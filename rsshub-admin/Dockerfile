FROM node:20-alpine

# Install Docker CLI to be able to restart containers via mounted socket
# Also install python3 and dependencies required by decrypt.py
RUN apk add --no-cache docker-cli python3 py3-requests py3-pycryptodome

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the Vite frontend
RUN npm run build

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
