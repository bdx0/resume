# Stage 1: Install dependencies
FROM node:20-alpine AS dev

RUN npm install -g npm@latest

WORKDIR /app
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1
# RUN npm ci
RUN npm install
RUN npm run build

ENV NODE_ENV production

CMD ["npm", "run", "dev"]
