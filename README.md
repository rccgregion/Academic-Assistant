# SHARON Academic Assistant

SHARON (Scholarly Help and Research Online Navigator) is an AI-powered academic assistant designed to support students throughout their academic journey. From brainstorming research ideas to drafting documents, analyzing papers, and preparing for presentations, SHARON offers a suite of intelligent tools to enhance productivity and learning.

This project is built with a modern, professional frontend stack powered by **Vite**, **React**, and **TypeScript**.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration (Crucial!)](#environment-configuration-crucial)
- [Available Scripts](#available-scripts)
  - [`npm run dev`](#npm-run-dev)
  - [`npm run build`](#npm-run-build)
  - [`npm run preview`](#npm-run-preview)
  - [`npm run lint`](#npm-run-lint)
- [Internationalization (i18n)](#internationalization-i18n)
- [Theming](#theming)
- [Gemini API Usage](#gemini-api-usage)

## Description

SHARON aims to be an indispensable co-pilot for students, leveraging the power of Google's Gemini API to provide context-aware assistance for a wide range of academic tasks. The application is designed with a focus on user experience, offering a clean, responsive interface with light and dark modes, and support for multiple languages.

## Features

The application is a comprehensive suite of specialized academic tools:
*   **Dashboard:** Central hub for accessing all features.
*   **Idea Spark:** Brainstorm unique academic project ideas.
*   **DocuCraft:** Draft various sections of academic documents.
*   **StealthWriter:** Paraphrase and enhance text for clarity and originality.
*   **Professor AI:** Get simulated expert feedback on your work.
*   **InsightWeaver:** Synthesize literature, identify themes, and discover research gaps.
*   **LitReview Snippets:** Get AI-generated summary snippets from relevant academic sources.
*   **Resource Rover:** Discover academic articles with AI-powered search.
*   **Paper Analyzer:** Get summaries, methodologies, and limitations from research papers.
*   **Document Lab:** Upload your own documents for processing with SHARON's tools.
*   **Diagram Drafter:** Visualize concepts and processes with AI-generated diagrams.
*   **CiteWise:** Generate citations in various academic formats.
*   **IntegrityGuard:** Perform a simulated originality check on your text.
*   **Study Buddy AI:** An interactive AI tutor for any subject.
*   **Viva Voce Prep:** Generate potential defense questions and answers from your project.
*   **Presentation Crafter:** Create structured presentation outlines.
*   **Success Hub:** Get general academic advice and support.
*   **Prompt Lab:** Experiment with custom prompts and model settings.
*   **Settings:** Configure global preferences for all tools.

## Tech Stack

*   **Build Tool:** Vite
*   **Frontend:** React 19, TypeScript
*   **Routing:** React Router DOM v6
*   **AI:** Google Gemini API (via `@google/genai` SDK)
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API

## Project Structure

The project uses a standard Vite project structure. The root `index.html` is the entry point.

```
.
├── src/                      # All application source code
│   ├── App.tsx               # Main app component with routing
│   ├── components/           # Reusable React components
│   ├── contexts/             # React context providers for global state
│   ├── features/             # Components for each main application feature/page
│   ├── hooks/                # Custom React hooks
│   ├── index.css             # Global styles and Tailwind directives
│   ├── index.tsx             # React DOM entry point for the app
│   ├── locales/              # Internationalization (i18n) translation files
│   ├── services/             # API call logic (geminiService.ts)
│   └── types.ts              # TypeScript type definitions
├── .env.example              # Example environment file
├── index.html                # Vite's main HTML entry point
├── package.json              # Project dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite configuration
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   **Node.js and npm:** Ensure you have Node.js (which includes npm) installed. Version 18 or higher is recommended.
    *   [Node.js download](https://nodejs.org/)

### Installation

1.  **Clone the repository (or download the source code):**
    ```bash
    git clone https://your-repository-url/sharon-academic-assistant.git
    cd sharon-academic-assistant
    ```
2.  **Install dependencies:**
    This installs React, Vite, and all other necessary packages.
    ```bash
    npm install
    ```

### Environment Configuration (Crucial!)

SHARON uses the Google Gemini API, which requires an API key.

1.  **Create an environment file:**
    Make a copy of the `.env.example` file and rename it to `.env.local`.
    ```bash
    cp .env.example .env.local
    ```
2.  **Add your API Key:**
    Open the newly created `.env.local` file and replace `YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key.
    ```
    VITE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    The `.env.local` file is included in `.gitignore` by default and should never be committed to version control.

## Available Scripts

### `npm run dev`

Runs the app in development mode using the Vite dev server. Open [http://localhost:5173](http://localhost:5173) (or the URL provided in your terminal) to view it in the browser. The page will reload if you make edits.

### `npm run build`

Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`

This command runs a local static web server that serves the files from `dist`. It's a good way to check if the production build works correctly on your local machine.

### `npm run lint`

Runs the ESLint static analysis tool to find and report on patterns in the code, helping to maintain code quality.

## Internationalization (i18n)

SHARON supports multiple languages using a custom React Context-based solution.
*   Translation files are located in `src/locales/`.
*   Supported languages include English, Spanish, French, German, Nigerian Pidgin, Hausa, Yoruba, and Igbo.

## Theming

*   Supports **Light and Dark modes** using Tailwind CSS.
*   The user's theme preference is stored in `localStorage`.
*   Theming is managed via the `ThemeProvider` in `src/hooks/useTheme.tsx`.

## Gemini API Usage

*   The application uses the `@google/genai` SDK to interact with Google's Gemini models.
*   API calls are centralized in `src/services/geminiService.ts`.
*   The API key is accessed securely via `import.meta.env.VITE_API_KEY`.