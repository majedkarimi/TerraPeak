package store

import (
	"bytes"
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/aliharirian/TerraPeak/config"
	"github.com/aliharirian/TerraPeak/logger"
	"github.com/aliharirian/TerraPeak/proxy"
	"github.com/aliharirian/TerraPeak/store/filesystem"
	"github.com/aliharirian/TerraPeak/store/s3"
)

// Store handles file storage with automatic backend selection
type Store struct {
	config      *config.Config
	backend     Storage
	proxyClient *proxy.Client
}

// New creates a new Store instance
// Automatically selects backend based on config:
// - If S3.Enabled = true, uses S3/MinIO
// - Otherwise uses FileSystem (default)
func New(cfg *config.Config) (*Store, error) {
	// Initialize proxy client
	proxyClient, err := proxy.New(cfg)
	if err != nil {
		logger.Errorf("Failed to initialize proxy client: %v", err)
		return nil, err
	}

	// Select backend based on config
	var backend Storage
	if cfg.Storage.S3.Enabled {
		logger.Infof("Initializing S3 storage backend")
		backend, err = s3.New(cfg)
		if err != nil {
			return nil, err
		}
	} else {
		logger.Infof("Initializing FileSystem storage backend (default)")
		backend, err = filesystem.New(cfg)
		if err != nil {
			return nil, err
		}
	}

	return &Store{
		config:      cfg,
		backend:     backend,
		proxyClient: proxyClient,
	}, nil
}

// HandleRequest is the main HTTP handler for file requests
func (s *Store) HandleRequest(w http.ResponseWriter, r *http.Request) {
	// Generate download URL and file path from request
	downloadURL, filePath := s.generateURL(r.URL.String())
	if downloadURL == "" || filePath == "" {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	// Check if file already exists in storage (cache hit)
	if s.FileExists(filePath) {
		logger.Infof("Cache HIT: File %s found in storage", filePath)
		s.serveCachedFile(w, filePath)
		return
	}

	// Cache miss - need to download and store
	logger.Infof("Cache MISS: Downloading file %s", filePath)
	s.downloadAndCache(w, downloadURL, filePath)
}

// serveCachedFile serves a file from cache
func (s *Store) serveCachedFile(w http.ResponseWriter, filePath string) {
	data, err := s.ReadFromStorage(filePath)
	if err != nil {
		logger.Errorf("Failed to read from storage: %v", err)
		http.Error(w, "Storage read failed", http.StatusInternalServerError)
		return
	}

	// Send cached file to user
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(data)))
	w.Header().Set("X-Cache-Status", "HIT")
	w.WriteHeader(http.StatusOK)
	w.Write(data)

	logger.Infof("Served cached file %s (%d bytes)", filePath, len(data))
}

// downloadAndCache downloads a file and caches it
func (s *Store) downloadAndCache(w http.ResponseWriter, downloadURL, filePath string) {
	// Get stream from source
	sourceStream, contentLength, err := s.getSourceStream(downloadURL)
	if err != nil {
		logger.Errorf("Failed to get source stream: %v", err)
		http.Error(w, "Download failed", http.StatusInternalServerError)
		return
	}
	defer sourceStream.Close()

	// Create buffer for user response and hash calculation
	var userBuffer bytes.Buffer
	md5Hash := md5.New()
	sha256Hash := sha256.New()

	// Create a TeeReader that writes to buffer and hashes
	multiWriter := io.MultiWriter(&userBuffer, md5Hash, sha256Hash)
	streamReader := io.TeeReader(sourceStream, multiWriter)

	// Stream to storage
	err = s.backend.StreamWrite(filePath, streamReader, contentLength)
	if err != nil {
		logger.Errorf("Failed to save to storage: %v", err)
		http.Error(w, "Save failed", http.StatusInternalServerError)
		return
	}

	// Calculate checksums and save metadata
	md5Sum := hex.EncodeToString(md5Hash.Sum(nil))
	sha256Sum := hex.EncodeToString(sha256Hash.Sum(nil))

	err = s.backend.SaveMetadata(filePath, md5Sum, sha256Sum, int64(userBuffer.Len()))
	if err != nil {
		logger.Warnf("Failed to save metadata: %v", err)
	}

	// Send file data to user
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", userBuffer.Len()))
	w.Header().Set("X-Cache-Status", "MISS")
	w.WriteHeader(http.StatusOK)
	w.Write(userBuffer.Bytes())

	logger.Infof("Downloaded and cached file %s (%d bytes)", filePath, userBuffer.Len())
}

// getSourceStream opens a stream from the download URL
func (s *Store) getSourceStream(downloadURL string) (io.ReadCloser, int64, error) {
	logger.Debugf("Opening stream from %s", downloadURL)

	var resp *http.Response
	var err error

	if s.proxyClient.IsProxyEnabled() {
		logger.Debugf("Using proxy-enabled client for download")
		resp, err = s.proxyClient.Get(downloadURL)
	} else {
		logger.Debugf("Using direct connection for download")
		resp, err = http.Get(downloadURL)
	}

	if err != nil {
		logger.Errorf("Error creating HTTP request: %v", err)
		return nil, 0, err
	}

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, 0, fmt.Errorf("HTTP request failed with status: %d", resp.StatusCode)
	}

	logger.Debugf("Stream opened successfully, content length: %d", resp.ContentLength)
	return resp.Body, resp.ContentLength, nil
}

// generateURL generates download URL and file path from request URL
func (s *Store) generateURL(requestURL string) (downloadURL string, filePath string) {
	parsedURL, err := url.Parse(requestURL)
	if err != nil {
		logger.Errorf("Failed to parse URL: %s", err)
		return "", ""
	}

	uri := parsedURL.Path
	httpsURL := "https:/" + uri

	// Validate the generated URL
	_, err = url.Parse(httpsURL)
	if err != nil {
		logger.Errorf("Error parsing generated URL: %v", err)
		return "", ""
	}

	logger.Debugf("Generated download URL: %s", httpsURL)

	// Remove leading slash for file path
	if len(uri) > 1 {
		filePath = uri[1:]
	} else {
		logger.Errorf("Invalid URI path: %s", uri)
		return "", ""
	}

	return httpsURL, filePath
}

// FileExists checks if a file exists in storage
func (s *Store) FileExists(filePath string) bool {
	return s.backend.Exists(filePath)
}

// ReadFromStorage reads file from storage and returns the data
func (s *Store) ReadFromStorage(filePath string) ([]byte, error) {
	return s.backend.Read(filePath)
}

// Save saves data to storage
func (s *Store) Save(filename string, data []byte) error {
	return s.backend.Write(filename, data)
}
