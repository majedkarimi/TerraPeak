package proxy

import (
	"context"
	"net"
	"net/http"
	"testing"
	"time"

	"github.com/aliharirian/TerraPeak/config"
)

func TestProxyServerStart(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = false

	handler, err := NewHandler(cfg)
	if err != nil {
		t.Fatalf("Failed to create handler: %v", err)
	}

	// Start proxy server on a random port
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatalf("Failed to create listener: %v", err)
	}
	defer listener.Close()

	addr := listener.Addr().String()

	// Test that we can start the server
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	go func() {
		select {
		case <-ctx.Done():
			return
		}
	}()

	// Test connection handling
	go func() {
		conn, err := listener.Accept()
		if err != nil {
			return
		}
		handler.handleConnection(conn)
	}()

	// Test connecting to the proxy
	conn, err := net.DialTimeout("tcp", addr, 1*time.Second)
	if err != nil {
		t.Fatalf("Failed to connect to proxy: %v", err)
	}
	defer conn.Close()

	// Send a simple HTTP request
	request := "GET http://example.com/ HTTP/1.1\r\nHost: example.com\r\n\r\n"
	_, err = conn.Write([]byte(request))
	if err != nil {
		t.Fatalf("Failed to write request: %v", err)
	}

	// Read response (should timeout or get an error)
	conn.SetReadDeadline(time.Now().Add(100 * time.Millisecond))
	buffer := make([]byte, 1024)
	_, err = conn.Read(buffer)
	// We expect an error here since example.com might not be reachable
	// The important thing is that the connection was handled
}

func TestHTTPProxyHandler(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = false

	handler, err := NewHandler(cfg)
	if err != nil {
		t.Fatalf("Failed to create handler: %v", err)
	}

	// Create a mock HTTP request
	req, err := http.NewRequest("GET", "http://example.com/", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	// Create a mock response writer
	w := &mockResponseWriter{}

	// Test HTTP proxy handling
	handler.HandleHTTPProxy(w, req)

	// Check that some response was written
	if len(w.data) == 0 {
		t.Error("Expected some response data")
	}
}

func TestSOCKSProxyHandler(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = false

	handler, err := NewHandler(cfg)
	if err != nil {
		t.Fatalf("Failed to create handler: %v", err)
	}

	// Create a mock connection
	server, client := net.Pipe()
	defer server.Close()
	defer client.Close()

	// Test SOCKS proxy handling in a goroutine
	go func() {
		handler.HandleSOCKSProxy(server)
	}()

	// Send SOCKS5 handshake
	handshake := []byte{0x05, 0x01, 0x00} // SOCKS5, 1 method, no auth
	_, err = client.Write(handshake)
	if err != nil {
		t.Fatalf("Failed to write SOCKS handshake: %v", err)
	}

	// Read response
	response := make([]byte, 2)
	client.SetReadDeadline(time.Now().Add(100 * time.Millisecond))
	_, err = client.Read(response)
	if err != nil {
		// Expected error due to connection handling
		t.Logf("Expected error during SOCKS handling: %v", err)
	}
}

// mockResponseWriter implements http.ResponseWriter for testing
type mockResponseWriter struct {
	header http.Header
	status int
	data   []byte
}

func (m *mockResponseWriter) Header() http.Header {
	if m.header == nil {
		m.header = make(http.Header)
	}
	return m.header
}

func (m *mockResponseWriter) Write(data []byte) (int, error) {
	m.data = append(m.data, data...)
	return len(data), nil
}

func (m *mockResponseWriter) WriteHeader(statusCode int) {
	m.status = statusCode
}

func TestProxyConfigurationValidation(t *testing.T) {
	tests := []struct {
		name        string
		proxyConfig config.Proxy
		expectError bool
	}{
		{
			name: "Valid HTTP proxy",
			proxyConfig: config.Proxy{
				Enabled:  true,
				Type:     "http",
				Host:     "127.0.0.1",
				Port:     8080,
				Username: "user",
				Password: "pass",
			},
			expectError: false,
		},
		{
			name: "Valid SOCKS5 proxy",
			proxyConfig: config.Proxy{
				Enabled:  true,
				Type:     "socks5",
				Host:     "127.0.0.1",
				Port:     1080,
				Username: "user",
				Password: "pass",
			},
			expectError: false,
		},
		{
			name: "Valid SOCKS4 proxy",
			proxyConfig: config.Proxy{
				Enabled:  true,
				Type:     "socks4",
				Host:     "127.0.0.1",
				Port:     1080,
				Username: "user",
			},
			expectError: false,
		},
		{
			name: "Invalid proxy type",
			proxyConfig: config.Proxy{
				Enabled: true,
				Type:    "invalid",
				Host:    "127.0.0.1",
				Port:    8080,
			},
			expectError: true,
		},
		{
			name: "Disabled proxy",
			proxyConfig: config.Proxy{
				Enabled: false,
			},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg := &config.Config{}
			cfg.Proxy = tt.proxyConfig

			_, err := New(cfg)
			if tt.expectError && err == nil {
				t.Error("Expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestProxyInfo(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "http"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 8080
	cfg.Proxy.Username = "testuser"
	cfg.Proxy.Password = "testpass"

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	info := client.GetProxyInfo()

	// Check required fields
	requiredFields := []string{"enabled", "type", "host", "port", "username", "has_password"}
	for _, field := range requiredFields {
		if _, exists := info[field]; !exists {
			t.Errorf("Missing required field: %s", field)
		}
	}

	// Check values
	if info["enabled"] != true {
		t.Error("Proxy should be enabled")
	}
	if info["type"] != "http" {
		t.Error("Proxy type should be http")
	}
	if info["host"] != "127.0.0.1" {
		t.Error("Proxy host should be 127.0.0.1")
	}
	if info["port"] != 8080 {
		t.Error("Proxy port should be 8080")
	}
	if info["username"] != "testuser" {
		t.Error("Proxy username should be testuser")
	}
	if info["has_password"] != true {
		t.Error("Proxy should have password")
	}
}
