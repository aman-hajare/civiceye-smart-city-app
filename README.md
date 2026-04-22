# 🚀 CivicEye – Smart City Reporting & Monitoring System

CivicEye is a full-stack smart city platform that enables citizens to report civic issues in real-time using images and location data. The system ensures efficient communication between users, administrators, and workers with real-time notifications, AI-based validation, and geo-location tracking.

---

## 🌟 Features

* 📌 **Real-Time Issue Reporting** (with image & location)
* 🔐 **JWT Authentication & Role-Based Access Control (Admin / Worker / User)**
* 🔔 **Real-Time Notifications** using WebSockets (Django Channels)
* 📍 **Geo-Location Based Filtering** (Haversine Formula)
* 🤖 **AI-Based Image Validation** to prevent spam
* 📊 **Admin Dashboard & Analytics**
* 🔎 **Search, Filter, and Sorting APIs**
* 📱 **Mobile-Friendly Responsive UI**

---

## 🛠 Tech Stack

**Backend:**

* Python
* Django
* Django REST Framework (DRF)
* JWT Authentication (SimpleJWT)
* Django Channels (WebSockets)

**Frontend:**

* React.js
* Tailwind CSS
* Axios
* React Router

**Database:**

* SQLite (Development)

**Other:**

* Geo-location (Latitude/Longitude)
* Haversine Distance Algorithm
* AI Image Validation (Pre-trained Model)

---

## 🧠 System Architecture

User (Browser / Mobile)
↓
React Frontend
↓
REST API (Django DRF)
↓
Database (SQLite)
↓
WebSocket Layer (Django Channels)

---

## 🔐 Authentication Flow

* User logs in → JWT Token generated
* Token stored in frontend
* Token sent in API headers
* Backend validates and authorizes request

---

## 🔔 Real-Time Notification Flow

Event (Issue Assigned / Resolved)
↓
Backend triggers notification
↓
Channels Layer
↓
WebSocket Push
↓
Frontend updates instantly

---

## 📍 Geo-Location Feature

* Captures real-time user location using browser Geolocation API
* Stores latitude & longitude in database
* Uses Haversine formula to filter nearby issues

---

## 🤖 AI Image Validation

* Uses pre-trained model to classify uploaded image
* Matches predicted category with selected category
* Rejects invalid or spam images

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/civiceye.git
cd civiceye
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌐 Environment Variables

Create `.env` file in frontend:

```
REACT_APP_API_URL=http://localhost:8000/api
```


---

## 📌 Future Enhancements

* 📱 Mobile App (React Native)
* ☁️ Cloud Deployment (AWS / Render)
* 📊 Advanced Analytics Dashboard
* 📧 Email/SMS Notifications
* 🗺 Full Map Integration (Google Maps / Mapbox)

---

## 👨‍💻 Author

**Aman**
Final Year B.Tech (AI & DS)
Backend & Full-Stack Developer

---

## 📜 License

This project is for educational purposes.

---

⭐ If you like this project, don’t forget to star the repository!
