# 4. Hypothèses Techniques

## 4.1 Structure du Dépôt (Repository)

Compte tenu de l'intégration native de Payload 3 dans NextJS, un **Monorepo** est la structure logique et requise pour ce projet.

## 4.2 Architecture de Services

L'architecture est **unifiée**. Payload CMS s'exécute directement au sein de l'environnement NextJS. Cela permet d'utiliser l'API locale de Payload pour des performances maximales et simplifie le déploiement en une seule entité.
