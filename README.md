````md
````
# QA Automation Engineering Portfolio

## Overview
This repository showcases a professional QA Automation portfolio focused on building scalable, maintainable, and reliable testing solutions.

It demonstrates a multi-layer testing strategy covering:
- End-to-End (E2E) testing
- API testing (in progress)
- Performance testing (planned)
- Mobile automation (planned)

The goal is to simulate real-world QA challenges and demonstrate how automation improves product quality and release confidence.

---

## What is implemented

### 🔹 E2E Automation with Playwright (TypeScript)

Current implementation focuses on real user flows using SauceDemo:

- End-to-end test automation using Playwright
- Page Object Model (POM) for maintainability
- Reusable and scalable test architecture
- Critical user journeys covered:
  - Login
  - Product selection
  - Checkout flow
- Parallel execution support
- Test isolation and stability practices

---

## Why this matters

This project is designed to reflect real-world QA responsibilities:

- Prevent regressions in critical business flows
- Ensure reliability of user journeys
- Provide fast and trustworthy feedback for releases
- Build maintainable automation suites that scale with the product

Rather than focusing on full coverage, the approach prioritizes:
- Risk-based testing
- Critical path validation
- Long-term maintainability

---

## Project structure

```bash
qa-automation-engineering-portfolio/
│
├── e2e-playwright/        # E2E tests with Playwright
├── api-testing/           # API testing (Postman, Newman, Rest Assured)
├── performance/           # Performance testing (k6)
├── mobile/                # Mobile automation (Appium)
├── ai-testing/            # AI/LLM testing (LangSmith, Python)
├── ci-cd/                 # CI/CD pipelines (GitHub Actions)
├── shared/                # Shared data and configs
└── docs/                  # Documentation and assets
````

---

## How to run (Playwright)

Navigate to the E2E project:

```bash
cd e2e-playwright
npm install
npx playwright test
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Open HTML report:

```bash
npx playwright show-report
```

---

## Test Execution Evidence

* Playwright HTML report
* Execution logs
* Screenshots of test runs

---

## Design decisions

* **Page Object Model (POM)** used to improve maintainability and readability
* Focus on **critical user flows** instead of exhaustive coverage
* Use of **stable selectors** to reduce flaky tests
* Modular structure to support future expansion (API, performance, mobile)
* Separation of concerns between test logic and page interactions

---

## Next steps

The portfolio is designed to evolve progressively:

* API Testing (Postman + Newman)
* CI/CD integration (GitHub Actions)
* Performance testing with k6
* Mobile automation with Appium
* Contract testing and advanced validations
* AI/LLM testing with Python and LangSmith

---

## About me

QA Automation Engineer focused on building reliable and scalable testing solutions.

* Playwright (TypeScript)
* API Testing (Postman, REST)
* CI/CD basics
* Continuous improvement in test architecture and quality practices

Currently improving English skills and working towards international opportunities.

---

## Repository

E2E implementation:
[https://github.com/martinexequiel/qa-automation-engineering-portfolio/tree/main/e2e-playwright](https://github.com/martinexequiel/qa-automation-engineering-portfolio/tree/main/e2e-playwright)


