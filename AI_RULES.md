# AI Rules and Tech Stack for ReparoPro

This document outlines the core technologies used in the ReparoPro application and provides guidelines for using specific libraries and tools.

## Tech Stack Overview

ReparoPro is built with a modern web development stack, focusing on performance, maintainability, and a rich user experience.

*   **React**: The primary JavaScript library for building dynamic and interactive user interfaces.
*   **TypeScript**: Enhances code quality and developer productivity by adding static type definitions to JavaScript.
*   **Tailwind CSS**: A utility-first CSS framework used for rapid and consistent styling across the application.
*   **Vite**: A fast and efficient build tool that provides a lightning-fast development server and optimized builds.
*   **Chart.js**: A powerful and flexible JavaScript charting library for creating various data visualizations.
*   **Google GenAI (Gemini API)**: Integrated for AI-powered features, such as suggesting repairs based on damage descriptions.
*   **Custom UI Components**: The application currently uses custom-built UI components (e.g., `Button`, `Card`, `Input`) styled with Tailwind CSS.
*   **Local Storage**: Used for client-side data persistence, managing user sessions and saved quotes.

## Library Usage Guidelines

To maintain consistency and leverage the strengths of each tool, please follow these guidelines:

*   **UI Components**:
    *   For new UI elements, **always prioritize using `shadcn/ui` components**. These are pre-installed and offer a consistent, accessible foundation.
    *   If a specific `shadcn/ui` component doesn't meet requirements or needs significant customization, create a new custom component in `src/components/ui/` following the existing styling conventions. **Do not modify `shadcn/ui` source files directly.**
    *   `Radix UI` components are available for headless UI primitives if you need to build complex, accessible interactions from scratch, but `shadcn/ui` should be the first choice.
*   **Styling**:
    *   **Always use Tailwind CSS** for all styling. Avoid inline styles or separate CSS files unless absolutely necessary for specific third-party integrations that require it.
*   **Icons**:
    *   Use the `lucide-react` package for all icons in the application.
*   **Routing**:
    *   For managing application navigation, **use `React Router`**. All route definitions should be maintained within `src/App.tsx`.
*   **Charting**:
    *   All data visualization and charting needs should be handled using **`Chart.js`**.
*   **AI Integration**:
    *   Interact with the Google GenAI (Gemini API) through the `services/geminiService.ts` utility. Ensure the `GEMINI_API_KEY` environment variable is properly configured.
*   **Data Persistence**:
    *   For client-side data storage, continue to use `localStorage`.
    *   If server-side data storage, authentication, or more robust database features are required, consider integrating with `Supabase`.