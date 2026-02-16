# 🚀 CivicEye – Smart City Issue Reporting System

CivicEye is a full-stack smart city issue reporting platform built using Django REST Framework and React.  
It allows citizens to report civic issues and enables administrators to manage and resolve them efficiently.

---

## 🏗 Tech Stack

### Backend
- Django
- Django REST Framework
- JWT Authentication
- Role-Based Access Control
- Geo-location filtering
- Priority Scoring Logic

### Frontend
- React
- Tailwind CSS
- React Router
- Axios

---

## 👥 User Roles

- USER → Report issues and track status
- WORKER → View assigned issues
- ADMIN → Assign issues, update status, view analytics

---

## 🔥 Key Features

- Secure JWT Authentication
- Role-Based API Filtering
- Issue Reporting with Image & Geo Location
- Auto Priority Scoring System
- Admin Dashboard Analytics
- Nearby Issues Filtering (Geo-radius search)
- Modern Glassmorphism UI

---

## 📊 Smart Features

- Category-based dynamic priority scoring
- Status-based urgency adjustment
- Haversine formula for location-based filtering
- Admin-only analytics dashboard

---

## ⚙️ Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

cd frontend
npm install
npm start

📌 Future Improvements

Email/SMS notifications

Real-time updates

Mobile app integration

AI-based issue categorization



👨‍💻 Developed By

Aman – Final Year B.Tech Student