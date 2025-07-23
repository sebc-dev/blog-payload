# **Guide d'implémentation de la stratégie de cache optimisée**

## **Objectif**

Ce document décrit la procédure pour remplacer la stratégie de cache monolithique actuelle par une approche optimisée à deux niveaux dans le workflow GitHub Actions. L'objectif est de séparer le cache des dépendances (pnpm) du cache de build (Next.js) pour accélérer les exécutions de la CI en n'invalidant que ce qui est strictement nécessaire.

## **Mise en œuvre de la stratégie à deux niveaux**

La solution consiste à utiliser deux mécanismes de cache distincts au sein du même job.

### **Couche 1 : Cache des dépendances pnpm**

La mise en cache du pnpm store est gérée de manière optimale et automatique par l'action actions/setup-node. Il n'est pas nécessaire d'ajouter une étape manuelle actions/cache pour les dépendances.  
Action requise :  
Dans l'étape Setup Node.js, assurez-vous que l'option cache est définie sur 'pnpm'.  
\- name: Setup Node.js  
 uses: actions/setup-node@v4  
 with:  
 node-version: '20.x' \# ou votre version de Node.js  
 cache: 'pnpm'

Cette configuration unique demande à l'action de :

1. Mettre en cache le contenu du pnpm store.
2. Utiliser une clé de cache basée **uniquement** sur le hash du fichier pnpm-lock.yaml.
3. Restaurer le cache au début du job.
4. L'étape pnpm install qui suit sera ainsi quasi instantanée si le lockfile n'a pas changé.

### **Couche 2 : Cache de build Next.js**

Cette couche nécessite une étape actions/cache manuelle, spécifiquement configurée pour le répertoire .next/cache. Elle utilise une clé primaire très spécifique et une clé de restauration plus générique pour permettre les builds incrémentiels.  
Action requise :  
Ajoutez l'étape de cache suivante juste avant l'étape de build (pnpm run build).  
\- name: Cache Next.js build  
 id: next-build-cache  
 uses: actions/cache@v4  
 with:  
 \# 1\. Chemin vers le répertoire de cache de Next.js  
 path: ./.next/cache

    \# 2\. Clé primaire (key) : très spécifique
    \# Invalide le cache si les fichiers de config OU les fichiers source changent.
    \# Ceci force la sauvegarde d'un nouveau cache après un build réussi.
    key: ${{ runner.os }}-nextjs-${{ hashFiles('\*\*/next.config.mjs', '\*\*/tsconfig.json') }}-${{ hashFiles('src/\*\*/\*.{js,jsx,ts,tsx}') }}

    \# 3\. Clé de restauration (restore-keys) : moins spécifique
    \# Permet de restaurer le cache le plus récent même si les fichiers source ont changé.
    \# C'est ce qui permet à \`next build\` de démarrer en mode incrémentiel.
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('\*\*/next.config.mjs', '\*\*/tsconfig.json') }}-

## **Fichier .github/workflows/ci.yml complet**

Voici le fichier de workflow complet intégrant la stratégie de cache optimisée. Vous pouvez l'utiliser comme référence directe pour remplacer votre configuration actuelle.  
\#.github/workflows/ci.yml

name: CI Pipeline

on:  
 push:  
 branches:  
 \- main  
 pull_request:  
 branches:  
 \- main

jobs:  
 build-and-test:  
 runs-on: ubuntu-latest  
 steps:  
 \# Étape 1: Récupération du code du dépôt  
 \- name: Checkout repository  
 uses: actions/checkout@v4

      \# Étape 2: Configuration de pnpm
      \- name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8 \# Spécifiez la version de pnpm de votre projet

      \# Étape 3: Configuration de Node.js avec cache pnpm intégré (Couche 1\)
      \# Gère automatiquement le cache du pnpm store basé sur pnpm-lock.yaml
      \- name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x' \# Spécifiez la version de Node.js de votre projet
          cache: 'pnpm'

      \# Étape 4: Installation des dépendances
      \# Sera quasi-instantanée si le cache de la Couche 1 a été restauré.
      \- name: Install dependencies
        run: pnpm install \--frozen-lockfile

      \# Étape 5: Mise en cache des artefacts de build Next.js (Couche 2\)
      \# Permet les builds incrémentiels rapides.
      \- name: Cache Next.js build
        id: next-build-cache
        uses: actions/cache@v4
        with:
          path: ./.next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('\*\*/next.config.mjs', '\*\*/tsconfig.json') }}-${{ hashFiles('src/\*\*/\*.{js,jsx,ts,tsx}') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('\*\*/next.config.mjs', '\*\*/tsconfig.json') }}-

      \# Étape 6: Build de l'application Next.js
      \# Profitera du cache restauré à l'étape 5 pour un build plus rapide.
      \- name: Build Next.js application
        run: pnpm run build

      \# Étape 7: Exécution des linters et des tests
      \- name: Run linter
        run: pnpm run lint

      \- name: Run tests
        run: pnpm run test

L'application de cette configuration améliorera significativement les temps d'exécution de votre CI en réduisant les réinstallations de dépendances et en activant les builds incrémentiels de Next.js.
