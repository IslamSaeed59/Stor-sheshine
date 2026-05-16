# ============================================
# Stage 1: Build the Frontend
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all package files (root + workspaces)
COPY package*.json ./
COPY Backend/package*.json ./Backend/
COPY FrontEnd/package*.json ./FrontEnd/

# Install ALL dependencies (including devDependencies needed for build)
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Build frontend with increased memory for large projects
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# ============================================
# Stage 2: Production Image (lightweight)
# ============================================
FROM node:20-alpine

WORKDIR /app

# Copy backend package files and install production-only deps
COPY Backend/package*.json ./Backend/
RUN cd Backend && npm install --omit=dev --legacy-peer-deps

# Copy backend source code
COPY Backend/ ./Backend/

# Copy the built frontend from Stage 1
COPY --from=builder /app/FrontEnd/dist ./FrontEnd/dist

# Create the uploads directory (will be overlaid by Docker Volume)
RUN mkdir -p /app/Backend/public/uploads

# Expose the backend port
EXPOSE 9000

# Enable graceful shutdown in Docker
STOPSIGNAL SIGTERM

# Start the server
CMD ["node", "Backend/index.js"]
