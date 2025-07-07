# My Monorepo

This is a monorepo using PNPM Workspaces containing three main applications:

## Structure

```
.
├── web/        # Web application
├── mobile/     # Mobile application
├── backend/    # Backend application
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have PNPM installed:

```bash
npm install -g pnpm
```

### Installation

Install all dependencies for all workspaces:

```bash
pnpm install
```

### Development

Start all applications in parallel:

```bash
pnpm dev
```

Or start individual applications:

```bash
pnpm dev:web     # Start web application
pnpm dev:mobile  # Start mobile application
pnpm dev:backend # Start backend application
```

### Building

Build all applications:

```bash
pnpm build
```

Or build individual applications:

```bash
pnpm build:web     # Build web application
pnpm build:mobile  # Build mobile application
pnpm build:backend # Build backend application
```

### Testing

Run tests for all workspaces:

```bash
pnpm test
```

### Workspace Management

- Install a dependency to a specific workspace:
  ```bash
  pnpm --filter @my-monorepo/web add react
  ```

- Install a dev dependency to all workspaces:
  ```bash
  pnpm -r add -D typescript
  ```

- Run a command in all workspaces:
  ```bash
  pnpm -r exec npm audit
  ```

### Clean

Remove all node_modules:

```bash
pnpm clean
```

## Workspaces

- **@my-monorepo/web**: Web application workspace
- **@my-monorepo/mobile**: Mobile application workspace  
- **@my-monorepo/backend**: Backend application workspace

Each workspace is a separate npm package with its own `package.json` and can have its own dependencies and scripts.
