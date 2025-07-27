# Schéma de la Base de Données

Le schéma de la base de données pour PostgreSQL sera directement **généré et géré par Payload CMS** en fonction des configurations des "Collections" que nous avons définies dans la section "Modèles de Données". Il n'est donc pas nécessaire de maintenir manuellement un script SQL de création.

Cependant, à des fins de clarté et pour visualiser la structure finale, voici une représentation en SQL DDL (Data Definition Language) de ce que Payload va générer.

**NOTE :** Ce script est une illustration. La structure exacte, notamment la gestion de la localisation (bilinguisme), sera gérée de manière optimisée par Payload (souvent via des tables de jointure ou des colonnes JSONB).

```sql
-- ATTENTION : Ce schéma est une représentation gérée automatiquement par Payload CMS.
-- Ne pas appliquer manuellement.

-- Collection pour les utilisateurs (Auteurs)
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR,
    "email" VARCHAR UNIQUE NOT NULL,
    "hashed_password" VARCHAR,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Collection pour les médias
CREATE TABLE "media" (
    "id" SERIAL PRIMARY KEY,
    -- Payload gère la localisation de manière flexible
    "alt" JSONB, -- Ex: { "fr": "Texte FR", "en": "Texte EN" }
    "url" VARCHAR,
    "filename" VARCHAR,
    "mime_type" VARCHAR,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Collection pour les catégories
CREATE TABLE "categories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR UNIQUE NOT NULL
);

-- Collection pour les tags
CREATE TABLE "tags" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR UNIQUE NOT NULL
);

-- Collection pour les articles
CREATE TABLE "posts" (
    "id" SERIAL PRIMARY KEY,
    "slug" VARCHAR UNIQUE NOT NULL,
    "status" VARCHAR CHECK(status IN ('draft', 'published')),
    "published_date" TIMESTAMPTZ,
    "author_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "hero_image_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table générée par Payload pour le contenu localisé des articles
CREATE TABLE "posts_locales" (
    "id" SERIAL PRIMARY KEY,
    "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
    "locale" VARCHAR, -- 'fr' or 'en'
    "title" VARCHAR,
    "content" JSONB, -- Le contenu RichText est stocké en JSON
    "excerpt" TEXT
);

-- Table de jointure pour la relation plusieurs-à-plusieurs Posts <-> Categories
CREATE TABLE "posts_categories" (
    "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
    "category_id" INTEGER REFERENCES "categories"("id") ON DELETE CASCADE,
    PRIMARY KEY ("post_id", "category_id")
);

-- Table de jointure pour la relation plusieurs-à-plusieurs Posts <-> Tags
CREATE TABLE "posts_tags" (
    "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES "tags"("id") ON DELETE CASCADE,
    PRIMARY KEY ("post_id", "tag_id")
);

-- Indexes pour la performance des requêtes
CREATE INDEX "posts_slug_idx" ON "posts" ("slug");
CREATE INDEX "posts_published_date_idx" ON "posts" ("published_date" DESC);
```

D'accord, continuons.

La prochaine étape est de définir la structure concrète des fichiers et des dossiers du projet. Une organisation claire est essentielle pour la maintenabilité et pour que les agents IA puissent intervenir efficacement.

---
