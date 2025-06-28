# MERN E-commerce 2025 🛍️

A full-featured E-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with TypeScript integration.

## Features 🚀

### User Features
- **Authentication & Authorization**
  - Google OAuth integration
  - Role-based access control (Admin & User)
  - Secure password management

- **Product Management**
  - Browse products with category filters
  - Search functionality
  - Product details with images
  - Stock tracking

- **Shopping Experience**
  - Cart management
  - Wishlist functionality
  - Order tracking
  - Secure checkout process

- **Payment Integration**
  - Razorpay integration
  - Secure payment processing
  - Order confirmation

### Admin Dashboard 📊
- **Analytics & Reporting**
  - Revenue tracking
  - Sales analytics
  - User statistics
  - Inventory management

- **Data Visualization**
  - Bar charts
  - Line charts
  - Pie charts
  - Real-time data updates

- **Management Tools**
  - Product management
  - Order management
  - User management
  - Transaction tracking

- **Additional Features**
  - Coupon management
  - Stock monitoring
  - Category management

## Technical Stack 💻

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- RTK Query for API calls
- SCSS for styling
- Chart.js for data visualization
- React Icons
- React Hot Toast for notifications

### Backend
- Node.js & Express.js with TypeScript
- MongoDB with Mongoose
- Firebase Authentication
- Multer for file uploads
- Server-side caching
- Type-safe API responses

## Getting Started 🏁

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Firebase account
- Razorpay account (for payments)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/MERN-ECOMMERCE-2025.git
```

2. Install dependencies for backend
```bash
cd e-commerce-backend
npm install
```

3. Install dependencies for frontend
```bash
cd e-commerce-frontend
npm install
```

4. Set up environment variables
```bash
# Backend .env
PORT=
MONGODB_URI=
FIREBASE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Frontend .env
VITE_FIREBASE_KEY=
VITE_SERVER_URL=
VITE_RAZORPAY_KEY=
```

5. Start the development servers
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## Project Structure 📁

```
MERN-ECOMMERCE-2025/
├── e-commerce-backend/     # Backend server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── app.ts         # Express app
│   └── package.json
│
└── e-commerce-frontend/    # Frontend client
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/        # Page components
    │   ├── redux/        # State management
    │   ├── styles/       # SCSS styles
    │   └── utils/        # Utility functions
    └── package.json
```

## Key Features in Detail 🔑

### Admin Dashboard
- Real-time analytics and reporting
- Comprehensive charts and statistics
- Order and inventory management
- User management system

### Shopping Features
- Intuitive product browsing
- Advanced search and filtering
- Secure checkout process
- Order tracking

### Security Features
- JWT authentication
- Role-based access control
- Secure payment processing
- Input validation

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Thanks to all contributors
- Built with modern web technologies
- Designed for scalability and performance

---
Made with ❤️ by [Your Name] 