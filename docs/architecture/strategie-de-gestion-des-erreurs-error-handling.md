# Stratégie de Gestion des Erreurs (Error Handling)

Cette stratégie vise à intercepter les erreurs de manière prévisible, à fournir des retours clairs aux utilisateurs et à donner aux administrateurs les informations nécessaires pour le débogage.

## Flux de Gestion d'une Erreur

Ce diagramme illustre le parcours d'une erreur, depuis sa source jusqu'à sa présentation à l'utilisateur.

```mermaid
graph TD
    subgraph "Backend (Payload/Node.js)"
        B1[Base de Données]
        B2[Logique Métier]
    end
    subgraph "Frontend (Next.js)"
        F1[Composant React (Client)]
        F2[Route API / Server Action]
        F3[Page (error.tsx)]
    end
    subgraph "Observabilité"
        LOG[Service de Logging]
    end

    B1 -- Erreur DB --> B2
    B2 -- Erreur Inattendue --> LOG
    B2 -- Erreur Attendue --> F2
    F1 -- Appel API --> F2
    F2 -- Réponse d'Erreur JSON --> F1
    F1 -- Affiche Erreur --> User[Utilisateur]
    F2 -- Erreur Serveur --> F3
    F3 -- Affiche Page d'Erreur --> User
```

## Format de Réponse d'Erreur API

Toutes les erreurs générées par nos endpoints d'API (y compris ceux de Payload) suivront un format JSON standardisé pour que le frontend puisse les interpréter de manière fiable.

```typescript
interface ApiErrorResponse {
  errors: {
    message: string // Message destiné à l'utilisateur ou au développeur
    field?: string // Champ du formulaire concerné (pour les erreurs de validation)
  }[]
}
```

## Gestion des Erreurs Backend

- **Centralisation :** Nous utiliserons les "hooks" de Payload, notamment le hook `afterError`, pour intercepter toutes les erreurs qui se produisent au niveau du backend.
- **Logging :** Toute erreur inattendue (erreur 500) sera enregistrée de manière structurée (avec un logger comme `pino`). Le log contiendra la pile d'exécution (stack trace), l'URL de la requête, et un identifiant de corrélation, mais **jamais** d'informations sensibles (mots de passe, clés API).
- **Erreurs Attendues vs Inattendues :**
  - **Attendues :** Les erreurs de validation ou de permissions (4xx) renverront le format `ApiErrorResponse` ci-dessus.
  - **Inattendues :** Les erreurs serveur (5xx) seront loguées et renverront un message générique à l'utilisateur pour ne pas exposer de détails d'implémentation.

## Gestion des Erreurs Frontend

Nous utiliserons les mécanismes intégrés de Next.js App Router pour une expérience utilisateur résiliente.

- **Pages d'Erreur Personnalisées :**
  - Un fichier `src/app/error.tsx` global sera créé pour afficher une page d'erreur conviviale en cas de problème inattendu, offrant un moyen de recharger la page.
  - Un fichier `src/app/not-found.tsx` affichera une page 404 personnalisée et utile.
- **Gestion des Appels API :**
  - Les fonctions dans `src/lib/payload-utils.ts` encapsuleront les appels `fetch`. Elles seront responsables de la gestion des `try/catch`, de l'interprétation des réponses d'erreur JSON et de la transmission d'une erreur structurée ou d'une valeur `null` aux composants.
- **Retour Utilisateur :**
  _ Les erreurs de formulaire seront affichées directement sous les champs concernés.
  _ Les erreurs globales (ex: problème de réseau) seront affichées via une notification non bloquante (un "Toast").
  Ok, il est temps de définir comment nous allons garder un œil sur la santé et le comportement de notre application une fois en production.
