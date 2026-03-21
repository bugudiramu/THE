# Food D2C Backend API

A comprehensive NestJS backend for a modern food D2C (Direct-to-Consumer) store with Razorpay payment gateway integration and subscription features.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Payment Gateway**: Full Razorpay integration for one-time payments and subscriptions
- **Subscription Management**: Weekly and monthly subscription plans with pause/resume/cancel functionality
- **Product Catalog**: Complete product management system
- **Order Management**: Order tracking and status updates
- **User Management**: Customer profiles and admin controls
- **API Documentation**: Auto-generated Swagger documentation
- **Database**: PostgreSQL with TypeORM
- **Validation**: Input validation with class-validator
- **CORS**: Cross-origin resource sharing enabled

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Payment Gateway**: Razorpay
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Razorpay account (for payment features)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd food-d2c-backend
```

2. Install dependencies

```bash
npm install
```

3. Environment setup

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=food_d2c

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App Configuration
PORT=3000
NODE_ENV=development
```

### Database Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE food_d2c;
```

2. The application will automatically create tables on startup (in development mode)

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, visit `http://localhost:3000/api` for interactive Swagger documentation.

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Payments

- `POST /payments/create-order` - Create a payment order
- `POST /payments/verify-payment` - Verify payment
- `POST /payments/create-subscription-plan` - Create subscription plan
- `POST /payments/create-subscription` - Create subscription
- `POST /payments/cancel-subscription` - Cancel subscription
- `POST /payments/pause-subscription` - Pause subscription
- `POST /payments/resume-subscription` - Resume subscription

### Subscriptions

- `POST /subscriptions` - Create new subscription
- `GET /subscriptions/my` - Get user subscriptions
- `GET /subscriptions/:id` - Get subscription by ID
- `PUT /subscriptions/:id/pause` - Pause subscription
- `PUT /subscriptions/:id/resume` - Resume subscription
- `PUT /subscriptions/:id/cancel` - Cancel subscription
- `GET /subscriptions/admin/all` - Get all subscriptions (Admin)
- `GET /subscriptions/admin/stats` - Get subscription stats (Admin)

### Health Check

- `GET /` - Basic health check
- `GET /health` - Detailed health check

## Test Data

The application includes a seed service that creates test users and products. To seed the database:

```bash
# This will be executed automatically on first run in development
# or you can trigger it manually via the API
```

### Test Users

- **Customer**: `john.doe@example.com` / `password123`
- **Customer**: `jane.smith@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### Test Products

- Fresh Organic Vegetables Box - ₹299
- Farm Fresh Eggs - ₹120
- Organic Fruits Basket - ₹399
- Artisanal Bread - ₹80
- Local Honey - ₹250

## Razorpay Integration

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay dashboard
3. Add the keys to your `.env` file
4. Test with Razorpay test mode first

## Subscription Flow

1. Create a subscription plan via `/payments/create-subscription-plan`
2. Create a subscription for a user via `/payments/create-subscription`
3. Manage subscriptions via `/subscriptions/*` endpoints
4. Razorpay will handle recurring payments automatically

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Style

The project uses ESLint and Prettier for code formatting. Run:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t food-d2c-backend .
```

2. Run the container:

```bash
docker run -p 3000:3000 --env-file .env food-d2c-backend
```

### Cloud Deployment

The application can be deployed to any cloud platform that supports Node.js:

- AWS (Elastic Beanstalk, ECS, Lambda)
- Google Cloud Platform
- Azure
- Heroku
- DigitalOcean

## Security Considerations

- All endpoints are protected with JWT authentication (except auth endpoints)
- Input validation is implemented for all DTOs
- Environment variables are used for sensitive configuration
- CORS is configured for cross-origin requests
- Passwords are hashed with bcrypt

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
