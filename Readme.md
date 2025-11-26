# Zcash.me Map

A privacy-focused, interactive map application visualizing Zcash users and communities worldwide. Built with modern web technologies for performance and scalability.

## 🚀 Features

- **Interactive Map**: Visualize user clusters with smooth zooming and panning.
- **City Filtering**: Filter users by city with URL synchronization (deep linking).
- **Dark/Light Mode**: Automatic system detection with manual toggle.
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Privacy First**: No personal data tracking; uses aggregated public data.

## 🛠 Architecture

The project consists of a React frontend and a Cloudflare Workers backend.

```mermaid
graph TD
    User[User Browser]
    
    subgraph Frontend [Vite + React]
        App[App Component]
        Theme[Theme Context]
        Map[Leaflet Map]
        UI[UI Components]
    end
    
    subgraph Backend [Cloudflare Workers]
        Worker[API Worker]
        CSV[CSV Parser]
    end
    
    subgraph Data [Data Source]
        Assets[Static Assets (CSV)]
    end

    User -->|HTTPS| App
    App -->|State| Theme
    App -->|Render| Map
    App -->|Render| UI
    
    App -->|Fetch Data| Worker
    Worker -->|Read| Assets
    Worker -->|Parse| CSV
    Worker -->|JSON| App
```

### Tech Stack

- **Frontend**: React 18, Vite, Leaflet, React Router
- **Backend**: Cloudflare Workers, PapaParse
- **Styling**: CSS Modules / Vanilla CSS (Scoped)

## 📦 Setup & Installation

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Frontend

1. Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

### Backend

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the local worker:

    ```bash
    npm run dev
    ```

## 🌍 Deployment

### Frontend

The frontend is designed to be deployed as a static site (e.g., Cloudflare Pages, Vercel, Netlify).

```bash
npm run build
```

### Backend

The backend is deployed to Cloudflare Workers.

```bash
npm run deploy
```
