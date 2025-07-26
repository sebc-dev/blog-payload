# Templates de Tests Sécurité

Templates de tests automatisés pour valider les corrections sécurité appliquées par l'agent **security-review**.

## 🔐 Tests d'Authentification

### Template: Tests JWT

```typescript
// __tests__/security/jwt.test.ts
import jwt from 'jsonwebtoken'
import { generateTokens, verifyToken } from '@/lib/auth/jwt'

describe('JWT Security Tests', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    role: 'user',
    tokenVersion: 1,
  }

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-256-bits-long-for-testing-purposes-only'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-256-bits-long-for-testing'
  })

  test('should generate secure JWT tokens', () => {
    const { accessToken, refreshToken } = generateTokens(mockUser)

    // Verify tokens are generated
    expect(accessToken).toBeDefined()
    expect(refreshToken).toBeDefined()

    // Verify token structure
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as any
    expect(decoded.userId).toBe(mockUser.id)
    expect(decoded.role).toBe(mockUser.role)
    expect(decoded.exp).toBeDefined()
  })

  test('should reject weak secrets', () => {
    process.env.JWT_SECRET = 'weak'

    expect(() => {
      generateTokens(mockUser)
    }).toThrow('JWT secret too weak')
  })

  test('should reject expired tokens', () => {
    const expiredToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET!, {
      expiresIn: '-1h',
    })

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET!)
    }).toThrow('jwt expired')
  })

  test('should reject tampered tokens', () => {
    const { accessToken } = generateTokens(mockUser)
    const tamperedToken = accessToken.slice(0, -5) + 'XXXXX'

    expect(() => {
      jwt.verify(tamperedToken, process.env.JWT_SECRET!)
    }).toThrow('invalid signature')
  })

  test('should reject none algorithm', () => {
    const noneToken = jwt.sign({ userId: mockUser.id }, '', { algorithm: 'none' })

    expect(() => {
      jwt.verify(noneToken, process.env.JWT_SECRET!)
    }).toThrow()
  })
})
```

### Template: Tests Middleware Auth

```typescript
// __tests__/security/auth-middleware.test.ts
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

describe('Authentication Middleware Tests', () => {
  const createRequest = (path: string, cookies: Record<string, string> = {}) => {
    const url = `http://localhost:3000${path}`
    const request = new NextRequest(url)

    // Add cookies
    Object.entries(cookies).forEach(([name, value]) => {
      request.cookies.set(name, value)
    })

    return request
  }

  test('should allow access to public routes', async () => {
    const request = createRequest('/')
    const response = await middleware(request)

    expect(response?.status).not.toBe(401)
  })

  test('should redirect to login for protected routes without token', async () => {
    const request = createRequest('/admin')
    const response = await middleware(request)

    expect(response?.status).toBe(307) // Redirect
    expect(response?.headers.get('location')).toContain('/login')
  })

  test('should allow access with valid token', async () => {
    const validToken = jwt.sign({ userId: '123', role: 'admin' }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    })

    const request = createRequest('/admin', { accessToken: validToken })
    const response = await middleware(request)

    expect(response?.status).not.toBe(307)
  })

  test('should reject expired tokens', async () => {
    const expiredToken = jwt.sign({ userId: '123', role: 'admin' }, process.env.JWT_SECRET!, {
      expiresIn: '-1h',
    })

    const request = createRequest('/admin', { accessToken: expiredToken })
    const response = await middleware(request)

    expect(response?.status).toBe(307) // Redirect to login
  })
})
```

## 🛡️ Tests d'Injection Prevention

### Template: Tests Payload Queries

```typescript
// __tests__/security/payload-injection.test.ts
import payload from 'payload'
import { secureFind } from '@/lib/secure-queries'

describe('Payload Injection Prevention Tests', () => {
  afterEach(async () => {
    // Cleanup test data
    await payload.delete({
      collection: 'users',
      where: { email: { like: '%test%' } },
    })
  })

  test('should prevent SQL injection in queries', async () => {
    const maliciousInput = "'; DROP TABLE users; --"

    const result = await secureFind('users', {
      email: { equals: maliciousInput },
    })

    // Should return empty result, not error
    expect(result.docs).toHaveLength(0)
    expect(result.totalDocs).toBe(0)
  })

  test('should sanitize operator injection', async () => {
    const maliciousQuery = {
      email: {
        $where: "this.password = 'secret'", // MongoDB injection attempt
      },
    }

    const result = await secureFind('users', maliciousQuery)

    // Malicious operator should be filtered out
    expect(result.docs).toHaveLength(0)
  })

  test('should limit query results to prevent DoS', async () => {
    // Create test users
    for (let i = 0; i < 100; i++) {
      await payload.create({
        collection: 'users',
        data: {
          email: `test${i}@example.com`,
          password: 'password123',
        },
      })
    }

    const result = await secureFind('users', {
      email: { contains: 'test' },
    })

    // Should be limited to max 50 results
    expect(result.docs.length).toBeLessThanOrEqual(50)
  })

  test('should escape special characters in search', async () => {
    const specialChars = "<script>alert('xss')</script>"

    const result = await secureFind('users', {
      name: { contains: specialChars },
    })

    // Should not throw error and return safe results
    expect(result).toBeDefined()
    expect(result.docs).toHaveLength(0)
  })
})
```

### Template: Tests Input Validation

```typescript
// __tests__/security/input-validation.test.ts
import { sanitizeInput } from '@/lib/security/sanitize'

describe('Input Validation Tests', () => {
  test('should sanitize XSS attempts in text', () => {
    const malicious = "<script>alert('xss')</script>Hello"
    const sanitized = sanitizeInput.text(malicious)

    expect(sanitized).not.toContain('<script>')
    expect(sanitized).not.toContain('alert')
    expect(sanitized).toContain('Hello')
  })

  test('should sanitize HTML content safely', () => {
    const maliciousHtml = `
      <p>Safe content</p>
      <script>alert('xss')</script>
      <img src="x" onerror="alert('xss')">
      <a href="javascript:alert('xss')">Link</a>
    `

    const sanitized = sanitizeInput.html(maliciousHtml)

    expect(sanitized).toContain('<p>Safe content</p>')
    expect(sanitized).not.toContain('<script>')
    expect(sanitized).not.toContain('onerror')
    expect(sanitized).not.toContain('javascript:')
  })

  test('should validate and sanitize emails', () => {
    const testCases = [
      { input: 'valid@example.com', expected: 'valid@example.com' },
      { input: 'VALID@EXAMPLE.COM', expected: 'valid@example.com' },
      { input: 'invalid-email', expected: null },
      { input: 'test@<script>evil.com', expected: null },
    ]

    testCases.forEach(({ input, expected }) => {
      const result = sanitizeInput.email(input)
      expect(result).toBe(expected)
    })
  })

  test('should validate URLs safely', () => {
    const testCases = [
      { input: 'https://example.com', valid: true },
      { input: 'http://example.com', valid: true },
      { input: 'javascript:alert(1)', valid: false },
      { input: 'data:text/html,<script>alert(1)</script>', valid: false },
      { input: 'ftp://example.com', valid: false },
    ]

    testCases.forEach(({ input, valid }) => {
      const result = sanitizeInput.url(input)
      if (valid) {
        expect(result).toBe(input)
      } else {
        expect(result).toBeNull()
      }
    })
  })
})
```

## 🚫 Tests Rate Limiting

### Template: Tests Rate Limiter

```typescript
// __tests__/security/rate-limiting.test.ts
import { SecurityRateLimiter } from '@/lib/security/rate-limiter'

describe('Rate Limiting Tests', () => {
  let rateLimiter: SecurityRateLimiter

  beforeEach(() => {
    rateLimiter = new SecurityRateLimiter()
  })

  test('should allow requests within limit', async () => {
    const identifier = 'test-user'

    // Should allow first 5 requests
    for (let i = 0; i < 5; i++) {
      const allowed = await rateLimiter.checkLimit(identifier, 5, 60000)
      expect(allowed).toBe(true)
    }
  })

  test('should block requests exceeding limit', async () => {
    const identifier = 'test-user'

    // Exceed limit
    for (let i = 0; i < 6; i++) {
      await rateLimiter.checkLimit(identifier, 5, 60000)
    }

    // 6th request should be blocked
    const blocked = await rateLimiter.checkLimit(identifier, 5, 60000)
    expect(blocked).toBe(false)
  })

  test('should reset after time window', async () => {
    const identifier = 'test-user'

    // Exceed limit
    for (let i = 0; i < 6; i++) {
      await rateLimiter.checkLimit(identifier, 5, 100) // 100ms window
    }

    // Wait for window to reset
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should allow requests again
    const allowed = await rateLimiter.checkLimit(identifier, 5, 60000)
    expect(allowed).toBe(true)
  })

  test('should implement exponential backoff', async () => {
    const identifier = 'test-user'

    // Exceed limit multiple times
    for (let attempt = 0; attempt < 10; attempt++) {
      for (let i = 0; i < 6; i++) {
        await rateLimiter.checkLimit(identifier, 5, 100)
      }
    }

    // Should have extended block time
    const blocked = await rateLimiter.checkLimit(identifier, 5, 100)
    expect(blocked).toBe(false)
  })
})
```

## 🗂️ Tests Upload Sécurisé

### Template: Tests File Upload

```typescript
// __tests__/security/file-upload.test.ts
import { secureUploadConfig } from '@/lib/security/upload'

describe('File Upload Security Tests', () => {
  const createMockFile = (name: string, type: string, size: number, content: Buffer): File => {
    return new File([content], name, { type })
  }

  test('should accept valid image files', async () => {
    // Create valid JPEG file
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0])
    const mockFile = createMockFile('test.jpg', 'image/jpeg', 1000, jpegHeader)

    const result = await secureUploadConfig.validateFile(mockFile)
    expect(result.valid).toBe(true)
  })

  test('should reject files with invalid MIME types', async () => {
    const mockFile = createMockFile('test.exe', 'application/x-msdownload', 1000, Buffer.from([]))

    const result = await secureUploadConfig.validateFile(mockFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid file type')
  })

  test('should reject files with invalid extensions', async () => {
    const mockFile = createMockFile('test.php', 'image/jpeg', 1000, Buffer.from([]))

    const result = await secureUploadConfig.validateFile(mockFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid file extension')
  })

  test('should reject oversized files', async () => {
    const largeSize = 10 * 1024 * 1024 // 10MB
    const mockFile = createMockFile('test.jpg', 'image/jpeg', largeSize, Buffer.from([]))

    const result = await secureUploadConfig.validateFile(mockFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('File too large')
  })

  test('should validate file signatures (magic numbers)', async () => {
    // Fake JPEG with wrong signature
    const fakeContent = Buffer.from([0x00, 0x00, 0x00, 0x00])
    const mockFile = createMockFile('test.jpg', 'image/jpeg', 1000, fakeContent)

    const result = await secureUploadConfig.validateFile(mockFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid file signature')
  })

  test('should generate secure filenames', () => {
    const originalName = '../../../etc/passwd'
    const userId = 'user123'

    const secureFilename = secureUploadConfig.generateSecureFilename(originalName, userId)

    expect(secureFilename).not.toContain('../')
    expect(secureFilename).not.toContain('passwd')
    expect(secureFilename).toMatch(/^[a-f0-9]+\.\w+$/)
  })
})
```

## 🔒 Tests Security Headers

### Template: Tests Headers

```typescript
// __tests__/security/security-headers.test.ts
import { NextRequest } from 'next/server'

describe('Security Headers Tests', () => {
  test('should include Content Security Policy', async () => {
    const response = await fetch('http://localhost:3000/')
    const csp = response.headers.get('Content-Security-Policy')

    expect(csp).toBeDefined()
    expect(csp).toContain("default-src 'self'")
    expect(csp).not.toContain("'unsafe-inline'") // Should be minimal
  })

  test('should include HSTS header', async () => {
    const response = await fetch('http://localhost:3000/')
    const hsts = response.headers.get('Strict-Transport-Security')

    expect(hsts).toBeDefined()
    expect(hsts).toContain('max-age=')
    expect(hsts).toContain('includeSubDomains')
  })

  test('should prevent clickjacking', async () => {
    const response = await fetch('http://localhost:3000/')
    const frameOptions = response.headers.get('X-Frame-Options')

    expect(frameOptions).toBe('DENY')
  })

  test('should prevent MIME sniffing', async () => {
    const response = await fetch('http://localhost:3000/')
    const contentType = response.headers.get('X-Content-Type-Options')

    expect(contentType).toBe('nosniff')
  })
})
```

## 📊 Test Suite Intégration

### Template: Security Test Runner

```typescript
// __tests__/security/security-suite.test.ts
import { runSecurityTests } from '@/lib/security/test-runner'

describe('Security Test Suite', () => {
  test('should run complete security audit', async () => {
    const results = await runSecurityTests({
      auth: true,
      injection: true,
      rateLimit: true,
      upload: true,
      headers: true,
    })

    expect(results.passed).toBeGreaterThan(0)
    expect(results.failed).toBe(0)
    expect(results.coverage).toBeGreaterThanOrEqual(90)
  })

  test('should generate security report', async () => {
    const report = await runSecurityTests({ generateReport: true })

    expect(report).toHaveProperty('owasp_compliance')
    expect(report).toHaveProperty('vulnerabilities')
    expect(report).toHaveProperty('recommendations')

    expect(report.owasp_compliance).toBeGreaterThanOrEqual(85)
  })
})
```

### Template: Performance Security Tests

```typescript
// __tests__/security/performance.test.ts
describe('Security Performance Tests', () => {
  test('should handle rate limiting efficiently', async () => {
    const start = Date.now()

    // Simulate many requests
    const promises = Array.from({ length: 100 }, (_, i) => rateLimiter.checkLimit(`user-${i}`, 5))

    await Promise.all(promises)

    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000) // Should complete in < 1s
  })

  test('should validate files quickly', async () => {
    const mockFile = createMockFile('test.jpg', 'image/jpeg', 1000, jpegBuffer)

    const start = Date.now()
    await secureUploadConfig.validateFile(mockFile)
    const duration = Date.now() - start

    expect(duration).toBeLessThan(100) // Should validate in < 100ms
  })
})
```

---

## 🚀 Test Automation Script

### Template: Tests CI/CD

```bash
#!/bin/bash
# scripts/run-security-tests.sh

echo "🛡️ Running Security Test Suite..."

# Run all security tests
npm test -- --testPathPattern=security --coverage

# Check for critical vulnerabilities
npm audit --audit-level critical

# OWASP dependency check
npm run security:check

# Generate security report
npm run security:report

echo "✅ Security tests completed"
```

---

_Templates de tests sécurité - Validation automatisée_
