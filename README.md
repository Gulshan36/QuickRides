# QuickRides

A ride-hailing application connecting passengers with drivers in real-time.

## Tech Stack

**Frontend:** React, Tailwind CSS, Vite, Google Maps  
**Backend:** Node.js, Express, MongoDB, Socket.IO  
**Authentication:** JWT, bcrypt

## Features

- User and driver authentication
- Real-time ride booking and tracking
- Live GPS location updates
- Multiple vehicle types (Car, Bike, Auto)
- In-app chat between riders and drivers
- Ride history and profile management
- Dynamic fare calculation

## Installation

Clone the repository:
```bash
git clone https://github.com/asif-khan-2k19/QuickRide.git
cd QuickRide
```

Install backend dependencies:
```bash
cd Backend
npm install
```

Install frontend dependencies:
```bash
cd ../Frontend
npm install
```

## Configuration

Create `.env` files in both Backend and Frontend directories.

**Backend/.env:**
```env
PORT=3000
MONGODB_DEV_URL=mongodb://127.0.0.1:27017/quickRide
JWT_SECRET=your_secret_key
GOOGLE_MAPS_API=your_api_key
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

**Frontend/.env:**
```env
VITE_SERVER_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_RIDE_TIMEOUT=90000
```

## Running the Application

Start the backend server:
```bash
cd Backend
npm run dev
```

Start the frontend:
```bash
cd Frontend
npm run dev
```

Access the application at `http://localhost:5173`

## License

MIT License - see [LICENSE](LICENSE) file for details.
