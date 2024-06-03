# Use the official Node.js image
FROM node:20

# Create app directory
WORKDIR /usr/src/app


# Install Bun and configure PATH
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
RUN bun --version

# Install app dependencies
COPY package*.json ./
RUN npm install

# Build the app
COPY . .
# CMD ["npm", "prisma", "db", "push"]
RUN npm prisma db push
RUN npm run app:build

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "run", "app:start"]

