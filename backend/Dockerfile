# ===== STAGE 1: Сборка =====
FROM node:20-alpine as builder

# Временные зависимости для сборки
RUN apk add --no-cache --virtual .build-deps python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== STAGE 2: Финальный образ =====
FROM node:20-alpine

WORKDIR /app

# Копируем зависимости и production-билд
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Только production-зависимости
RUN npm install --only=production

# Создаем ТУ ЖЕ ПАПКУ, что в приложении + меняем владельца ВСЕЙ рабочей директории
RUN mkdir -p /app/logs && chown -R node:node /app

# Используем встроенного пользователя node (безопаснее)
USER node

EXPOSE 3001
CMD ["node", "dist/index.js"]