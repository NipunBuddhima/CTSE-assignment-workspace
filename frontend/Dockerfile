FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with better network retry settings
RUN npm ci --no-audit --no-fund

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start the application - serve doesn't support --host flag
CMD ["serve", "-s", "dist", "-l", "5173"]
