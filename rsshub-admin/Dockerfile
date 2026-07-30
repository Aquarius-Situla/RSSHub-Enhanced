FROM node:20-alpine

# Install Docker CLI to be able to restart containers via mounted socket
RUN apk add --no-cache docker-cli

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
