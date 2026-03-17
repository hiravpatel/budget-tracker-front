# SmartSpend Frontend

The progressive web app (PWA) client for the SmartSpend budget tracking application. A sleek, premium dark-themed interface crafted with React and Tailwind CSS v4.

## Technologies Used
- **React**: Frontend UI library.
- **Vite**: Blazing fast frontend build tool.
- **TypeScript**: Typed structural language.
- **Tailwind CSS (v4)**: Utility-first CSS framework for responsive design.
- **Zustand**: Lightweight global state management.
- **React Query (@tanstack/react-query)**: Fast and reliable data-fetching hook system.
- **Recharts**: Re-usable charting library customized for analytics.
- **vite-plugin-pwa**: Progressive Web App capabilities for offline use and installation.
- **React-Hot-Toast**: Toaster notifications component.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hiravpatel/budget-tracker-front.git
   cd budget-tracker-front
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Run the tests:**
   ```bash
   npm test
   ```

## Features
- Dynamic routing with `react-router-dom`.
- Responsive layout using media queries transitioning perfectly from a mobile bottom nav to a desktop sidebar layout.
- Premium financial app design using deep navy (#0B0F1A) with soft Indigo gradients.
- Comprehensive error and HTTP status handling utilizing Axios interceptors securely parsing JWT credentials.
- PWA optimization config allowing user installations directly to device home screens with offline fallbacks.
