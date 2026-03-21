# 🥗 Food D2C - Payment Testing Frontend

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

## 🔧 Features

### ✅ Authentication
- **Login**: `paymenttest@example.com` / `testpass123`
- **Register**: Create new accounts
- **JWT Token Management**: Automatic token handling

### 💳 Payment Features

#### One-Time Payments
- **Trial Box**: ₹299
- **Premium Box**: ₹599  
- **Deluxe Box**: ₹999
- **Razorpay Checkout Integration**

#### Subscriptions
- **Weekly Fresh Box**: ₹299/week
- **Monthly Premium Box**: ₹799/month
- **Automatic Razorpay Subscription Creation**

#### Subscription Management
- **View All Subscriptions**: Real-time status
- **Pause Subscriptions**: Temporary hold
- **Resume Subscriptions**: Reactivate paused
- **Cancel Subscriptions**: Permanent cancellation

### 🔄 Real-time Updates
- **Webhook Integration**: Live status sync
- **Auto-refresh**: Subscription updates
- **Status Indicators**: Visual feedback

## 🧪 Testing Scenarios

### 1. **User Flow Testing**
1. Login with test credentials
2. Create one-time payment
3. Create subscription
4. Manage subscription (pause/resume/cancel)

### 2. **Webhook Testing**
1. Create subscription from frontend
2. Cancel/pause from Razorpay Dashboard
3. Verify status updates in frontend

### 3. **Payment Flow Testing**
1. Test successful payments
2. Test payment failures
3. Verify order creation and verification

## 🔗 Backend Integration

### API Endpoints Used:
- **Auth**: `/auth/login`, `/auth/register`
- **Payments**: `/payments/create-order`, `/payments/verify-payment`
- **Subscriptions**: `/subscriptions/*`
- **Webhooks**: `/webhooks/razorpay`

### Environment Variables:
- **Backend URL**: `http://localhost:3000`
- **Razorpay Key**: `rzp_test_STZeCvuVRxPPby`

## 🎨 UI Features

### Design Elements:
- **Modern Glass-morphism UI**
- **Responsive Design**: Mobile & Desktop
- **Smooth Animations**: Hover effects & transitions
- **Status Indicators**: Color-coded subscription status
- **Loading States**: User feedback during operations

### User Experience:
- **Intuitive Navigation**: Clear sections
- **Error Handling**: User-friendly messages
- **Success Feedback**: Confirmation messages
- **Real-time Updates**: Live data sync

## 📱 Mobile Responsive

- **Mobile-first Design**: Optimized for all devices
- **Touch-friendly**: Large buttons & touch targets
- **Adaptive Layout**: Responsive grid system

## 🔒 Security Features

- **JWT Authentication**: Secure token handling
- **CORS Enabled**: Cross-origin requests
- **Input Validation**: Form validation
- **Error Sanitization**: Safe error messages

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 + CSS Grid/Flexbox
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Payment**: Razorpay Checkout

## 🧪 Development Mode

### Hot Reload:
- **Fast Refresh**: Instant updates
- **Error Overlay**: Development errors
- **Source Maps**: Easy debugging

### Development Commands:
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📊 Testing Checklist

### ✅ Authentication Tests
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Logout functionality

### ✅ Payment Tests
- [ ] Create one-time payment order
- [ ] Complete payment successfully
- [ ] Handle payment cancellation
- [ ] Verify payment signature

### ✅ Subscription Tests
- [ ] Create weekly subscription
- [ ] Create monthly subscription
- [ ] Pause active subscription
- [ ] Resume paused subscription
- [ ] Cancel subscription

### ✅ Webhook Tests
- [ ] Receive subscription.paused webhook
- [ ] Receive subscription.cancelled webhook
- [ ] Update UI in real-time
- [ ] Handle webhook errors

## 🚀 Production Deployment

### Build Commands:
```bash
npm run build
npm run preview
```

### Environment Setup:
- Update API URLs for production
- Configure production Razorpay keys
- Set up proper CORS origins

## 📞 Support

### Backend Server:
- **URL**: `http://localhost:3000`
- **Status**: Must be running for frontend to work

### Razorpay Dashboard:
- **Test Mode**: Enabled
- **Webhooks**: Configured
- **API Keys**: Test keys used

---

**🎉 Ready to test your complete payment flow!**
