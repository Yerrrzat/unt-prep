-- CreateEnum
CREATE TYPE "role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "item_type" AS ENUM ('single', 'context', 'matching', 'multiple');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" "role" NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 80,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "item_type" NOT NULL,
    "topic" VARCHAR(64) NOT NULL,
    "points" INTEGER NOT NULL,
    "body" JSONB NOT NULL,
    "answer_key" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline_at" TIMESTAMPTZ(3) NOT NULL,
    "submitted_at" TIMESTAMPTZ(3),
    "score" INTEGER,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "response" JSONB NOT NULL,
    "points" INTEGER,
    "answered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "user_id" UUID,
    "attempt_id" UUID,
    "item_id" UUID,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "items_topic_idx" ON "items"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "items_variant_id_number_key" ON "items"("variant_id", "number");

-- CreateIndex
CREATE INDEX "attempts_user_id_started_at_idx" ON "attempts"("user_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "attempts_variant_id_idx" ON "attempts"("variant_id");

-- CreateIndex
CREATE INDEX "answers_item_id_idx" ON "answers"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_attempt_id_item_id_key" ON "answers"("attempt_id", "item_id");

-- CreateIndex
CREATE INDEX "events_type_created_at_idx" ON "events"("type", "created_at");

-- CreateIndex
CREATE INDEX "events_user_id_created_at_idx" ON "events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "events_attempt_id_idx" ON "events"("attempt_id");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Hand-written constraints (Prisma schema cannot express these)
-- ---------------------------------------------------------------------------

ALTER TABLE "items"
  ADD CONSTRAINT "items_number_range" CHECK ("number" BETWEEN 1 AND 40),
  ADD CONSTRAINT "items_points_positive" CHECK ("points" > 0),
  ADD CONSTRAINT "items_body_is_object" CHECK (jsonb_typeof("body") = 'object'),
  ADD CONSTRAINT "items_answer_key_is_object" CHECK (jsonb_typeof("answer_key") = 'object'),
  ADD CONSTRAINT "items_explanation_is_object" CHECK (jsonb_typeof("explanation") = 'object');

ALTER TABLE "variants"
  ADD CONSTRAINT "variants_duration_positive" CHECK ("duration_minutes" > 0);

ALTER TABLE "attempts"
  ADD CONSTRAINT "attempts_deadline_after_start" CHECK ("deadline_at" > "started_at"),
  ADD CONSTRAINT "attempts_score_non_negative" CHECK ("score" IS NULL OR "score" >= 0),
  ADD CONSTRAINT "attempts_submitted_after_start" CHECK ("submitted_at" IS NULL OR "submitted_at" >= "started_at");

ALTER TABLE "answers"
  ADD CONSTRAINT "answers_points_non_negative" CHECK ("points" IS NULL OR "points" >= 0);

-- At most one unfinished attempt per user and variant.
CREATE UNIQUE INDEX "attempts_one_open_per_user_variant"
  ON "attempts" ("user_id", "variant_id") WHERE "submitted_at" IS NULL;
