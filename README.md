# 🌾 Agritech Management & Analytics Engine

A high-performance PERN stack platform for real-time agronomic monitoring, localized weather risk alerts, spatial agrovet lookup, inventory management, and yield tracking.

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Recharts, Leaflet / OpenStreetMap
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with PostGIS for spatial queries)
- **APIs & Tools:** Open-Meteo Weather API, Twilio WhatsApp API, JWT Authentication

## 🚀 Key Modules
1. **Real-time Weather & Insights:** Atmospheric metrics and rule-based spraying/irrigation guidance.
2. **Spatial Agrovet Map:** Geospatial search for nearby agricultural suppliers using PostGIS.
3. **Automated Risk Advisories:** Disease and pest warnings with optional WhatsApp dispatch.
4. **Inventory & Inputs Tracker:** Stock management with custom low-level reorder thresholds.
5. **Yield Analytics Engine:** Time-series yield visualisation and CSV report exporter.

## 📦 Setup & Installation
1. Clone the repository: `git clone https://github.com/kevinwandei08/agritech-platform.git`
2. Install server dependencies: `cd server && npm install`
3. Install client dependencies: `cd client && npm install`
4. Copy `.env.example` to `.env` in the server directory and configure your PostgreSQL database.
5. Run the development server: `npm run dev`
