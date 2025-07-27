# Monitoring et Observabilité

Pour le MVP, nous mettrons en place une stratégie de monitoring simple, efficace et alignée avec les contraintes budgétaires du projet (auto-hébergée et open-source). L'objectif est d'assurer la disponibilité et la performance du site, conformément aux KPIs définis.

## Pile de Monitoring (Monitoring Stack)

- **Monitoring de Disponibilité (Uptime) :** Nous déploierons **Uptime Kuma** dans un conteneur Docker sur le même VPS. Cet outil simple et léger vérifiera à intervalles réguliers que le site `sebc.dev` est en ligne et répond correctement. Il enverra des alertes en cas d'indisponibilité, nous permettant ainsi de suivre l'objectif de **99.9% de disponibilité**.
- **Suivi des Erreurs :** Pour le MVP, le suivi des erreurs se basera sur les **logs structurés** (format JSON) générés par l'application et écrits dans des fichiers sur le serveur. Une rotation des logs sera mise en place pour gérer l'espace disque. L'analyse se fera manuellement en cas de problème. L'intégration d'un outil centralisé comme Sentry est une amélioration possible post-MVP.
- **Monitoring de Performance :** La performance sera suivie via des **audits Lighthouse réguliers** (manuels ou automatisés via des scripts) pour s'assurer que le score reste supérieur à 90 et que les Core Web Vitals sont bons.
- **Analyse d'Audience (Analytics) :** Conformément au brief, l'implémentation d'une solution d'analytics auto-hébergée (comme Plausible ou Umami) est explicitement **hors du périmètre du MVP** et sera considérée dans une phase ultérieure.

## Métriques Clés à Suivre

### Métriques Backend & Serveur

- **Disponibilité (Uptime) :** Pourcentage de temps où le site est accessible (Cible : > 99.9%).
- **Santé du Serveur :** Utilisation du CPU et de la RAM sur le VPS.
- **Taux d'Erreur :** Nombre d'erreurs 5xx dans les logs de l'application.

### Métriques Frontend

- **Core Web Vitals (LCP, INP, CLS) :** Mesurés via les audits Lighthouse.
- **Score de Performance Lighthouse :** Score global (Cible : > 90).
