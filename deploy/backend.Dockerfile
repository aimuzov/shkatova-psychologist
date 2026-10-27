# Сервис чата: Node запускает TypeScript сам, сборка не нужна. Из зависимостей только
# Sentry, всё остальное в devDependencies и нужно лишь сборке сайта.
# Контекст сборки -- корень репо: промпт берёт данные о Татьяне из src/shared.

FROM node:26.11.1-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund --loglevel=error
COPY src/shared ./src/shared
COPY src/backend ./src/backend
USER node
EXPOSE 8787
CMD ["node", "--import", "./src/backend/instrument.ts", "src/backend/server.ts"]
