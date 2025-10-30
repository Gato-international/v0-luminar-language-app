# AI Rules for Luminar Language App

This document outlines the technical stack and guidelines for developing the Luminar Language App.

## Tech Stack

*   **React**: The core JavaScript library for building user interfaces.
*   **Next.js**: The React framework providing server-side rendering, static site generation, and API routes, along with file-system based routing.
*   **TypeScript**: Used throughout the codebase for type safety and improved developer experience.
*   **Tailwind CSS**: A utility-first CSS framework for styling, ensuring a consistent and responsive design.
*   **shadcn/ui**: A collection of re-usable UI components built on Radix UI and styled with Tailwind CSS.
*   **Radix UI**: Low-level UI primitives that provide accessibility and unstyled components, forming the foundation for shadcn/ui.
*   **Supabase**: The backend-as-a-service platform used for authentication, database (PostgreSQL), and server-side logic.
*   **Lucide React**: A library for beautiful and consistent open-source icons.
*   **date-fns**: A modern JavaScript date utility library for parsing, validating, manipulating, and formatting dates.
*   **react-hook-form** and **Zod**: For efficient form management and schema-based validation.

## Library Usage Rules

To maintain consistency and efficiency, please adhere to the following rules when developing:

*   **UI Components**: Always prioritize `shadcn/ui` components for building the user interface. If a required component is not available in `shadcn/ui` or needs significant customization, create a new component using Radix UI primitives and style it with Tailwind CSS. **Do not modify existing `shadcn/ui` component files directly.**
*   **Styling**: All styling must be done using **Tailwind CSS** classes. Ensure designs are responsive across different screen sizes.
*   **State Management**: For local component state, use React's built-in `useState` and `useReducer` hooks. For global state, leverage React Context API if necessary, keeping implementations simple and focused. Avoid introducing external state management libraries unless explicitly requested and approved.
*   **Forms & Validation**: Use `react-hook-form` for all form handling. Implement schema validation using `Zod` to ensure data integrity.
*   **Icons**: Integrate icons using the `lucide-react` library.
*   **Date & Time Operations**: All date and time manipulations, formatting, and parsing should be handled using the `date-fns` library.
*   **Backend Interactions**: All database queries, authentication flows, and server-side logic must utilize the **Supabase client** (`@supabase/supabase-js`, `@supabase/ssr`) and **Next.js Server Actions**.
*   **Routing**: The application uses **Next.js file-system based routing**. Do not introduce `react-router-dom` or similar client-side routing libraries.
*   **Utility Functions**: Common utility functions (e.g., for class name concatenation like `cn`) should be placed in `lib/utils.ts`.
*   **Error Handling**: Do not implement `try/catch` blocks for error handling unless specifically requested. Errors should be allowed to bubble up for centralized handling and debugging.
*   **New Components/Hooks**: Always create new files for new components or hooks, no matter how small. Aim for components that are 100 lines of code or less.