# Spécification de l'API (REST & GraphQL)

Pour ce projet, nous adoptons une approche pragmatique et efficace en matière de spécification d'API.

Étant donné que nous utilisons Payload CMS comme backend, nous n'allons pas créer manuellement un document de spécification OpenAPI statique. À la place, nous allons nous appuyer sur les **API REST et GraphQL générées automatiquement par Payload**.

## Raisonnement Architectural

1.  **Source de Vérité Unique :** Les modèles de données ("Collections") que nous avons définis précédemment deviennent la source de vérité unique. Toute modification d'un champ ou d'un modèle est **instantanément et automatiquement reflétée** dans les deux API (REST et GraphQL).
2.  **Maintenance Zéro :** Cette approche élimine le risque d'avoir une documentation d'API désynchronisée par rapport à l'implémentation réelle. La documentation est générée à partir du code lui-même.
3.  **Flexibilité Maximale :** Comme spécifié dans notre pile technologique, nous disposons à la fois d'une API REST complète et d'une API GraphQL, sans effort de développement supplémentaire. Le frontend pourra utiliser l'une ou l'autre en fonction du cas d'usage (par exemple, GraphQL pour des requêtes de données complexes et REST pour des actions simples).

## Endpoints Principaux (Générés par Payload)

Basé sur nos modèles de données, Payload générera automatiquement des endpoints REST pour chaque collection, incluant les opérations CRUD complètes (Create, Read, Update, Delete), le filtrage, le tri et la pagination. Les principaux endpoints seront :

- `/api/users` (pour les auteurs)
- `/api/media`
- `/api/categories`
- `/api/tags`
- `/api/posts`
- `/api/pages`

## Documentation Interactive

Payload intègre également une interface **Swagger UI** qui fournit une documentation interactive et testable pour l'API REST. Elle sera disponible directement depuis l'application en cours d'exécution (généralement à l'adresse `/api/docs`), permettant d'explorer tous les endpoints, leurs paramètres et les schémas de données en temps réel.
Absolument. Passons à la structure de la base de données.
