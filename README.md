# Authentication System Backend

A secure authentication and authorization system built with Node.js, Express, and MongoDB.

## Features

- User registration and login
- JWT-based authentication with access and refresh tokens
- Role-based access control (user, admin)
- Token blacklisting for secure logout
- MongoDB for data storage
- Input validation with Joi
- Error handling middleware
- Rate limiting for API endpoints
- Security with Helmet

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auth-system
   CLIENT_URL=http://localhost:3000
   JWT_ACCESS_SECRET=your_access_token_secret_key
   JWT_REFRESH_SECRET=your_refresh_token_secret_key
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d
   ```
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user (requires authentication)

### User Management

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile

### Admin Routes

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Authentication Flow

1. User registers or logs in and receives access and refresh tokens
2. Access token is used for API requests (valid for 15 minutes)
3. When access token expires, use refresh token to get a new access token
4. On logout, both tokens are blacklisted

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are signed with secure secrets
- Access tokens have short expiration time
- Refresh tokens are stored in database and can be revoked
- API rate limiting prevents brute force attacks
- Helmet middleware adds security headers
