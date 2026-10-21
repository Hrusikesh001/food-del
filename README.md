# 🍔 FoodTaxi — Full-Stack Food Delivery Platform

FoodTaxi is a full-stack food delivery web application that allows users to explore food items, manage their shopping cart, place orders, and make online payments. It also includes an admin panel for managing food items and customer orders.

Built with the **MERN stack**, FoodTaxi demonstrates full-stack web development through frontend components, REST APIs, database integration, authentication, and payment processing.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Application Workflow](#-application-workflow)
- [API Overview](#-api-overview)
- [Security Considerations](#-security-considerations)
- [Future Improvements](#-future-improvements)
- [Learning Outcomes](#-learning-outcomes)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Overview

FoodTaxi provides a convenient way for customers to browse food items and place online orders through a responsive web interface.

The application consists of three main parts:

1. **Customer Frontend:** A React application for browsing food, managing the cart, signing in, and ordering food.
2. **Backend API:** A Node.js and Express server that handles application requests, authentication, database operations, orders, and payment-related functionality.
3. **Admin Panel:** A separate React application for managing food items and viewing or managing orders.

MongoDB stores application data, while Stripe is integrated for online payment processing.

## ✨ Features

### 👤 Customer Features

- **User Authentication:** User registration and login.
- **Food Catalog:** Browse available food items with images, descriptions, prices, and categories.
- **Category Filtering:** Explore food items by category.
- **Shopping Cart:** Add items, increase quantities, and remove items.
- **Cart Management:** Maintain cart information and calculate order totals.
- **Order Placement:** Submit orders through the checkout workflow.
- **Online Payments:** Stripe integration for payment processing.
- **Order Verification:** A payment verification workflow.
- **Order History:** View previous orders through the customer order page.
- **Responsive Interface:** React-based user interface with reusable components.

### 🛠️ Admin Features

- **Food Management:** Add food items with relevant details and images.
- **Food Catalog Management:** Manage the items available to customers.
- **Order Management:** View customer orders and manage their status.
- **Dedicated Admin Interface:** Separate frontend for administrative operations.

### 🔧 Backend Features

- REST API architecture using Express.js.
- MongoDB database integration using Mongoose.
- Password hashing using bcrypt.
- Token-based authentication using JWT.
- Image uploads using Multer.
- Stripe payment integration.
- Separate route and controller modules for application functionality.

> Note: Features such as live rider tracking, AI recommendations, automated PDF invoices, coupons, and Socket.IO-based notifications are potential future enhancements, not features claimed as implemented here.

## 💻 Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Building the customer interface and admin panel |
| Vite | Frontend development server and build tooling |
| JavaScript | Application logic |
| CSS | Styling and layout |
| Axios | HTTP requests between frontend and backend |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API and server-side routing |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Multer | Handling file uploads |
| Stripe | Online payment integration |
| npm | Package management |

## 🏗️ Project Architecture

FoodTaxi follows a client-server architecture with separate customer and admin applications.

```text
                 ┌──────────────────────┐
                 │    Customer Website  │
                 │    React + Vite      │
                 └──────────┬───────────┘
                            │
                            │ Axios / HTTP
                            ▼
                 ┌──────────────────────┐
                 │    Express Backend   │
                 │    Node.js REST API  │
                 └──────────┬───────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │   MongoDB Atlas  │        │ Stripe Payments  │
    │ Application Data │        │ Payment Provider │
    └──────────────────┘        └──────────────────┘
                            ▲
                            │
                 ┌──────────┴───────────┐
                 │     Admin Panel      │
                 │     React + Vite     │
                 └──────────────────────┘
```

### How the architecture works

1. The customer interacts with the React frontend.
2. Axios sends HTTP requests to the Express backend.
3. The backend validates requests and performs business logic.
4. Mongoose communicates with MongoDB to retrieve or update data.
5. Stripe handles payment processing through the configured payment workflow.
6. The backend returns responses to the frontend.
7. The admin panel uses backend APIs to manage food items and orders.

## 📂 Project Structure

The project is organized into three separate applications.

```text
FoodTaxi/
│
├── frontend/                  # Customer-facing website
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── FoodDisplay/
│   │   │   ├── Fooditem/
│   │   │   ├── Navbar/
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── StoreContext.jsx
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Cart/
│   │   │   ├── PlaceOrder/
│   │   │   ├── Verify/
│   │   │   ├── MyOrders/
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── admin/                     # Administrative dashboard
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # REST API server
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

*The tree illustrates the project's main organization. Some individual filenames and subfolders may vary in your local repository.*

## ⚙️ Getting Started

Follow these instructions to run FoodTaxi on your local machine.

### Prerequisites

Install the following tools before getting started:

- [Node.js](https://nodejs.org/) — preferably an LTS release.
- npm — included with Node.js.
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or a compatible MongoDB server.
- [Stripe](https://stripe.com/) account for testing payments.
- Git for cloning the repository.

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd FoodTaxi
```

Replace `YOUR_REPOSITORY_URL` with your actual Git repository URL.

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` directory and add your own configuration:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
STRIPE_SECRET_KEY=your_stripe_test_secret_key
```

Replace the placeholder values with your own credentials. Do not commit this file to Git.

The variable names must match those used by your backend code. If your Stripe integration uses additional configuration, include the required variables as well.

### 4. Start the backend

From the `backend` directory, run the command configured in your `package.json`. If the project has the `server` script, you can use:

```bash
npm run server
```

Alternatively, if you have Nodemon installed and configured:

```bash
npx nodemon server.js
```

The backend should start on:

```text
http://localhost:4000
```

If your root endpoint is configured to return an API health message, opening that URL should confirm that the server is responding.

### 5. Install and start the customer frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local URL in the terminal, commonly:

```text
http://localhost:5173
```

### 6. Install and start the admin panel

Open another terminal:

```bash
cd admin
npm install
npm run dev
```

Vite will display the admin application's URL. If port `5173` is already occupied, Vite may select another available port.

### 7. Verify the application

Check the following:

- The backend starts without database connection errors.
- The food-list API returns the expected JSON response.
- Food items appear on the customer website.
- User registration and login work.
- Cart operations work.
- Checkout and payment verification behave as expected.
- Orders appear in the admin panel.

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port used by the Express server |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens |
| `STRIPE_SECRET_KEY` | Secret API key used by the backend Stripe integration |

Use a different secret key for each environment when appropriate. Never expose your Stripe secret key, database password, or JWT secret in frontend code or a public repository.

For a Vite frontend, only intentionally public variables should use the `VITE_` prefix. A secret placed in a frontend environment variable can become visible to users in the browser.

## 🔌 API Overview

FoodTaxi organizes its backend around separate resources for food, users, carts, and orders.

The following table describes the expected route groups based on the project's existing organization. Confirm the exact endpoint paths and HTTP methods in your route files before relying on this table as complete API documentation.

| Resource | Typical route prefix | Purpose |
|---|---|---|
| Food | `/api/food` | Retrieve and manage food items |
| Users | `/api/user` | Registration, login, and user-related operations |
| Cart | `/api/cart` | Add, remove, and retrieve cart items |
| Orders | `/api/order` | Place orders, process payments, and retrieve order information |

### Example: Retrieve the food catalog

**Request**

```http
GET /api/food/list
```

**Local URL**

```text
http://localhost:4000/api/food/list
```

The endpoint returns a JSON response containing the food list. The exact response property names depend on the backend implementation.

### Authentication

Protected endpoints should validate the authentication token and verify that the current user is authorized to perform the requested action.

### Payment processing

The backend should verify payment outcomes through a trusted Stripe verification mechanism before marking an order as paid. The browser redirect or a client-submitted success flag alone should never be treated as proof of payment.

## 🔒 Security Considerations

Security is important for a food ordering application that handles accounts, orders, and payments.

Recommended practices include:

- Store passwords using bcrypt rather than plaintext.
- Keep database credentials and API secrets in environment variables.
- Protect administrative APIs with authentication and role-based authorization.
- Validate incoming request data on the backend.
- Calculate order totals using trusted server-side prices.
- Verify Stripe payment status on the backend.
- Validate uploaded files and restrict allowed file types and sizes.
- Use HTTPS in production.
- Avoid exposing sensitive user or payment information in logs.
- Configure CORS for the frontend origins that should access the API.
- Use secure token handling and appropriate expiration policies.

## 🚧 Future Improvements

The following are potential enhancements for future versions of FoodTaxi.

### Customer Experience
- Downloadable PDF invoices.
- Ratings and reviews for completed orders.
- Saved addresses and favorite dishes.
- Coupons, promotional offers, and loyalty points.
- Food search, sorting, and advanced filtering.
- Food customization and add-ons.

### Real-Time Capabilities
- Socket.IO-based order status updates.
- Live delivery tracking using a map.
- Delivery partner dashboard.
- Real-time order notifications.

### AI and Analytics
- AI-powered food recommendations.
- AI food assistant for personalized suggestions.
- Sales analytics dashboard for administrators.
- Popularity and demand analysis for food items.

### Reliability and Performance
- Automated tests for APIs and critical user flows.
- Better error handling and logging.
- Pagination and optimized database queries.
- Deployment automation using CI/CD.
- Improved accessibility and responsive design.

These improvements can be introduced incrementally based on project requirements.

## 📚 Learning Outcomes

Building FoodTaxi provides practical experience with:

- Full-stack web development using the MERN stack.
- Component-based development with React.
- State management using React Context.
- REST API design with Express.js.
- Database modeling using MongoDB and Mongoose.
- Authentication and authorization concepts.
- File upload handling.
- Third-party payment integration.
- Environment-based application configuration.
- Separating frontend, backend, and administrative functionality.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected functionality.
5. Commit and push your changes.
6. Open a pull request with a clear explanation of your changes.

Please avoid committing environment files, credentials, or other sensitive information.

## 📄 License

Choose and add a license file, such as the MIT License, if you intend to publish the project under that license. Until a license is added, the repository should not be assumed to grant permission for unrestricted reuse.

---

**FoodTaxi — Bringing your favorite food closer to you.** 🍕🍔🍜
