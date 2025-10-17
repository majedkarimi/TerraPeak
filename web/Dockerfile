# =============================================================================
# TerraPeak Web - Production-Ready Multi-Stage Dockerfile
# =============================================================================
# This Dockerfile follows Next.js best practices for production deployments
# - Multi-stage build for minimal final image size
# - Efficient layer caching for faster rebuilds
# - Security-hardened with non-root user
# - Optimized for Yarn package manager
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# Install dependencies in a separate stage for better caching
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Install libc6-compat for compatibility with some native dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies with frozen lockfile for reproducible builds
RUN yarn install --frozen-lockfile --production=false

# -----------------------------------------------------------------------------
# Stage 2: Builder
# Build the Next.js application
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
# This creates optimized production build in .next folder
RUN yarn build

# -----------------------------------------------------------------------------
# Stage 3: Runner (Production)
# Run the application with minimal dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
# Copy public assets
COPY --from=builder /app/public ./public

# Copy Next.js standalone output (includes minimal runtime)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check to ensure container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the Next.js server
CMD ["node", "server.js"]
