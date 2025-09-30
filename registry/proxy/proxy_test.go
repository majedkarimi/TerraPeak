package proxy

import (
	"context"
	"net/http"
	"net/url"
	"testing"
	"time"

	"github.com/aliharirian/TerraPeak/config"
)

func TestProxyClientCreation(t *testing.T) {
	// Test with proxy disabled
	cfg := &config.Config{}
	cfg.Proxy.Enabled = false

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	if client.IsProxyEnabled() {
		t.Error("Proxy should be disabled")
	}

	// Test with HTTP proxy enabled
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "http"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 8080

	client, err = New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client with proxy: %v", err)
	}

	if !client.IsProxyEnabled() {
		t.Error("Proxy should be enabled")
	}

	info := client.GetProxyInfo()
	if info["type"] != "http" {
		t.Errorf("Expected proxy type 'http', got '%v'", info["type"])
	}
}

func TestProxyHandlerCreation(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = false

	handler, err := NewHandler(cfg)
	if err != nil {
		t.Fatalf("Failed to create handler: %v", err)
	}

	if handler == nil {
		t.Error("Handler should not be nil")
	}

	client := handler.GetClient()
	if client == nil {
		t.Error("Client should not be nil")
	}
}

func TestHTTPProxyConfiguration(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "http"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 8080
	cfg.Proxy.Username = "user"
	cfg.Proxy.Password = "pass"

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	info := client.GetProxyInfo()
	if info["type"] != "http" {
		t.Errorf("Expected proxy type 'http', got '%v'", info["type"])
	}
	if info["host"] != "127.0.0.1" {
		t.Errorf("Expected host '127.0.0.1', got '%v'", info["host"])
	}
	if info["port"] != 8080 {
		t.Errorf("Expected port 8080, got '%v'", info["port"])
	}
	if info["username"] != "user" {
		t.Errorf("Expected username 'user', got '%v'", info["username"])
	}
}

func TestSOCKS5ProxyConfiguration(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "socks5"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 1080
	cfg.Proxy.Username = "user"
	cfg.Proxy.Password = "pass"

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	info := client.GetProxyInfo()
	if info["type"] != "socks5" {
		t.Errorf("Expected proxy type 'socks5', got '%v'", info["type"])
	}
}

func TestSOCKS4ProxyConfiguration(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "socks4"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 1080
	cfg.Proxy.Username = "user"

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	info := client.GetProxyInfo()
	if info["type"] != "socks4" {
		t.Errorf("Expected proxy type 'socks4', got '%v'", info["type"])
	}
}

func TestInvalidProxyType(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "invalid"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 8080

	_, err := New(cfg)
	if err == nil {
		t.Error("Expected error for invalid proxy type")
	}
}

func TestHTTPClientWithProxy(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "http"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 8080

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	httpClient := client.GetClient()
	if httpClient == nil {
		t.Error("HTTP client should not be nil")
	}

	// Test that the client has a timeout
	if httpClient.Timeout != 30*time.Second {
		t.Errorf("Expected timeout 30s, got %v", httpClient.Timeout)
	}
}

func TestProxyURLGeneration(t *testing.T) {
	cfg := &config.Config{}
	cfg.Proxy.Enabled = true
	cfg.Proxy.Type = "http"
	cfg.Proxy.Host = "127.0.0.1"
	cfg.Proxy.Port = 8080
	cfg.Proxy.Username = "user"
	cfg.Proxy.Password = "pass"

	client, err := New(cfg)
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	// Test that the transport is configured
	httpClient := client.GetClient()
	transport := httpClient.Transport.(*http.Transport)

	if transport.Proxy == nil {
		t.Error("Transport should have proxy configured")
	}

	// Test proxy URL generation
	testURL, _ := url.Parse("http://example.com")
	proxyURL, err := transport.Proxy(&http.Request{URL: testURL})
	if err != nil {
		t.Fatalf("Failed to get proxy URL: %v", err)
	}

	expectedURL := "http://user:pass@127.0.0.1:8080"
	if proxyURL.String() != expectedURL {
		t.Errorf("Expected proxy URL '%s', got '%s'", expectedURL, proxyURL.String())
	}
}
