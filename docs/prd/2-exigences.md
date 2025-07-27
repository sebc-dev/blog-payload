# 2. Exigences

## 2.1 Exigences Fonctionnelles (FR)

- **FR1** : L'administrateur (vous) doit pouvoir créer, prévisualiser, éditer et publier des articles de blog dans les deux langues (français et anglais).
- **FR2** : L'administrateur doit pouvoir créer des catégories et des tags, et les assigner librement aux articles.
- **FR3** : Le système doit permettre d'associer un article en français à sa version anglaise correspondante au sein d'une même entrée de contenu.
- **FR4** : Les visiteurs du site doivent pouvoir lire les articles publiés sur une interface publique, claire et lisible.
- **FR5** : Les visiteurs doivent pouvoir naviguer et découvrir les articles par le biais de listes chronologiques, de pages de catégories et de pages de tags.
- **FR6** : Les visiteurs doivent disposer d'une page de recherche pour trouver des articles en fonction de mots-clés.

## 2.2 Exigences Non Fonctionnelles (NFR)

- **NFR1 (Performance)** : Le site public doit viser un score Lighthouse supérieur à 90, en particulier sur les Core Web Vitals.
- **NFR2 (Accessibilité)** : Le site public doit viser un score d'accessibilité supérieur à 95 pour être utilisable par le plus grand nombre.
- **NFR3 (Responsive Design)** : Le site doit être entièrement responsive et offrir une expérience utilisateur de haute qualité sur les appareils mobiles et les ordinateurs de bureau.
- **NFR4 (Stack Technologique)** : Le projet doit être impérativement développé avec la stack technique définie : NextJS 15, React 19, Payload 3, PostgreSQL, et être déployable via Docker sur un VPS OVH.
- **NFR5 (Sécurité)** : L'application doit respecter les bonnes pratiques de sécurité web standard (HTTPS par défaut, protection contre les vulnérabilités communes comme XSS et CSRF).
- **NFR6 (Extensibilité)** : L'architecture doit être conçue pour faciliter l'ajout ultérieur des fonctionnalités prévues en phase Post-V1 (commentaires, inscriptions, newsletter) sans nécessiter une refonte majeure.
