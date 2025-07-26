# OWASP Top 10 (2021) - Checklist blog-payload

Checklist détaillée pour l'audit sécurité selon OWASP Top 10, spécifique au stack Next.js + Payload CMS.

## A01:2021 - Broken Access Control

### 🎯 Audit Focus: Payload Collections & API Routes

#### Payload CMS Access Control

- [ ] **Collections Access Patterns**

  ```typescript
  // ✅ Correct: Field-level permissions
  {
    name: 'users',
    access: {
      read: ({ req: { user } }) => user?.role === 'admin',
      update: ({ req: { user }, id }) => user?.id === id || user?.role === 'admin'
    }
  }
  ```

- [ ] **API Routes Protection**
  ```typescript
  // ✅ Correct: Middleware auth check
  export async function GET(request: Request) {
    const token = request.headers.get('authorization')
    const user = await verifyJWT(token)
    if (!user) return NextResponse.json({}, { status: 401 })
  }
  ```

#### Validation Points

- [ ] Routes publiques/privées clairement définies
- [ ] Contrôle d'accès basé sur les rôles (RBAC)
- [ ] Validation côté serveur (pas seulement client)
- [ ] Protection contre l'énumération d'IDs

## A02:2021 - Cryptographic Failures

### 🔐 Audit Focus: JWT & Secrets Management

#### JWT Implementation

- [ ] **Algorithm Security**

  ```typescript
  // ✅ Correct: Strong algorithm
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256', // ou RS256 pour production
    expiresIn: '15m',
  })
  ```

- [ ] **Secret Management**
  - [ ] JWT_SECRET entropy > 256 bits
  - [ ] Secrets non exposés dans .env.example
  - [ ] Rotation des secrets en production

#### Password Security

- [ ] **Hashing robuste**
  ```typescript
  // ✅ Correct: bcrypt avec salt
  const hashedPassword = await bcrypt.hash(password, 12)
  ```

## A03:2021 - Injection

### 💉 Audit Focus: Payload Queries & Input Validation

#### Payload Query Security

- [ ] **Dynamic Where Clauses**

  ```typescript
  // ❌ Dangerous: User input direct
  await payload.find({
    collection: 'posts',
    where: { title: { contains: userInput } }, // Potential injection
  })

  // ✅ Correct: Sanitized input
  const sanitizedInput = validator.escape(userInput)
  await payload.find({
    collection: 'posts',
    where: { title: { contains: sanitizedInput } },
  })
  ```

#### Input Validation

- [ ] **Schema Validation**
  ```typescript
  // ✅ Correct: Zod validation
  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  ```

## A04:2021 - Insecure Design

### 🏗️ Audit Focus: Auth Flow Architecture

#### Session Management

- [ ] **Secure Session Design**
  ```typescript
  // ✅ Correct: Refresh token rotation
  const refreshToken = await generateRefreshToken(user.id)
  cookies().set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  ```

## A05:2021 - Security Misconfiguration

### ⚙️ Audit Focus: Next.js & Payload Configuration

#### Next.js Security Headers

- [ ] **Headers Configuration**
  ```javascript
  // next.config.js
  const nextConfig = {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ],
        },
      ]
    },
  }
  ```

#### CORS Configuration

- [ ] **Restrictive CORS**
  ```typescript
  // ✅ Correct: Specific origins
  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000'],
    credentials: true,
  }
  ```

## A06:2021 - Vulnerable and Outdated Components

### 📦 Audit Focus: Dependencies & Payload Versions

#### Package Security

- [ ] **Audit Commands**

  ```bash
  npm audit --audit-level high
  npm outdated
  ```

- [ ] **Payload CMS Updates**
  - [ ] Version Payload >= 3.48.0 (dernière sécurisée)
  - [ ] Plugins tiers auditez
  - [ ] Dependencies critiques à jour

## A07:2021 - Identification and Authentication Failures

### 🔑 Audit Focus: Multi-factor & Rate Limiting

#### Authentication Security

- [ ] **Rate Limiting**

  ```typescript
  // ✅ Correct: Rate limiting auth endpoints
  const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: 'Too many login attempts',
  })
  ```

- [ ] **Session Timeout**
  ```typescript
  // ✅ Correct: Short-lived tokens
  const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' })
  ```

## A08:2021 - Software and Data Integrity Failures

### 🛡️ Audit Focus: Build Process & Package Integrity

#### Integrity Checks

- [ ] **Package Lock Files**
  - [ ] package-lock.json committé
  - [ ] Integrity hashes validés

## A09:2021 - Security Logging and Monitoring Failures

### 📊 Audit Focus: Audit Logs & Security Events

#### Logging Security Events

- [ ] **Security Events Tracking**

  ```typescript
  // ✅ Correct: Security event logging
  const securityLogger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'auth' },
    transports: [new winston.transports.File({ filename: 'security.log' })],
  })

  // Log failed login
  securityLogger.warn('Failed login attempt', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  })
  ```

## A10:2021 - Server-Side Request Forgery (SSRF)

### 🌐 Audit Focus: External API Calls

#### SSRF Prevention

- [ ] **URL Validation**
  ```typescript
  // ✅ Correct: URL whitelist
  const allowedHosts = ['api.stripe.com', 'api.sendgrid.com']
  const url = new URL(externalUrl)
  if (!allowedHosts.includes(url.hostname)) {
    throw new Error('Unauthorized external request')
  }
  ```

---

## 📋 Compliance Score Calculation

```typescript
const calculateComplianceScore = (checkedItems: number, totalItems: number) => {
  return Math.round((checkedItems / totalItems) * 100)
}

// Seuils de compliance
// 90-100%: APPROVED
// 70-89%: CONDITIONAL
// <70%: BLOCKED
```

---

_Checklist OWASP 2021 - Adapté pour Next.js 15.3.3 + Payload 3.48.0_
