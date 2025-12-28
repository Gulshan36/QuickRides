# 🚗 QuickRides

<div align="center">
  <img src="/Frontend//public/logo-quickride-green.png" height="120px" alt="QuickRides Logo">
  
  ### *Your Journey, Our Priority*
  
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Platform](https://img.shields.io/badge/platform-web-green.svg)
  ![Status](https://img.shields.io/badge/status-active-success.svg)
</div>

---

## 🌟 Overview

**QuickRides** is a comprehensive, full-stack ride-hailing platform that bridges the gap between passengers and drivers through real-time technology. Built with cutting-edge web technologies, this application delivers seamless transportation experiences with advanced features like live GPS tracking, instant ride matching, dynamic pricing, and secure communication channels.

This project demonstrates enterprise-level architecture, scalable design patterns, and production-ready implementation of modern web development practices.

> 💡 **Star this repository** to bookmark it for future reference and to support ongoing development!

---

## 📋 What's Inside

- [🛠️ Technology Arsenal](#️-technology-arsenal)
- [🎯 Core Capabilities](#-core-capabilities)
- [📸 Visual Tour](#-visual-tour)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Configuration Guide](#️-configuration-guide)
- [🤝 Join the Community](#-join-the-community)
- [📄 Legal](#-legal)

---

## 🛠️ Technology Arsenal

### Frontend Powerhouse
- **React 18** - Modern UI with hooks and context API
- **Tailwind CSS** - Utility-first styling framework
- **Vite** - Lightning-fast build tooling
- **Google Maps SDK** - Interactive mapping and geocoding
- **Socket.IO Client** - Bidirectional event-based communication

### Backend Infrastructure  
- **Node.js & Express** - RESTful API architecture
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time WebSocket connections
- **JWT & bcrypt** - Industry-standard authentication
- **Nodemailer** - Email service integration
- **Google Maps APIs** - Distance matrix and directions services

### Development Ecosystem
```
Postman  •  ESLint  •  Nodemon  •  npm  •  Git  •  Custom Logging System
```

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,tailwind,vite,git,postman&perline=8" />
</div>

---

## 🎯 Core Capabilities

### 🔒 **Secure Access Management**
Built on JWT-based authentication with role-specific permissions for riders and captains. Features include:
- Multi-step registration with email confirmation
- Encrypted password storage using bcrypt hashing
- Password recovery via email-based reset tokens
- Protected routes with middleware authorization
- Automatic session expiry and token blacklisting

### 👤 **Profile Control Center**
Complete account management with:
- Real-time profile editing (name, contact, email)
- Complete ride history with detailed trip analytics
- Input sanitization and server-side validation
- Data consistency across all user touchpoints

### 🗺️ **Smart Location Services**
Powered by Google Maps Platform:
- Autocomplete-enabled address search
- Live GPS tracking with marker animations
- Visual route rendering with polylines
- Precise distance and duration calculations
- Geolocation-based suggestions

### 🚕 **Intelligent Ride Orchestration**
Multi-vehicle booking system supporting Cars, Bikes, and Autos with:
- Real-time availability checking
- Smart captain matching algorithm
- Status progression: Pending → Accepted → In Progress → Completed/Cancelled
- Concurrent request handling with database-level locking
- Auto-cancellation with configurable timeouts
- Dynamic fare calculation based on distance, time, and vehicle type

### ⚡ **Live Communication Hub**
WebSocket-powered real-time features:
- Instant ride status synchronization
- Live location streaming for active trips
- Private chat system between rider and assigned captain
- Message persistence with timestamp tracking
- Connection state management and auto-reconnection

### 👨‍✈️ **Captain Dashboard**
Dedicated interface for drivers featuring:
- Incoming ride request notifications
- One-tap accept/decline functionality
- Active trip monitoring
- Earnings and trip statistics
- Role-based access control

### 🛠️ **System Reliability Tools**
Built-in utilities for stability:
- Comprehensive logging to MongoDB (frontend + backend)
- Emergency data reset mechanism
- User-friendly alert notifications (success/error/warning)
- Error boundary implementation
- Performance monitoring

---

## 📸 Visual Tour

<table>
  <tr>
    <td align="center">
      <img src="./Frontend/public/screens/user-auth.png" width="400px" alt="Authentication Flow"/>
      <br />
      <b>Authentication System</b>
    </td>
    <td align="center">
      <img src="./Frontend/public/screens/user-module.png" width="400px" alt="User Dashboard"/>
      <br />
      <b>Rider Experience</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="./Frontend/public/screens/captain-module.png" width="400px" alt="Captain Interface"/>
      <br />
      <b>Captain Controls</b>
    </td>
    <td align="center">
      <img src="./Frontend/public/screens/sidebar.png" width="400px" alt="Navigation Menu"/>
      <br />
      <b>Navigation Panel</b>
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites
Ensure you have installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (local or Atlas cluster)
- Google Maps API key
- Gmail account (for nodemailer)

### Installation Steps

**Step 1: Clone Repository**
```bash
git clone https://github.com/asif-khan-2k19/QuickRide.git
cd QuickRide
```

**Step 2: Backend Setup**
```bash
cd Backend
npm install
```

**Step 3: Frontend Setup**
```bash
cd ../Frontend
npm install
```

**Step 4: Configure Environment**  
Refer to [Configuration Guide](#️-configuration-guide) below

**Step 5: Launch Services**

Terminal 1 (Backend):
```bash
cd Backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd Frontend
npm run dev
```

**Step 6: Access Application**
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## ⚙️ Configuration Guide

### Backend Environment (`Backend/.env`)

```env
# Server Configuration
PORT=3000
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
ENVIRONMENT=development
RELOAD_INTERVAL=10

# Database
MONGODB_DEV_URL=mongodb://127.0.0.1:27017/quickRide
MONGODB_PROD_URL=mongodb+srv://username:password@cluster.mongodb.net/quickRide

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# External APIs
GOOGLE_MAPS_API=AIzaSy...your_google_maps_api_key

# Email Service (Gmail)
MAIL_USER=your-email@gmail.com
MAIL_PASS=your_16_digit_app_password
```

### Frontend Environment (`Frontend/.env`)

```env
# API Endpoint
VITE_SERVER_URL=http://localhost:3000

# Application Settings
VITE_ENVIRONMENT=development
VITE_RIDE_TIMEOUT=90000
```

> ⚠️ **Security Note**: Never commit `.env` files to version control. Use `.env.example` as templates.

### Obtaining API Keys

**Google Maps API:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Maps JavaScript API, Directions API, and Distance Matrix API
4. Generate API key in Credentials section

**Gmail App Password:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Account Settings → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use the 16-character password in your `.env`

---

## 🤝 Join the Community

We're excited to welcome contributions from developers of all skill levels!

### How to Contribute

1. **Star** this repository ⭐
2. **Fork** the project
3. **Create** your feature branch:  
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Commit** with descriptive messages:  
   ```bash
   git commit -m "Add: implemented real-time notification system"
   ```
5. **Push** to your branch:  
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open** a Pull Request with detailed description

### Contribution Ideas
- 🐛 Bug fixes and error handling improvements
- ✨ New features (payment integration, ratings, etc.)
- 📝 Documentation enhancements
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🧪 Test coverage expansion

---

## 📄 Legal

This project is released under the **MIT License**. See [LICENSE](LICENSE) file for complete terms.

```
Copyright (c) 2025 QuickRides Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

<div align="center">
  
### 🌟 Built with passion for the developer community

**[Report Bug](../../issues)** • **[Request Feature](../../issues)** • **[Documentation](../../wiki)**

Made with ❤️ using React & Node.js

</div>
