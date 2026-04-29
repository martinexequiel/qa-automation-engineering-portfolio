# E2E Automation Framework - Sauce Demo

Un framework de automatización de pruebas E2E profesional construido con **Playwright**, **TypeScript** y patrones de diseño avanzados.

## 🎯 Quick Start (5 minutos)

### 1. Clonar y preparar el proyecto
```bash
git clone <repo>
cd e2e-playwright
npm install
```

### 2. Instalar navegadores de Playwright
```bash
npx playwright install --with-deps
```

### 3. Ejecutar los tests
```bash
npm test
```

### 4. Ver resultados
```bash
npm run report
```

---

## 📋 Requisitos previos

- **Node.js** 16+ (verificar: `node --version`)
- **npm** 8+ (verificar: `npm --version`)
- Navegadores instalados (se instalan con Playwright)

---

## 🚀 Comandos principales

| Comando | Descripción |
|---------|------------|
| `npm test` | Ejecuta todos los tests en modo headless (3 navegadores) |
| `npm run test:headed` | Ejecuta tests con navegador visible |
| `npm run test:debug` | Abre Playwright Inspector para debugging paso a paso |
| `npm run test:ui` | Interfaz visual interactiva para ejecutar tests |
| `npm run test:chromium` | Solo tests en Chromium |
| `npm run test:firefox` | Solo tests en Firefox |
| `npm run test:webkit` | Solo tests en WebKit/Safari |
| `npm run report` | Abre el reporte HTML de la última ejecución |

### Ejemplos de uso avanzado

```bash
# Ejecutar solo un archivo de test
npx playwright test tests/login.spec.ts

# Ejecutar tests que coincidan con un patrón
npx playwright test -g "login"

# Ejecutar con modo lento (500ms entre acciones)
SLOW_MO=500 npm test

# Ejecutar un solo test
npx playwright test tests/login.spec.ts -g "should login successfully"

# Ejecutar y detener al primer fallo
npm test -- --max-failures=1
```

---

## 📁 Estructura del proyecto

```
e2e-playwright/
├── tests/                    # Especificaciones de tests (*.spec.ts)
│   ├── login.spec.ts        # Tests de autenticación
│   ├── purchase.spec.ts     # Tests de compra/flujo completo
│   └── example.spec.ts      # Tests de ejemplo
│
├── pages/                    # Page Object Model (POM)
│   ├── BasePage.ts          # Clase base con utilidades comunes
│   ├── LoginPage.ts         # Lógica de página de login
│   ├── InventoryPage.ts     # Página de productos
│   ├── CartPage.ts          # Carrito de compras
│   ├── CheckoutPage.ts      # Checkout
│   ├── CheckoutCompletePage.ts
│   └── index.ts             # Exportas centralizadas
│
├── fixtures/                 # Custom test fixtures
│   └── index.ts             # Extensión del contexto de Playwright
│
├── utils/                    # Utilidades y datos
│   ├── testData.ts          # Datos de prueba (usuarios, productos, etc.)
│   └── index.ts             # Exportas centralizadas
│
├── playwright/              # Estado del navegador (sesiones autenticadas)
│   └── .auth/              # Storage state después del global-setup
│
├── playwright.config.ts     # Configuración principal de Playwright
├── global-setup.ts          # Setup global (ej: login automático)
├── tsconfig.json            # Configuración de TypeScript
├── package.json             # Dependencias y scripts
└── README.md               # Este archivo
```

---

## 🏗️ Arquitectura y patrones

### Page Object Model (POM)
Cada página/componente tiene una clase correspondiente que encapsula:
- **Selectores** (privados, no expuestos a tests)
- **Métodos de interacción** (click, fill, login, etc.)
- **Métodos de validación** (isVisible, getError, etc.)

```typescript
// ❌ SIN POM (acoplamiento directo)
await page.locator('[data-test="username"]').fill('user');
await page.locator('[data-test="password"]').fill('pass');
await page.locator('[data-test="login-button"]').click();

// ✅ CON POM (abstracto y mantenible)
await loginPage.login('user', 'pass');
```

### Custom Fixtures
Extienden el contexto de Playwright con page objects listos para usar:

```typescript
test('login flow', async ({ loginPage, inventoryPage }) => {
  // loginPage y inventoryPage están inyectados automáticamente
  await loginPage.login('standard_user', 'secret_sauce');
  expect(await inventoryPage.isVisible()).toBe(true);
});
```

### Test Data Centralized
Datos de prueba separados de la lógica de tests:

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
    // assert...
  });
});
```

---

## 🔍 Viendo resultados

### HTML Report (Recomendado)
```bash
npm run report
```
Abre un reporte visual interactivo con:
- ✅ Test results con paso a paso
- 📸 Screenshots automáticas
- 🎬 Videos de ejecución
- 📊 Traces para debugging profundo

### Artifacts después de un fallo
Todos los artifacts se guardan en `test-results/`:
- `index.html` - Reporte principal
- `*.png` - Screenshots del fallo
- `*.webm` - Videos de ejecución
- `*.zip` - Traces con snapshots DOM

---

## 🐛 Debugging

### Opción 1: UI Mode (Recomendada)
```bash
npm run test:ui
```
Abre una interfaz gráfica donde puedes:
- Ejecutar tests individuales
- Pausar/reanudar ejecución
- Ver estados en vivo

### Opción 2: Debug Mode
```bash
npm run test:debug
```
Abre Playwright Inspector para:
- Pasos uno a uno
- Inspeccionar DOM
- Ejecutar comandos en consola

### Opción 3: Headed Mode
```bash
npm run test:headed
```
Ver el navegador ejecutando los tests en tiempo real.

### Opción 4: Logs y traces
```bash
PWDEBUG=1 npm test
```
Habilita logging detallado y abre Inspector automáticamente.

---

## 🔧 Configuración

### Variables de entorno
Opcionales (tienen valores por defecto):

```bash
# Tiempo de ejecución
TIMEOUT=30000

# Navegador visible (no headless)
HEADED=false

# Ralentizar acciones (útil para demos/debugging)
SLOW_MO=0

# URL base de la aplicación
BASE_URL=https://www.saucedemo.com

# Reintentos en CI
RETRIES_CI=2
RETRIES_LOCAL=0
```

---

## 📝 Escribiendo tests

### Estructura básica
```typescript
import { expect, test } from '@fixtures/index';
import { validUsers } from '@utils/testData';

test.describe('Login Suite', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully', async ({ loginPage, page }) => {
    // Arrange
    const user = validUsers[0];
    
    // Act
    await loginPage.login(user.username, user.password);
    
    // Assert
    expect(page.url()).toContain('/inventory');
  });
});
```

### Usando fixtures
```typescript
test('purchase flow', async ({ 
  loginPage,
  inventoryPage,
  cartPage,
  checkoutPage 
}) => {
  // Todos los page objects están inyectados automáticamente
  await loginPage.login('standard_user', 'secret_sauce');
  await inventoryPage.addProductToCart('Backpack');
  await cartPage.checkout();
  await checkoutPage.fillForm('John', 'Doe', '12345');
});
```

---

## ✅ Best Practices

| ✅ DO | ❌ DON'T |
|------|---------|
| Usar Page Objects para encapsular selectores | Hardcodear selectores en tests |
| Mantener datos de prueba centralizados | Datos esparcidos en múltiples files |
| Usar fixtures para inyección de dependencias | Instanciar page objects manualmente |
| Esperar explícitamente con `.waitFor()` | Confiar en `page.goto()` automático |
| Usar path aliases (`@pages`, `@utils`) | Imports relativos confusos |
| Tests descriptivos y enfocados | Tests genéricos que hacen demasiado |
| Aprovechar TypeScript strict mode | Usar `any` o tipado débil |
| Datos externalizados (`.env`) | Valores hardcodeados |

---

## 🌐 Soporta múltiples navegadores

Tests se ejecutan en **Chromium, Firefox y WebKit** por defecto:

```bash
# Todos los navegadores (default)
npm test

# Solo Chromium
npm run test:chromium

# Solo Firefox
npm run test:firefox

# Solo WebKit
npm run test:webkit
```

---

## 📊 CI/CD Integration

Este framework está listo para CI/CD:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm install

- name: Install browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

El proyecto detecta `CI=true` automáticamente y:
- ✅ Corre con 1 worker (estable)
- ✅ Activa 2 reintentos (reduce flakiness)
- ✅ Forbid `test.only()` (previene commits accidentales)

---

## 📚 Recursos útiles

- [**Mapa de navegación**](./GET_STARTED.md) ← Empieza aquí si eres nuevo
- [Estructura arquitectónica](./STRUCTURE.md) - Componentes y patrones
- [Decisiones de diseño](./ARCHITECTURE.md) - Por qué cada decisión
- [Guía de contribución](./CONTRIBUTING.md) - Estándares y workflow
- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

## 📞 Soporte

Para preguntas o issues:
1. Revisar [STRUCTURE.md](./STRUCTURE.md) para detalles arquitectónicos
2. Explorar ejemplos en `tests/`
3. Consultar comentarios en `pages/`

---

**Última actualización:** Abril 2026
