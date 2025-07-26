# Security Documentation Hub - blog-payload

Hub central pour la sécurité du projet blog-payload. Documentation de référence pour l'agent **security-review**.

## 🏗️ Architecture Sécurité

### Stack Sécurisé

- **Next.js 15.3.3** : API routes protégées, middleware sécurité
- **Payload 3.48.0** : Auth hooks, collections access control
- **PostgreSQL** : Requêtes sécurisées, prevention injections
- **JWT** : Authentification stateless avec refresh tokens

### Modèle de Menaces

- **Authentification** : Bypass auth, session hijacking
- **Autorisation** : Privilege escalation, access control
- **Injections** : SQL/NoSQL injection via Payload queries
- **XSS/CSRF** : Client-side attacks, CORS misconfiguration
- **Data Exposure** : Information leakage, PII protection

## 📚 Documentation Organisée

### Core Security

- **[owasp-checklist.md](./owasp-checklist.md)** : OWASP Top 10 détaillé
- **[auth-patterns.md](./auth-patterns.md)** : Patterns authentification sécurisés
- **[payload-security.md](./payload-security.md)** : Spécificités sécurité Payload CMS

### Templates & Playbooks

- **[templates/corrections.md](./templates/corrections.md)** : Templates corrections sécurité
- **[templates/security-tests.md](./templates/security-tests.md)** : Templates tests sécurité
- **[escalation-playbooks.md](./escalation-playbooks.md)** : Procédures escalade TDD

## 🔄 Workflow d'Escalade

### Triggers Automatiques

```typescript
// Patterns détectés par tdd-cycle-manager
const securityPatterns = [
  /auth|login|jwt|session|password|token/i,
  /payment|stripe|billing|checkout/i,
  /upload|file|image|media/i,
  /admin|role|permission|access/i,
  /payload\.find.*where.*\$/i,
  /cors|csrf|xss|header/i,
]
```

### Format Output Standardisé

```json
{
  "status": "APPROVED|CONDITIONAL|BLOCKED",
  "critical_issues": [],
  "fixes_applied": [],
  "tests_required": [],
  "compliance_score": 85,
  "next_actions": []
}
```

## 🚀 Quick Start

1. **Escalade manuelle** : `/security-review "Audit auth JWT"`
2. **Escalade auto** : Détection patterns dans cycle TDD
3. **Consultation docs** : Référence checklists spécifiques
4. **Application fixes** : Templates corrections automatisées

## 🔗 Intégration TDD

L'agent **security-review** maintient l'**isolation contextuelle** tout en fournissant un feedback actionnable pour la continuité du cycle TDD.

---

_Documentation mise à jour : {{current_date}}_
