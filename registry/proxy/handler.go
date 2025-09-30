package proxy

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/aliharirian/TerraPeak/config"
	"github.com/aliharirian/TerraPeak/logger"
)

// Handler handles incoming proxy requests
type Handler struct {
	config *config.Config
	client *Client
}

// NewHandler creates a new proxy handler
func NewHandler(cfg *config.Config) (*Handler, error) {
	client, err := New(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create proxy client: %v", err)
	}

	return &Handler{
		config: cfg,
		client: client,
	}, nil
}

// GetClient returns the proxy client
func (h *Handler) GetClient() *Client {
	return h.client
}

// HandleHTTPProxy handles HTTP CONNECT requests for HTTPS tunneling
func (h *Handler) HandleHTTPProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodConnect {
		h.handleHTTPSConnect(w, r)
		return
	}

	// Handle regular HTTP requests through proxy
	h.handleHTTPRequest(w, r)
}

// handleHTTPSConnect handles HTTPS CONNECT requests
func (h *Handler) handleHTTPSConnect(w http.ResponseWriter, r *http.Request) {
	// Extract target host:port from request
	target := r.URL.Host
	if !strings.Contains(target, ":") {
		target += ":443" // Default HTTPS port
	}

	logger.Infof("HTTPS CONNECT request to %s", target)

	// Connect to target server
	targetConn, err := h.connectToTarget(target)
	if err != nil {
		logger.Errorf("Failed to connect to target %s: %v", target, err)
		http.Error(w, "Connection failed", http.StatusBadGateway)
		return
	}
	defer targetConn.Close()

	// Send 200 Connection Established response
	w.WriteHeader(http.StatusOK)

	// Hijack the connection to get raw TCP connection
	hijacker, ok := w.(http.Hijacker)
	if !ok {
		logger.Errorf("ResponseWriter does not support hijacking")
		http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
		return
	}

	clientConn, _, err := hijacker.Hijack()
	if err != nil {
		logger.Errorf("Failed to hijack connection: %v", err)
		return
	}
	defer clientConn.Close()

	// Send connection established response
	clientConn.Write([]byte("HTTP/1.1 200 Connection Established\r\n\r\n"))

	// Start bidirectional data copying
	go h.copyData(targetConn, clientConn, "target->client")
	h.copyData(clientConn, targetConn, "client->target")
}

// handleHTTPRequest handles regular HTTP requests through proxy
func (h *Handler) handleHTTPRequest(w http.ResponseWriter, r *http.Request) {
	// Modify request to use absolute URL
	if r.URL.Scheme == "" {
		r.URL.Scheme = "http"
	}
	if r.URL.Host == "" {
		r.URL.Host = r.Host
	}

	logger.Infof("HTTP proxy request: %s %s", r.Method, r.URL.String())

	// Forward request through proxy client
	resp, err := h.client.Do(r)
	if err != nil {
		logger.Errorf("Failed to forward request: %v", err)
		http.Error(w, "Proxy request failed", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	// Set status code
	w.WriteHeader(resp.StatusCode)

	// Copy response body
	_, err = io.Copy(w, resp.Body)
	if err != nil {
		logger.Errorf("Failed to copy response body: %v", err)
	}
}

// connectToTarget establishes connection to target server
func (h *Handler) connectToTarget(target string) (net.Conn, error) {
	// Use proxy client's transport if proxy is enabled
	if h.client.IsProxyEnabled() {
		transport := h.client.GetClient().Transport.(*http.Transport)
		return transport.DialContext(context.Background(), "tcp", target)
	}

	// Direct connection
	return net.DialTimeout("tcp", target, 30*time.Second)
}

// copyData copies data between two connections
func (h *Handler) copyData(dst, src net.Conn, direction string) {
	defer func() {
		dst.Close()
		src.Close()
	}()

	_, err := io.Copy(dst, src)
	if err != nil {
		logger.Debugf("Connection closed (%s): %v", direction, err)
	}
}

// HandleSOCKSProxy handles SOCKS proxy requests
func (h *Handler) HandleSOCKSProxy(conn net.Conn) {
	defer conn.Close()

	// Read SOCKS version
	buffer := make([]byte, 1)
	_, err := conn.Read(buffer)
	if err != nil {
		logger.Errorf("Failed to read SOCKS version: %v", err)
		return
	}

	version := buffer[0]

	switch version {
	case 0x04: // SOCKS4
		h.handleSOCKS4(conn)
	case 0x05: // SOCKS5
		h.handleSOCKS5(conn)
	default:
		logger.Errorf("Unsupported SOCKS version: %d", version)
	}
}

// handleSOCKS4 handles SOCKS4 requests
func (h *Handler) handleSOCKS4(conn net.Conn) {
	// Read SOCKS4 request (simplified implementation)
	buffer := make([]byte, 8)
	_, err := conn.Read(buffer)
	if err != nil {
		logger.Errorf("Failed to read SOCKS4 request: %v", err)
		return
	}

	// Extract port and IP
	port := int(buffer[2])<<8 + int(buffer[3])
	ip := net.IPv4(buffer[4], buffer[5], buffer[6], buffer[7])
	target := fmt.Sprintf("%s:%d", ip.String(), port)

	logger.Infof("SOCKS4 request to %s", target)

	// Connect to target
	targetConn, err := h.connectToTarget(target)
	if err != nil {
		logger.Errorf("Failed to connect to target %s: %v", target, err)
		// Send SOCKS4 error response
		conn.Write([]byte{0x00, 0x5B, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00})
		return
	}
	defer targetConn.Close()

	// Send SOCKS4 success response
	conn.Write([]byte{0x00, 0x5A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00})

	// Start bidirectional data copying
	go h.copyData(targetConn, conn, "target->client")
	h.copyData(conn, targetConn, "client->target")
}

// handleSOCKS5 handles SOCKS5 requests
func (h *Handler) handleSOCKS5(conn net.Conn) {
	// Read authentication methods
	buffer := make([]byte, 1)
	_, err := conn.Read(buffer)
	if err != nil {
		logger.Errorf("Failed to read SOCKS5 auth methods count: %v", err)
		return
	}

	methodCount := int(buffer[0])
	methods := make([]byte, methodCount)
	_, err = conn.Read(methods)
	if err != nil {
		logger.Errorf("Failed to read SOCKS5 auth methods: %v", err)
		return
	}

	// Send no authentication required
	conn.Write([]byte{0x05, 0x00})

	// Read connection request
	request := make([]byte, 4)
	_, err = conn.Read(request)
	if err != nil {
		logger.Errorf("Failed to read SOCKS5 request: %v", err)
		return
	}

	// Read address
	var target string
	addrType := request[3]

	switch addrType {
	case 0x01: // IPv4
		ip := make([]byte, 4)
		conn.Read(ip)
		port := make([]byte, 2)
		conn.Read(port)
		target = fmt.Sprintf("%d.%d.%d.%d:%d",
			ip[0], ip[1], ip[2], ip[3],
			int(port[0])<<8+int(port[1]))
	case 0x03: // Domain name
		length := make([]byte, 1)
		conn.Read(length)
		domain := make([]byte, length[0])
		conn.Read(domain)
		port := make([]byte, 2)
		conn.Read(port)
		target = fmt.Sprintf("%s:%d", string(domain), int(port[0])<<8+int(port[1]))
	default:
		logger.Errorf("Unsupported SOCKS5 address type: %d", addrType)
		conn.Write([]byte{0x05, 0x08, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00})
		return
	}

	logger.Infof("SOCKS5 request to %s", target)

	// Connect to target
	targetConn, err := h.connectToTarget(target)
	if err != nil {
		logger.Errorf("Failed to connect to target %s: %v", target, err)
		// Send SOCKS5 error response
		conn.Write([]byte{0x05, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00})
		return
	}
	defer targetConn.Close()

	// Send SOCKS5 success response
	conn.Write([]byte{0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00})

	// Start bidirectional data copying
	go h.copyData(targetConn, conn, "target->client")
	h.copyData(conn, targetConn, "client->target")
}

// StartProxyServer starts a proxy server on the specified address
func (h *Handler) StartProxyServer(addr string) error {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %v", addr, err)
	}
	defer listener.Close()

	logger.Infof("Proxy server listening on %s", addr)

	for {
		conn, err := listener.Accept()
		if err != nil {
			logger.Errorf("Failed to accept connection: %v", err)
			continue
		}

		go h.handleConnection(conn)
	}
}

// handleConnection determines the proxy type and handles accordingly
func (h *Handler) handleConnection(conn net.Conn) {
	defer conn.Close()

	// Set read timeout
	conn.SetReadDeadline(time.Now().Add(30 * time.Second))

	// Peek at the first byte to determine protocol
	buffer := make([]byte, 1)
	n, err := conn.Read(buffer)
	if err != nil {
		logger.Errorf("Failed to read from connection: %v", err)
		return
	}

	// Reset read deadline
	conn.SetReadDeadline(time.Time{})

	// Determine protocol based on first byte
	firstByte := buffer[0]

	if firstByte == 0x04 || firstByte == 0x05 {
		// SOCKS proxy
		// Write the first byte back to the stream
		conn.Write(buffer[:n])
		h.HandleSOCKSProxy(conn)
	} else {
		// HTTP proxy
		// Write the first byte back to the stream
		conn.Write(buffer[:n])

		// Create a buffered reader to peek at the request
		reader := bufio.NewReader(conn)
		req, err := http.ReadRequest(reader)
		if err != nil {
			logger.Errorf("Failed to read HTTP request: %v", err)
			return
		}

		// Create a response writer
		w := &responseWriter{conn: conn}
		h.HandleHTTPProxy(w, req)
	}
}

// responseWriter implements http.ResponseWriter for raw connections
type responseWriter struct {
	conn   net.Conn
	header http.Header
	status int
}

func (rw *responseWriter) Header() http.Header {
	if rw.header == nil {
		rw.header = make(http.Header)
	}
	return rw.header
}

func (rw *responseWriter) Write(data []byte) (int, error) {
	return rw.conn.Write(data)
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.status = statusCode
	// Write status line
	statusText := http.StatusText(statusCode)
	statusLine := fmt.Sprintf("HTTP/1.1 %d %s\r\n", statusCode, statusText)
	rw.conn.Write([]byte(statusLine))

	// Write headers
	for key, values := range rw.header {
		for _, value := range values {
			headerLine := fmt.Sprintf("%s: %s\r\n", key, value)
			rw.conn.Write([]byte(headerLine))
		}
	}
	rw.conn.Write([]byte("\r\n"))
}
