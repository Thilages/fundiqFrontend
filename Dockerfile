FROM node:18-alpine

ENV NODE_OPTIONS=--max_old_space_size=8192

WORKDIR /frontend


# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --inline-builds --refresh-lockfile

# Copy .env before build so Next.js can use it
COPY .env ./

# Copy the rest of the app
COPY . .

# Build the Next.js app (reads .env at build time)
RUN yarn build

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

USER node

CMD ["yarn", "start"]