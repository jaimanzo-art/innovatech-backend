FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev


FROM node:24-alpine AS production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

EXPOSE 3000

CMD ["npm", "start"]