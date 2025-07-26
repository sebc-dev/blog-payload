# Guide des Bonnes Pratiques - Qualité de Code TypeScript

## 🎯 Principes Fondamentaux

### DRY (Don't Repeat Yourself)

**Principe** : Une seule représentation autoritaire de chaque connaissance dans le système.

```typescript
// ❌ Répétition
const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email)
const checkEmailFormat = (email: string) => /\S+@\S+\.\S+/.test(email)

// ✅ Centralisé
const EMAIL_REGEX = /\S+@\S+\.\S+/
const validateEmail = (email: string) => EMAIL_REGEX.test(email)
```

### KISS (Keep It Simple, Stupid)

**Principe** : Privilégier les solutions simples aux solutions complexes.

```typescript
// ❌ Complexe
const getMonthName = (num: number) => {
  switch (num) {
    case 1:
      return 'January'
    case 2:
      return 'February'
    // ... 10 autres cases
  }
}

// ✅ Simple
const MONTHS = ['January', 'February', 'March' /* ... */]
const getMonthName = (num: number) => MONTHS[num - 1]
```

### YAGNI (You Ain't Gonna Need It)

**Principe** : N'implémentez que ce qui est actuellement nécessaire.

```typescript
// ❌ Sur-ingénierie
class User {
  constructor(
    private name: string,
    private email: string,
    private futureFeature?: string, // Pas nécessaire maintenant
    private anotherFutureFeature?: boolean,
  ) {}
}

// ✅ Essentiel uniquement
class User {
  constructor(
    private name: string,
    private email: string,
  ) {}
}
```

## 🏃‍♂️ Object Calisthenics - 9 Règles

### 1. Un Seul Niveau d'Indentation

```typescript
// ❌ Nested
function processUser(user: User): boolean {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return true
      }
    }
  }
  return false
}

// ✅ Early returns
function processUser(user: User): boolean {
  if (!user) return false
  if (!user.isActive) return false
  if (!user.hasPermission) return false
  return true
}
```

### 2. Éviter le Mot-clé ELSE

```typescript
// ❌ Avec else
function getDiscount(price: number, isMember: boolean): number {
  if (isMember) {
    return price * 0.9
  } else {
    return price
  }
}

// ✅ Sans else
function getDiscount(price: number, isMember: boolean): number {
  if (isMember) return price * 0.9
  return price
}
```

### 3. Encapsuler les Primitives

```typescript
// ❌ Primitives nues
class Order {
  constructor(private price: number) {}
}

// ✅ Value Objects
class Price {
  constructor(private value: number) {
    if (value <= 0) throw new Error('Price must be positive')
  }
  getValue(): number {
    return this.value
  }
}

class Order {
  constructor(private price: Price) {}
}
```

### 4. Collections First-Class

```typescript
// ❌ Array direct
class Cart {
  constructor(public items: Product[]) {}
}

// ✅ Collection encapsulée
class CartItems {
  constructor(private items: Product[] = []) {}

  add(item: Product): void {
    this.items.push(item)
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0)
  }
}
```

### 5. Un Point Par Ligne (Law of Demeter)

```typescript
// ❌ Chaînage profond
const city = user.getAddress().getLocation().getCity()

// ✅ Méthodes déléguées
class User {
  constructor(private address: Address) {}

  getCity(): string {
    return this.address.getCity()
  }
}
```

### 6. Pas d'Abréviations

```typescript
// ❌ Abréviations
class UsrMgr {
  constructor(private nm: string) {}
}

// ✅ Noms explicites
class UserManager {
  constructor(private name: string) {}
}
```

### 7. Entités Petites (Single Responsibility)

```typescript
// ❌ Responsabilités multiples
class User {
  constructor(private email: string) {}

  sendEmail(message: string): void {
    // Logique d'envoi email
  }

  validateEmail(): boolean {
    // Logique de validation
  }
}

// ✅ Responsabilités séparées
class EmailService {
  send(email: string, message: string): void {}
}

class EmailValidator {
  validate(email: string): boolean {}
}

class User {
  constructor(private email: string) {}
}
```

### 8. Maximum 2 Variables d'Instance

```typescript
// ❌ Trop de dépendances
class Order {
  constructor(
    private id: string,
    private customer: Customer,
    private items: OrderItem[],
    private status: string,
    private createdAt: Date,
  ) {}
}

// ✅ Objets composés
class OrderMetadata {
  constructor(
    private id: string,
    private createdAt: Date,
  ) {}
}

class Order {
  constructor(
    private metadata: OrderMetadata,
    private details: OrderDetails,
  ) {}
}
```

### 9. Pas de Getters/Setters

```typescript
// ❌ Exposition des données
class Account {
  constructor(private balance: number) {}

  getBalance(): number {
    return this.balance
  }
  setBalance(amount: number): void {
    this.balance = amount
  }
}

// ✅ Comportements métier
class Account {
  constructor(private balance: number) {}

  withdraw(amount: number): void {
    if (amount > this.balance) {
      throw new Error('Insufficient funds')
    }
    this.balance -= amount
  }

  deposit(amount: number): void {
    this.balance += amount
  }
}
```

## 📋 Checklist Qualité de Code

### Principes Fondamentaux

- [ ] **DRY** : Aucune duplication de logique ou de connaissance
- [ ] **KISS** : Solutions simples privilégiées, éviter la complexité inutile
- [ ] **YAGNI** : Seulement les fonctionnalités actuellement nécessaires

### Object Calisthenics

- [ ] **Indentation** : Un seul niveau d'indentation par méthode
- [ ] **ELSE** : Éviter le mot-clé else, utiliser early returns
- [ ] **Primitives** : Encapsuler les primitives dans des objets métier
- [ ] **Collections** : Utiliser des collections first-class
- [ ] **Law of Demeter** : Un seul point par ligne, éviter le chaînage
- [ ] **Nommage** : Pas d'abréviations, noms explicites et compréhensibles
- [ ] **Single Responsibility** : Entités petites avec une seule responsabilité
- [ ] **Variables d'instance** : Maximum 2 variables d'instance par classe
- [ ] **Encapsulation** : Pas de getters/setters, privilégier les comportements métier

### Bonnes Pratiques Générales

- [ ] **Testabilité** : Code facilement testable et unités isolées
- [ ] **Composition** : Préférée à l'héritage complexe
- [ ] **Validation** : Validation des données à l'entrée des objets
- [ ] **Immutabilité** : Privilégier les objets immutables quand possible

---

_Ces principes sont des guides, pas des règles absolues. Appliquez-les avec discernement selon le contexte de votre projet._
