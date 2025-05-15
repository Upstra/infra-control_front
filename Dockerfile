FROM node:20-alpine AS base

RUN addgroup -g 1001 -S nodegroup && adduser -S nodeuser -G nodegroup
RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS builder

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

FROM nginx:stable-alpine AS runner

RUN addgroup -g 1001 -S nodegroup && adduser -S nodeuser -G nodegroup

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nodeuser

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]