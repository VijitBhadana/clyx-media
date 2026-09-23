# CLYX Media

A modern web application built with React, Vite, and TypeScript.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, GSAP, Radix UI components
- **Tooling:** TypeScript, Prettier, Vitest

The backend lives in a separate `clyx-media-backend` service and is not part of this repo.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prai-10/clyx-media.git
   cd clyx-media
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```
   *(Note: You can also use `npm install` if you prefer)*

### Running Locally

To start the development server, run:

```bash
pnpm run dev
```
*(Or `npm run dev`)*

This will start the Vite development server. Open the provided `localhost` URL in your browser to view the application.

### Available Scripts

- `pnpm run dev`: Starts the local development server.
- `pnpm run build`: Builds the project for production.
- `pnpm run test`: Runs unit tests using Vitest.
- `pnpm run format`: Formats code using Prettier.

## License

This project is licensed under the MIT License.
