# ҰБТ Информатика — подготовка к ЕНТ

MVP веб-платформы для подготовки к ҰБТ/ЕНТ по информатике. Ученик решает пробные варианты (40 заданий) и получает балл, освоение по темам и разбор каждого задания. Интерфейс на казахском языке, mobile-first.

**Стек:** Next.js 16 (App Router, TypeScript), Tailwind CSS 4, PostgreSQL 16 + Prisma 7, Auth.js v5 (email + пароль), Zod, Vitest, GitHub Actions. Деплой — Docker-образ (`output: "standalone"`) у казахстанского провайдера. Vercel-специфичных функций нет.

## Быстрый старт

### Вариант 1: всё в Docker

```bash
cp .env.example .env
# впишите AUTH_SECRET: openssl rand -base64 32
docker compose up --build
```

- `db` — PostgreSQL 16 (порт 5432, данные в volume `pgdata`);
- `migrate` — одноразово применяет миграции (`prisma migrate deploy`) и завершается;
- `app` — Next.js на <http://localhost:3000>, стартует после успешных миграций.

Демо-вариант с заданиями всех четырёх типов:

```bash
docker compose run --rm migrate npm run db:seed
```

### Вариант 2: локальная разработка

Нужен Node.js ≥ 22.12.

```bash
npm ci                      # postinstall сгенерирует Prisma Client
cp .env.example .env        # DATABASE_URL и AUTH_SECRET
docker compose up -d db     # или свой PostgreSQL
npm run db:migrate          # применить миграции
npm run db:seed             # демо-вариант
npm run dev                 # http://localhost:3000
```

Проверка: `curl localhost:3000/api/health` → `{"status":"ok","db":"ok"}`.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер |
| `npm run build` / `npm start` | production-сборка и запуск |
| `npm run lint` | ESLint |
| `npm run typecheck` | генерация типов маршрутов + `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run db:migrate` | `prisma migrate deploy` (применить миграции) |
| `npm run db:migrate:dev` | `prisma migrate dev` (создать новую миграцию из изменений схемы) |
| `npm run db:seed` | демо-вариант «Демо нұсқа» |
| `npm run db:studio` | Prisma Studio |

## Переменные окружения

Все настройки берутся из окружения: в образ ничего не зашивается, `.env` в git не попадает (в репозитории только `.env.example`). При старте сервер проверяет переменные (`src/server/env.ts`) и завершается со списком ошибок, если что-то не так.

| Переменная | Обязательна | Описание |
|---|---|---|
| `DATABASE_URL` | да | `postgresql://user:pass@host:5432/db?schema=public` |
| `AUTH_SECRET` | да | ключ подписи сессий, ≥ 32 символов: `openssl rand -base64 32` |
| `AUTH_URL` | в проде | публичный URL приложения, например `https://unt.example.kz` |
| `AUTH_TRUST_HOST` | за прокси | `true`, если перед приложением балансировщик/nginx |
| `PORT`, `HOSTNAME` | нет | по умолчанию в образе `3000` и `0.0.0.0` |

Сборке (`next build`) переменные не нужны: CI и Docker собирают без базы и секретов.

## Структура

```
prisma/
  schema.prisma          модели и enum'ы
  migrations/            SQL-миграции (+ CHECK-ограничения и частичный индекс вручную)
  seed.ts                демо-вариант
src/
  app/
    (auth)/              /login, /register, server actions входа/регистрации/выхода
    (app)/               защищённые страницы: /dashboard, /profile (проверка сессии в layout)
    api/auth/            обработчики Auth.js
    api/health/          health-check
  auth.config.ts         лёгкая часть конфига Auth.js (для proxy)
  auth.ts                Credentials-провайдер (Prisma + Argon2id)
  proxy.ts               ранний редирект анонимов с защищённых страниц
  lib/items/             раскладка ҰБТ и Zod-схемы JSONB (общие для сервера и клиента)
  lib/auth/              схемы форм, защита от open redirect
  server/                только серверный код: db, items (ключи ответов), password, env, session
  generated/prisma/      сгенерированный Prisma Client (не коммитится)
```

## Модель данных

| Модель | Назначение |
|---|---|
| `User` | email (уникальный, в нижнем регистре), хэш пароля Argon2id, имя, роль `student`/`admin` |
| `Variant` | пробный вариант: название, длительность, `isPublished` |
| `Item` | задание: `number` 1–40, `type`, `topic`, `points`, `body`, `answerKey`, `explanation` (JSONB) |
| `Attempt` | попытка: `startedAt`, `deadlineAt` (таймер на сервере), `submittedAt`, `score` |
| `Answer` | ответ ученика (`response` JSONB, `points`), уникален по `(attemptId, itemId)` |
| `Event` | журнал для аналитики: `type`, `payload` JSONB, ссылки на user/attempt/item |

Раскладка ҰБТ (`src/lib/items/layout.ts`), максимум 50 баллов:

| № | Тип | Баллы |
|---|---|---|
| 1–25 | `single`: один правильный ответ | 1 |
| 26–30 | `context`: вопрос к общему тексту, коду или таблице | 1 |
| 31–35 | `matching`: сопоставление | 2 |
| 36–40 | `multiple`: несколько правильных ответов | 2 |

Форматы JSONB описаны Zod-схемами в `src/lib/items/schema.ts` (`body`, `explanation`, ответ ученика) и `src/server/items.ts` (`answerKey`). Вложения в `body` — код (`python`, `pseudocode`, …), таблица или изображение. Перед записью задание проходит `parseItem`: проверяются формы JSON, соответствие типа и баллов номеру и то, что ключ ответа ссылается на существующие варианты.

Миграция дополнительно задаёт в БД: `number BETWEEN 1 AND 40`, `points > 0`, JSONB-колонки — объекты, `deadline_at > started_at`, и частичный уникальный индекс — не больше одной незавершённой попытки на пользователя и вариант.

## Правильные ответы не уходят в браузер

Защита в несколько слоёв:

1. **Prisma Client по умолчанию не загружает `Item.answerKey`, `Item.explanation` и `User.passwordHash`** (`omit` в `src/server/db.ts`). Чтобы их прочитать, запрос должен явно указать `omit: { answerKey: false }`.
2. **Ответ не может попасть в `body`**: схемы строгие, лишний ключ вроде `isCorrect` в варианте ответа отклоняется при записи.
3. **`toPublicItem`** строит представление задания для попытки по белому списку полей и повторно валидирует `body`. При неожиданных данных он падает, а не пропускает их.
4. **Модули с ключами помечены `import "server-only"`**: импорт из клиентского компонента ломает сборку.
5. **Тесты** (`src/server/items.test.ts`) проверяют, что публичное представление не содержит ключа и разбора.

Разбор (`explanation`) тоже не загружается по умолчанию; экран разбора (следующий шаг) должен запрашивать его только для завершённой попытки.

## Авторизация

- Регистрация и вход по email и паролю (Auth.js Credentials, JWT-сессия в httpOnly-cookie).
- Пароли хэшируются Argon2id с параметрами OWASP (19 MiB, 2 итерации). Для неизвестного email выполняется проверка с фиктивным хэшем, чтобы время ответа не выдавало зарегистрированные адреса.
- Защищённые страницы проверяют сессию на сервере (`requireUser()` в `src/app/(app)/layout.tsx`). `proxy.ts` лишь заранее перенаправляет анонимов на `/login?callbackUrl=…`.
- `callbackUrl` сводится к пути на этом же сайте, поэтому open redirect невозможен.

## Деплой (Казахстан)

Целевая площадка — Yandex Cloud (регион Казахстан) или другой KZ-провайдер. Хранение там соответствует требованию закона РК «О персональных данных» о локализации данных граждан.

```bash
docker build -t unt-prep .                               # приложение (target runner)
docker build -t unt-prep-migrate --target migrator .     # миграции

# при каждом релизе — сначала миграции, затем приложение
docker run --rm -e DATABASE_URL=... unt-prep-migrate
docker run -d -p 3000:3000 \
  -e DATABASE_URL=... -e AUTH_SECRET=... \
  -e AUTH_URL=https://unt.example.kz -e AUTH_TRUST_HOST=true \
  unt-prep
```

- Образ: `node:22-bookworm-slim`, непривилегированный пользователь, внутри только standalone-сервер.
- `HEALTHCHECK` и балансировщик используют `GET /api/health`: 200 — база отвечает, 503 — нет.
- TLS завершается на балансировщике/nginx перед приложением.
- Управляемый PostgreSQL провайдера подключается через `DATABASE_URL`; для большого числа инстансов поставьте перед ним пулер соединений (PgBouncer или пулер провайдера).

## CI

`.github/workflows/ci.yml` запускается на push в `main` и на каждый pull request:

- **check**: `npm ci` → lint → typecheck → unit-тесты → `prisma migrate deploy` на пустом PostgreSQL → проверка, что `schema.prisma` совпадает с миграциями → `next build` без переменных окружения;
- **docker**: сборка runtime-образа (без push).

## Соглашения

- Сообщения коммитов: `UNT-<номер задачи>: <что сделано>`.
- Перед коммитом: `npm run lint && npm run typecheck && npm test && npm run build`.
- Изменили `schema.prisma` → `npm run db:migrate:dev -- --name <имя>` и закоммитьте миграцию вместе со схемой (иначе CI упадёт на проверке расхождения).
