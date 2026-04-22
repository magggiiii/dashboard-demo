# Technology Stack

**Project:** CopilotKit AI Dashboard Audit
**Researched:** May 2025

## Recommended Stack

### Core Framework (Audit Tools)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Knip | v5.x | Dead code & dependency analysis | Before refactoring `page.tsx`, we must identify which CopilotKit hooks and components are genuinely used vs. obsolete. Knip excels at finding unused exports in modern TS codebases. | HIGH |
| Dependency-Cruiser | v16.x | Dependency graphing & rule enforcement | Uncovers tight coupling in the monorepo. It validates whether Next.js components are illegally importing from backend boundaries or if circular dependencies exist. | HIGH |

### Database & Backend Audit
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @nestjs/devtools-integration | ^11.0.0 | DI Graph Inspection | Visualizes the internal Dependency Injection graph of the NestJS backend to identify misconfigured scopes or bottlenecks. | HIGH |
| eslint-plugin-nestjs | v0.x | NestJS anti-pattern detection | Catches framework-specific anti-patterns in NestJS 11, such as missing `@Injectable()` decorators or improper scope handling. | MEDIUM |

### Infrastructure & Performance
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @next/bundle-analyzer | v15.x | Client bundle visualization | Determines how much CopilotKit runtime and UI components are bloating the client bundle, informing the shift to React Server Components (RSC). | HIGH |
| Langfuse | Latest | LLM Trace & Observability | Already in stack, but repurposed for the audit to trace exactly how the monolithic `page.tsx` is prompting the LLM and parsing responses. | HIGH |

### Supporting Libraries
| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| Madge | v8.x | Circular dependency visualization | Use when a quick visual insight into NestJS module tangles or Next.js UI coupling is needed. | HIGH |
| eslint-plugin-boundaries | v4.x | Architectural boundary linting | Use to enforce strict boundaries during the refactor (e.g., ensuring UI components don't directly manipulate the CopilotKit regex parser). | HIGH |

## Alternatives Considered (What NOT to use and why)

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Architecture Mapping | Dependency-Cruiser | Arkit | Arkit is largely unmaintained and struggles with modern Next.js App Router structures and monorepos compared to Dependency-Cruiser. |
| Code Structure Audit | Knip | ts-prune | `ts-prune` is deprecated and doesn't handle modern framework intricacies (like Next.js server actions/layouts) effectively. Knip is the modern standard. |
| System Diagramming | AST-based mapping (Madge) | Automatic AI UML Generators | AI generators often hallucinate architecture based on file names rather than actual dependency graphs. Rely on factual AST parsing. |

## Installation

```bash
# Core Audit Tools
npm install -D knip dependency-cruiser

# Supporting Libraries
npm install -D madge eslint-plugin-boundaries

# Next.js specific audit tools
npm install -D @next/bundle-analyzer

# NestJS specific audit tools
npm install -D @nestjs/devtools-integration eslint-plugin-nestjs
```

## Sources

- Knip official docs: https://knip.dev/ (HIGH)
- Dependency-Cruiser GitHub: https://github.com/sverweij/dependency-cruiser (HIGH)
- Next.js Bundle Analyzer docs: https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer (HIGH)
- NestJS Devtools docs: https://docs.nestjs.com/devtools/overview (HIGH)