# 🛡️ SAHAAY — AI Disaster Management System
### Admin Dashboard

<div align="center">

![SAHAAY Banner](https://img.shields.io/badge/SAHAAY-Disaster%20Management-red?style=for-the-badge&logo=shield&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)

**Real-time AI-powered disaster prediction, SOS tracking, and rescue coordination system**

[🔴 Live Demo](https://sahaay-jet.vercel.app) • [📖 API Docs](https://sahaay-production.up.railway.app/docs) • [🆘 Citizen App](https://sahaay-citizen.vercel.app)

</div>

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Live Map
![Live Map](./screenshots/livemap.png)

### Send Alert
![Send Alert](./screenshots/sendalert.png)

### SOS Feed
![SOS Feed](./screenshots/sosfeed.png)

---

## ✨ Features

### 🤖 AI & Predictions
- **Random Forest ML Models** for 4 disaster types — Flood, Earthquake, Heatwave, Air Quality
- **Live weather integration** via OpenWeatherMap API
- **Real-time risk scoring** (0–100) with confidence levels
- **Prediction trend charts** with historical data

### 🛰️ India Surveillance Radar
- **Animated radar** with live sweep across India map
- **350+ coordinate points** for accurate India border
- **7 disaster-prone zones** highlighted — Odisha, West Bengal, Andhra Pradesh, Tamil Nadu, Assam, Bihar, Uttar Pradesh
- **28 States + 8 UTs** marked with real geographic coordinates
- **15 major cities** monitored with risk indicators
- **Live SOS blips** on radar when signals arrive

### 🆘 SOS Management
- **Real-time WebSocket** feed for incoming SOS signals
- **Priority classification** — CRITICAL / HIGH / MEDIUM / LOW
- **GPS location tracking** with Google Maps integration
- **Media uploads** — photos and videos from citizens
- **One-click resolve** with audit trail

### 🗺️ Live Rescue Map
- **Leaflet.js** interactive map with satellite/street toggle
- **4 rescue teams** (Alpha/Bravo/Charlie/Delta) with real-time status
- **Team assignment** to SOS signals with route lines
- **Multi-team rescue planner** with OSRM route optimization
- **Nearest-neighbour algorithm** for optimal stop ordering

### 📊 City Monitor
- **5 Punjab cities** monitored — Ludhiana, Chandigarh, Amritsar, Jalandhar, Patiala
- **Auto-refresh** every 10 minutes
- **Risk trend charts** — temperature, rainfall, wind speed
- **Auto-alerts** for HIGH/CRITICAL risk levels

### 📢 Alert System
- **Multi-channel broadcasting** — App, SMS, WhatsApp, IVR Call
- **Twilio integration** for SMS and voice calls
- **Zone-based targeting** for specific cities
- **Alert history** with full audit log

### 📰 News Feed
- **Live disaster news** from GNews API
- **Category filtering** — Flood, Earthquake, Heatwave, Cyclone
- **India-specific** disaster news

### 👥 Contact Book
- **Emergency contact management** by zone
- **Bulk SMS/IVR** to zone contacts
- **CRUD operations** with PostgreSQL persistence

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Charts** | Recharts |
| **Maps** | Leaflet.js, React-Leaflet |
| **Backend** | FastAPI (Python 3.11) |
| **Database** | PostgreSQL 15 |
| **ML Models** | Scikit-learn (Random Forest) |
| **Real-time** | WebSockets |
| **Weather** | OpenWeatherMap API |
| **SMS/IVR** | Twilio |
| **Routing** | OSRM (Open Source Routing Machine) |
| **Deploy FE** | Vercel |
| **Deploy BE** | Railway |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Frontend Setup
```bash
# Clone the repo
git clone https://github.com/vanshrana2k5/Sahaay.git
cd Sahaay/admin-dashboard

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

### Backend Setup
```bash
cd Sahaay/Backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
DATABASE_URL=postgresql://postgres:password@localhost:5432/sahaay_db
OPENWEATHER_API_KEY=your_key_here
SECRET_KEY=your_secret_key

# Run the server
uvicorn main:app --reload
```

### Database Setup
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE sahaay_db;
\q

# Tables are auto-created on first run
```

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| 🛡️ Admin Dashboard | https://sahaay-jet.vercel.app |
| 🆘 Citizen App | https://sahaay-citizen.vercel.app |
| ⚡ Backend API | https://sahaay-production.up.railway.app |
| 📖 API Docs | https://sahaay-production.up.railway.app/docs |

---
## 🔐 Demo Access

> Try the live admin dashboard using the credentials below.

| Field | Value |
|-------|-------|
| 🌐 **Dashboard URL** | https://sahaay-jet.vercel.app |
| 👤 **Username** | admin |
| 🔑 **Password** | sahaay123 |

---
## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── MapView.jsx          # Leaflet rescue map
│   │   ├── SOSFeed.jsx          # Real-time SOS feed
│   │   ├── CityAlertSender.jsx  # Alert broadcasting
│   │   ├── RiskBanner.jsx       # Risk level display
│   │   └── StatsPanel.jsx       # Dashboard stats
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main dashboard + India radar
│   │   ├── MapPage.jsx          # Live map page
│   │   ├── MonitorPage.jsx      # City monitoring
│   │   ├── AlertPage.jsx        # Send alerts
│   │   ├── ContactBook.jsx      # Emergency contacts
│   │   ├── HistoryPage.jsx      # SOS history
│   │   ├── NewsFeedPage.jsx     # Disaster news
│   │   └── SettingsPage.jsx     # App settings
│   ├── services/
│   │   └── api.js               # API service layer
│   └── context/
│       └── ThemeContext.jsx      # Dark/light mode

Backend/
├── main.py                      # FastAPI app + all routes
├── database/                    # PostgreSQL models & connection
├── ml/                          # Random Forest ML models
├── monitor.py                   # City risk monitoring
├── weather.py                   # OpenWeatherMap integration
└── prediction.py                # Risk prediction logic
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/dashboard` | Dashboard stats + weather |
| GET | `/weather/{city}` | Live weather data |
| POST | `/predict/all` | AI disaster prediction |
| GET | `/monitor` | City risk snapshots |
| POST | `/sos` | Submit SOS signal |
| GET | `/sos/all` | All SOS signals |
| PUT | `/sos/{id}/resolve` | Resolve SOS |
| POST | `/alerts` | Create alert |
| GET | `/contacts` | Get contacts |
| WS | `/ws/sos` | WebSocket SOS feed |

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| **Vansh Rana** | Full Stack Developer |
| **Mansi** | Full Stack Developer |

---

## 📄 License

This project is built for educational and humanitarian purposes.

---

<div align="center">

**Built with ❤️ for disaster relief and emergency response**

⭐ Star this repo if you find it useful!

</div>
