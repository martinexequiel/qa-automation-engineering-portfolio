# E2E Automation Framework - Arquitectura Detallada

## 📐 Visión General

Framework profesional de automatización E2E que implementa patrones avanzados:
- **Page Object Model (POM)**: Encapsulación de selectores y lógica de página
- **Custom Fixtures**: Inyección de dependencias del contexto de tests
- **Data-Driven Testing**: Datos centralizados separados de lógica
- **Cross-Browser**: Ejecución automática en Chromium, Firefox, WebKit
- **TypeScript Strict**: Type safety total para prevenir errores

---

## 📁 Estructura de directorios

```
e2e-playwright/
├── tests/                      # 🧪 Especificaciones de tests
│   ├── login.spec.ts           # Auth: login, lockout, credenciales inválidas
│   ├── purchase.spec.ts        # E2E: carrito → checkout → confirmación
│   └── example.spec.ts         # Demostración de conceptos básicos
│
├── pages/                       # 🏠 Page Object Model (POM)
│   ├── BasePage.ts             # Clase base con métodos comunes
│   ├── LoginPage.ts            # Lógica de página de login
│   ├── InventoryPage.ts        # Catálogo de productos
│   ├── CartPage.ts             # Carrito de compras
│   ├── CheckoutPage.ts         # Formulario de checkout
│   ├── CheckoutCompletePage.ts # Confirmación de orden
│   └── index.ts                # Exportas centralizadas de todas las páginas
│
├── fixtures/                    # 🔧 Custom test fixtures & setup
│   └── index.ts                # Inyección de page objects en tests
│
├── utils/                       # 🛠️ Utilidades y datos compartidos
│   ├── testData.ts             # Datos de prueba (usuarios, productos, etc.)
│   └── index.ts                # Exportas centralizadas
│
├── playwright/                  # 🌐 Configuración de estado del navegador
│   └── .auth/                  # Sesiones autenticadas pre-guardadas
│       └── standard-user.json  # Storage state del usuario autenticado
│
├── test-results/               # 📊 Artifacts de ejecuciones fallidas
│   ├── index.html              # Reporte HTML interactivo
│   ├── results.json            # Resultados en formato JSON
│   ├── *.png                   # Screenshots de fallos
│   ├── *.webm                  # Videos de ejecución
│   └── *.zip                   # Traces con snapshots DOM
│
├── playwright-report/          # 📈 Último reporte (abierto con npm run report)
│
├── .github/                    # CI/CD configuration
│   └── workflows/              # GitHub Actions
│
├── playwright.config.ts        # ⚙️ Configuración principal de Playwright
├── global-setup.ts             # 🌍 Setup global (autenticación, setup DB, etc.)
├── tsconfig.json               # 📘 Configuración TypeScript
├── package.json                # 📦 Dependencias y scripts npm
├── .env.example                # 🔐 Template de variables de entorno
├── .gitignore                  # 🚫 Archivos ignorados por git
└── README.md                   # 📖 Guía de inicio rápido

---

## 🏗️ Componentes principales

### `/tests` - Especificaciones de tests
```typescript
// Estructura recomendada: Describe → Nested Describes → Tests
test.describe('Feature Category', () => {
  test.beforeEach(async ({ fixture }) => {
    // Setup común
  });

  test.describe('Escenario específico', () => {
    test('should do something', async ({ fixture }) => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Características:**
- Nombres descriptivos que expresan comportamiento esperado
- Fixtures inyectadas automáticamente
- Setup/teardown usando beforeEach/afterEach
- Test.only y test.skip solo en desarrollo (forbidOnly en CI)

### `/pages` - Page Object Model (POM)

**Principios:**
1. **Encapsulación**: Selectores privados, métodos públicos
2. **Abstracción**: Métodos de alto nivel (login, addToCart)
3. **Reutilización**: Métodos comunes en BasePage
4. **Mantenibilidad**: Un cambio de UI = un cambio de código

```typescript
// ✅ BUENO: Abstracción clara
async login(username: string, password: string): Promise<void> {
  await this.page.locator(this.selectors.usernameField).fill(username);
  await this.page.locator(this.selectors.passwordField).fill(password);
  await this.page.locator(this.selectors.loginButton).click();
}

// ❌ MALO: Expone selectores en tests
test('login', async ({ page }) => {
  await page.locator('[data-test="username"]').fill('user');
  // ...
});
```

**Herencia:**
- `BasePage` = métodos comunes (locator, waitForUrl, etc.)
- Clases específicas = métodos de cada página (login, fillForm, etc.)

### `/fixtures` - Custom test fixtures

Extiende el contexto de Playwright (`test`) con page objects:

```typescript
export const test = base.extend<{
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  // ...
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  // ...
});
```

**Ventajas:**
- Page objects disponibles automáticamente en tests
- Tipado fuerte (TypeScript autocomplete)
- Setup/teardown declarativo
- Reutilización sin boilerplate

### `/utils/testData.ts` - Datos centralizados

Separa datos de prueba de la lógica:

```typescript
export const validUsers = [
  { username: 'standard_user', password: 'secret_sauce', ... },
  { username: 'problem_user', password: 'secret_sauce', ... },
];

export const lockedOutUser = {
  username: 'locked_out_user',
  password: 'secret_sauce',
  expectedError: 'Epic sadface: Sorry, this user has been locked out.',
};

export const invalidCredentials = [
  { username: 'invalid_user', password: 'secret_sauce', expectedError: '...' },
  // ...
];
```

**Beneficios:**
- Datos centralizados = fácil de actualizar
- Datos + expected outcomes juntos
- Data-driven testing con forEach
- Reutilización entre tests

### `playwright.config.ts` - Configuración central

Configuración profesional con características:
- Navegadores múltiples (Chromium, Firefox, WebKit)
- Retries solo en CI (reduce false negatives)
- Artifacts solo en fallos (screenshots, videos, traces)
- Timeouts configurables vía env vars
- Storage state para tests autenticados
- Reporters HTML, JSON y consola

```typescript
export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    storageState: 'playwright/.auth/standard-user.json',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### `global-setup.ts` - Setup global

Ejecución antes de cualquier test:
- Autenticación pre-guardada (login una sola vez)
- Seed de datos en DB
- Setup de fixtures globales
- Validación de ambiente

```typescript
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Pre-authenticate for faster tests
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await context.storageState({ path: 'playwright/.auth/standard-user.json' });

  await browser.close();
}
```

### `/playwright` - Browser state

Carpeta generada por `global-setup.ts`:

```
playwright/
└── .auth/
    └── standard-user.json   # Storage state: cookies, localStorage, etc.
```

Reutilizado en tests via `storageState` en config = tests más rápidos (sin login repetido)

---

## 🔄 Flujo de ejecución

```
┌─────────────────────────────────┐
│  npm test (o npm run test:*)    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Playwright lee config.ts       │
│  - Proyectos (browsers)         │
│  - Workers (paralelismo)        │
│  - Retries, timeouts, etc.      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Ejecuta global-setup.ts        │
│  - Pre-autentica usuario        │
│  - Guarda session en .auth/     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Para cada proyecto (browser):  │
│  - Crea contexto con storage    │
│  - Ejecuta test.beforeEach()    │
│  - Corre test                   │
│  - Corre test.afterEach()       │
│  - Guarda artifacts (si fallo)  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Genera reportes:               │
│  - HTML interactivo             │
│  - JSON machine-readable        │
│  - Output consola               │
└─────────────────────────────────┘
```

---

## 📊 Patrones de implementación

### Pattern 1: Esperas explícitas
```typescript
// ✅ CORRECTO: Esperar a que aparezca
await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });

// ❌ INCORRECTO: Confiar en timeouts implícitos
await this.page.locator(selector).click(); // ¿Qué pasa si no está visible?
```

### Pattern 2: Selectores múltiples (fallbacks)
```typescript
// ✅ ROBUSTO: Intenta principales, luego fallbacks
const field = this.page.locator(
  `${this.selectors.primary}, ${this.selectors.fallback}`
);
await field.fill(value);

// ❌ FRÁGIL: Solo selector principal
await this.page.locator(this.selectors.primary).fill(value);
```

### Pattern 3: Try-catch para estados opcionales
```typescript
// ✅ ROBUSTO: Maneja ausencia de error
async getError(): Promise<string> {
  try {
    const errorLocator = this.page.locator(this.selectors.errorMessage);
    await errorLocator.waitFor({ state: 'visible', timeout: 2000 });
    return await errorLocator.innerText();
  } catch {
    return ''; // No hay error
  }
}

// ❌ FRÁGIL: Falla si no hay error
const error = await this.page.locator(selector).innerText();
```

---

## 🎯 Path Aliases (TypeScript)

Definidos en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["pages/*"],
      "@fixtures/*": ["fixtures/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

**Uso:**
```typescript
import { LoginPage } from '@pages/index';
import { test } from '@fixtures/index';
import { validUsers } from '@utils/testData';
```

**Ventajas:**
- ✅ Imports limpios
- ✅ Fácil refactoring (cambiar paths después)
- ✅ IDE autocomplete mejorado
- ✅ Legibilidad superior


## ⚙️ Configuración y personalización

### Timeouts
```typescript
// Global (en config)
timeout: 30000  // 30 segundos

// Por acción (fill, click, etc.)
actionTimeout: 30000

// Por navegación
navigationTimeout: 30000
```

### Modo de ejecución
```bash
# Headless (default, sin ventana visible)
npm test

# Headed (con ventana del navegador)
npm run test:headed

# Lento (500ms entre acciones)
SLOW_MO=500 npm test

# Debug interactivo
npm run test:debug
```

### Reintentos y limpieza
```typescript
// Reintentos automáticos en fallos
retries: process.env.CI ? 2 : 0

// Limpieza de artifacts
outputDir: 'test-results'
screenshot: 'only-on-failure'
video: 'retain-on-failure'
trace: 'on-first-retry'
```

---

## 🔍 Debugging y troubleshooting

### Escenario: Test falla intermitentemente

**Diagnóstico:**
1. Abrir último reporte: `npm run report`
2. Revisar video: ¿Dónde falla exactamente?
3. Examinar trace: Hacer click en screenshots

**Soluciones comunes:**
```typescript
// ❌ PROBLEMA: Espera implícita insuficiente
await page.click('[data-test="button"]');  // ¿Está visible?

// ✅ SOLUCIÓN: Espera explícita
await page.locator('[data-test="button"]').waitFor({ state: 'visible' });
await page.locator('[data-test="button"]').click();
```

### Escenario: Test pasa localmente pero falla en CI

**Causas comunes:**
- Timing: CI más lenta, necesita más timeouts
- Network: Requests tardos
- Paralelismo: Tests interfieren entre sí

**Soluciones:**
```bash
# En CI: aumentar timeouts
TIMEOUT=60000 npm test

# En CI: reducir workers
CI=true npm test  # Automáticamente usa 1 worker
```

### Escenario: Selector cambió y rompen tests

**Impacto:** Solo 1 archivo (la página object) necesita actualización
```typescript
// pages/LoginPage.ts
private readonly selectors = {
  usernameField: '[data-test="username"]',  // ← Actualizar aquí
  // ...
};
// ✅ Todos los tests que usan loginPage.login() siguen funcionando
```

---

## 🚀 Buenas prácticas

### ✅ Test bien escrito
```typescript
test('should navigate to inventory after successful login', async ({
  loginPage,
  inventoryPage,
  page,
}) => {
  // Arrange: Setup datos
  const credentials = { username: 'standard_user', password: 'secret_sauce' };

  // Act: Ejecutar acción
  await loginPage.goto();
  await loginPage.login(credentials.username, credentials.password);

  // Assert: Verificar resultados
  expect(page.url()).toContain('/inventory');
  expect(await inventoryPage.isVisible()).toBe(true);
});
```

### ❌ Test mal escrito
```typescript
test('login', async ({ page }) => {
  // Sin fixtures, sin POM, sin setup claro, assertions vagas
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForNavigation();
  // No hay asserts
});
```

### ✅ Agregar nuevas páginas
```typescript
// 1. Crear pages/NewPage.ts
export class NewPage extends BasePage {
  private readonly selectors = {
    element: '[data-test="element"]',
  };

  async doSomething(): Promise<void> {
    await this.page.locator(this.selectors.element).click();
  }
}

// 2. Exportar en pages/index.ts
export { NewPage } from './NewPage';

// 3. Agregar fixture en fixtures/index.ts
newPage: async ({ page }, use) => {
  await use(new NewPage(page));
}

// 4. Usar en tests
test('example', async ({ newPage }) => {
  await newPage.doSomething();
});
```

---

## 📈 Performance

### Paralelismo
```typescript
// Local: Múltiples workers (más rápido)
workers: undefined  // Auto: CPU count

// CI: 1 worker (estable)
workers: process.env.CI ? 1 : undefined
```

### Almacenamiento de sesión
```typescript
// Sin session state: Login en cada test (~3 segundos por test)
// Con session state: Reutilizar sesión (~0.5 segundos)
storageState: 'playwright/.auth/standard-user.json'
```

### Artifacts management
```typescript
screenshot: 'only-on-failure'  // No guardar todas las screenshots
video: 'retain-on-failure'     // Solo si falla
trace: 'on-first-retry'        // Solo en retry
```

---

## 🔐 Seguridad

### Variables sensibles
```bash
# ❌ NUNCA hardcodear
const password = 'secret_sauce';

# ✅ SIEMPRE desde env (aunque sea test)
const password = process.env.TEST_PASSWORD || 'default_password';
```

### Storage state
```typescript
// Storage state contiene:
// - Cookies
// - localStorage
// - sessionStorage

// No incluye passwords directamente, pero sí sesiones
// Guardar en .gitignore
*.json
```

---

## 📝 Extensibilidad

### Agregar reportes adicionales
```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['json', { outputFile: 'results.json' }],
  ['list'],
  ['junit', { outputFile: 'results.xml' }],  // Agregar XML
  ['github'],  // Para GitHub Actions
],
```

### Agregar middleware de logging
```typescript
// fixtures/index.ts
const test = base.extend({
  // Logging automático en cada test
  logger: async ({}, use) => {
    console.log(`[TEST] Starting...`);
    await use(null);
    console.log(`[TEST] Completed`);
  },
});
```

### Agregar API testing
```typescript
// fixtures/index.ts
export const test = base.extend({
  api: async ({}, use) => {
    const client = new ApiClient('https://api.example.com');
    await use(client);
  },
});

// tests/api.spec.ts
test('API should return 200', async ({ api }) => {
  const response = await api.get('/users');
  expect(response.status).toBe(200);
});
```

---

## 📊 Test organization patterns

### Por funcionalidad
```
tests/
├── auth.spec.ts       # Login, logout, cambio de contraseña
├── inventory.spec.ts  # Búsqueda, filtros, ordenamiento
├── cart.spec.ts       # Agregar/quitar items, actualizar cantidad
└── checkout.spec.ts   # Flujo de compra completo
```

### Por tipo de test
```
tests/
├── smoke/             # Tests críticos (rápidos)
│   └── auth.smoke.spec.ts
├── regression/        # Cobertura completa
│   └── inventory.spec.ts
└── e2e/               # Flujos completos
    └── purchase.spec.ts
```

### Combinando: Nested describes
```typescript
test.describe('Authentication', () => {
  test.describe('Valid credentials', () => {
    test('should login with standard_user', ...);
    test('should login with problem_user', ...);
  });

  test.describe('Invalid credentials', () => {
    test('should show error on wrong password', ...);
    test('should show error on empty username', ...);
  });

  test.describe('Account lockout', () => {
    test('should prevent locked_out_user login', ...);
  });
});
```

---

## 🎯 Próximos pasos para expandir

### API Testing
```typescript
// utils/apiClient.ts
export class ApiClient {
  constructor(private baseUrl: string) {}
  
  async get(endpoint: string) {
    return fetch(`${this.baseUrl}${endpoint}`);
  }
}
```

### Visual Regression Testing
```bash
npm install @playwright/test @playwrightvisualcomparison
```

### Mobile Testing
```typescript
// playwright.config.ts
projects: [
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
]
```

### Accessibility Testing
```typescript
// tests/a11y.spec.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('page should be accessible', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## 📚 Recursos y referencias

| Recurso | URL |
|---------|-----|
| Documentación oficial | https://playwright.dev |
| Best Practices | https://playwright.dev/docs/best-practices |
| API Reference | https://playwright.dev/docs/api/class-test |
| Debugging | https://playwright.dev/docs/debug |
| GitHub | https://github.com/microsoft/playwright |

---

## 🤝 Contribuciones

Cuando contribuyas:
1. ✅ Mantener estructura POM
2. ✅ Usar TypeScript strict
3. ✅ Agregar JSDoc comments
4. ✅ Seguir convenciones de nombrado
5. ✅ Tests deben ser independientes

---

**Última actualización:** Abril 2026

- name: Run tests
  run: CI=true npm test

- name: Upload results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: test-results/
```

### Key CI Settings (Auto-Applied when CI=true)
- `forbidOnly: true` - Fails if test.only() found in code
- `retries: 2` - Automatic retry of failed tests
- `workers: 1` - Single worker for consistency
- `reporter: ['html', 'json']` - Machine-readable output

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase TIMEOUT in .env (default: 30000ms) |
| Flaky tests locally | Use npm run test:ui to debug specific test |
| Browser not found | Run `npx playwright install` |
| Screenshots not saved | Ensure test actually fails; screenshots only captured on failure |
| Out of memory | Reduce workers: `npm test -- --workers=1` |
| Tests run too fast | Set SLOW_MO=500 in .env for debugging |

## Production Readiness Checklist

- ✅ Cross-browser support (Chromium, Firefox, Safari)
- ✅ Parallel execution for speed
- ✅ Intelligent retry strategy for stability
- ✅ Comprehensive failure diagnostics (screenshots, videos, traces)
- ✅ Environment-driven configuration (no hardcoding)
- ✅ CI/CD optimized (forbidOnly, workers, retries)
- ✅ Professional HTML and JSON reporting
- ✅ TypeScript with strict mode enabled
- ✅ Well-documented configuration
- ✅ Scalable directory structure ready for growth

## Configuration Files

### playwright.config.ts (Professional Optimization)

**Key Features:**
- ✅ **Base URL**: `https://www.saucedemo.com` (environment-driven via .env)
- ✅ **Smart Retries**: 2x in CI/CD, 0x locally
- ✅ **Failure Artifacts**: Screenshots & videos on failure only
- ✅ **Comprehensive Tracing**: Full test state on first retry
- ✅ **Headless Execution**: Default for efficiency
- ✅ **Multi-Browser**: Chrome, Firefox, Safari ready
- ✅ **Parallel Execution**: Auto-scaling based on system resources

**Configuration Strategy:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Retries** | CI: 2, Local: 0 | Prevents false negatives in pipelines; fails fast in development |
| **Workers** | CI: 1, Local: auto | Ensures consistent results in CI; parallel locally for speed |
| **Screenshot** | only-on-failure | Captures diagnostic evidence without storage overhead |
| **Video** | retain-on-failure | Essential visual evidence for debugging failed tests |
| **Trace** | on-first-retry | Full DOM, network, and console state for comprehensive debugging |
| **Headless** | true (default) | Optimized for CI/CD; override with HEADED=true for debugging |
| **Timeout** | 30 seconds | Balanced for most modern web applications |

**Environment Variables Support:**
```
BASE_URL          # Target application URL
HEADED            # Run with visible browser (true/false)
SLOW_MO           # Delay between actions (milliseconds)
TIMEOUT           # Global test timeout
RETRIES_CI        # Retries for CI environments
RETRIES_LOCAL     # Retries for local development
```

**Why This Configuration:**
1. **No Hardcoding** - All values in .env for flexibility across environments
2. **Smart Retries** - Balances stability (CI) with rapid feedback (local)
3. **Diagnostic Output** - Screenshots, videos, and traces help debug failures quickly
4. **Cross-Browser** - Built-in support for Chrome, Firefox, Safari
5. **CI/CD Optimized** - forbidOnly, workers, and retry strategies for automated pipelines

### tsconfig.json
- TypeScript strict compilation mode
- Path aliases for clean imports (@pages, @fixtures, @utils)
- ES2020 target for modern JavaScript features
- Source maps enabled for debugging

### .env.example
- Comprehensive template with all configurable parameters
- Inline documentation for each setting
- Pre-configured values for https://www.saucedemo.com
- Never commit .env file (add to .gitignore)
