# Payload CMS Security - Spécificités & Best Practices

Guide sécurité spécifique à Payload CMS 3.48.0 dans le contexte Next.js 15.3.3.

## 🏗️ Architecture Sécurisée Payload

### Configuration Base Sécurisée

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!, // Min 256 bits entropy

  // Database sécurisée
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),

  // Admin sécurisé
  admin: {
    user: 'users',
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: 'dev@example.com',
            password: 'test123',
          }
        : false,

    // Sécurité admin UI
    meta: {
      titleSuffix: ' - Admin',
      favicon: '/admin-favicon.ico',
    },

    // CSRF protection
    csrf: [
      'https://yourdomain.com',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
    ],
  },

  // Rate limiting
  rateLimit: {
    trustProxy: true,
    window: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests par window
  },

  // Cors sécurisé
  cors: [
    'https://yourdomain.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
})
```

## 🔐 Collections Security Patterns

### Users Collection Sécurisée

```typescript
// collections/Users.ts
import type { CollectionConfig } from 'payload/types'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 heures
    verify: {
      generateEmailHTML: ({ token, user }) => {
        return `Verify your email: ${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`
      },
    },
    forgotPassword: {
      generateEmailHTML: ({ token, user }) => {
        return `Reset password: ${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`
      },
    },
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },

  // Access control sécurisé
  access: {
    // Seuls les admins peuvent lire tous les users
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      // Users peuvent lire seulement leur propre profil
      return {
        id: { equals: user?.id },
      }
    },

    // Seuls les admins peuvent créer des users via admin
    create: ({ req: { user } }) => user?.role === 'admin',

    // Users peuvent modifier seulement leur profil
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        id: { equals: user?.id },
      }
    },

    // Seuls les admins peuvent supprimer
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,

      // Seuls les admins peuvent modifier les rôles
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },

    {
      name: 'loginAttempts',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true }, // Caché dans l'admin UI

      // Field interne, pas d'accès direct
      access: {
        read: () => false,
        update: () => false,
      },
    },

    {
      name: 'tokenVersion',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },

      access: {
        read: () => false,
        update: () => false,
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Hash password lors de création/modification
        if (operation === 'create' || (operation === 'update' && data.password)) {
          const bcrypt = await import('bcrypt')
          data.password = await bcrypt.hash(data.password, 12)
        }

        return data
      },
    ],

    afterLogin: [
      async ({ req, user }) => {
        // Reset failed attempts après login réussi
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { loginAttempts: 0 },
        })

        // Log security event
        console.log(`[SECURITY] User login: ${user.email} from ${req.ip}`)
      },
    ],

    afterLogout: [
      async ({ req, user }) => {
        if (user) {
          // Invalider refresh tokens
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { tokenVersion: (user.tokenVersion || 0) + 1 },
          })

          console.log(`[SECURITY] User logout: ${user.email}`)
        }
      },
    ],
  },
}
```

### Posts Collection avec Access Control

```typescript
// collections/Posts.ts
export const Posts: CollectionConfig = {
  slug: 'posts',

  access: {
    // Posts publics lisibles par tous
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      // Non-admin ne voient que les posts publiés
      return {
        status: { equals: 'published' },
      }
    },

    // Seuls les admins peuvent créer des posts
    create: ({ req: { user } }) => user?.role === 'admin',

    // Seuls les admins peuvent modifier
    update: ({ req: { user } }) => user?.role === 'admin',

    // Seuls les admins peuvent supprimer
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      validate: (value) => {
        // Validation XSS prevention
        if (/<script|javascript:|on\w+=/i.test(value)) {
          return 'Invalid characters detected in title'
        }
        return true
      },
    },

    {
      name: 'content',
      type: 'richText',
      required: true,

      // Rich text sécurisé
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          // Désactiver les features dangereuses
          // HTMLConverterFeature({}) // Commenté pour sécurité
        ],
      }),
    },

    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published'],
      defaultValue: 'draft',
      required: true,
    },

    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,

      // Auto-set author to current user
      defaultValue: ({ user }) => user?.id,

      // Seuls les admins peuvent changer l'auteur
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Auto-set author lors de création
        if (operation === 'create' && !data.author) {
          data.author = req.user?.id
        }

        // Audit log
        console.log(`[AUDIT] Post ${operation}: ${data.title} by ${req.user?.email}`)

        return data
      },
    ],
  },
}
```

## 🛡️ Hooks de Sécurité Avancés

### Validation & Sanitization Hook

```typescript
// hooks/security-validation.ts
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

export const sanitizeHook = (fieldName: string) => {
  return async ({ data, operation }) => {
    if (data[fieldName] && typeof data[fieldName] === 'string') {
      // Sanitize HTML content
      data[fieldName] = DOMPurify.sanitize(data[fieldName], {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
        ALLOWED_ATTR: [],
      })

      // Escape special characters
      data[fieldName] = validator.escape(data[fieldName])
    }

    return data
  }
}

// Usage dans collection
export const Comments: CollectionConfig = {
  slug: 'comments',

  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],

  hooks: {
    beforeChange: [sanitizeHook('content')],
  },
}
```

### Audit Logging Hook

```typescript
// hooks/audit-logging.ts
export const auditHook = (collectionSlug: string) => {
  return async ({ operation, data, previousDoc, req }) => {
    const auditEntry = {
      collection: collectionSlug,
      operation,
      userId: req.user?.id,
      userEmail: req.user?.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      changes:
        operation === 'update'
          ? {
              before: previousDoc,
              after: data,
            }
          : data,
    }

    // Log to secure audit collection
    await req.payload.create({
      collection: 'audit-logs',
      data: auditEntry,
    })
  }
}
```

## 🔍 Query Security

### Secure Query Patterns

```typescript
// lib/secure-queries.ts
import payload from 'payload'

// Fonction sécurisée pour requêtes utilisateur
export const secureFind = async (collection: string, userQuery: any, userRole: string = 'user') => {
  // Whitelist des opérateurs autorisés
  const allowedOperators = ['equals', 'contains', 'in', 'not_equals']

  // Sanitize query object
  const sanitizedQuery = sanitizeQuery(userQuery, allowedOperators)

  // Apply role-based restrictions
  const baseWhere = getRoleBasedWhere(collection, userRole)

  return await payload.find({
    collection,
    where: {
      and: [baseWhere, sanitizedQuery],
    },
    limit: 50, // Limite pour éviter DoS
  })
}

const sanitizeQuery = (query: any, allowedOps: string[]) => {
  const sanitized = {}

  for (const [field, condition] of Object.entries(query)) {
    if (typeof condition === 'object' && condition !== null) {
      for (const [operator, value] of Object.entries(condition)) {
        if (allowedOps.includes(operator)) {
          // Validate value
          if (typeof value === 'string') {
            sanitized[field] = {
              [operator]: validator.escape(value),
            }
          }
        }
      }
    }
  }

  return sanitized
}
```

## 🗂️ File Upload Security

### Secure Media Collection

```typescript
// collections/Media.ts
export const Media: CollectionConfig = {
  slug: 'media',

  access: {
    read: () => true, // Public read
    create: ({ req: { user } }) => !!user, // Auth required pour upload
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  upload: {
    staticURL: '/media',
    staticDir: 'media',

    // Restrictions sécurisées
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],

    // Taille limite
    limits: {
      fileSize: 5000000, // 5MB
    },

    // Resize automatique
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'centre',
      },
    ],

    // Validation fichier
    uploadFilename: ({ filename }) => {
      // Sanitize filename
      return filename
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '-')
        .replace(/-+/g, '-')
    },
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      validate: (value) => {
        if (/<script|javascript:|on\w+=/i.test(value)) {
          return 'Invalid characters in alt text'
        }
        return true
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-set uploader
        if (!data.uploadedBy) {
          data.uploadedBy = req.user?.id
        }

        // Virus scan en production
        if (process.env.NODE_ENV === 'production' && data.file) {
          // Intégration ClamAV ou service antivirus
          // const scanResult = await virusScan(data.file)
          // if (!scanResult.clean) throw new Error('File security check failed')
        }

        return data
      },
    ],
  },
}
```

## 🔐 Environment Security

### Secure Environment Variables

```bash
# .env.example (template sécurisé)
DATABASE_URL="postgresql://user:password@localhost:5432/blog"
PAYLOAD_SECRET=""  # Generate avec: openssl rand -hex 32
JWT_SECRET=""      # Generate avec: openssl rand -hex 32
JWT_REFRESH_SECRET=""

# SMTP sécurisé
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# Production uniquement
NODE_ENV="production"
NEXT_PUBLIC_SERVER_URL="https://yourdomain.com"

# Stripe (si paiements)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

### Runtime Security Checks

```typescript
// lib/security-checks.ts
export const validateEnvironment = () => {
  const requiredVars = ['DATABASE_URL', 'PAYLOAD_SECRET', 'JWT_SECRET', 'JWT_REFRESH_SECRET']

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate secret strength
  if (process.env.PAYLOAD_SECRET!.length < 32) {
    throw new Error('PAYLOAD_SECRET must be at least 32 characters')
  }

  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters')
  }
}
```

---

## ✅ Payload Security Checklist

### Configuration

- [ ] Secret clé forte (256+ bits)
- [ ] CORS configuré restrictif
- [ ] Rate limiting activé
- [ ] CSRF protection enabled

### Collections

- [ ] Access control par rôle
- [ ] Field-level permissions
- [ ] Input validation/sanitization
- [ ] Audit logging hooks

### Authentication

- [ ] Strong password policy
- [ ] Account lockout après échecs
- [ ] Token refresh sécurisé
- [ ] Logout invalide tokens

### File Uploads

- [ ] MIME type validation
- [ ] File size limits
- [ ] Filename sanitization
- [ ] Virus scanning (prod)

### Database

- [ ] PostgreSQL avec SSL
- [ ] Requêtes paramétrées
- [ ] Indexes optimisés
- [ ] Backup encryption

---

_Sécurité Payload CMS 3.48.0 - Patterns & Best Practices_
