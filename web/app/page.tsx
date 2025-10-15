"use client"

import { Menu, X, Star, Copy, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

// Sample module data
const modulesData = [
  {
    id: 1,
    namespace: "terraform-aws-modules",
    name: "vpc",
    fullName: "terraform-aws-modules/vpc/aws",
    description: "Terraform module which creates VPC resources on AWS",
    tags: ["aws", "network", "vpc"],
    stars: 2845,
    version: "5.1.2",
    provider: "hashicorp/aws",
    versions: [
      { version: "5.1.2", date: "2024-01-15" },
      { version: "5.1.1", date: "2023-12-20" },
      { version: "5.1.0", date: "2023-11-10" },
    ],
  },
  {
    id: 2,
    namespace: "terraform-google-modules",
    name: "kubernetes-engine",
    fullName: "terraform-google-modules/kubernetes-engine/google",
    description: "Modular and composable GKE cluster on Google Cloud Platform",
    tags: ["gcp", "kubernetes", "gke"],
    stars: 1523,
    version: "28.0.0",
    provider: "hashicorp/google",
    versions: [
      { version: "28.0.0", date: "2024-02-01" },
      { version: "27.0.0", date: "2023-12-15" },
    ],
  },
  {
    id: 3,
    namespace: "terraform-aws-modules",
    name: "eks",
    fullName: "terraform-aws-modules/eks/aws",
    description: "Terraform module to create an Elastic Kubernetes (EKS) cluster on AWS",
    tags: ["aws", "kubernetes", "eks"],
    stars: 3421,
    version: "19.16.0",
    provider: "hashicorp/aws",
    versions: [
      { version: "19.16.0", date: "2024-01-28" },
      { version: "19.15.3", date: "2024-01-10" },
    ],
  },
  {
    id: 4,
    namespace: "terraform-aws-modules",
    name: "rds",
    fullName: "terraform-aws-modules/rds/aws",
    description: "Terraform module which creates RDS resources on AWS",
    tags: ["aws", "database", "rds"],
    stars: 1876,
    version: "6.3.0",
    provider: "hashicorp/aws",
    versions: [
      { version: "6.3.0", date: "2024-01-20" },
      { version: "6.2.0", date: "2023-12-05" },
    ],
  },
  {
    id: 5,
    namespace: "terraform-aws-modules",
    name: "security-group",
    fullName: "terraform-aws-modules/security-group/aws",
    description: "Terraform module which creates EC2 security group resources on AWS",
    tags: ["aws", "security", "network"],
    stars: 1234,
    version: "5.1.0",
    provider: "hashicorp/aws",
    versions: [
      { version: "5.1.0", date: "2024-01-12" },
      { version: "5.0.0", date: "2023-11-20" },
    ],
  },
  {
    id: 6,
    namespace: "terraform-google-modules",
    name: "network",
    fullName: "terraform-google-modules/network/google",
    description: "Sets up a new VPC network on Google Cloud",
    tags: ["gcp", "network", "vpc"],
    stars: 987,
    version: "8.0.0",
    provider: "hashicorp/google",
    versions: [
      { version: "8.0.0", date: "2024-01-25" },
      { version: "7.5.0", date: "2023-12-10" },
    ],
  },
  {
    id: 7,
    namespace: "Azure",
    name: "aks",
    fullName: "Azure/aks/azurerm",
    description: "Terraform module for deploying an AKS cluster on Azure",
    tags: ["azure", "kubernetes", "aks"],
    stars: 1654,
    version: "7.5.0",
    provider: "hashicorp/azurerm",
    versions: [
      { version: "7.5.0", date: "2024-02-05" },
      { version: "7.4.0", date: "2024-01-15" },
    ],
  },
  {
    id: 8,
    namespace: "terraform-aws-modules",
    name: "s3-bucket",
    fullName: "terraform-aws-modules/s3-bucket/aws",
    description: "Terraform module which creates S3 bucket resources on AWS",
    tags: ["aws", "storage", "s3"],
    stars: 2156,
    version: "3.15.1",
    provider: "hashicorp/aws",
    versions: [
      { version: "3.15.1", date: "2024-01-30" },
      { version: "3.15.0", date: "2024-01-05" },
    ],
  },
]

type Module = (typeof modulesData)[0]

export default function TerraformRegistry() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filteredModules, setFilteredModules] = useState<Module[]>(modulesData)
  const [displayedCount, setDisplayedCount] = useState(6)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set())
  const [currentSort, setCurrentSort] = useState("stars")
  const [searchTerm, setSearchTerm] = useState("")
  const [heroSearchTerm, setHeroSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Filter and sort modules
  useEffect(() => {
    const filtered = modulesData.filter((module) => {
      const matchesSearch =
        !searchTerm ||
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTags = selectedTags.size === 0 || module.tags.some((tag) => selectedTags.has(tag))

      const matchesProvider = selectedProviders.size === 0 || selectedProviders.has(module.provider)

      return matchesSearch && matchesTags && matchesProvider
    })

    // Sort
    filtered.sort((a, b) => {
      if (currentSort === "stars") {
        return b.stars - a.stars
      } else if (currentSort === "recent") {
        return new Date(b.versions[0].date).getTime() - new Date(a.versions[0].date).getTime()
      } else if (currentSort === "name") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    setFilteredModules(filtered)
    setDisplayedCount(6)
  }, [searchTerm, selectedTags, selectedProviders, currentSort])

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setSelectedTags(newTags)
  }

  const toggleProvider = (provider: string) => {
    const newProviders = new Set(selectedProviders)
    if (newProviders.has(provider)) {
      newProviders.delete(provider)
    } else {
      newProviders.add(provider)
    }
    setSelectedProviders(newProviders)
  }

  const clearFilters = () => {
    setSelectedTags(new Set())
    setSelectedProviders(new Set())
  }

  const handleHeroSearch = () => {
    setSearchTerm(heroSearchTerm)
    document.getElementById("module-list")?.scrollIntoView({ behavior: "smooth" })
  }

  const copyToClipboard = () => {
    if (!selectedModule) return
    const code = `module "${selectedModule.name}" {
  source  = "${selectedModule.fullName}"
  version = "${selectedModule.version}"
  
  # Configuration options
}`
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                T
              </span>
              <span className="text-xl font-bold text-gray-900">
                terra<span className="text-green-600">peak</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#browse" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Browse
              </a>
              <a href="#providers" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Providers
              </a>
              <a href="#modules" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Modules
              </a>
              <a href="#docs" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Documentation
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col gap-2">
                <a
                  href="#browse"
                  className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                >
                  Browse
                </a>
                <a
                  href="#providers"
                  className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                >
                  Providers
                </a>
                <a
                  href="#modules"
                  className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                >
                  Modules
                </a>
                <a
                  href="#docs"
                  className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                >
                  Documentation
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Terraform Module Registry</h1>
            <p className="text-lg text-gray-700 mb-8">
              Discover and share Terraform modules and providers for your infrastructure
            </p>

            {/* Hero Search */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={heroSearchTerm}
                onChange={(e) => setHeroSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                placeholder="Search modules, providers..."
                className="w-full px-4 py-3 pr-24 rounded-lg border-2 border-green-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
                aria-label="Search modules and providers"
              />
              <button
                onClick={handleHeroSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>

            <div className="mt-6">
              <a
                href="#browse"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Browse Modules
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={clearFilters} className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Clear
                </button>
              </div>

              {/* Tags Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["aws", "gcp", "kubernetes", "network", "security", "database"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        selectedTags.has(tag)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Providers</h3>
                <div className="space-y-2">
                  {["hashicorp/aws", "hashicorp/google", "hashicorp/kubernetes", "hashicorp/azurerm"].map(
                    (provider) => (
                      <label key={provider} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProviders.has(provider)}
                          onChange={() => toggleProvider(provider)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{provider}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Module List */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter modules..."
                    className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                    aria-label="Filter modules"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-gray-700 font-medium whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={currentSort}
                    onChange={(e) => setCurrentSort(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                  >
                    <option value="stars">Most Starred</option>
                    <option value="recent">Recently Updated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {Math.min(displayedCount, filteredModules.length)} of {filteredModules.length} modules
              </p>
            </div>

            {/* Module Grid */}
            <div id="module-list" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredModules.slice(0, displayedCount).map((module) => {
                const initials = module.namespace.substring(0, 2).toUpperCase()
                return (
                  <article
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {module.namespace}/<span className="text-green-600">{module.name}</span>
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{module.provider}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{module.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {module.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {module.stars}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          v{module.version}
                        </span>
                      </div>
                      <button className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Load More */}
            {displayedCount < filteredModules.length && (
              <div className="text-center">
                <button
                  onClick={() => setDisplayedCount(displayedCount + 6)}
                  className="px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Load More Modules
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div
          onClick={() => setSelectedModule(null)}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedModule.fullName}</h2>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6">
                {/* Module Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                      {selectedModule.namespace.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{selectedModule.namespace}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {selectedModule.stars}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          v{selectedModule.version}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedModule.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedModule.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Usage Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Usage</h3>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`module "${selectedModule.name}" {
  source  = "${selectedModule.fullName}"
  version = "${selectedModule.version}"
  
  # Configuration options
}`}</code>
                    </pre>
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-3 right-3 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Versions Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Available Versions</h3>
                  <div className="space-y-2">
                    {selectedModule.versions.map((v) => (
                      <div key={v.version} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium text-gray-900">v{v.version}</span>
                          <span className="text-sm text-gray-600 ml-3">{v.date}</span>
                        </div>
                        <button className="text-sm text-green-600 hover:text-green-700 font-medium">Install</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  T
                </span>
                <span className="text-lg font-bold text-gray-900">
                  terra<span className="text-green-600">peak</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Your trusted Terraform module registry</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#docs" className="text-gray-600 hover:text-green-600">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#guides" className="text-gray-600 hover:text-green-600">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#api" className="text-gray-600 hover:text-green-600">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#github" className="text-gray-600 hover:text-green-600">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#discord" className="text-gray-600 hover:text-green-600">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#forum" className="text-gray-600 hover:text-green-600">
                    Forum
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="text-gray-600 hover:text-green-600">
                    About
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-gray-600 hover:text-green-600">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-600 hover:text-green-600">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 terrapeak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
