# Sweet Shop Management System

A full-stack web application for managing a sweet shop inventory, built with modern technologies and best practices. The system supports user authentication, product management, inventory tracking, and role-based access control.

## Features

- **User Authentication**
  - User registration and login
  - Separate Employee (Admin) and User login options
  - JWT token-based authentication
  - Google OAuth integration (frontend ready)
  - Password hashing with bcrypt
  - Protected routes and role-based access
  - Default admin account (admin@sweetshop.com / admin123)

- **Sweet Management**
  - View all available sweets in a responsive grid layout
  - Search sweets by name, category, or price range
  - Add, edit, and delete sweets (Admin only)
  - Real-time inventory updates

- **Inventory Management**
  - Purchase sweets (decreases quantity)
  - Restock inventory (Admin only)
  - Quantity tracking and stock alerts

- **Admin Panel**
  - Full CRUD operations for sweets
  - Inventory restocking
  - User role management

- **User Experience**
  - Responsive design (mobile, tablet, desktop)
  - Modern, visually appealing UI
  - Loading states and error handling
  - Toast notifications
  - Smooth transitions and animations
  - Virtual scrolling for performance

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: React Query
- **HTTP Client**: Axios
- **UI Components**: Custom CSS
- **Virtualization**: @tanstack/react-virtual
- **Notifications**: React Hot Toast
- **OAuth**: @react-oauth/google
- **Testing**: Vitest, React Testing Library

### Database
- **PostgreSQL** with UUID primary keys
- Migrations support via SQL files

## Default Admin Credentials

**For Employee/Admin Login:**
- **Email**: `admin@sweetshop.com`
- **Password**: `admin123`
- **Role**: Admin (full access to admin panel)

**Note**: The default admin user is automatically created when the database is initialized. You can change these credentials after first login or create additional admin users through the database.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sweet_shop_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Create the PostgreSQL database:
```bash
createdb sweet_shop_db
```

5. Run database migrations:
```bash
psql -d sweet_shop_db -f migrations/001_initial_schema.sql
```

6. Build the TypeScript code:
```bash
npm run build
```

7. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Testing

### Backend Tests

Run all backend tests:
```bash
cd backend
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Frontend Tests

Run all frontend tests:
```bash
cd frontend
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

### Test Coverage

The project aims for 80%+ code coverage. Backend tests include:
- Unit tests for business logic
- Integration tests for API endpoints
- Authentication/authorization tests
- Database operation tests

Frontend tests include:
- Component tests with React Testing Library
- Integration tests for user flows

## Deployment

### Backend Deployment (Render)

1. **Create a Render account** and connect your GitHub repository

2. **Create a PostgreSQL database** on Render:
   - Go to Dashboard → New → PostgreSQL
   - Note the connection string

3. **Create a Web Service**:
   - Go to Dashboard → New → Web Service
   - Connect your repository
   - Select the `backend` directory
   - Use the following settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node

4. **Set Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong random secret
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-app.vercel.app`)
   - `PORT`: Leave default (Render sets this automatically)

5. **Deploy**: Render will automatically deploy from your main branch

Alternatively, you can use the `render.yaml` file for infrastructure as code:
- Push `render.yaml` to your repository
- Render will detect and use it for configuration

### Frontend Deployment (Vercel)

1. **Create a Vercel account** and connect your GitHub repository

2. **Import your project**:
   - Select the `frontend` directory as the root
   - Vercel will auto-detect Vite

3. **Set Environment Variables**:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

4. **Deploy**: Vercel will automatically deploy from your main branch

The `vercel.json` file is already configured for optimal deployment.

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Sweet Endpoints (Protected)

#### Get All Sweets
```http
GET /api/sweets
Authorization: Bearer {token}
```

#### Search Sweets
```http
GET /api/sweets/search?name=chocolate&category=Candy&minPrice=5&maxPrice=20
Authorization: Bearer {token}
```

#### Create Sweet (Admin Only)
```http
POST /api/sweets
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 5.99,
  "quantity": 100
}
```

#### Update Sweet (Admin Only)
```http
PUT /api/sweets/{id}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 6.99
}
```

#### Delete Sweet (Admin Only)
```http
DELETE /api/sweets/{id}
Authorization: Bearer {admin-token}
```

### Inventory Endpoints (Protected)

#### Purchase Sweet
```http
POST /api/sweets/{id}/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 2
}
```

#### Restock Sweet (Admin Only)
```http
POST /api/sweets/{id}/restock
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "quantity": 50
}
```

## Project Structure

```
sweet-shop-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Sweet.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── sweets.ts
│   │   │   └── inventory.ts
│   │   ├── utils/
│   │   │   ├── password.ts
│   │   │   └── jwt.ts
│   │   ├── test/
│   │   │   ├── setup.ts
│   │   │   ├── auth.test.ts
│   │   │   ├── sweets.test.ts
│   │   │   └── inventory.test.ts
│   │   └── index.ts
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── render.yaml
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   └── sweets.ts
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Layout.css
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   └── AdminPanel.css
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── cartStore.ts
│   │   ├── test/
│   │   │   └── setup.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── index.html
│
└── README.md
```

## Security Considerations

- **Input Validation**: All inputs are validated on both frontend and backend using express-validator
- **SQL Injection Prevention**: Parameterized queries using pg library
- **XSS Protection**: React automatically escapes content, and Helmet adds security headers
- **CSRF Protection**: JWT tokens stored in memory/state, not cookies
- **Rate Limiting**: API endpoints are rate-limited (100 requests per 15 minutes)
- **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
- **HTTPS**: Enforced in production environments
- **CORS**: Configured to only allow requests from the frontend URL
- **Environment Variables**: Sensitive data stored in environment variables, not in code

## Coding Standards

- **ESLint** and **Prettier** configured for consistent code formatting
- **TypeScript strict mode** enabled
- **SOLID principles** followed in architecture
- **Clean code** practices with meaningful variable and function names
- **Comments** only for complex logic
- **Error handling** implemented throughout
- **Logging** for debugging and monitoring

## My AI Usage

During this project, I utilized Cursor as my primary IDE, which provided intelligent code suggestions and helped with basic debugging tasks. I also consulted ChatGPT for guidance on deployment steps and configuration for Render and Vercel. These tools helped streamline my development workflow, though all core logic and architecture decisions were made independently.

## Contributors

- **Your Name** - [Your Email/Contact]

## License

This project is licensed under the ISC License.
