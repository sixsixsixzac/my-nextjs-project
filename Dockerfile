# Use Bun as base image
FROM oven/bun:1 AS base

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application files
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true
RUN bun run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "start"]

