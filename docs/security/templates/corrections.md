# Templates de Corrections Sécurité

Templates de corrections automatisées pour les vulnérabilités courantes détectées par l'agent **security-review**.

## 🔐 Authentication & Authorization

### Template: JWT Sécurisé

**Problème**: JWT non sécurisé ou mal configuré

```typescript
// ❌ AVANT (vulnérable)
const token = jwt.sign({ userId: user.id }, 'weak-secret')

// ✅ APRÈS (sécurisé)
const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  },
  process.env.JWT_SECRET!, // Min 256 bits
  {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: 'blog-payload',
    audience: 'blog-users',
  },
)
```

### Template: Middleware Auth Sécurisé

**Problème**: Middleware d'auth manquant ou faible

```typescript
// ✅ Middleware robuste
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
  // Rate limiting par IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('accessToken')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any

      // Check token expiry
      if (payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Add user info to headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}
```

### Template: RBAC Access Control

**Problème**: Contrôle d'accès insuffisant

```typescript
// ✅ RBAC robuste
export const createRoleGuard = (requiredRole: UserRole) => {
  return async (request: NextRequest) => {
    const userRole = request.headers.get('x-user-role') as UserRole

    if (!userRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roleHierarchy: Record<UserRole, number> = {
      user: 0,
      moderator: 1,
      admin: 2,
    }

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return null // Access granted
  }
}

// Usage dans API route
export async function GET(request: NextRequest) {
  const accessCheck = await createRoleGuard('admin')(request)
  if (accessCheck) return accessCheck

  // Admin logic here...
}
```

## 🛡️ Input Validation & Injection Prevention

### Template: Payload Query Sécurisé

**Problème**: Requêtes Payload vulnérables aux injections

```typescript
// ❌ AVANT (vulnérable)
export async function POST(request: Request) {
  const { email } = await request.json()

  const user = await payload.find({
    collection: 'users',
    where: { email: { equals: email } }, // Direct user input
  })
}

// ✅ APRÈS (sécurisé)
import { z } from 'zod'

const searchSchema = z.object({
  email: z.string().email().max(255),
  limit: z.number().min(1).max(50).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, limit = 10 } = searchSchema.parse(body)

    // Sanitize input
    const sanitizedEmail = email.toLowerCase().trim()

    // Parameterized query
    const user = await payload.find({
      collection: 'users',
      where: {
        email: { equals: sanitizedEmail },
        // Add security filters
        and: [{ active: { equals: true } }],
      },
      limit,
      select: {
        email: true,
        id: true,
        // Exclude sensitive fields
      },
    })

    return NextResponse.json({
      found: user.docs.length > 0,
      // Don't leak user data
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    // Log error securely
    console.error('[SECURITY] Query error:', {
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for'),
    })

    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### Template: Input Sanitization

**Problème**: Données utilisateur non sanitisées

```typescript
// ✅ Sanitization robuste
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

export const sanitizeInput = {
  // Pour texte simple
  text: (input: string): string => {
    return validator.escape(validator.stripLow(input.trim()))
  },

  // Pour HTML (rich text)
  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'],
      ALLOWED_ATTR: ['href'],
      ALLOWED_SCHEMES: ['http', 'https', 'mailto'],
    })
  },

  // Pour URLs
  url: (input: string): string | null => {
    if (!validator.isURL(input, { protocols: ['http', 'https'] })) {
      return null
    }
    return validator.normalizeEmail(input) || input
  },

  // Pour emails
  email: (input: string): string | null => {
    const normalized = validator.normalizeEmail(input)
    return normalized && validator.isEmail(normalized) ? normalized : null
  },
}

// Usage dans Payload hook
export const sanitizeHook = async ({ data }) => {
  if (data.title) data.title = sanitizeInput.text(data.title)
  if (data.content) data.content = sanitizeInput.html(data.content)
  if (data.email) data.email = sanitizeInput.email(data.email)

  return data
}
```

## 🔒 Rate Limiting & DoS Prevention

### Template: Rate Limiter Avancé

**Problème**: Pas de protection contre les attaques par force brute

```typescript
// ✅ Rate limiter robuste
interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

class SecurityRateLimiter {
  private attempts = new Map<string, RateLimitEntry>()

  async checkLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000,
  ): Promise<boolean> {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry || now > entry.resetTime) {
      // New window
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      })
      return true
    }

    if (entry.blocked && now < entry.resetTime) {
      return false // Still blocked
    }

    entry.count++

    if (entry.count > maxAttempts) {
      entry.blocked = true

      // Exponential backoff
      entry.resetTime = now + windowMs * Math.pow(2, entry.count - maxAttempts)

      // Log security event
      console.warn(`[SECURITY] Rate limit exceeded for ${identifier}`)

      return false
    }

    return true
  }

  async resetLimit(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

const rateLimiter = new SecurityRateLimiter()

// Usage dans API
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!(await rateLimiter.checkLimit(`login:${ip}`, 5))) {
    return NextResponse.json(
      {
        error: 'Too many attempts. Try again later.',
        retryAfter: 900, // 15 minutes
      },
      { status: 429 },
    )
  }

  // Process login...

  // Reset on successful login
  await rateLimiter.resetLimit(`login:${ip}`)
}
```

## 🗂️ File Upload Security

### Template: Upload Sécurisé

**Problème**: Upload de fichiers non sécurisé

```typescript
// ✅ Upload sécurisé
import { createHash } from 'crypto'
import path from 'path'

export const secureUploadConfig = {
  // MIME types autorisés
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  // Extensions autorisées
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],

  // Taille maximale (5MB)
  maxFileSize: 5 * 1024 * 1024,

  // Validation sécurisée
  validateFile: async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Check file size
    if (file.size > secureUploadConfig.maxFileSize) {
      return { valid: false, error: 'File too large' }
    }

    // Check MIME type
    if (!secureUploadConfig.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' }
    }

    // Check extension
    const ext = path.extname(file.name).toLowerCase()
    if (!secureUploadConfig.allowedExtensions.includes(ext)) {
      return { valid: false, error: 'Invalid file extension' }
    }

    // Check file signature (magic numbers)
    const buffer = await file.arrayBuffer()
    const signature = Array.from(new Uint8Array(buffer.slice(0, 4)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const validSignatures = {
      ffd8ffe0: 'jpeg',
      ffd8ffe1: 'jpeg',
      '89504e47': 'png',
      '47494638': 'gif',
      '52494646': 'webp',
    }

    if (!Object.keys(validSignatures).some((sig) => signature.startsWith(sig))) {
      return { valid: false, error: 'Invalid file signature' }
    }

    return { valid: true }
  },

  // Génération nom de fichier sécurisé
  generateSecureFilename: (originalName: string, userId: string): string => {
    const ext = path.extname(originalName).toLowerCase()
    const hash = createHash('sha256')
      .update(`${originalName}-${userId}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16)

    return `${hash}${ext}`
  },
}

// Usage dans API route
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = request.headers.get('x-user-id')

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or user' }, { status: 400 })
    }

    // Validate file
    const validation = await secureUploadConfig.validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate secure filename
    const secureFilename = secureUploadConfig.generateSecureFilename(file.name, userId)

    // Save file with Payload
    const uploadedFile = await payload.create({
      collection: 'media',
      data: {
        alt: '', // Will be set later
        uploadedBy: userId,
      },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: secureFilename,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        filename: secureFilename,
        url: uploadedFile.url,
      },
    })
  } catch (error) {
    console.error('[SECURITY] Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

## 🔐 Security Headers

### Template: Headers Sécurisés

**Problème**: Headers de sécurité manquants

```typescript
// ✅ Configuration Next.js sécurisée
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
`

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'false',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 📝 Template d'Application Automatique

### Script d'Application des Corrections

```typescript
// scripts/apply-security-fixes.ts
interface SecurityFix {
  type: 'jwt' | 'validation' | 'rateLimit' | 'headers' | 'upload'
  file: string
  description: string
  apply: () => Promise<void>
}

export const applySecurityFixes = async (fixes: SecurityFix[]) => {
  const results = []

  for (const fix of fixes) {
    try {
      await fix.apply()
      results.push({
        type: fix.type,
        file: fix.file,
        status: 'SUCCESS',
        description: fix.description,
      })
    } catch (error) {
      results.push({
        type: fix.type,
        file: fix.file,
        status: 'FAILED',
        error: error.message,
      })
    }
  }

  return {
    applied: results.filter((r) => r.status === 'SUCCESS').length,
    failed: results.filter((r) => r.status === 'FAILED').length,
    details: results,
  }
}
```

---

_Templates de corrections sécurité - Application automatisée_
