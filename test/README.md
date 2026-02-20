# test

![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![styled-components](https://img.shields.io/badge/styled--components-DB7093?style=flat&logo=styled-components&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat&logo=react&logoColor=white)

A production-ready React application built with Vite, scaffolded by create-react-forge.

## Prerequisites

- Node.js 18.x or higher
- npm

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint code |

## Project Structure

```
test/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/              # Base UI primitives
│   ├── features/            # Feature-based modules
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # State management stores
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── [config files]           # Configuration files
```

## Tech Stack

- **Runtime**: Vite
- **Language**: TypeScript
- **Styling**: styled-components
- **State Management**: zustand

## Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [styled-components Documentation](https://styled-components.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

## License

MIT
