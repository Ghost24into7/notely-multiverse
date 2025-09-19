# SaaS Notes Application

A multi-tenant Software as a Service (SaaS) notes application built with Node.js, Express, MongoDB, and React. The application supports multiple tenants with strict data isolation, role-based access control, and subscription-based feature gating.

## 🏗️ Architecture & Multi-Tenancy Approach

### Chosen Approach: Shared Schema with Tenant ID Column

This application implements multi-tenancy using the **shared schema with tenant ID column** approach for the following reasons:

1. **Cost Efficiency**: Single database and schema reduce infrastructure costs
2. **Maintenance**: Easier to maintain and update compared to multiple schemas/databases
3. **Resource Optimization**: Better resource utilization for small to medium-scale applications
4. **Scalability**: Easier to implement cross-tenant analytics and reporting

### Data Isolation Strategy

- Every data model (Users, Notes) includes a `tenantId` field
- All database queries are automatically filtered by `tenantId`
- Middleware ensures users can only access data from their own tenant
- Compound indexes on `tenantId` ensure optimal query performance

## 🚀 Features

### Multi-Tenancy
- ✅ Support for multiple tenants (Acme & Globex)
- ✅ Strict data isolation between tenants
- ✅ Tenant-specific user management
- ✅ Shared database with tenant ID column approach

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Member)
- ✅ Secure password hashing with bcrypt
- ✅ Token validation middleware

### Subscription Management
- ✅ Free Plan: Limited to 3 notes per tenant
- ✅ Pro Plan: Unlimited notes
- ✅ Admin-only subscription upgrades
- ✅ Real-time subscription limit enforcement

### Notes Management (CRUD)
- ✅ Create notes with title and content
- ✅ List all notes for current tenant
- ✅ View individual note details
- ✅ Update note content
- ✅ Soft delete notes
- ✅ Tenant isolation enforced on all operations

### Frontend Features
- ✅ Clean, responsive React interface
- ✅ Login with predefined test accounts
- ✅ Notes listing and creation
- ✅ Subscription status display
- ✅ Upgrade to Pro functionality for admins

## 📋 Test Accounts

The application comes with pre-configured test accounts (password: `password`):

| Email | Role | Tenant | Capabilities |
|-------|------|--------|--------------|
| `admin@acme.test` | Admin | Acme | Create notes, upgrade subscription |
| `user@acme.test` | Member | Acme | Create and manage notes only |
| `admin@globex.test` | Admin | Globex | Create notes, upgrade subscription |
| `user@globex.test` | Member | Globex | Create and manage notes only |

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Request validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons

### Deployment
- **Vercel** - Hosting platform for both frontend and backend

## 🚦 API Endpoints

### Authentication
```
POST /api/auth/login           - Login with email/password
GET  /api/auth/me              - Get current user profile
POST /api/auth/logout          - Logout (client-side token removal)
POST /api/auth/validate-token  - Validate JWT token
```

### Notes Management
```
POST   /api/notes              - Create a new note
GET    /api/notes              - List all notes (tenant-filtered)
GET    /api/notes/:id          - Get specific note details
PUT    /api/notes/:id          - Update a note
DELETE /api/notes/:id          - Delete a note (soft delete)
GET    /api/notes/stats/overview - Get notes statistics
```

### Tenant Management
```
GET  /api/tenants/:slug                - Get tenant information
POST /api/tenants/:slug/upgrade        - Upgrade to Pro (Admin only)
GET  /api/tenants/:slug/subscription   - Get subscription status
```

### Health Check
```
GET  /health                   - API health status
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB database (local or cloud)
- Git

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd yardstick-2-fullstack

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

#### Backend (.env)
Create `backend/.env` file:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saas-notes?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Database Setup
```bash
# Seed the database with test accounts
npm run seed
```

### 4. Development
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run backend:dev    # Backend on http://localhost:3001
npm run frontend:dev   # Frontend on http://localhost:3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🚀 Deployment to Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas database (recommended for production)

### 1. Environment Variables
Set the following environment variables in Vercel:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saas-notes
JWT_SECRET=your-production-jwt-secret-key
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Follow the prompts to configure your deployment
```

### 3. Seed Production Database
After deployment, seed your production database:
```bash
# Set environment variables locally to point to production DB
# Then run:
npm run seed
```

## 🧪 Testing the Application

### 1. Login Testing
- Visit the frontend application
- Click on any test account email to auto-fill credentials
- Verify successful login and dashboard access

### 2. Multi-Tenant Testing
- Login with different tenant accounts
- Verify data isolation (users can only see their tenant's notes)
- Confirm role-based access (only admins can upgrade subscriptions)

### 3. Subscription Testing
- Create notes up to the limit (3 for free accounts)
- Verify limit enforcement on the 4th note creation
- Test subscription upgrade with admin accounts
- Confirm unlimited notes after upgrade

### 4. API Testing
Use tools like Postman or curl:
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'

# Create note (replace TOKEN with actual JWT)
curl -X POST http://localhost:3001/api/notes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"This is a test note"}'
```

## 📁 Project Structure

```
saas-notes-app/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection config
│   ├── middleware/
│   │   ├── auth.js              # JWT & authorization middleware
│   │   └── validation.js        # Request validation schemas
│   ├── models/
│   │   ├── Tenant.js            # Tenant data model
│   │   ├── User.js              # User data model
│   │   └── Note.js              # Note data model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── notes.js             # Notes CRUD routes
│   │   └── tenants.js           # Tenant management routes
│   ├── scripts/
│   │   └── seed.js              # Database seeding script
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Express server entry point
│   └── vercel.json              # Vercel backend config
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx # Route protection component
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   └── Dashboard.jsx     # Main dashboard
│   │   ├── utils/
│   │   │   └── api.js            # API client configuration
│   │   ├── App.jsx               # Main application component
│   │   ├── App.css               # Application styles
│   │   └── main.jsx              # React entry point
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   └── index.html                # HTML template
├── .gitignore                    # Git ignore rules
├── package.json                  # Root package.json
├── README.md                     # This documentation
└── vercel.json                   # Vercel deployment config
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt for secure password storage
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers for enhanced protection
- **Input Validation**: Joi-based request validation
- **Tenant Isolation**: Strict data access controls

## 📈 Scalability Considerations

- **Database Indexing**: Compound indexes on tenantId for optimal performance
- **Pagination**: Built-in pagination for notes listing
- **Caching**: Ready for Redis implementation
- **Load Balancing**: Stateless architecture supports horizontal scaling
- **Monitoring**: Structured logging for production monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Assignment Completion Checklist

### ✅ Multi-Tenancy Requirements
- [x] Support for Acme and Globex tenants
- [x] Strict data isolation between tenants
- [x] Shared schema with tenant ID approach implemented
- [x] Architecture documented in README

### ✅ Authentication & Authorization
- [x] JWT-based login system
- [x] Admin and Member roles implemented
- [x] Test accounts created with correct credentials
- [x] Role-based access control enforced

### ✅ Subscription Feature Gating
- [x] Free plan with 3-note limit
- [x] Pro plan with unlimited notes
- [x] Admin-only upgrade endpoint
- [x] Immediate limit lifting after upgrade

### ✅ Notes API (CRUD)
- [x] POST /notes - Create note with tenant isolation
- [x] GET /notes - List tenant-specific notes
- [x] GET /notes/:id - Retrieve specific note
- [x] PUT /notes/:id - Update note
- [x] DELETE /notes/:id - Delete note

### ✅ Deployment Requirements
- [x] Vercel deployment configuration
- [x] CORS enabled for external access
- [x] GET /health endpoint implemented

### ✅ Frontend Requirements
- [x] Minimal frontend hosted on Vercel
- [x] Login functionality with test accounts
- [x] Notes listing, creation, and deletion
- [x] Subscription upgrade UI for admins
- [x] "Upgrade to Pro" prompt when limit reached

**🎉 All assignment requirements completed successfully!**