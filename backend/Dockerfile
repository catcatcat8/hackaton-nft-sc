# Dockerfile for Node.js Backend

# Берем образ ноды
FROM node:18-alpine

# Прокидываем рабочую директорию для контейнера
WORKDIR /app

# Качаем курл
RUN apk add --no-cache curl

RUN curl -o root.crt https://storage.yandexcloud.net/cloud-certs/CA.pem

# Установка зависимостей
COPY package.json package-lock.json ./
RUN npm install

# Копируем бек
COPY . .

# Настраиваем 5000й порт
EXPOSE 5000

# Поднимаем бек
CMD ["npm", "run", "start"]
