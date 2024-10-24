# Diamond Enterprise System

The system is designed for local launch of frontend and backend parts of the application.

Contracts are deployed to the BNB Chain testnet network.

# Docs

- [smart-contracts-readme](./contracts/README.md)
- [frontend-readme](./frontend/README.md)
- [backend-readme](./backend/README.md)

# Как поднять проект (live-демо)

## Общая сборка (поднять докер)

1. Для начала нужно подготовить .env файл (данные для заполнения можно найти на диске env docker)
2. `docker-compose up --build -d`
3. Перейти на `http://localhost:3000/`

## Локальные сборки отдельно фронт и бекенд

1. Для начала нужно подготовить .env файлы
   Для папки backend и frontend , эти файлы будут лежать на диске
2. Проследовать по пунктам из Docs
