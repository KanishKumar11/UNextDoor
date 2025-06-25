# UNextDoor Server

This is the backend server for UNextDoor application.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   JWT_SECRET=your-secret-key
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

## Project Structure

```
server/
├── index.js          # Entry point
├── routes/           # API routes
│   └── auth.js       # Authentication routes
├── .env              # Environment variables
├── package.json      # Dependencies and scripts
└── README.md         # Documentation
```

## Notes

This is a simple implementation with in-memory storage. In a production environment, you would:

1. Use a real database (PostgreSQL as specified in the requirements)
2. Implement proper error handling and validation
3. Set up proper email sending with a service like SendGrid or Mailgun
4. Implement more security measures
5. Add logging and monitoring
