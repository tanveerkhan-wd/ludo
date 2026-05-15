# GEMINI.md -  Ludo Project Brief

**Project Name:**  Ludo  
**Type:** Real Money Ludo Gaming Web Application (PWA Style)  
**Goal:** Build a high-quality clone of https://ludo.com

## Project Overview

 Ludo is a **mobile-first real-money Ludo platform** where users can:
- Play Classic Ludo (mainly 2-player)
- Deposit money via UPI
- Win real cash and withdraw instantly
- Earn lifetime 3% referral commission
- Battle with friends and random players

The app has a clean, colorful, modern gaming UI with bottom navigation.

---

## Tech Stack (Finalized)

- **Framework:** Next.js 15 (App Router) - Full Stack
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Real-time:** Socket.io
- **Database:** MongoDB + Mongoose
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Validation:** Zod

---

## Core Modules

### 1. User Module
- Phone + OTP Auth
- Referral System (Lifetime 3% commission)
- Profile & KYC
- JWT Authentication

### 2. Wallet Module
- Real-time balance
- Deposit & Withdraw
- Transaction History

### 3. Battle Module
- Create Open Battle (Enter Amount)
- Open Battles List
- Running Battles List
- Join Battle / Challenge System

### 4. Game Module (Ludo)
- Real-time 2-player Ludo Board
- Dice Roll, Token Movement
- Game Logic & Winner Declaration

### 5. Real-time System
- Live battle updates
- Live moves in game room
- Wallet balance updates

### 6. Referral & Commission
- Refer & Earn page
- Commission tracking

### 7. Support
- 24/7 WhatsApp Support
- In-app support section

---

## Project Structure (Recommended)

```bash
src/
├── app/                  # Next.js App Router
├── components/           # UI Components
├── lib/                  # Utils, socket, db
├── socket/               # Socket.io server logic
├── store/                # Zustand stores
├── types/                # TypeScript types
├── hooks/                # Custom hooks
└── middleware.ts