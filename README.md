# 🛍️ Rivaayaat – A Practical Full‑Stack E‑commerce Platform

Rivaayaat is a full‑stack e‑commerce web application built as a real‑world project, not just a demo.
The goal behind this project was to understand how **production‑level applications actually work** — from authentication and cart logic to payments, admin security, and deployment.

Every feature in Rivaayaat is implemented with proper validation, error handling, and user experience in mind.

---

## 🌟 What This Project Does

Rivaayaat allows users to browse products, manage their cart, place secure orders, and track purchases.
At the same time, it provides admins with full control over products, orders, and users.

This project reflects how a real online store works behind the scenes.

---

## 👤 User Features

- Secure user signup and login using JWT  
- Google OAuth login support  
- Browse products by category  
- Add, remove, and update items in cart  
- Razorpay-powered secure checkout  
- Order history and session persistence  
- Fully working contact form with backend integration  

---

## 🛠️ Admin Features

- Secure admin authentication with role checks  
- Product management (add, update, delete)  
- Order management and status updates  
- User access control and blocking  
- Proper session validation and security  

---

## 🧠 Focus on Correct Logic

A major focus of this project was fixing common logic mistakes seen in beginner projects:

- Authentication includes user‑blocking checks  
- Cart operations have quantity and stock limits  
- Payments are verified securely with Razorpay  
- Errors are handled gracefully on both frontend and backend  
- Admin routes are fully protected  

The intention was to make the application **reliable, secure, and realistic**.

---

## 🧰 Tech Stack

### Frontend
- React.js  
- Redux  
- Axios  
- Razorpay Checkout  
- Google OAuth  

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- Socket.IO  

### Deployment
- Render (Backend)  
- Netlify (Frontend)  
- MongoDB Atlas  

---

## 📁 Project Structure

```
Rivaayaat/
├── backend/        # Node.js + Express backend
├── summer/         # React frontend
├── DEPLOYMENT.md
├── SETUP-GUIDE.md
└── README.md
```

---

## 🚀 How to Run Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd summer
npm install
npm start
```

Backend runs on **localhost:5000**  
Frontend runs on **localhost:3000**

---

## 🔐 Environment Setup

Create a `.env` file inside the backend folder and configure:

- MongoDB connection  
- JWT secret  
- Razorpay keys  
- Google OAuth credentials  

Sample environment files and step‑by‑step instructions are included in the repository.

---

## 🌍 Deployment

- Backend deployed on **Render**
- Frontend deployed on **Netlify**
- Environment‑based CORS and cookie configuration
- Health check endpoint for production readiness

---

## 🎯 Why This Project Matters

This project helped me understand:

- How real authentication systems work  
- How to handle payments safely  
- How to protect admin routes  
- How frontend and backend communicate in production  
- How to deploy and configure a full‑stack application  

It is built with learning, clarity, and scalability in mind.

---

## 👨‍💻 Author

**Manish Tayde**  
Final‑year B.Tech CSE student (2026)  
Interested in full‑stack development and building real‑world software systems.

---

⭐ If you’re reviewing this as a recruiter or mentor — thank you for your time!
