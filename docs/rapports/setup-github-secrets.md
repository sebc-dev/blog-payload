# Configuration GitHub Secrets et Pipeline DevOps

Guide exhaustif pour configurer tous les secrets et éléments nécessaires sur GitHub pour le pipeline DevOps 2025.

## 🔐 **GitHub Secrets à Créer**

### **Secrets Obligatoires (Repository Secrets)**

1. **`DATABASE_URI`**
   - **Description** : URI de connexion à la base de données PostgreSQL de production
   - **Format** : `postgresql://username:password@host:port/database_name`
   - **Exemple** : `postgresql://blog_user:secure_password@db.example.com:5432/blog_payload_prod`

2. **`PAYLOAD_SECRET`**
   - **Description** : Clé secrète pour chiffrement/authentification Payload CMS
   - **Format** : Chaîne aléatoire sécurisée (32+ caractères)
   - **Génération** : `openssl rand -hex 32` ou générateur de mots de passe sécurisé
   - **Exemple** : `F6B39B6D9963BB5B5C19EFA126187A2E8D4C5F7B8A9C0D1E2F3G4H5I6J7K8L9M`

3. **`SNYK_TOKEN`**
   - **Description** : Token d'authentification pour Snyk (scan vulnérabilités)
   - **Obtention** :
     - Créer compte sur [snyk.io](https://snyk.io)
     - Aller dans Account Settings > API Token
     - Générer un nouveau token
   - **Format** : Token UUID de Snyk

### **Secrets Automatiques (Fournis par GitHub)**

4. **`GITHUB_TOKEN`** ✅
   - **Description** : Token automatique pour actions GitHub (Gitleaks)
   - **Action** : Aucune - fourni automatiquement par GitHub Actions

## 🔧 **Configuration GitHub Repository**

### **1. Paramètres Repository**

- **Nom** : `blog-payload`
- **Visibilité** : Public ou Private selon vos besoins
- **Branches protégées** : Configurer `main` comme branche protégée

### **2. Configuration Branches Protection**

Aller dans **Settings > Branches** et configurer pour `main` :

```yaml
Protection Rules pour 'main':
✅ Require a pull request before merging
  ✅ Require approvals (1 minimum)
  ✅ Dismiss stale PR approvals when new commits are pushed
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Status checks required:
    - Test & Secure
    - Build & Deploy (si applicable)
✅ Restrict pushes that create files over 100MB
✅ Allow force pushes: ❌
✅ Allow deletions: ❌
```

### **3. Configuration Security**

Aller dans **Settings > Security** :

```yaml
Security Settings:
✅ Enable vulnerability alerts
✅ Enable Dependabot security updates
✅ Enable Dependabot version updates
✅ Enable private vulnerability reporting
✅ Enable secret scanning
✅ Enable push protection for secrets
```

### **4. Actions & Workflows**

Aller dans **Settings > Actions > General** :

```yaml
Actions Permissions:
✅ Allow all actions and reusable workflows

Workflow Permissions:
✅ Read and write permissions
✅ Allow GitHub Actions to create and approve pull requests

Artifact and log retention:
📅 Set to 30 days (ou selon vos besoins)
```

## 🛠️ **Services Externes à Configurer**

### **1. Snyk Account**

- **URL** : [snyk.io](https://snyk.io)
- **Action** :
  1. Créer un compte gratuit
  2. Connecter votre repository GitHub
  3. Générer un API token
  4. Ajouter le token comme `SNYK_TOKEN` dans GitHub Secrets

### **2. Base de Données PostgreSQL**

- **Options** :
  - **Cloud** : AWS RDS, Google Cloud SQL, Azure Database
  - **Managé** : Heroku Postgres, Railway, PlanetScale
  - **Self-hosted** : VPS avec PostgreSQL
- **Configuration requise** :
  - PostgreSQL 12+
  - Accès externe autorisé pour les migrations
  - Backup automatique recommandé

## 📝 **Étapes de Configuration (Ordre Recommandé)**

### **Phase 1 : Repository Setup**

1. ✅ Créer/configurer le repository GitHub
2. ✅ Push le code avec le pipeline CI/CD
3. ✅ Configurer les branches protection rules

### **Phase 2 : Services Externes**

4. 🔧 Créer compte Snyk et générer token
5. 🔧 Provisionner base de données PostgreSQL production
6. 🔧 Générer `PAYLOAD_SECRET` sécurisé

### **Phase 3 : GitHub Secrets**

7. 🔐 Ajouter `SNYK_TOKEN` dans GitHub Secrets
8. 🔐 Ajouter `DATABASE_URI` dans GitHub Secrets
9. 🔐 Ajouter `PAYLOAD_SECRET` dans GitHub Secrets

### **Phase 4 : Validation**

10. ✅ Déclencher premier workflow (push sur `dev` ou `main`)
11. ✅ Vérifier que tous les jobs passent
12. ✅ Contrôler les rapports de sécurité dans Security tab

## ⚠️ **Important - Sécurité**

### **Ne JAMAIS committer** :

- ❌ Vrais secrets ou tokens dans le code
- ❌ Informations de connexion DB en dur
- ❌ Clés API dans les fichiers de configuration

### **Bonnes pratiques** :

- ✅ Utiliser des secrets différents pour dev/staging/prod
- ✅ Rotation régulière des secrets (trimestrielle)
- ✅ Audit logs activés sur les services critiques
- ✅ Accès minimal nécessaire (principe du moindre privilège)

## 🔍 **Vérification Post-Configuration**

Une fois tout configuré, vérifiez :

1. **Pipeline** : Push sur `dev` → workflow s'exécute sans erreur
2. **Sécurité** : Vérifier onglet Security → pas d'alertes critiques
3. **Docker** : Build + scan Trivy réussit
4. **Tests** : Tous les tests passent
5. **Déploiement** : Si sur `main`, le déploiement s'exécute

## 🚀 **Commandes Utiles**

### Générer un PAYLOAD_SECRET sécurisé :

```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### Tester la connexion à la base de données :

```bash
# Test connection
psql "$DATABASE_URI" -c "SELECT version();"
```

### Vérifier les secrets dans le workflow :

```bash
# Dans GitHub Actions, les secrets sont masqués automatiquement
# Mais vous pouvez vérifier qu'ils sont bien définis :
echo "DATABASE_URI is set: ${{ secrets.DATABASE_URI != '' }}"
```

Cette configuration vous donnera un pipeline DevOps production-ready avec toutes les sécurités requises ! 🚀

---

**📄 Fichier généré automatiquement lors de l'implémentation du Pipeline DevOps 2025**
