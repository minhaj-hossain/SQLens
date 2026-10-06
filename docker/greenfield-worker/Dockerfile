# ==============================================================================
# Greenfield Exam Isolated Worker - Secure Execution Sandbox (RCE Defense-in-Depth)
# ==============================================================================
FROM node:20-alpine

# Security hardening: install ca-certificates and minimal utilities, remove package cache
RUN apk add --no-cache bash ca-certificates \
    && rm -rf /var/cache/apk/*

# Create unprivileged execution user
RUN addgroup -g 1001 sandboxgroup && \
    adduser -D -u 1001 -G sandboxgroup -s /bin/sh sandbox

WORKDIR /sandbox

# Install pinned dependencies
RUN npm init -y && \
    npm install --save-dev typescript @types/node && \
    npm install @prisma/client@5.22.0 prisma@5.22.0

# Copy runner and evaluation harnesses
COPY evaluator.ts /sandbox/evaluator.ts
COPY runner.sh /sandbox/runner.sh

RUN chmod +x /sandbox/runner.sh && \
    chown -R sandbox:sandboxgroup /sandbox

# Drop all privileges
USER sandbox

# Environment restrictions
ENV NODE_ENV=production
ENV CI=true

ENTRYPOINT ["/sandbox/runner.sh"]
