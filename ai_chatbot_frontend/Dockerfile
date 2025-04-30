# Stage 1: Build React App
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependencies
COPY package.json ./

# Use legacy peer deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy rest of the files
COPY . .

# Build-time environment variable
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build production build
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Custom nginx config for React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build to nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
