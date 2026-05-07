   # 💎 Arumvale Jewellery — MERN Stack E-Commerce Platform

   Arumvale Jewellery is a full-stack MERN e-commerce platform built for modern jewellery businesses. The platform includes multi-role authentication, product and order management, vendor dashboards, custom jewellery requests, and real-time metal pricing integration.

   This project was built to demonstrate frontend architecture, REST API development, authentication workflows, and modern UI development using React and Tailwind CSS.

   ## ✨ Key Features

   ### 🛍️ Customer Experience
   - Product catalog with filtering and search
   - Shopping cart with persistent state
   - Custom jewellery request workflow
   - Order tracking and management
   - Wishlist functionality
   - Multi-step checkout process

   ### 🏪 Vendor Management
   - Dashboard with sales overview
   - Product CRUD operations with image uploads
   - Order processing and fulfillment
   - Custom request review system
   - Inventory management
   - Sales analytics and reporting

   ### 👑 Admin Panel
   - User and vendor management
   - Vendor approval workflow
   - Product oversight and moderation
   - Order supervision
   - Analytics dashboard
   - System configuration

   ### 🔐 Authentication & Security
   - Multi-role authentication (Customer, Vendor, Admin)
   - JWT-based security
   - OTP password reset system
   - Email verification
   - Protected routes with middleware

   ### 📊 Real-Time Features
   - Live metal price integration
   - Real-time price ticker
   - Inventory synchronization
   - Order status updates

   ## 🛠️ Tech Stack

   ### Frontend
   - React - Modern reactive UI framework
   - Vite - Fast build tool and dev server
   - JavaScript (ES6+)
   - Tailwind CSS - Utility-first CSS framework
   - Radix UI - Accessible component library
   - shadcn/ui - Professional UI components
   - React Router - Client-side routing
   - TanStack Query - Server state management
   - React Hook Form - Form validation
   - Axios - HTTP client

   ### Backend
   - Node.js - JavaScript runtime
   - Express - Web application framework
   - MongoDB - NoSQL database with Mongoose ODM
   - JWT - Authentication tokens
   - bcrypt - Password hashing
   - Nodemailer - Email service integration
   - Multer - File upload handling
   - Cookie Parser - Cookie management
   - CORS - Cross-origin resource sharing

   ### Development Tools
   - ESLint - Code linting
   - Vitest - Unit testing framework
   - PostCSS - CSS processing
   - Nodemon - Development auto-restart

   ## 📸 Screenshots

   Screenshots and live demo will be added soon.

   ## 📁 Project Structure

   ```
   arumvale-jewellery/
   ├── frontend/                          # React frontend application
   │   ├── src/
   │   │   ├── components/               # Reusable UI components
   │   │   │   ├── ui/                   # shadcn/ui components
   │   │   │   ├── CustomerLayout.jsx    # Customer page layout
   │   │   │   ├── VendorLayout.jsx      # Vendor dashboard layout
   │   │   │   └── AdminLayout.jsx       # Admin panel layout
   │   │   ├── pages/                    # Page components
   │   │   │   ├── admin/                # Admin-specific pages
   │   │   │   ├── vendor/               # Vendor-specific pages
   │   │   │   ├── LoginPage.jsx         # Authentication pages
   │   │   │   ├── ProductsPage.jsx      # Product catalog
   │   │   │   └── ...                   # Additional pages
   │   │   ├── context/                  # React contexts
   │   │   │   ├── AuthContext.jsx       # Authentication state
   │   │   │   ├── CartContext.jsx       # Shopping cart state
   │   │   │   └── CompareContext.jsx    # Product comparison
   │   │   ├── hooks/                    # Custom React hooks
   │   │   ├── utils/                    # Utility functions
   │   │   └── lib/                      # Library configurations
   │   ├── public/                       # Static assets
   │   ├── package.json                  # Frontend dependencies
   │   └── vite.config.js               # Vite configuration
   ├── backend/                          # Express backend application
   │   ├── config/                       # Configuration files
   │   │   ├── db.js                     # Database connection
   │   │   └── mail.js                   # Email service setup
   │   ├── controllers/                  # Business logic controllers
   │   │   ├── authController.js         # Authentication logic
   │   │   ├── productController.js      # Product management
   │   │   ├── vendorController.js       # Vendor operations
   │   │   └── ...                       # Additional controllers
   │   ├── middleware/                   # Custom middleware
   │   │   └── authMiddleware.js         # Authentication middleware
   │   ├── models/                       # MongoDB schemas
   │   │   ├── User.js                   # User schema
   │   │   ├── Product.js                # Product schema
   │   │   ├── Order.js                  # Order schema
   │   │   └── ...                       # Additional models
   │   ├── routes/                       # API route definitions
   │   │   ├── authRoutes.js             # Authentication endpoints
   │   │   ├── productRoutes.js          # Product endpoints
   │   │   └── ...                       # Additional routes
   │   ├── utils/                        # Utility functions
   │   ├── uploads/                      # File upload directory
   │   ├── package.json                  # Backend dependencies
   │   └── server.js                     # Application entry point
   ├── .gitignore                        # Git ignore rules
   └── README.md                         # Project documentation
   ```

   ## 🚀 Installation & Setup

   ### Prerequisites
   - Node.js 18+
   - MongoDB instance
   - Git

   ### Clone & Install
   ```bash
   # Clone the repository
   git clone https://github.com/gokuldharmaraj/arumvale-jewellery.git
   cd arumvale-jewellery

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

   ## ⚙️ Environment Variables Setup

   ### Backend Environment Variables
   Create `backend/.env` file:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/arumvale-jewellery
   MONGO_URL=mongodb://localhost:27017/arumvale-jewellery

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here

   # Email Service Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   EMAIL_FROM=noreply@arumvalejewellery.com

   # External APIs
   METAL_API_KEY=your-metal-price-api-key

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

   ### Frontend Environment Variables
   Create `frontend/.env` file:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000
   VITE_BACKEND_URL=http://localhost:5000

   # Application Configuration
   VITE_APP_NAME=Arumvale Jewellery
   VITE_APP_VERSION=1.0.0
   ```

   ## 🏃‍♂️ Running the Application

   ### Start Backend Server
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

   ### Start Frontend Development Server
   ```bash
   cd frontend
   npm run dev
   # Application runs on http://localhost:5173
   ```

   ### Production Build
   ```bash
   # Build frontend
   cd frontend
   npm run build

   # Start backend in production
   cd backend
   npm start
   ```

   ## 🔌 API Overview

   ### Authentication Endpoints
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/logout` - User logout
   - `GET /api/auth/me` - Get current user
   - `POST /api/auth/forgot-password` - Password reset request
   - `POST /api/auth/verify-otp` - OTP verification
   - `POST /api/auth/reset-password` - Password reset

   ### Product Endpoints
   - `GET /api/products` - Get all products
   - `GET /api/products/:id` - Get product details
   - `POST /api/products` - Create product (Vendor)
   - `PUT /api/products/:id` - Update product (Vendor)
   - `DELETE /api/products/:id` - Delete product (Vendor)

   ### Order Endpoints
   - `GET /api/orders` - Get user orders
   - `POST /api/orders` - Create order
   - `PUT /api/orders/:id` - Update order status

   ### Vendor Endpoints
   - `GET /api/vendors/dashboard` - Vendor dashboard data
   - `GET /api/vendors/analytics` - Sales analytics
   - `POST /api/vendors/products` - Add new product

   ### Admin Endpoints
   - `GET /api/admin/users` - Manage users
   - `GET /api/admin/vendors` - Manage vendors
   - `PUT /api/admin/vendors/:id/approve` - Approve vendor
   - `GET /api/admin/reports` - Generate reports

   ## 🔐 Authentication System

   The application uses JWT (JSON Web Tokens) for authentication:

   1. **User Registration**: Email verification for account activation
   2. **Login**: JWT token stored in HTTP-only cookie
   3. **Protected Routes**: Middleware verifies token for protected endpoints
   4. **Role-Based Access**: Three roles with different permissions:
      - **Customer**: Browse products, place orders, manage profile
      - **Vendor**: Manage products, process orders, view analytics
      - **Admin**: Full system access, user management, oversight

   ### Security Features
   - Password hashing with bcrypt
   - JWT token expiration (7 days)
   - HTTP-only cookies for token storage
   - CORS protection
   - Input validation and sanitization

   
   ### Frontend Development
   - Modern React patterns with hooks and context API
   - Component-based architecture with reusable UI components
   - State management with React Context and TanStack Query
   - Responsive design with Tailwind CSS
   - Form validation and user experience optimization
   - Performance optimization techniques

   ### Backend Development
   - RESTful API design and implementation
   - Authentication and authorization systems
   - Database design with MongoDB and Mongoose
   - File upload handling and storage solutions
   - Email service integration
   - Error handling and logging best practices

   ### Full-Stack Integration
   - End-to-end application development
   - Cross-origin resource sharing (CORS) configuration
   - Environment variable management
   - Security best practices
   - Architecture patterns
   - Code organization and maintainability

   ### Professional Skills
   - Version control with Git
   - Environment configuration
   - Testing strategies
   - Documentation and technical writing
   - Project planning and development
   - Clean code principles

   ## 👤 Author

   Developed by Gokul Dharmaraj

   Full-Stack Developer | MERN Stack Specialist

   - 🐙 GitHub: github.com/gokuldharmaraj
   - 💼 LinkedIn: linkedin.com/in/gokuldharmaraj


   Built as a full-stack  project using the MERN stack during my Internship.
