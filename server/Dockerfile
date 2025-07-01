# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Expose the port (default 5001, can be overridden)
EXPOSE 5001

# Set environment variables (override in production as needed)
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
