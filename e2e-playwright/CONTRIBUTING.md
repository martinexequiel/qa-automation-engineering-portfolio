# 🤝 Guía de Contribución

Este documento explica cómo contribuir al framework de automatización E2E.

---

## 📋 Antes de comenzar

- Lee [README.md](./README.md) para entender el proyecto
- Lee [STRUCTURE.md](./STRUCTURE.md) para conocer la arquitectura
- Verifica que tienes Node.js 16+ y npm 8+
- Instala dependencias: `npm install`
- Instala navegadores: `npx playwright install --with-deps`

---

## 🔄 Workflow de contribución

### 1. Crear rama
```bash
git checkout -b feature/tu-feature-descriptiva
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer cambios siguiendo estándares
```bash
# Escribir tests
# Crear page objects
# Actualizar utilidades
# Ver siguiente sección: Estándares de código
```

### 3. Verificar que todo funciona
```bash
# Correr todos los tests
npm test

# Ver reporte
npm run report

# En modo debug si algo falla
npm run test:debug
```

### 4. Commit con mensajes claros
```bash
git add .
git commit -m "feat: agregar login test para usuario locked out"
# o
git commit -m "fix: corregir selector en LoginPage"
# o
git commit -m "docs: mejorar documentación de fixtures"
```

### 5. Push y pull request
```bash
git push origin feature/tu-feature-descriptiva
```

---

## 📝 Estándares de código

### Tests

#### ✅ Buen test
```typescript
import { expect, test } from '@fixtures/index';
import { validUsers, successIndicators } from '@utils/testData';

test.describe('Authentication Flow @smoke', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({
    page,
    loginPage,
  }) => {
    // Arrange: Preparar datos
    const user = validUsers[0];

    // Act: Ejecutar la acción
    await loginPage.login(user.username, user.password);

    // Assert: Verificar resultado
    expect(page.url()).toMatch(successIndicators.urlPattern);
    expect(page).toHaveTitle(successIndicators.title);
  });
});
```

#### ❌ Mal test
```typescript
// Falta descripción clara
test('login test', async ({ page }) => {
  // Sin Arrange-Act-Assert
  // Selectors hardcodeados
  await page.locator('[data-test="username"]').fill('user');
  // Sin fixtures
  // Assertions vagas
  expect(page.url()).toBeTruthy();
});
```

### Page Objects

#### ✅ Buen page object
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Encapsula toda la lógica de login
 */
export class LoginPage extends BasePage {
  /**
   * Selectores privados - NO expuestos a tests
   */
  private readonly selectors = {
    usernameField: '[data-test="username"]',
    passwordField: '[data-test="password"]',
    loginButton: '[data-test="login-button"]',
    errorMessage: '[data-test="error"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   * @returns Promise<void>
   */
  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com');
    await this.page
      .locator(this.selectors.usernameField)
      .waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Perform login with username and password
   * 
   * @param username - User account username
   * @param password - User account password
   * @returns Promise<void>
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.locator(this.selectors.usernameField).fill(username);
    await this.page.locator(this.selectors.passwordField).fill(password);
    await this.page.locator(this.selectors.loginButton).click();

    // Esperar a que se complete la acción
    await Promise.race([
      this.page.waitForURL('**/inventory.html', { timeout: 5000 }),
      this.page
        .locator(this.selectors.errorMessage)
        .waitFor({ state: 'visible', timeout: 5000 }),
    ]).catch(() => {
      // Continuar aunque no haya completado
    });
  }

  /**
   * Get error message text
   * @returns Promise<string>
   */
  async getError(): Promise<string> {
    try {
      const errorLocator = this.page.locator(this.selectors.errorMessage);
      await errorLocator.waitFor({ state: 'visible', timeout: 2000 });
      return await errorLocator.innerText();
    } catch {
      return '';
    }
  }
}
```

#### ❌ Mal page object
```typescript
// Falta JSDoc
// Selectores no encapsulados
export class LoginPage {
  constructor(public page: Page) {}

  async login(username: string, password: string) {
    // Selectores hardcodeados cada vez
    await this.page.locator('[data-test="username"]').fill(username);
    // Sin esperas explícitas
    await this.page.locator('[data-test="password"]').fill(password);
    // Sin manejo de errores
    await this.page.locator('[data-test="login-button"]').click();
  }
}
```

### TypeScript

- ✅ Usar tipos explícitos: `async function(): Promise<string>`
- ✅ Evitar `any` - usar tipos específicos
- ✅ Usar `readonly` para constantes
- ❌ NO usar tipos implícitos vagos

```typescript
// ✅ BUENO
async login(username: string, password: string): Promise<void> {
  const field: Locator = this.page.locator(selector);
  await field.fill(username);
}

// ❌ MALO
async login(username, password) {
  const field = this.page.locator(selector);
  await field.fill(username);
}
```

### Selectores

- ✅ Preferir `[data-test="..."]` (controlado por QA)
- ✅ Usar fallbacks si necesario
- ❌ NO usar selectores frágiles (index, texto)

```typescript
// ✅ ROBUSTO
const selectors = {
  button: '[data-test="submit-button"]',
};

// ✅ CON FALLBACK
this.page.locator(`${primary}, ${fallback}`)

// ❌ FRÁGIL
this.page.locator('button >> text=Submit')
this.page.locator('xpath=//button[2]')
```

### Esperas

- ✅ Esperas explícitas: `.waitFor({ state: '...' })`
- ✅ Timeouts razonables (2-5 segundos)
- ❌ NO confiar en setTimeout

```typescript
// ✅ CORRECTO
await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
await this.page.locator(selector).click();

// ❌ INCORRECTO
await new Promise(r => setTimeout(r, 1000));  // 🚫
await this.page.locator(selector).click();
```

---

## 📊 Estructura de tests

### Nombres descriptivos
```typescript
// ✅ CLARO: Expresa qué comportamiento se valida
test('should display error when user provides wrong password')
test('should redirect to inventory after successful login')
test('should disable login button while request is pending')

// ❌ VAGO: No dice qué se está probando
test('login test')
test('error handling')
test('user flow')
```

### Organize con describe blocks
```typescript
test.describe('Login Page', () => {
  test.describe('Valid Credentials', () => {
    test('should login successfully', ...);
  });

  test.describe('Invalid Credentials', () => {
    test('should display error for wrong password', ...);
  });

  test.describe('Account Lockout', () => {
    test('should prevent locked user from logging in', ...);
  });
});
```

### Data-driven tests
```typescript
// ✅ MANTENIBLE: Datos centralizados
validCredentials.forEach((user) => {
  test(`should login with ${user.description}`, async ({ loginPage }) => {
    await loginPage.login(user.username, user.password);
    // assert...
  });
});
```

---

## 🔍 Checklist pre-commit

Antes de hacer push:

- [ ] Código corre sin errores: `npm test`
- [ ] Tests pasan: Todos los tests verdes
- [ ] No hay type errors: Verifica que TypeScript está happy
- [ ] Nombres descriptivos: Tests y funciones son claros
- [ ] JSDoc agregado: Métodos públicos tienen comentarios
- [ ] Selectores encapsulados: No expuestos en tests
- [ ] Esperas explícitas: No hay race conditions
- [ ] Error handling: Try-catch donde corresponde
- [ ] Fixtures usados: No instancias manuales
- [ ] Path aliases: Imports limpios (@pages, @utils)

---

## 🐛 Reportando bugs

Si encuentras un bug:

1. **Reproducirlo**
   ```bash
   npm test -- -g "nombre del test que falla"
   ```

2. **Recopilar información**
   - ¿Falla siempre o intermitentemente?
   - En qué navegador falla?
   - Logs/screenshots/videos

3. **Crear issue con**
   - Título descriptivo
   - Pasos para reproducir
   - Resultado esperado vs actual
   - Screenshots/videos si aplica

---

## 💡 Sugerencias de mejora

Antes de hacer cambios grandes:

1. Abre una issue describiendo la mejora
2. Discute la aproximación
3. Implementa una vez que hay consenso
4. Incluye tests para nuevas funcionalidades

---

## 📚 Recursos útiles

- [README.md](./README.md) - Quick start
- [STRUCTURE.md](./STRUCTURE.md) - Arquitectura profunda
- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

## 🎓 Ejemplos de contribución

### Agregar un nuevo test
```bash
1. Abrir tests/newFeature.spec.ts
2. Usar fixtures: loginPage, inventoryPage, etc.
3. Esperas explícitas
4. Arrange-Act-Assert
5. npm test para verificar
```

### Agregar una nueva página
```bash
1. Crear pages/NewPage.ts (extends BasePage)
2. Selectores privados
3. Métodos públicos con JSDoc
4. Exportar en pages/index.ts
5. Agregar fixture en fixtures/index.ts
6. Usar en tests
```

### Refactorizar código duplicado
```bash
1. Identificar duplicación
2. Extraer a método en BasePage o nuevo utility
3. Reemplazar usos
4. Verificar tests siguen pasando
5. Commit con mensaje: "refactor: extract method"
```

---

## ❓ Preguntas frecuentes

**P: ¿Dónde agrego datos de prueba?**
R: En `utils/testData.ts` si es compartido, o en `tests/file.spec.ts` si es local.

**P: ¿Cómo debuggeo un test que falla?**
R: `npm run test:debug` o `npm run test:ui` para interfaz gráfica.

**P: ¿Puedo usar test.only()?**
R: Sí en local. En CI está prohibido (forbidOnly: true).

**P: ¿Cuál es el timeout recomendado?**
R: 30 segundos global, 5 segundos para waitFor, 2 segundos para acciones rápidas.

---

**Gracias por contribuir al proyecto!** 🙌

Última actualización: Abril 2026
