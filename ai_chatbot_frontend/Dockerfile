# Stage 1: Build React App
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependencies
COPY package.json ./

# If you have package-lock.json, uncomment the line below
# COPY package-lock.json ./

RUN npm install

# Copy remaining files
COPY . .

# Build-time environment variable for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the production-ready React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# If using React Router, provide a custom nginx config
# Make sure you have a valid `nginx.conf` in the project root
# If not, REMOVE the following line
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx's HTML directory
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
