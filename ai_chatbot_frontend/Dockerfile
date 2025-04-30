# # Step 1: Build the React app using Node.js
# FROM node:18-alpine as build

# WORKDIR /app

# # Copy and install dependencies
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install

# # Copy the rest of the project files
# COPY . .

# # Build the app using the API URL
# ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
# RUN npm run build

# # Step 2: Use Nginx to serve the built app
# FROM nginx:stable-alpine

# # ✅ Copy custom Nginx config to fix React routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy built React files into Nginx HTML directory
# COPY --from=build /app/build /usr/share/nginx/html

# # Expose default HTTP port
# EXPOSE 80

# # Start Nginx server
# CMD ["nginx", "-g", "daemon off;"]



# Stage 1: Build React App
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies first (cached)
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Pass environment variables during build (optional)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build React App
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy custom Nginx config (for React Router support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build files
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
