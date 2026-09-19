-- Ensure PostGIS is active in your database
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer', -- 'farmer', 'admin', 'vet'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. AGROVETS & VET SERVICES TABLE (Geospatial)
CREATE TABLE agrovets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- 'agrovet', 'veterinary'
    phone VARCHAR(20),
    -- PostGIS geography column storing Longitude & Latitude (SRID 4326)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index for ultra-fast proximity queries
CREATE INDEX idx_agrovets_location ON agrovets USING GIST (location);

-- 3. CROPS PRODUCTION TABLE
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    crop_type VARCHAR(50) NOT NULL, -- 'coffee', 'sugarcane', 'avocado', 'tea'
    stage VARCHAR(50) NOT NULL, -- 'cultivation', 'weeding', 'harvest', etc.
    acreage NUMERIC(5, 2),
    planted_at DATE NOT NULL,
    expected_harvest_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. LIVESTOCK PRODUCTION TABLE
CREATE TABLE livestock (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    animal_type VARCHAR(50) NOT NULL, -- 'beef', 'dairy', 'poultry'
    tag_id VARCHAR(50),
    stage VARCHAR(50) NOT NULL, -- 'birth', 'weaning', 'milking', 'butcher', 'processing'
    birth_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. PANDEMIC & ACTIVITY ALERTS TABLE
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'pandemic', 'task_reminder', 'weather_warning'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);