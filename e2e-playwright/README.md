# E2E Test Automation Framework

A compact, production-ready Playwright + TypeScript automation suite for Sauce Demo.

## Overview

This framework validates core e-commerce flows with a strong focus on maintainability, cross-browser reliability, and clear test structure.

## Scope

**Covered:**
- Login and authentication scenarios
- Cart management and checkout workflows
- Positive and negative validations
- Cross-browser execution on Chromium, Firefox, and WebKit

**Excluded:**
- API-layer tests
- performance/load testing
- mobile-specific responsive validation

## Tech Stack

- Playwright 1.59.1
- TypeScript 5.3.0
- Node.js 16+
- Page Object Model
- Custom fixtures
- Data-driven test design

## Project Structure

```
e2e-playwright/
├── tests/                    # Test specs
│   ├── login.spec.ts
│   ├── purchase.spec.ts
│   └── cart.spec.ts
├── pages/                    # UI abstractions
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── CheckoutCompletePage.ts
├── flows/                    # Reusable business flows and user journeys
│   ├── loginFlow.ts
│   └── purchaseFlow.ts
├── fixtures/                 # Custom test fixtures
│   └── index.ts
├── utils/                    # Shared data and utilities
│   ├── testData.ts
│   └── index.ts
├── playwright.config.ts
├── global-setup.ts
├── tsconfig.json
└── package.json
```

## Design Principles

- **Page Object Model:** UI logic lives in page classes.
- **Three-tier design:** locators, actions, assertions are separated.
- **Flows layer:** reusable business journeys reduce duplication.
- **Custom fixtures:** provide ready-to-use page objects in tests.
- **Data-driven tests:** centralized input values and expected outcomes.

## Test Strategy

- Focus on stable, independent tests.
- Parallel execution across browsers.
- Use explicit waits and robust selectors.
- Capture artifacts only on failures.

## Quick Start

```bash
npm install
npx playwright install --with-deps
npm test
```

## Contributing

- Use explicit TypeScript types.
- Keep selectors encapsulated in page objects.
- Prefer data-test selectors and role-based locators.
- Avoid `test.only()` in committed code.
- Run `npm test` before pushing.

## CI/CD

This suite is ready for CI with a standard pipeline that installs dependencies, installs Playwright browsers, runs tests, and archives the report.

## Troubleshooting

- If tests fail due to timeouts, verify element wait conditions.
- If selectors break, update the page object instead of tests.
- Use `npm run test:debug` or `npm run test:ui` for interactive debugging.

## License

Portfolio project for QA automation demonstration purposes.
