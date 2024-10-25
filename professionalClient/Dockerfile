# Use the official Node.js image as a base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY professionalClient/package.json ./
COPY professionalClient/package-lock.json ./

# Install Expo CLI globally and other dependencies
RUN npm install && \
    npm install -g expo-cli@latest && \
    npm install --legacy-peer-deps && \
    npm install react-native-gesture-handler --legacy-peer-deps

# Copy the rest of the app
COPY professionalClient/. .

#command and exposed ports are set up in the docker-compose.yml file