# API Development and Microservices

This project implements an authentication system using a microservices architecture. It consists of two separate services:

1. **Auth Service**: Handles user registration, login, and token verification
2. **Product Service**: Serves product data to authenticated users

## System Architecture

The services communicate with each other via RESTful API calls:

```
Client → Product Service → Auth Service
         (Token verification)
```

## Prerequisites

- Node.js (v14+)
- npm

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
SECRET_KEY=your_secret_key_here
AUTH_SERVICE_URL=http://localhost:4000
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the Auth Service:
   ```
   node auth-service.js
   ```

3. Start the Product Service (in a new terminal):
   ```
   node product-service.js
   ```

> **Important**: Both services must be running simultaneously for the system to work properly. The Product Service depends on the Auth Service for token verification.

## API Endpoints

### Auth Service (Port 4000)

#### Health Check
```
GET /
```
Response: Text message confirming service status

#### Register User
```
POST /api/register
```
Request body:
```json
{
  "username": "testuser",
  "password": "password123"
}
```
Response:
```json
{
  "message": "✅ User registered successfully"
}
```

#### Login User
```
POST /api/login
```
Request body:
```json
{
  "username": "testuser",
  "password": "password123"
}
```
Response:
```json
{
  "message": "✅ Login successful",
  "token": "jwt_token_here"
}
```

#### Verify Token (Internal use)
```
POST /api/verify-token
```
Headers:
```
Authorization: Bearer jwt_token_here
```
Response:
```json
{
  "valid": true,
  "user": {
    "username": "testuser",
    "iat": 1741779244,
    "exp": 1741782844
  }
}
```

### Product Service (Port 5000)

#### Health Check
```
GET /
```
Response: Text message confirming service status

#### Get Products (Protected Route)
```
GET /api/products
```
Headers:
```
Authorization: Bearer jwt_token_here
```
Response:
```json
{
  "message": "✅ Authorized access",
  "products": [
    { "id": 1, "name": "Laptop", "price": 1000 },
    { "id": 2, "name": "Phone", "price": 500 },
    { "id": 3, "name": "Tablet", "price": 300 }
  ]
}
```

## Authentication Flow

1. User registers via the `/api/register` endpoint
2. User logs in via the `/api/login` endpoint and receives a JWT token
3. User accesses protected resources by including the token in the Authorization header
4. Product Service forwards the token to Auth Service for verification
5. On successful verification, Product Service returns the requested data

## Security Features

- Password hashing using bcrypt
- JWT-based authentication with 1-hour expiration
- Token verification for protected routes
- CORS support for cross-origin requests

## Error Handling

The API returns appropriate status codes and error messages:

- 400: Bad Request (missing fields, user already exists, etc.)
- 401: Unauthorized (invalid credentials, expired token)
- 403: Forbidden (no token provided)

## Data Storage

This implementation uses in-memory storage for demonstration purposes. In a production environment, you would integrate with a database system.
