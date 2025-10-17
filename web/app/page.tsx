"use client"

import { useState, useEffect } from "react"

export default function TerraformRegistry() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === "A" && target.hash) {
        const href = target.getAttribute("href")
        if (href?.startsWith("#")) {
          e.preventDefault()
          const element = document.querySelector(href)
          if (element) {
            const headerOffset = 80
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            })
          }
        }
      }
    }

    document.addEventListener("click", handleAnchorClick)
    return () => document.removeEventListener("click", handleAnchorClick)
  }, [])

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .code-block {
          position: relative;
        }
        .copy-btn {
          transition: all 0.2s ease;
        }
        .copy-btn:hover {
          transform: translateY(-1px);
        }
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          transform: translateY(150%);
          transition: transform 0.3s ease;
          z-index: 1000;
        }
        .toast.show {
          transform: translateY(0);
        }
        details summary {
          cursor: pointer;
          user-select: none;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

      <div className="bg-black text-gray-100 font-sans antialiased">
        {/* Header / Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">terrapeak</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#home"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                >
                  Home
                </a>
                <a
                  href="/browse"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                >
                  Browse
                </a>
                <a
                  href="#quickstart"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                >
                  Quickstart
                </a>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                >
                  Features
                </a>
                <a
                  href="#docs"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                >
                  Docs
                </a>
                <a
                  href="https://github.com/aliharirian/TerraPeak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
                >
                  GitHub
                </a>
              </div>

              {/* Star Button */}
              <a
                href="https://github.com/aliharirian/TerraPeak"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg border border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">Star on GitHub</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div id="mobile-menu" className="md:hidden pb-4">
                <div className="flex flex-col gap-2">
                  <a
                    href="#home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white transition-colors px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Home
                  </a>
                  <a
                    href="/browse"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white transition-colors px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Browse
                  </a>
                  <a
                    href="#quickstart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white transition-colors px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Quickstart
                  </a>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white transition-colors px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Features
                  </a>
                  <a
                    href="#docs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white transition-colors px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Docs
                  </a>
                  <a
                    href="https://github.com/aliharirian/TerraPeak"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero Section */}
          <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto fade-in">
                <div className="inline-block mb-4 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <span className="text-sm text-green-400 font-medium">Open Source • High Performance</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  A high-performance caching proxy for Terraform Registry
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Accelerate your Terraform provider downloads and reduce bandwidth costs. TerraPeak supports intelligent
                  storage backends (MinIO, local file storage) and offers flexible proxy modes for corporate environments
                  with outbound and inbound proxy support.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#quickstart"
                    className="w-full sm:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    Get Started — Docker Compose
                  </a>
                  <a
                    href="https://github.com/aliharirian/TerraPeak"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why TerraPeak?</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Built for DevOps teams who need reliable, fast, and secure Terraform provider caching
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">High-Performance Caching</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Dramatically reduce provider download times and bandwidth usage with intelligent caching. Perfect for
                    teams running frequent Terraform operations.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Intelligent Storage Backends</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Choose between MinIO for distributed object storage or local file storage. Scale your caching
                    infrastructure to match your needs.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Flexible Proxy Support</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Works seamlessly in corporate environments with outbound client proxy and inbound server proxy modes.
                    Supports HTTP, SOCKS5, and SOCKS4 protocols.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">HTTPS Required</h3>
                  <p className="text-gray-400 leading-relaxed">
                    TerraPeak requires HTTPS with valid SSL certificates to ensure Terraform accepts provider downloads
                    securely. Built with security as a priority.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Corporate-Friendly</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Designed for enterprise environments with support for various proxy types and configurations. Integrate
                    seamlessly with your existing infrastructure.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Easy to Deploy</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Get started in minutes with Docker Compose, Docker, or build from source. Simple configuration with YAML
                    files for all settings.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quickstart Section */}
          <section id="quickstart" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get Started in Minutes</h2>
                <p className="text-lg text-gray-400">Choose your preferred deployment method</p>
              </div>

              {/* Docker Compose */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Docker Compose (Recommended)
                </h3>
                <p className="text-gray-400 mb-4">The easiest way to get TerraPeak running with all dependencies:</p>

                <div className="code-block bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 font-mono">bash</span>
                    <button
                      className="copy-btn px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() =>
                        copyToClipboard(
                          `git clone https://github.com/aliharirian/TerraPeak.git\ncd TerraPeak\ndocker-compose up -d`
                        )
                      }
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{`git clone https://github.com/aliharirian/TerraPeak.git
cd TerraPeak
docker-compose up -d`}</code>
                  </pre>
                </div>

                <p className="text-gray-400 text-sm">
                  TerraPeak will be available on the configured ports. Check your{" "}
                  <code className="px-2 py-0.5 bg-gray-800 text-green-400 rounded text-xs">cfg.yml</code> for server
                  address settings.
                </p>
              </div>

              {/* Docker Run */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Docker Run
                </h3>
                <p className="text-gray-400 mb-4">Pull and run the latest TerraPeak image:</p>

                <div className="code-block bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 font-mono">bash</span>
                    <button
                      className="copy-btn px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() => copyToClipboard("docker pull aliharirian/terrapeak:latest")}
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>docker pull aliharirian/terrapeak:latest</code>
                  </pre>
                </div>

                <div className="code-block bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 font-mono">bash</span>
                    <button
                      className="copy-btn px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() =>
                        copyToClipboard(
                          "docker run -d -p 8080:8080 -v $(pwd)/cfg.yml:/app/cfg.yml aliharirian/terrapeak:latest"
                        )
                      }
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>
                      docker run -d -p 8080:8080 -v $(pwd)/cfg.yml:/app/cfg.yml aliharirian/terrapeak:latest
                    </code>
                  </pre>
                </div>
              </div>

              {/* Build from Source */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Build from Source
                </h3>
                <p className="text-gray-400 mb-4">For developers who want to build and customize:</p>

                <div className="code-block bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 font-mono">bash</span>
                    <button
                      className="copy-btn px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() => copyToClipboard("cd registry\ngo build -o terrapeak\n./terrapeak")}
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{`cd registry
go build -o terrapeak
./terrapeak`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Configuration</h2>
                <p className="text-lg text-gray-400">Configure TerraPeak with a simple YAML file</p>
              </div>

              <div className="bg-black border border-gray-800 rounded-xl p-6">
                <details className="group">
                  <summary className="flex items-center justify-between text-lg font-semibold text-white mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-2">
                    <span>Example cfg.yml Configuration</span>
                    <svg
                      className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                  <div className="code-block bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 font-mono">yaml</span>
                      <button
                        className="copy-btn px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={() =>
                          copyToClipboard(`server:
  addr: ':8080'
  domain: 'https://terrapeak.example.com'  # Must be HTTPS

storage:
  type: 'minio'  # or 'file'
  minio:
    endpoint: 'minio:9000'
    accessKey: 'minioadmin'
    secretKey: 'minioadmin'
    bucket: 'terraform-providers'
    useSSL: false

proxy:
  enabled: true
  type: 'http'  # http, socks5, or socks4
  url: 'http://proxy.example.com:8080'`)
                        }
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{`server:
  addr: ':8080'
  domain: 'https://terrapeak.example.com'  # Must be HTTPS

storage:
  type: 'minio'  # or 'file'
  minio:
    endpoint: 'minio:9000'
    accessKey: 'minioadmin'
    secretKey: 'minioadmin'
    bucket: 'terraform-providers'
    useSSL: false

proxy:
  enabled: true
  type: 'http'  # http, socks5, or socks4
  url: 'http://proxy.example.com:8080'`}</code>
                    </pre>
                  </div>
                </details>

                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-green-400 font-semibold mb-1">Important: HTTPS Required</p>
                      <p className="text-sm text-gray-300">
                        The <code className="px-1.5 py-0.5 bg-gray-800 text-green-400 rounded text-xs">server.domain</code>{" "}
                        must use HTTPS with valid SSL certificates. Terraform will not accept provider downloads over
                        insecure connections.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Architecture Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
                <p className="text-lg text-gray-400">Simple, efficient architecture for maximum performance</p>
              </div>

              <div className="bg-black border border-gray-800 rounded-xl p-8">
                {/* Architecture Diagram */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                  {/* Terraform Client */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-purple-500/10 border-2 border-purple-500 rounded-lg flex items-center justify-center mb-3">
                      <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">Terraform Client</span>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-8 h-8 text-green-500 rotate-90 md:rotate-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  {/* TerraPeak */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">TerraPeak</span>
                    <span className="text-xs text-gray-500">(Cache Layer)</span>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-8 h-8 text-green-500 rotate-90 md:rotate-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  {/* Storage / Registry */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-500/10 border-2 border-blue-500 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-10 h-10 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">MinIO / Registry</span>
                    <span className="text-xs text-gray-500">(Backend Storage)</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Request Flow</h3>
                  <ol className="space-y-3 text-gray-400">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>Terraform client requests a provider from TerraPeak</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>TerraPeak checks its cache (MinIO or local storage) for the provider</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>If cached, TerraPeak serves the provider immediately (fast path)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>
                        If not cached, TerraPeak fetches from upstream registry, caches it, and serves to client
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <span>
                        Subsequent requests for the same provider are served from cache, dramatically reducing download
                        times
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Docs & Resources Section */}
          <section id="docs" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Documentation & Resources</h2>
                <p className="text-lg text-gray-400">Everything you need to get the most out of TerraPeak</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* GitHub Repo */}
                <a
                  href="https://github.com/aliharirian/TerraPeak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/10 transition-colors">
                      <svg
                        className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-500 transition-colors">
                        GitHub Repository
                      </h3>
                      <p className="text-gray-400 text-sm">View source code, report issues, and contribute to the project</p>
                    </div>
                  </div>
                </a>

                {/* README */}
                <a
                  href="https://github.com/aliharirian/TerraPeak#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/10 transition-colors">
                      <svg
                        className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-500 transition-colors">
                        README Documentation
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Complete setup guide, configuration options, and usage examples
                      </p>
                    </div>
                  </div>
                </a>

                {/* Issues */}
                <a
                  href="https://github.com/aliharirian/TerraPeak/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/10 transition-colors">
                      <svg
                        className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-500 transition-colors">
                        Report Issues
                      </h3>
                      <p className="text-gray-400 text-sm">Found a bug or have a feature request? Let us know on GitHub</p>
                    </div>
                  </div>
                </a>

                {/* License */}
                <a
                  href="https://github.com/aliharirian/TerraPeak/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/10 transition-colors">
                      <svg
                        className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-500 transition-colors">
                        Open Source License
                      </h3>
                      <p className="text-gray-400 text-sm">Free to use, modify, and distribute under open source license</p>
                    </div>
                  </div>
                </a>
              </div>

              {/* Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://github.com/aliharirian/TerraPeak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  <img
                    src="https://img.shields.io/github/stars/aliharirian/TerraPeak?style=social"
                    alt="GitHub stars"
                    className="h-5"
                  />
                </a>
                <a
                  href="https://github.com/aliharirian/TerraPeak/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  <img
                    src="https://img.shields.io/github/license/aliharirian/TerraPeak"
                    alt="License"
                    className="h-5"
                  />
                </a>
                <a
                  href="https://github.com/aliharirian/TerraPeak/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  <img
                    src="https://img.shields.io/github/issues/aliharirian/TerraPeak"
                    alt="GitHub issues"
                    className="h-5"
                  />
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">terrapeak</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
                <span>© 2025 TerraPeak. Open Source Project.</span>
                <a
                  href="https://github.com/aliharirian/TerraPeak/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1"
                >
                  License
                </a>
                <a
                  href="https://github.com/aliharirian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1"
                >
                  Contributors
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
