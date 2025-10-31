# GEMINI.md

## Project Overview

This is a web application designed to help students track their progress on the SkillRack platform. It allows users to input their SkillRack profile URL, and the application will parse the profile to display statistics and help them set and track their goals.

The project is built with a modern tech stack, including:

*   **Frontend:** React, TypeScript, and Vite, with Tailwind CSS for styling.
*   **Backend:** Vercel Serverless Functions, written in TypeScript, are used to handle the parsing of SkillRack profiles.
*   **Testing:** The project uses Jest and React Testing Library for unit and integration testing.

The application is designed to be stateless, meaning it doesn't require user registration and doesn't store any user data.

## Building and Running

To get the project up and running, you'll need to have Node.js (v18 or higher) and npm installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Sudharshan2026/skillracktracker2.o.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd skillracktracker2.o
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Development

To start the development server, run:

```bash
npm run dev
```

This will start the Vite development server, and you can view the application in your browser at `http://localhost:3000`.

### Building

To build the application for production, run:

```bash
npm run build
```

This will create a `dist` directory with the optimized production build.

### Testing

To run the tests, use the following command:

```bash
npm test
```

You can also run the tests in watch mode:

```bash
npm test:watch
```

To generate a test coverage report, run:

```bash
npm test:coverage
```

## Development Conventions

*   **Code Style:** The project uses ESLint to enforce a consistent code style. You can run the linter with `npm run lint`.
*   **TypeScript:** The project is written in TypeScript, and it's recommended to follow TypeScript best practices.
*   **Components:** The frontend is built with React components, which are located in the `src/components` directory.
*   **Serverless Functions:** The backend logic is implemented as Vercel Serverless Functions, located in the `api` directory.
*   **Testing:** Tests are located in the `src/tests` directory and are written using Jest and React Testing Library.
