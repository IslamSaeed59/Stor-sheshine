# SheShine Backend API

This is the backend server for the SheShine application, built with Node.js, Express, and MongoDB (Mongoose). It provides a RESTful API for managing users and their profiles.

## ✨ Features

- **User Management**: CRUD operations for users (Create, Read, Update, Delete).
- **Profile Management**: CRUD operations for user profiles.
- **Database**: Uses Mongoose ODM to manage a MongoDB database with relationships between Users and Profiles.
- **Environment-based Configuration**: Uses `.env` files for easy configuration across different environments.

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **dotenv**: For loading environment variables from a `.env` file.
- **CORS**: For enabling Cross-Origin Resource Sharing.

## 📋 Prerequisites

- Node.js (v18.x or later recommended)
- npm
- A running MongoDB instance (Local or Atlas).

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd sheshine/Backend
```

### 2. Install Dependencies

Install the required npm packages.

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `Backend` directory and add the necessary environment variables. Your `Config/db.js` file will determine the exact names, but they typically look like this:

```env
# Server Configuration
PORT=9000

# JWT Secret for Authentication
JWT_SECRET=your_super_long_and_random_secret_string_here

# Database Configuration
MONGO_URI=mongodb://localhost:27017/sheshine_db
```

### 4. Run the Application

The `index.js` file is set up to automatically connect to the database, sync the models, and start the server.

To run the server in development mode with automatic restarts, you can add a script to your `package.json`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

Then, start the server:

```bash
npm run dev
```

The server will be running on `http://localhost:9000` (or the port you specified).

## API Endpoints

The following are the currently available API routes for the `User` resource.

### User Routes

Base Path: `/users` (Note: You will need to wire this up in `index.js` e.g., `app.use('/users', userRoutes);`)

- `GET /`: Get all users.
- `POST /`: Create a new user.
- `PUT /:id`: Update a user by their ID.
- `DELETE /:id`: Delete a user by their ID.
