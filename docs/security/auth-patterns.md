# Authentication Patterns - Sécurisés

Patterns d'authentification sécurisés pour le stack Next.js 15.3.3 + Payload CMS 3.48.0.

## 🔐 JWT Authentication Pattern

### Configuration Sécurisée

```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET! // Min 256 bits
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m', algorithm: 'HS256' },
  )

  const refreshToken = jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' },
  )

  return { accessToken, refreshToken }
}
```

### Secure Cookie Implementation

```typescript
// lib/auth/cookies.ts
export const setSecureCookies = (accessToken: string, refreshToken: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }

  cookies().set('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  })

  cookies().set('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}
```

## 🛡️ Payload CMS Integration

### Auth Hooks Sécurisés

```typescript
// payload/collections/Users.ts
import type { CollectionConfig } from 'payload/types'
import bcrypt from 'bcrypt'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: ['user', 'admin'],
      defaultValue: 'user',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || (operation === 'update' && data.password)) {
          // Hash password with strong salt
          data.password = await bcrypt.hash(data.password, 12)
        }
        return data
      },
    ],
    afterLogin: [
      async ({ req, user }) => {
        // Log successful login
        console.log(`User ${user.email} logged in from ${req.ip}`)

        // Reset failed login attempts
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { loginAttempts: 0 },
        })
      },
    ],
    afterLogout: [
      async ({ req, user }) => {
        // Invalidate refresh tokens by incrementing version
        if (user) {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { tokenVersion: (user.tokenVersion || 0) + 1 },
          })
        }
      },
    ],
  },
}
```

## 🔄 Token Refresh Pattern

### Middleware d'Authentification

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify access token
      jwt.verify(accessToken!, process.env.JWT_SECRET!)
      return NextResponse.next()
    } catch (error) {
      // Access token expired, try refresh
      if (refreshToken) {
        try {
          const refreshPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any

          // Generate new access token
          const newAccessToken = jwt.sign(
            { userId: refreshPayload.userId },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' },
          )

          const response = NextResponse.next()
          response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
          })

          return response
        } catch (refreshError) {
          // Both tokens invalid, redirect to login
          return NextResponse.redirect(new URL('/login', request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

## 🚨 Rate Limiting Pattern

### Login Protection

```typescript
// lib/auth/rate-limiter.ts
interface LoginAttempt {
  ip: string
  attempts: number
  resetTime: number
}

const loginAttempts = new Map<string, LoginAttempt>()

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt) {
    loginAttempts.set(ip, { ip, attempts: 1, resetTime: now + 15 * 60 * 1000 })
    return true
  }

  if (now > attempt.resetTime) {
    // Reset window
    loginAttempts.set(ip, { ip, attempts: 1, resetTime: now + 15 * 60 * 1000 })
    return true
  }

  if (attempt.attempts >= 5) {
    return false // Rate limited
  }

  attempt.attempts++
  return true
}

// Usage in login API
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

  // Proceed with login...
}
```

## 🔒 Role-Based Access Control (RBAC)

### Access Control Utils

```typescript
// lib/auth/rbac.ts
export type UserRole = 'user' | 'admin' | 'moderator'

export const permissions = {
  user: ['read:own', 'update:own'],
  moderator: ['read:own', 'update:own', 'read:all', 'moderate:content'],
  admin: ['read:own', 'update:own', 'read:all', 'update:all', 'delete:all'],
} as const

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return permissions[userRole]?.includes(permission as any) || false
}

export const requireRole = (requiredRole: UserRole) => {
  return (user: any) => {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2 }
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }
}
```

### Protected API Route Pattern

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { requireRole } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole('admin')(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin logic here...
    const users = await payload.find({ collection: 'users' })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

## 🔐 Password Security

### Strong Password Validation

```typescript
// lib/auth/password-validation.ts
import zxcvbn from 'zxcvbn'

export const validatePassword = (password: string, userInputs?: string[]) => {
  const result = zxcvbn(password, userInputs)

  return {
    isValid: result.score >= 3, // 0-4 scale
    score: result.score,
    feedback: result.feedback,
    estimatedCrackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
  }
}

// Usage in registration
export async function POST(request: Request) {
  const { email, password } = await request.json()

  const passwordValidation = validatePassword(password, [email])

  if (!passwordValidation.isValid) {
    return NextResponse.json(
      {
        error: 'Password too weak',
        feedback: passwordValidation.feedback,
      },
      { status: 400 },
    )
  }

  // Proceed with registration...
}
```

## 🛡️ Security Headers

### Next.js Security Configuration

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
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

## ✅ Security Checklist

- [ ] JWT tokens courts (15min access, 7j refresh)
- [ ] Cookies sécurisés (httpOnly, secure, sameSite)
- [ ] Rate limiting sur login (5 tentatives/15min)
- [ ] Hash passwords avec bcrypt (salt round 12+)
- [ ] Validation de force des mots de passe
- [ ] RBAC avec hiérarchie de rôles
- [ ] Security headers configurés
- [ ] Token refresh automatique
- [ ] Logout invalidant les tokens
- [ ] Logs des événements d'auth

---

_Patterns d'authentification sécurisés - Next.js 15.3.3 + Payload 3.48.0_
