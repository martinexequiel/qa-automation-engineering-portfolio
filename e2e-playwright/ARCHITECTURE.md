# 🏛️ Decisiones Arquitectónicas

Documento que explica el "por qué" detrás de cada decisión de diseño.

---

## 1️⃣ Page Object Model (POM)

### ¿Qué es?
Patrón de diseño que encapsula la interfaz de usuario en clases reutilizables.

### ¿Por qué?
**Problema:**
```typescript
// ❌ Selectores esparcidos en tests
test('login', async ({ page }) => {
  await page.locator('[data-test="username"]').fill('user');
  await page.locator('[data-test="password"]').fill('pass');
  await page.locator('[data-test="login-button"]').click();
});

// Si el selector cambia: múltiples tests para actualizar
```

**Solución (POM):**
```typescript
// ✅ Encapsulación en LoginPage
export class LoginPage {
  private readonly selectors = {
    usernameField: '[data-test="username"]',  // Un solo lugar
    // ...
  };

  async login(username: string, password: string) {
    await this.page.locator(this.selectors.usernameField).fill(username);
    // ...
  }
}

// Tests use abstraído
test('login', async ({ loginPage }) => {
  await loginPage.login('user', 'pass');  // Selector update en un lugar
});
```

### Beneficios
- ✅ **Mantenibilidad**: Cambio de UI = actualización en 1 archivo
- ✅ **Reutilización**: Métodos compartidos entre tests
- ✅ **Legibilidad**: Tests expresan intención, no detalles
- ✅ **Robustez**: Lógica de esperas centralizada

---

## 2️⃣ Custom Fixtures

### ¿Qué es?
Extensión del contexto de Playwright con dependencias inyectadas.

### ¿Por qué?
**Problema:**
```typescript
// ❌ Instanciación manual en cada test
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  await loginPage.login('user', 'pass');
  expect(await inventoryPage.isVisible()).toBe(true);
});

// Boilerplate repetido, error-prone
```

**Solución (Fixtures):**
```typescript
// ✅ Inyección automática
test('login', async ({ loginPage, inventoryPage }) => {
  await loginPage.login('user', 'pass');
  expect(await inventoryPage.isVisible()).toBe(true);
});

// Typesafe, autocomplete, setup automático
```

### Beneficios
- ✅ **Zero boilerplate**: Page objects disponibles directamente
- ✅ **Typesafe**: IDE autocomplete y verificación de tipos
- ✅ **Setup/teardown**: Lógica compartida sin duplicación
- ✅ **Testeable**: Fixtures pueden ser mockados

---

## 3️⃣ Centralización de datos (testData.ts)

### ¿Qué es?
Almacén único de datos de prueba separado de lógica de tests.

### ¿Por qué?
**Problema:**
```typescript
// ❌ Datos esparcidos
test('login with standard user', async ({ loginPage }) => {
  await loginPage.login('standard_user', 'secret_sauce');
});

test('login with problem user', async ({ loginPage }) => {
  await loginPage.login('problem_user', 'secret_sauce');
});

// Duplicación: ¿qué pasa si password cambia?
```

**Solución (Data-driven):**
```typescript
// utils/testData.ts
export const validUsers = [
  { username: 'standard_user', password: 'secret_sauce', ... },
  { username: 'problem_user', password: 'secret_sauce', ... },
];

// tests/login.spec.ts
validUsers.forEach((user) => {
  test(`login with ${user.description}`, async ({ loginPage }) => {
    await loginPage.login(user.username, user.password);
  });
});

// Cambio: Un lugar, múltiples tests se benefician
```

### Beneficios
- ✅ **Mantenibilidad**: Un único source of truth
- ✅ **DRY**: No repetir datos
- ✅ **Data-driven**: Escalable a cientos de casos
- ✅ **Validación**: Datos + expected outcomes juntos

---

## 4️⃣ TypeScript Strict Mode

### ¿Qué es?
Configuración de TypeScript que habilita todas las verificaciones.

### ¿Por qué?
**Problema:**
```typescript
// ❌ Sin strict: cualquier cosa es válido
export class LoginPage {
  async login(username, password) {  // ¿Tipos?
    const result = await this.page.locator(selector);  // ¿selector dónde?
    return result;  // ¿Promise o valor directo?
  }
}

// Errores aparecen en runtime, no en desarrollo
```

**Solución (Strict Mode):**
```typescript
// ✅ Con strict: tipos explícitos
export class LoginPage extends BasePage {
  private readonly selectors = { /* ... */ };

  async login(username: string, password: string): Promise<void> {
    const field = this.page.locator(this.selectors.usernameField);
    await field.fill(username);
  }
}

// IDE atrapa errores antes de ejecutar tests
```

### Beneficios
- ✅ **Prevención de bugs**: Errores detectados durante desarrollo
- ✅ **IDE support**: Autocomplete preciso
- ✅ **Documentation**: Tipos actúan como documentación
- ✅ **Refactoring seguro**: Cambios sin romper código

---

## 5️⃣ Selectores data-test

### ¿Qué es?
Atributos HTML específicos para testing: `[data-test="..."]`

### ¿Por qué?
**Problema:**
```typescript
// ❌ Selectores frágiles
await page.locator('.btn.primary.login').click();  // CSS subject to change
await page.locator('button >> text=Submit').click();  // Cambio de texto = fallo
await page.locator('xpath=//form[1]/button[2]').click();  // Muy frágil

// Cambios de UI rompen tests sin razón lógica
```

**Solución (data-test):**
```typescript
// HTML
<button data-test="login-button" class="btn primary styled">Login</button>

// Test - selectores estables
await page.locator('[data-test="login-button"]').click();

// Cambios estéticos no afectan tests
```

### Beneficios
- ✅ **Estabilidad**: Selectores no cambian con estilos
- ✅ **Intención clara**: Atributo expresa que es testeable
- ✅ **Separación**: QA y Dev pueden trabajar independientemente
- ✅ **Fallbacks**: Múltiples selectores sin fragilidad

---

## 6️⃣ Storage State para sesiones autenticadas

### ¿Qué es?
Guardar cookies/localStorage de una sesión autenticada para reutilizarla.

### ¿Por qué?
**Problema:**
```bash
# ❌ Sin session state
npm test

# Cada test hace login → 14 tests × 3 segundos × 3 browsers = 126 segundos
# Plus: Network requests, rate limiting, flakiness
```

**Solución (Storage State):**
```bash
# ✅ Con session state
1. global-setup.ts: Login una sola vez
2. Guardar sesión en playwright/.auth/standard-user.json
3. Cada test reutiliza sesión
4. 14 tests × 0.5 segundos = 7 segundos (90% más rápido)
```

### Beneficios
- ✅ **Performance**: Tests 10x más rápido
- ✅ **Estabilidad**: Menos login = menos flakiness
- ✅ **Realismo**: Tests con sesión real, no mocking
- ✅ **Flexibilidad**: Múltiples storage states (admin, user, etc.)

---

## 7️⃣ Retries en CI, no en local

### ¿Qué es?
Automáticamente reintentar tests fallidos solo en CI.

### ¿Por qué?
**Problema:**
```typescript
// ❌ Sin retries
// Test falla por timeout de network → CI falla
// Developer no puede reproducirlo localmente → frustrante

// ❌ Con retries siempre
// Developer ejecuta npm test, test falla, se reintenta automáticamente
// Developer no ve el error real → debugging imposible
```

**Solución (Retries selectivos):**
```typescript
retries: process.env.CI ? 2 : 0

// Local: Fail fast → ver errores inmediatamente
// CI: Tolerar flakiness transitoria (network, timing)
```

### Beneficios
- ✅ **CI estabilidad**: Reduce false negatives
- ✅ **Local debugging**: Errores visibles para fix
- ✅ **Balance**: Previene false positives y flakiness

---

## 8️⃣ Artifacts solo en fallos

### ¿Qué es?
Guardar screenshots, videos, traces solo cuando tests fallan.

### ¿Por qué?
**Problema:**
```bash
# ❌ Guardar todo
npm test
# 100 tests = 100 screenshots + 100 videos = 50 GB
# Almacenamiento y CI/CD lento
```

**Solución (Selective artifacts):**
```typescript
screenshot: 'only-on-failure'  // Solo fallos
video: 'retain-on-failure'     // Solo fallos
trace: 'on-first-retry'        // Solo retries

// 5 fallos = 5 screenshots, 5 videos, rastreable
```

### Beneficios
- ✅ **Almacenamiento**: Reduce 50 GB a 500 MB
- ✅ **CI speed**: Subidas/descargas rápidas
- ✅ **Debugging**: Artifacts ricos disponibles
- ✅ **Enfoque**: Información relevante sin ruido

---

## 9️⃣ Multiple navegadores

### ¿Qué es?
Tests ejecutados automáticamente en Chromium, Firefox, WebKit.

### ¿Por qué?
**Problema:**
```bash
# ❌ Solo Chrome
npm test
# Test pasa en Chrome → deployment
# Usuario en Firefox: "¿Por qué no funciona?"
```

**Solución (Multi-browser):**
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]

// npm test: 14 tests × 3 browsers = 42 ejecuciones
// Cobertura real de los usuarios
```

### Beneficios
- ✅ **Cross-browser**: Detecta bugs específicos de navegador
- ✅ **Confianza**: Cambios probados en 3 motores
- ✅ **Realismo**: Simula audiencia real
- ✅ **Regresión**: Evita sorpresas en producción

---

## 🔟 Path aliases

### ¿Qué es?
Imports limpios con `@pages`, `@fixtures`, `@utils` en lugar de `../../..`

### ¿Por qué?
**Problema:**
```typescript
// ❌ Sin path aliases (relatividad confusa)
import { LoginPage } from '../../../pages/LoginPage';
import { test } from '../../fixtures/index';

// ¿Cuántos ../? Confuso al refactorizar
```

**Solución (Path aliases):**
```typescript
// ✅ Con path aliases (claro e intuitivo)
import { LoginPage } from '@pages/LoginPage';
import { test } from '@fixtures/index';

// Cambiar estructura sin actualizar imports
```

### Beneficios
- ✅ **Legibilidad**: Imports expresivos
- ✅ **Refactoring**: Mover archivos sin romper imports
- ✅ **Mantenibilidad**: Estructura clara
- ✅ **IDE**: Mejor soporte de autocomplete

---

## 1️⃣1️⃣ Separación de responsabilidades

### ¿Qué es?
Cada componente tiene un único propósito bien definido.

### ¿Por qué?

| Componente | Responsabilidad | ❌ NO hace |
|-----------|----------------|-----------| 
| Test | Validar comportamiento | Selectores, setup DB |
| Page Object | Encapsular UI | Lógica de negocio, assertions |
| Fixture | Inyectar dependencias | Setup complejo, assertions |
| Util | Datos/helpers comunes | Lógica específica de página |
| Config | Configurar ejecución | Lógica de tests |

**Ejemplo:**
```typescript
// ✅ CORRECTO: Responsabilidades claras
// LoginPage: Encapsula UI
async login(username: string, password: string): Promise<void> { }

// Test: Valida comportamiento
test('should login successfully', async ({ loginPage, page }) => {
  await loginPage.login('user', 'pass');
  expect(page.url()).toContain('/inventory');
});

// ❌ INCORRECTO: Responsabilidades mezcladas
// LoginPage hace todo
async login(username: string, password: string): Promise<boolean> {
  await this.page.locator(selector).fill(username);
  // ...
  const isValid = /* validación */ ;
  if (!isValid) {
    // Setup DB, logging, etc.
  }
  return isValid;
}
```

### Beneficios
- ✅ **Testabilidad**: Cada parte es testeable
- ✅ **Reutilización**: Componentes sin coupling
- ✅ **Debugging**: Errores ubicables
- ✅ **Escalabilidad**: Agregar features sin refactoring

---

## 🎯 Resumen de decisiones

| Decisión | Problema | Solución | Beneficio |
|----------|----------|----------|----------|
| POM | Selectores esparcidos | Encapsular en clases | Mantenibilidad |
| Fixtures | Instanciación manual | Inyección automática | Zero boilerplate |
| TestData | Datos duplicados | Centralización | DRY, data-driven |
| TypeScript | Errores en runtime | Strict mode | Type safety |
| data-test | Selectores frágiles | Atributos estables | Robustez |
| Storage State | Tests lentos | Sesión reutilizable | 10x más rápido |
| Retries | False negatives/positives | Selectivo (CI vs local) | Balance |
| Artifacts | Almacenamiento bloated | Solo en fallos | Eficiencia |
| Multi-browser | Coverage limitada | 3 navegadores | Confianza |
| Path aliases | Imports confusos | @pages, @utils, @fixtures | Legibilidad |
| SOLID | Código acoplado | Separación responsabilidades | Escalabilidad |

---

**Última actualización:** Abril 2026
