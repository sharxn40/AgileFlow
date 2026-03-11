# Use official Node.js LTS image (full, not slim — needed for native modules like sqlite3)
FROM node:20

# Install native build tools required by sqlite3 and other native addons
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Cloud Run will set PORT automatically via environment variable
ENV PORT=8080

# Tell firebase-admin to use the service account key file in the container
ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/serviceAccountKey.json

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
