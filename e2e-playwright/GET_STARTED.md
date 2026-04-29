# 🗺️ Mapa de Navegación - Por dónde empezar

Bienvenido al framework de automatización E2E. Este documento te guía a la documentación correcta según tu necesidad.

---

## 🚀 ¿Soy nuevo en el proyecto?

**Start aquí:** [README.md](./README.md)
- 5 minutos para ejecutar tu primer test
- Comandos principales
- Cómo ver resultados

---

## 👨‍💻 Voy a escribir tests o contribuir código

**Secuencia recomendada:**

1. [README.md](./README.md) - Quick start
2. [STRUCTURE.md](./STRUCTURE.md) - Entender arquitectura
3. [CONTRIBUTING.md](./CONTRIBUTING.md) - Estándares de código
4. [ARCHITECTURE.md](./ARCHITECTURE.md) - Por qué cada decisión

**Checklist antes de commitear:**
```bash
npm test                    # ¿Pasan todos los tests?
npm run test:debug         # ¿Tests fallan? Debuggear aquí
npm run report             # ¿Hay artifacts útiles?
# Luego: git add, git commit, git push
```

---

## 🏗️ Quiero entender la arquitectura

**Documentos en orden:**

1. [STRUCTURE.md](./STRUCTURE.md) - Visión general
   - Directorio por directorio
   - Componentes principales
   - Patrones implementados

2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones de diseño
   - Por qué Page Object Model
   - Por qué Fixtures
   - Por qué cada decisión

3. [CONTRIBUTING.md](./CONTRIBUTING.md) - Mejores prácticas
   - Código bien/mal escrito
   - Ejemplos de contribución

---

## 🐛 Tengo un test que falla

### Opción 1: Ver el reporte HTML
```bash
npm run report
```
Abre interfaz visual interactiva con:
- Video de ejecución
- Screenshots
- Timeline completo

### Opción 2: Debugging paso a paso
```bash
npm run test:debug
# Abre Playwright Inspector
```

### Opción 3: Ver en navegador
```bash
npm run test:headed
# Ejecuta tests con navegador visible
```

**Si no puedes resolver:**
1. Revisar [STRUCTURE.md](./STRUCTURE.md#debugging) - Sección debugging
2. Consultar [CONTRIBUTING.md](./CONTRIBUTING.md#-preguntas-frecuentes) - FAQ

---

## 📝 Voy a agregar un nuevo test

**Guía rápida:**

1. Abrir `tests/newFeature.spec.ts`
2. Usar estructura Arrange-Act-Assert
3. Usar fixtures: `{ loginPage, inventoryPage, ... }`
4. Esperas explícitas: `.waitFor({ state: 'visible' })`
5. Nombres descriptivos: `should login successfully`
6. Ejecutar: `npm test -- -g "nuevo test"`
7. Ver reporte: `npm run report`

**Referencia:** [CONTRIBUTING.md - Escribir tests](./CONTRIBUTING.md#-escribir-tests)

---

## 🏠 Voy a crear una nueva página (Page Object)

**Pasos:**

1. Crear `pages/NewPage.ts`
   - Extends `BasePage`
   - Selectores privados
   - Métodos públicos con JSDoc

2. Exportar en `pages/index.ts`
   ```typescript
   export { NewPage } from './NewPage';
   ```

3. Agregar fixture en `fixtures/index.ts`
   ```typescript
   newPage: async ({ page }, use) => {
     await use(new NewPage(page));
   }
   ```

4. Usar en tests
   ```typescript
   test('example', async ({ newPage }) => {
     await newPage.doSomething();
   });
   ```

**Referencia:** [CONTRIBUTING.md - Agregar nueva página](./CONTRIBUTING.md#agregar-una-nueva-página)

---

## 📊 Quiero ejecutar tests específicos

```bash
# Un archivo
npx playwright test tests/login.spec.ts

# Patrón de nombre
npx playwright test -g "login"

# Un test específico
npx playwright test -g "should login successfully"

# Un navegador
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Con modo lento (para demos)
SLOW_MO=500 npm test

# Máximo 1 fallo y detener
npm test -- --max-failures=1
```

---

## 🔧 Quiero cambiar configuración

### Variables de entorno
Editar `.env` (copiar de `.env.example`):

```bash
BASE_URL=https://www.saucedemo.com  # URL de la app
TIMEOUT=30000                       # Timeouts en ms
HEADED=false                        # Ver navegador
SLOW_MO=0                           # Ralentizar acciones
```

### Configuración de Playwright
Editar `playwright.config.ts`:

```typescript
// Retries
retries: process.env.CI ? 2 : 0

// Workers
workers: process.env.CI ? 1 : undefined

// Browsers
projects: [
  { name: 'chromium', ... },
  { name: 'firefox', ... },
  { name: 'webkit', ... },
]
```

---

## 🎓 Recurso según tu rol

### QA - Escribir tests
1. [README.md](./README.md) - Setup
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - Tests bien escritos
3. [STRUCTURE.md](./STRUCTURE.md#patrones-de-implementación) - Patrones

### Developer - Agregar features
1. [STRUCTURE.md](./STRUCTURE.md) - Arquitectura
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones
3. [CONTRIBUTING.md](./CONTRIBUTING.md) - Estándares

### Tech Lead - Mantener framework
1. [STRUCTURE.md](./STRUCTURE.md) - Overview
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones
3. [CONTRIBUTING.md](./CONTRIBUTING.md) - Escalabilidad

### Nuevo en QA/Automation
1. [README.md](./README.md) - Fundamentals
2. [STRUCTURE.md](./STRUCTURE.md) - Componentes
3. [CONTRIBUTING.md](./CONTRIBUTING.md) - Best practices

---

## 📚 Índice rápido

| Documento | Para qué | Tiempo |
|-----------|----------|--------|
| [README.md](./README.md) | Quick start, comandos, troubleshooting | 5 min |
| [STRUCTURE.md](./STRUCTURE.md) | Arquitectura, componentes, patrones | 20 min |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Por qué cada decisión | 15 min |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Estándares, ejemplos, workflow | 20 min |
| [GET_STARTED.md](./GET_STARTED.md) | Este documento (mapa de navegación) | 3 min |

---

## ❓ ¿No encuentras lo que buscas?

### Búsqueda por tema

**Esperas y timing**
- [STRUCTURE.md - Esperas](./STRUCTURE.md#troubleshooting)
- [CONTRIBUTING.md - Selectores](./CONTRIBUTING.md#selectores)

**Page Objects**
- [STRUCTURE.md - POM](./STRUCTURE.md#page-object-model-pom)
- [ARCHITECTURE.md - Por qué POM](./ARCHITECTURE.md#1️⃣-page-object-model-pom)
- [CONTRIBUTING.md - Escribir POM](./CONTRIBUTING.md#page-objects)

**Tests**
- [STRUCTURE.md - Tests](./STRUCTURE.md#tests---especificaciones-de-tests)
- [CONTRIBUTING.md - Tests bien escritos](./CONTRIBUTING.md#tests)

**Fixtures**
- [STRUCTURE.md - Fixtures](./STRUCTURE.md#fixtures---custom-test-fixtures)
- [ARCHITECTURE.md - Por qué Fixtures](./ARCHITECTURE.md#2️⃣-custom-fixtures)

**Datos de prueba**
- [STRUCTURE.md - TestData](./STRUCTURE.md#utilidades-y-datos)
- [ARCHITECTURE.md - Por qué centralizar datos](./ARCHITECTURE.md#3️⃣-centralización-de-datos-testdatats)

**Debugging**
- [README.md - Debugging](./README.md#-debugging)
- [STRUCTURE.md - Debugging](./STRUCTURE.md#🔍-debugging-y-troubleshooting)

**Performance**
- [STRUCTURE.md - Performance](./STRUCTURE.md#-performance)
- [ARCHITECTURE.md - Storage State](./ARCHITECTURE.md#6️⃣-storage-state-para-sesiones-autenticadas)

---

## 🚦 Flujo de trabajo típico

```
┌─────────────────────────────────────────┐
│ Soy nuevo                               │
│ → README.md (5 min)                     │
│ → npm install && npm test               │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Quiero escribir un test                 │
│ → STRUCTURE.md (20 min)                 │
│ → CONTRIBUTING.md (tests section)       │
│ → Crear test en tests/                  │
│ → npm test                              │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Quiero entender arquitectura            │
│ → STRUCTURE.md (architecture)           │
│ → ARCHITECTURE.md (decisiones)          │
│ → CONTRIBUTING.md (patterns)            │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ Quiero contribuir/mantener              │
│ → ARCHITECTURE.md (completo)            │
│ → CONTRIBUTING.md (workflow)            │
│ → Explorar codebase                     │
└─────────────────────────────────────────┘
```

---

## 🎯 Comandos frecuentes

```bash
# Setup
npm install
npx playwright install --with-deps

# Ejecutar tests
npm test                    # Todos
npm run test:ui            # Interactivo
npm run test:debug         # Con inspector
npm run test:headed        # Navegador visible

# Ver resultados
npm run report             # HTML report

# Debugging
npm run test:debug         # Inspector
SLOW_MO=500 npm test       # Ralentizar

# Específicos
npx playwright test -g "login"              # Patrón
npm run test:chromium                       # Solo Chrome
```

---

## ✨ Tips importantes

- 💡 Siempre leer el reporte HTML después de un fallo
- 💡 Usar `npm run test:ui` para debugging interactivo
- 💡 Nombres de tests descriptivos = self-documenting
- 💡 Page Objects privados = selectores encapsulados
- 💡 Esperas explícitas = tests confiables
- 💡 Data centralizadas = mantenimiento fácil

---

**Última actualización:** Abril 2026

¿Preguntas? Revisa [CONTRIBUTING.md - FAQ](./CONTRIBUTING.md#-preguntas-frecuentes)
