package proxy

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/aliharirian/TerraPeak/config"
	"github.com/aliharirian/TerraPeak/logger"
	"golang.org/x/net/proxy"
)

// Client wraps an HTTP client with proxy support
type Client struct {
	httpClient *http.Client
	config     *config.Config
}

// New creates a new proxy-enabled HTTP client
func New(cfg *config.Config) (*Client, error) {
	client := &Client{
		config: cfg,
	}

	// Create HTTP client with proxy support
	httpClient, err := client.createHTTPClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP client: %v", err)
	}

	client.httpClient = httpClient
	return client, nil
}

// createHTTPClient creates an HTTP client with proxy configuration
func (c *Client) createHTTPClient() (*http.Client, error) {
	transport := &http.Transport{
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	// Configure proxy if enabled
	if c.config.Proxy.Enabled {
		if err := c.configureProxy(transport); err != nil {
			return nil, fmt.Errorf("failed to configure proxy: %v", err)
		}
		logger.Infof("Proxy enabled: %s://%s:%d", c.config.Proxy.Type, c.config.Proxy.Host, c.config.Proxy.Port)
	} else {
		logger.Debugf("Proxy disabled")
	}

	return &http.Client{
		Transport: transport,
		Timeout:   30 * time.Second,
	}, nil
}

// configureProxy configures the HTTP transport with proxy settings
func (c *Client) configureProxy(transport *http.Transport) error {
	proxyConfig := c.config.Proxy

	switch proxyConfig.Type {
	case "http", "https":
		return c.configureHTTPProxy(transport, c.config)
	case "socks5":
		return c.configureSOCKS5Proxy(transport, c.config)
	case "socks4":
		return c.configureSOCKS4Proxy(transport, c.config)
	default:
		return fmt.Errorf("unsupported proxy type: %s", proxyConfig.Type)
	}
}

// configureHTTPProxy configures HTTP/HTTPS proxy
func (c *Client) configureHTTPProxy(transport *http.Transport, cfg *config.Config) error {
	proxyConfig := cfg.Proxy
	proxyURL := fmt.Sprintf("%s://%s:%d", proxyConfig.Type, proxyConfig.Host, proxyConfig.Port)

	// Add authentication if provided
	if proxyConfig.Username != "" && proxyConfig.Password != "" {
		proxyURL = fmt.Sprintf("%s://%s:%s@%s:%d",
			proxyConfig.Type, proxyConfig.Username, proxyConfig.Password,
			proxyConfig.Host, proxyConfig.Port)
	}

	parsedURL, err := url.Parse(proxyURL)
	if err != nil {
		return fmt.Errorf("invalid proxy URL: %v", err)
	}

	transport.Proxy = http.ProxyURL(parsedURL)
	logger.Debugf("HTTP proxy configured: %s", proxyURL)
	return nil
}

// configureSOCKS5Proxy configures SOCKS5 proxy
func (c *Client) configureSOCKS5Proxy(transport *http.Transport, cfg *config.Config) error {
	proxyConfig := cfg.Proxy
	proxyAddr := fmt.Sprintf("%s:%d", proxyConfig.Host, proxyConfig.Port)

	var auth *proxy.Auth
	if proxyConfig.Username != "" && proxyConfig.Password != "" {
		auth = &proxy.Auth{
			User:     proxyConfig.Username,
			Password: proxyConfig.Password,
		}
	}

	dialer, err := proxy.SOCKS5("tcp", proxyAddr, auth, proxy.Direct)
	if err != nil {
		return fmt.Errorf("failed to create SOCKS5 dialer: %v", err)
	}

	transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		return dialer.Dial(network, addr)
	}

	logger.Debugf("SOCKS5 proxy configured: %s", proxyAddr)
	return nil
}

// configureSOCKS4Proxy configures SOCKS4 proxy
func (c *Client) configureSOCKS4Proxy(transport *http.Transport, cfg *config.Config) error {
	proxyConfig := cfg.Proxy
	proxyAddr := fmt.Sprintf("%s:%d", proxyConfig.Host, proxyConfig.Port)

	var auth *proxy.Auth
	if proxyConfig.Username != "" {
		auth = &proxy.Auth{
			User: proxyConfig.Username,
		}
	}

	dialer, err := proxy.SOCKS5("tcp", proxyAddr, auth, proxy.Direct)
	if err != nil {
		return fmt.Errorf("failed to create SOCKS4 dialer: %v", err)
	}

	transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		return dialer.Dial(network, addr)
	}

	logger.Debugf("SOCKS4 proxy configured: %s", proxyAddr)
	return nil
}

// Get performs an HTTP GET request through the proxy
func (c *Client) Get(url string) (*http.Response, error) {
	return c.httpClient.Get(url)
}

// Do performs an HTTP request through the proxy
func (c *Client) Do(req *http.Request) (*http.Response, error) {
	return c.httpClient.Do(req)
}

// GetClient returns the underlying HTTP client
func (c *Client) GetClient() *http.Client {
	return c.httpClient
}

// IsProxyEnabled returns true if proxy is enabled
func (c *Client) IsProxyEnabled() bool {
	return c.config.Proxy.Enabled
}

// GetProxyInfo returns proxy configuration information
func (c *Client) GetProxyInfo() map[string]interface{} {
	if !c.config.Proxy.Enabled {
		return map[string]interface{}{
			"enabled": false,
		}
	}

	info := map[string]interface{}{
		"enabled": true,
		"type":    c.config.Proxy.Type,
		"host":    c.config.Proxy.Host,
		"port":    c.config.Proxy.Port,
	}

	if c.config.Proxy.Username != "" {
		info["username"] = c.config.Proxy.Username
		info["has_password"] = c.config.Proxy.Password != ""
	}

	return info
}
