# Bajiger Ludo - Real Money Gaming Platform

Bajiger Ludo is a high-performance, mobile-first real-money Ludo gaming web application (PWA). It allows users to play classic Ludo, compete in battles, and win real cash rewards with instant withdrawals and a referral system.

## 🚀 Key Features

### 1. User Authentication
- **Phone + OTP Login**: Seamless entry using Twilio for real-time OTP verification.
- **Auto-Registration**: New users are automatically onboarded.
- **Referral System**: Lifetime 3% commission for referrers with unique referral codes.

### 2. Gaming & Battles
- **Real-time Ludo**: 2-player classic Ludo gameplay (Powered by Socket.io).
- **Battle System**: Create open battles with custom entry amounts or join existing ones.
- **Challenge System**: Battle with friends or random players globally.

### 3. Wallet & Payments
- **Real-time Balance**: Instant updates on wins/losses.
- **Deposit & Withdraw**: Secure UPI-based deposits and instant bank withdrawals.
- **Transaction History**: Complete ledger of all financial activities.

### 4. Admin Panel
- **Comprehensive Dashboard**: Real-time stats (Total Users, Today's Games, Revenue).
- **User Management**: View, suspend, or verify KYC of players.
- **Financial Control**: Manage and approve withdrawal requests.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **SMS Gateway**: [Twilio](https://www.twilio.com/)
- **Validation**: [Zod](https://zod.dev/)

---

## 📁 Project Structure

```bash
src/
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── admin/            # Admin Dashboard & Management
│   ├── api/              # Backend API Endpoints (Auth, Wallet, Game)
│   └── login/            # Authentication UI
├── components/           # Reusable UI Components
├── hooks/                # Custom React Hooks
├── lib/                  # Shared Utilities (Database, JWT, SMS, Socket)
├── models/               # Mongoose Database Schemas
├── socket/               # Socket.io Server-side logic
├── store/                # Zustand State Stores
└── types/                # TypeScript Interface Definitions
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ludo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔒 Security Measures
- **HTTP-only Cookies**: JWT tokens are stored securely to prevent XSS attacks.
- **Role-based Middleware**: Strict access control for Admin vs Player routes.
- **Input Validation**: All API requests are sanitized using Zod.

## 📄 License
This project is private and proprietary.
