-- Script d'initialisation PostgreSQL pour les tests d'intégration
-- Ce script s'exécute automatiquement au premier démarrage du conteneur

-- Configurer les extensions nécessaires pour PayloadCMS
\c test_payloadcms;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";      -- Pour les emails insensibles à la casse
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Pour la recherche full-text