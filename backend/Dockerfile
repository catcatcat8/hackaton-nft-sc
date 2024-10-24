# Dockerfile for Node.js Backend

# Берем образ ноды
FROM node:18-alpine

# Прокидываем рабочую директорию для контейнера
WORKDIR /app

# Установка зависимостей
COPY package.json package-lock.json ./
RUN npm install

# Копируем бек
COPY . .

# Настраиваем 5000й порт
EXPOSE 5000

# Поднимаем бек
CMD ["npm", "run", "start"]
