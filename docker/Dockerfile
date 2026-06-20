FROM node:18-alpine

# Install curl for HEALTHCHECK
RUN apk add --no-cache curl

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 5000

HEALTHCHECK \
  --start-period=40s \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
