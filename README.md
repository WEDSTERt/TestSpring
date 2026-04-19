# 📋 Kanban Docky

**Kanban Docky** – это полнофункциональное веб-приложение для управления проектами и задачами в стиле канбан. Проект построен на современном стеке технологий: React, Spring Boot, GraphQL и PostgreSQL.

## 🚀 Возможности

- 🔐 **Аутентификация** – регистрация и вход с JWT-токенами.
- 📁 **Управление проектами** – создание, редактирование, удаление проектов.
- 👥 **Участники проектов** – добавление, удаление, назначение ролей (OWNER, ADMIN, MEMBER, VIEWER).
- 📌 **Канбан-доска** – визуальное управление задачами с колонками «Создано», «В разработке», «Выполнено».
- 📝 **Задачи** – создание, редактирование, удаление, назначение исполнителей, установка дедлайна, приоритета и статуса.
- 🔄 **Drag & Drop** – перемещение задач между колонками.
- 📎 **Вложения** – загрузка, просмотр и удаление файлов, прикреплённых к задачам (файлы хранятся в БД).
- 👤 **Профиль пользователя** – изменение имени и пароля, удаление аккаунта.
- 📱 **Адаптивный дизайн** – интерфейс адаптирован для работы на ПК и мобильных устройствах.

## 🛠 Технологии

### Фронтенд
- React 18
- React Router DOM v6
- Apollo Client (GraphQL)
- react-datepicker
- FontAwesome
- Vite

### Бэкенд
- Spring Boot 3.2.6
- Spring GraphQL
- Spring Security (JWT)
- Spring Data JPA
- PostgreSQL
- JJWT (JSON Web Token)

## 📦 Установка и запуск

### Требования
- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Docker (опционально, для MailHog)

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-repo/kanban-docky.git
cd kanban-docky
```

### 2. Настройка базы данных
Создайте базу PostgreSQL и выполните скрипты из `database/schema.sql` (при необходимости). Пример подключения в `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/kanbandb
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 3. Запуск бэкенда
```bash
cd backend
./gradlew bootRun
# или используйте IDEA
```
Сервер запустится на `http://localhost:8080`. GraphQL IDE доступна по адресу `http://localhost:8080/graphiql`.

### 4. Запуск фронтенда
```bash
cd frontend
npm install
npm run dev
```
Приложение будет доступно на `http://localhost:3000`.

### 5. Переменные окружения (опционально)
Создайте файл `.env` в папке `frontend`:
```env
VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

## 🧪 Тестовые данные
При первом запуске база пуста. Вы можете зарегистрировать нового пользователя через интерфейс или добавить тестовые данные вручную.

## 📁 Структура проекта

### Бэкенд
```
src/main/java/com/
├── config/         # Конфигурации (Security, JWT, CORS)
├── controller/     # GraphQL и REST контроллеры
├── entity/         # JPA сущности
├── repository/     # Spring Data репозитории
├── service/        # Бизнес-логика
└── GraphQLApplication.java
```

### Фронтенд
```
src/
├── components/     # React компоненты
├── contexts/       # Контексты (AuthContext)
├── graphql/        # GraphQL запросы и мутации
├── utils/          # Вспомогательные функции (валидация)
├── apollo.js       # Настройка Apollo Client
├── App.jsx
└── main.jsx
```

## 🔧 Основные настройки

### JWT (бэкенд)
В `application.properties` укажите секретный ключ и срок действия токена:
```properties
jwt.secret=ваш_секретный_ключ_длиной_не_менее_32_символов
jwt.expiration=86400000
```

### CORS (бэкенд)
Разрешите адрес фронтенда в `SecurityConfig.java` (по умолчанию `http://localhost:3000`).

### Прокси (фронтенд)
В `vite.config.js` настроен прокси для `/graphql` и `/api`.

## 👥 Авторы
WEDSTER – разработка
