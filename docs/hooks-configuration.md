# Hooks Configuration - Blog-Payload

> Configuration des hooks Claude Code pour optimiser les workflows de développement du projet blog-payload

## Vue d'ensemble

Ce document présente la configuration complète des hooks Claude Code, organisés par agents spécialisés et niveaux de criticité. Chaque hook renforce l'architecture unique Next.js 15 + Payload CMS 3.48 + PostgreSQL du projet.

---

## 🎯 Hooks Essentiels - Niveau Critique

### 1. Payload Collection Validator

**Agent associé:** `payload-collection-expert`  
**Événement:** `PreToolUse`  
**Rôle:** Valide les modifications critiques des collections Payload avant exécution

#### Description

Empêche les modifications non validées des fichiers critiques Payload (collections, globals, config) qui pourraient compromettre l'intégrité des données ou la cohérence du schéma.

#### Configuration JSON

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/payload-collection-validator.py",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

#### Script `payload-collection-validator.py`

```python
#!/usr/bin/env python3
import json, sys, re

data = json.load(sys.stdin)
file_path = data.get('tool_input', {}).get('file_path', '')

# Block critical Payload files modifications without validation
critical_patterns = [
    r'src/payload/collections/',
    r'src/payload/globals/',
    r'payload\.config\.ts',
    r'src/lib/payload-api\.ts'
]

if any(re.search(pattern, file_path) for pattern in critical_patterns):
    print(f"⚠️ PAYLOAD CRITICAL FILE: {file_path}", file=sys.stderr)
    print("Please ensure Payload collection hooks and relations are validated", file=sys.stderr)
    print("Consider using payload-collection-expert agent for this modification", file=sys.stderr)
    sys.exit(2)

sys.exit(0)
```

---

### 2. Bilingual Content Validator

**Agent associé:** `i18n-localization-specialist`  
**Événement:** `PostToolUse`  
**Rôle:** Valide la cohérence du contenu bilingue French/English

#### Description

Détecte et valide les patterns de localisation (`LocalizedText`, `LocalizedName`, `extractFallbackText`) pour maintenir la cohérence bilingue du projet.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/i18n-validator.js"
          }
        ]
      }
    ]
  }
}
```

#### Script `i18n-validator.js`

```javascript
#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const data = JSON.parse(fs.readFileSync(0, 'utf8'))
const filePath = data.tool_input?.file_path || ''

if (filePath.includes('src/types/') || filePath.includes('src/lib/')) {
  const content = data.tool_input?.content || ''

  // Validate LocalizedText/LocalizedName patterns
  const i18nPatterns = [
    /LocalizedText/g,
    /LocalizedName/g,
    /extractFallbackText/g,
    /fallback.*fr.*en/gi,
  ]

  const hasI18nCode = i18nPatterns.some((pattern) => pattern.test(content))
  if (hasI18nCode) {
    console.log('✅ i18n patterns detected - bilingual validation passed')
    console.log('Consider using i18n-localization-specialist for advanced i18n features')
  }
}
```

---

### 3. Architecture Pattern Enforcer

**Agent associé:** `nextjs-payload-architect`  
**Événement:** `PreToolUse`  
**Rôle:** Applique les contraintes architecturales unifiées Next.js + Payload

#### Description

Valide le respect des route groups `(web)/(payload)` et empêche l'utilisation d'appels HTTP dans les Server Components (doit utiliser l'API locale Payload).

#### Configuration JSON

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/architecture-enforcer.sh"
          }
        ]
      }
    ]
  }
}
```

#### Script `architecture-enforcer.sh`

```bash
#!/bin/bash
input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')
content=$(echo "$input_data" | jq -r '.tool_input.content // empty')

# Enforce route groups structure
if [[ "$file_path" =~ src/app/.*page\. ]]; then
  if [[ ! "$file_path" =~ src/app/\(web\)/ ]] && [[ ! "$file_path" =~ src/app/\(payload\)/ ]]; then
    echo "❌ ARCHITECTURE: Pages must be in route groups (web) or (payload)" >&2
    echo "Use nextjs-payload-architect agent for proper architecture guidance" >&2
    exit 2
  fi
fi

# Block HTTP API calls in Server Components
if [[ "$content" =~ fetch\([\'\"]/api/ ]]; then
  echo "❌ PERFORMANCE: Use local Payload API calls, not HTTP in Server Components" >&2
  echo "Example: await payload.find({ collection: 'posts' }) instead of fetch('/api/posts')" >&2
  exit 2
fi

echo "✅ Architecture patterns validated"
exit 0
```

---

## 🧪 Hooks de Qualité - Niveau Important

### 4. Auto-Testing after Modifications

**Agent associé:** `testing-strategy-engineer`  
**Événement:** `PostToolUse`  
**Rôle:** Exécute automatiquement les tests liés aux modifications

#### Description

Lance les tests concernés par les modifications pour maintenir la qualité du code et détecter les régressions rapidement.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/auto-test.sh",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

#### Script `auto-test.sh`

```bash
#!/bin/bash
input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')

# Skip tests for documentation files
if [[ "$file_path" =~ \.(md|txt)$ ]]; then
  echo "📝 Documentation file - skipping tests"
  exit 0
fi

# Run related tests based on file type
if [[ "$file_path" =~ src/.*\.(ts|tsx)$ ]]; then
  echo "🧪 Running tests for: $file_path"
  pnpm test:related -- --run --changed
  if [ $? -eq 0 ]; then
    echo "✅ Tests passed for modified files"
  else
    echo "❌ Tests failed - consider using testing-strategy-engineer agent" >&2
    exit 2
  fi
fi
```

---

### 5. TypeScript & ESM Validator

**Agent associé:** `nextjs-payload-architect`  
**Événement:** `PostToolUse`  
**Rôle:** Valide la cohérence TypeScript et ESM après modifications

#### Description

Vérifie que les modifications respectent les contraintes TypeScript strictes et la configuration ESM requise par Payload CMS 3.48.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/typescript-validator.sh",
            "timeout": 45
          }
        ]
      }
    ]
  }
}
```

#### Script `typescript-validator.sh`

```bash
#!/bin/bash
input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')

# Only validate TypeScript files
if [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
  echo "🔍 TypeScript validation for: $file_path"

  # Check specific file
  pnpm tsc --noEmit "$file_path"

  if [ $? -eq 0 ]; then
    echo "✅ TypeScript validation passed"
  else
    echo "❌ TypeScript errors detected" >&2
    echo "Consider using nextjs-payload-architect for complex type issues" >&2
    exit 2
  fi
fi

exit 0
```

---

### 6. Security File Protection

**Agent associé:** `security-audit-specialist`  
**Événement:** `PreToolUse`  
**Rôle:** Protège les fichiers sensibles contre les modifications accidentelles

#### Description

Bloque l'accès aux fichiers critiques pour la sécurité (.env, Users collection, etc.) et guide vers l'audit de sécurité approprié.

#### Configuration JSON

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/security-protection.py"
          }
        ]
      }
    ]
  }
}
```

#### Script `security-protection.py`

```python
#!/usr/bin/env python3
import json, sys, re

data = json.load(sys.stdin)
file_path = data.get('tool_input', {}).get('file_path', '')

# Protected files and patterns
protected_files = [
    '.env',
    '.env.local',
    '.env.production',
    'package-lock.json',
    '.git/',
    'src/payload/collections/Users.ts',
    'src/payload/access/',
    'docker-compose.yml'
]

blocked = [pattern for pattern in protected_files if pattern in file_path]

if blocked:
    print(f"🔒 SECURITY: Protected file blocked - {file_path}", file=sys.stderr)
    print(f"Blocked pattern: {blocked[0]}", file=sys.stderr)
    print("Use security-audit-specialist agent for sensitive file modifications", file=sys.stderr)
    sys.exit(2)

sys.exit(0)
```

---

## 🎨 Hooks UI/Content - Niveau Utile

### 7. Auto-Format with Prettier

**Agent associé:** `ui-content-designer`  
**Événement:** `PostToolUse`  
**Rôle:** Formate automatiquement le code selon les standards du projet

#### Description

Applique Prettier automatiquement sur les fichiers TypeScript, JavaScript et CSS pour maintenir la cohérence du style de code.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/auto-format.sh"
          }
        ]
      }
    ]
  }
}
```

#### Script `auto-format.sh`

```bash
#!/bin/bash
input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')

# Format supported file types
if [[ "$file_path" =~ \.(ts|tsx|js|jsx|css|json)$ ]]; then
  echo "🎨 Formatting: $file_path"
  npx prettier --write "$file_path"

  if [ $? -eq 0 ]; then
    echo "✅ Code formatted successfully"
  else
    echo "⚠️ Prettier formatting failed - check syntax" >&2
  fi
fi
```

---

### 8. Content SEO Validator

**Agent associé:** `blog-content-manager`  
**Événement:** `PostToolUse`  
**Rôle:** Valide les métadonnées SEO du contenu blog

#### Description

Vérifie la présence et la qualité des métadonnées SEO dans les articles de blog et les pages de contenu.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/seo-validator.js"
          }
        ]
      }
    ]
  }
}
```

#### Script `seo-validator.js`

```javascript
#!/usr/bin/env node
const fs = require('fs')

const data = JSON.parse(fs.readFileSync(0, 'utf8'))
const filePath = data.tool_input?.file_path || ''
const content = data.tool_input?.content || ''

// Validate SEO patterns in blog content
if (filePath.includes('src/app/(web)') || filePath.includes('src/payload/collections')) {
  const seoPatterns = {
    title: /title.*:.*['"`](.+)['"`]/gi,
    description: /description.*:.*['"`](.+)['"`]/gi,
    metadata: /metadata.*export/gi,
    openGraph: /openGraph/gi,
  }

  const seoChecks = Object.entries(seoPatterns).map(([key, pattern]) => ({
    key,
    found: pattern.test(content),
  }))

  const missingSeo = seoChecks.filter((check) => !check.found)

  if (missingSeo.length > 0) {
    console.log(`📝 SEO validation for: ${filePath}`)
    console.log(`Missing SEO elements: ${missingSeo.map((m) => m.key).join(', ')}`)
    console.log('Consider using blog-content-manager for SEO optimization')
  } else {
    console.log('✅ SEO patterns validated')
  }
}
```

---

## 🚀 Hooks Performance & Déploiement

### 9. Database Query Monitor

**Agent associé:** `database-query-optimizer`  
**Événement:** `PostToolUse`  
**Rôle:** Surveille et optimise les requêtes de base de données

#### Description

Détecte les opérations de base de données Payload et suggère des optimisations de performance.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/db-query-monitor.sh"
          }
        ]
      }
    ]
  }
}
```

#### Script `db-query-monitor.sh`

```bash
#!/bin/bash
input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')
content=$(echo "$input_data" | jq -r '.tool_input.content // empty')

# Monitor database operations
db_operations=$(echo "$content" | grep -E "(payload\.find|payload\.create|payload\.update|payload\.delete)" | wc -l)

if [ "$db_operations" -gt 0 ]; then
  echo "🔍 Database operations detected: $db_operations queries in $file_path"

  # Check for potential N+1 queries
  if echo "$content" | grep -q "\.map.*payload\.find"; then
    echo "⚠️ Potential N+1 query pattern detected" >&2
    echo "Consider using database-query-optimizer agent for optimization" >&2
  fi

  # Check for missing pagination
  if echo "$content" | grep -q "payload\.find" && ! echo "$content" | grep -q "limit\|page"; then
    echo "💡 Consider adding pagination to large queries"
  fi

  echo "Consider performance review with database-query-optimizer agent"
fi
```

---

### 10. Build Validation

**Agent associé:** `deployment-devops-manager`  
**Événement:** `Stop`  
**Rôle:** Valide que les modifications n'ont pas cassé le build

#### Description

Vérifie que le projet peut toujours être buildé après les modifications, crucial pour les déploiements.

#### Configuration JSON

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/build-validation.sh",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

#### Script `build-validation.sh`

```bash
#!/bin/bash
echo "🔨 Validating build after modifications..."

# Quick type check first
pnpm tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors prevent build" >&2
  exit 2
fi

# Build check (dry run)
NODE_ENV=production pnpm build:check
if [ $? -eq 0 ]; then
  echo "✅ Build validation passed"
else
  echo "❌ Build validation failed" >&2
  echo "Use deployment-devops-manager agent for build issues" >&2
  exit 2
fi
```

---

## 🔔 Hooks de Workflow

### 11. Custom Notifications

**Agent associé:** Transversal  
**Événement:** `Notification`  
**Rôle:** Fournit des notifications desktop personnalisées

#### Description

Envoie des notifications système quand Claude Code nécessite une intervention utilisateur.

#### Configuration JSON

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/custom-notifications.sh"
          }
        ]
      }
    ]
  }
}
```

#### Script `custom-notifications.sh`

```bash
#!/bin/bash
input_data=$(cat)
message=$(echo "$input_data" | jq -r '.message // "Claude needs attention"')

# Send desktop notification
if command -v notify-send &> /dev/null; then
  notify-send 'Blog-Payload Dev' "$message" --icon=development --urgency=normal
elif command -v osascript &> /dev/null; then
  # macOS notification
  osascript -e "display notification \"$message\" with title \"Blog-Payload Dev\""
fi

echo "🔔 Notification sent: $message"
```

---

### 12. Development Logger

**Agent associé:** Transversal  
**Événement:** `PostToolUse`  
**Rôle:** Enregistre l'activité de développement pour traçabilité

#### Description

Maintient un log des activités de développement pour debugging et analyse des patterns d'usage.

#### Configuration JSON

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/dev-logger.sh"
          }
        ]
      }
    ]
  }
}
```

#### Script `dev-logger.sh`

```bash
#!/bin/bash
input_data=$(cat)
tool_name=$(echo "$input_data" | jq -r '.tool_name // "unknown"')
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // "N/A"')

log_entry="$(date '+%Y-%m-%d %H:%M:%S') - $tool_name - $file_path"
echo "$log_entry" >> "$CLAUDE_PROJECT_DIR/.claude/dev-activity.log"

# Rotate log if too large (keep last 1000 lines)
if [ -f "$CLAUDE_PROJECT_DIR/.claude/dev-activity.log" ]; then
  tail -1000 "$CLAUDE_PROJECT_DIR/.claude/dev-activity.log" > /tmp/dev-activity-temp.log
  mv /tmp/dev-activity-temp.log "$CLAUDE_PROJECT_DIR/.claude/dev-activity.log"
fi
```

---

## 📋 Guide d'Implémentation

### Phase 1 - Configuration Initiale (Critique)

1. Créer le dossier `.claude/hooks/` dans le projet
2. Implémenter les hooks 1-3 (Payload, i18n, Architecture)
3. Tester sur quelques modifications

### Phase 2 - Qualité (Important)

4. Ajouter les hooks 4-6 (Tests, TypeScript, Sécurité)
5. Configurer les timeouts appropriés
6. Valider l'intégration avec les agents

### Phase 3 - Optimisation (Utile)

7. Implémenter les hooks 7-12 (Format, SEO, Performance, Workflow)
8. Ajuster selon les besoins spécifiques
9. Documenter les patterns d'usage

### Configuration `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/payload-collection-validator.py",
            "timeout": 30
          },
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/architecture-enforcer.sh"
          },
          {
            "type": "command",
            "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/security-protection.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/i18n-validator.js"
          },
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/auto-test.sh",
            "timeout": 60
          },
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/typescript-validator.sh",
            "timeout": 45
          },
          { "type": "command", "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/auto-format.sh" },
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/seo-validator.js"
          },
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/db-query-monitor.sh"
          },
          { "type": "command", "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/dev-logger.sh" }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/custom-notifications.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash $CLAUDE_PROJECT_DIR/.claude/hooks/build-validation.sh",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## ⚡ Points Clés

- **Agents intégrés**: Chaque hook référence l'agent spécialisé approprié
- **Sécurité renforcée**: Protection des fichiers critiques et validation des patterns
- **Performance optimisée**: Timeouts adaptés et monitoring des requêtes DB
- **Feedback actionnable**: Messages d'erreur avec guidance vers les agents appropriés
- **Traçabilité complète**: Logs structurés pour debugging et analyse

Cette configuration transforme les recommandations des agents en contrôles automatiques, garantissant la qualité et la cohérence du projet blog-payload.
