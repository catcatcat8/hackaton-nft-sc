# Dockerfile for React Frontend

# Нода
FROM node:18-alpine AS build

# Директория
WORKDIR /app

# Установка
COPY package.json package-lock.json ./
RUN npm install

# Копируем фронт
COPY . .

# Билдим приложение
RUN npm run build

# Поднимаем нжинкс
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Сетапим 80 порт
EXPOSE 80

# Поднимаем никсы
CMD ["nginx", "-g", "daemon off;"]
