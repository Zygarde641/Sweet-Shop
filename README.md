# Sweet Shop Management System

An enterprise-grade, full-stack application architected for real-time inventory management, secure user authentication, and high-performance data visualization. This system demonstrates a modern approach to building scalable e-commerce platforms using the PERN stack (PostgreSQL, Express, React, Node.js).

## 🏗️ Technical Architecture

This application focuses on data integrity, state synchronization, and type safety across the full stack.

### Frontend Architecture
Built with **React 18** and **TypeScript** to ensure robust, maintainable code.
-   **Data Synchronization (React Query)**: tailored for server-state management. It handles caching, background updates, and optimistic UI updates, ensuring the dashboard always reflects real-time inventory levels without manual refreshes.
-   **Component Logic**:
    -   **Atomic Design Pattern**: Reusable, isolated components (e.g., `SweetCard`, `CartBadge`) for consistent UI.
    -   **Custom Hooks**: Encapsulated business logic (e.g., `useDebounce` for search, `useSweetActions` for transactional operations).
    -   **Optimized Rendering**: Virtual scrolling for large lists and memoization to prevent unnecessary re-renders.

### Backend Architecture
A RESTful API built on **Node.js** and **Express**, prioritized for security and performance.
-   **Transactional Integrity**: Critical operations like `purchase` and `release` stock use database transactions to prevent race conditions and ensure inventory accuracy.
-   **Security Layer**:
    -   **JWT Authentication**: Stateless, secure token-based auth with middleware protection (`authenticate`, `requireAdmin`).
    -   **Input Validation**: Strict schema validation using `express-validator` to sanitize all incoming data, preventing injection attacks.
    -   **Rate Limiting & Helmet**: mitigation against DDoS and common web vulnerabilities.
-   **Database Design (PostgreSQL)**:
    -   Normalized schema (3NF) to reduce redundancy.
    -   UUIDs for primary keys to prevent enumeration attacks.
    -   Indexed columns for high-performance searching and filtering.

## 💡 Key Implementation Logic

### Real-Time Inventory Synchronization
One of the system's core features is the sophisticated synchronization between the user's cart and the global inventory.
1.  **Optimistic Updates**: When a user adds an item, the UI updates instantly while the request is processed.
2.  **Stock Reservation**: Adding to cart triggers a backend "hold" on stock.
3.  **Smart Release Mechanism**: If a user removes an item or decreases quantity in the cart, a custom `release` endpoint is triggered, instantly returning stock to the global pool. This ensures that "abandoned" cart items don't permanently lock up inventory.

### Robust Search & Filtering
-   Server-side filtering for efficiency (processing heavy operations closer to the data).
-   Composite filter handling: allowing users to intersect searches by name, category, and price range simultaneously.

## 🛠️ Technology Stack

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript | Type safety prevents runtime errors; React 18 enables concurrent features. |
| **State** | Zustand | Lightweight alternatives to Redux for cleaner, boilerplate-free global state. |
| **Sync** | React Query | Manages server state complexity (caching, deduping requests) automatically. |
| **Styling** | Vanilla CSS (Variables) | Zero-runtime overhead, high performance, and full control over the design system/themes. |
| **Backend** | Node.js, Express | Event-driven, non-blocking I/O ideal for handling concurrent API requests. |
| **Database** | PostgreSQL | ACID compliance ensures financial/inventory data is never lost or corrupted. |
| **Auth** | JWT, bcryptjs, Helmet | Industry-standard security practices. |
| **Testing** | Vitest, Supertest | Full coverage for unit and integration tests to ensure reliability. |

## 🚀 Deployment & CI/CD
-   **Frontend**: Deployed on Vercel with automated build pipelines.
-   **Backend**: Hosted on Render.
-   **Environment**: Strict separation of concerns using environment variables for sensitive configuration.

## 🔐 Admin Credentials

For testing and administrative access, use the following credentials:

-   **Email**: `admin@sweetshop.com`
-   **Password**: `admin123`

> **Note**: These are default credentials for development/testing purposes. In production, ensure to change these credentials and use environment variables for sensitive data.

## My AI Usage

During this project, I utilized Cursor as my primary IDE, which provided intelligent code suggestions and helped with debugging tasks. I also consulted claude code for initial planning and ChatGPT for guidance on deployment steps and configuration for Render and Vercel. These tools helped streamline my development workflow, though all core logic and architecture decisions were made independently.

