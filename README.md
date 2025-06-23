
# Breakdown Tracker

Breakdown Tracker is a web application designed to help businesses and maintenance teams efficiently log, manage, and analyze equipment breakdowns. It also provides a simple inventory system for tracking spare parts consumed during repairs. Built with a modern tech stack, this application aims to streamline maintenance workflows and provide valuable insights into equipment performance.

## Key Features

*   **Breakdown Logging:** Quickly create detailed reports for equipment failures, including affected machinery, production line, loss time, and a description of the issue.
*   **Categorization:** Classify breakdowns (e.g., Electrical, Mechanical, Instrumentation) for better analysis and reporting.
*   **Spare Parts Consumption:** Track spare parts used for each breakdown, automatically updating inventory levels.
*   **Inventory Management:** Maintain a list of spare parts, including part numbers, descriptions, quantities, and storage locations.
*   **Dashboard Overview:** Get a quick glance at key metrics like total breakdowns, total loss time, and low stock alerts.
*   **Detailed Views:** Access comprehensive details for each breakdown report and spare part.
*   **Responsive Design:** Access and manage data seamlessly across desktop and mobile devices.

## Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (React Framework with App Router)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [ShadCN UI](https://ui.shadcn.com/) (Component Library)
    *   [Lucide React](https://lucide.dev/) (Icons)
*   **Backend (Conceptual - In-memory data for this version):**
    *   Next.js API Routes / Server Actions
*   **AI (Optional - if Genkit features are added):**
    *   [Genkit (Firebase)](https://firebase.google.com/docs/genkit)

## Getting Started
 Inventory Bug Fix
### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### Running Locally

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```
    The application will typically be available at `http://localhost:9002`.

4.  **(Optional) If using Genkit for AI features:**
    Genkit flows usually run on a separate development server.
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit development server, often on `http://localhost:3400`.

### Building for Production

To create a production-ready build:

```bash
npm run build
# or
# yarn build
# or
# pnpm build
```

This will generate an optimized build in the `.next` directory.

## Deployment

This application is configured for easy deployment with [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

### Deploying to Firebase App Hosting

1.  **Ensure Firebase CLI is installed and you are logged in:**
    ```bash
    npm install -g firebase-tools
    firebase login
    ```

2.  **Initialize Firebase in your project (if not already done):**
    ```bash
    firebase init hosting
    ```
    During initialization:
    *   Select "Use an existing project" or "Create a new project".
    *   When asked about the public directory, specify `.next/server/app` (or follow Firebase's latest guidance for Next.js App Router deployments if different).
    *   Configure as a single-page app (SPA): **No** (as Next.js handles routing).
    *   Set up automatic builds and deploys with GitHub: **Yes** (recommended for CI/CD).

3.  **Configure `apphosting.yaml` (if needed):**
    The `apphosting.yaml` file in the root of the project contains configuration for Firebase App Hosting. You can adjust settings like `runConfig.maxInstances` as needed.

4.  **Deploy:**
    If you haven't set up automatic GitHub deployments, you can deploy manually:
    ```bash
    firebase deploy --only hosting
    ```
    Or, more specifically for App Hosting backends:
    ```bash
    firebase apphosting:backends:deploy <your-backend-id> --source .
    ```
    (Refer to the latest Firebase App Hosting documentation for the most up-to-date deployment commands.)

### Other Cloud Platforms

While optimized for Firebase App Hosting, this Next.js application can be deployed to various platforms that support Node.js and Next.js, such as:

*   [Vercel](https://vercel.com/) (Recommended for Next.js projects)
*   [Netlify](https://www.netlify.com/)
*   AWS (e.g., Amplify, EC2 with PM2, Fargate)
*   Google Cloud (e.g., Cloud Run, App Engine)
*   Azure (e.g., App Service, Static Web Apps)

For these platforms, you will typically:
1.  Build the application (`npm run build`).
2.  Configure the platform to serve the Next.js application, often using the output from the `.next` directory.
3.  Set up environment variables as needed.

Refer to the specific documentation of your chosen hosting provider for detailed Next.js deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open-source and available under the [MIT License](LICENSE.md) (assuming one would be added).