# 🤖 AI Virtual Assistant — MERN Stack

A smart, voice-enabled AI virtual assistant built using the MERN stack and modern AI tools.  
This assistant can listen, reason, speak, remember users, and adapt its name, image, and style based on user choice.

It delivers a human-like digital companion experience with secure access, speech interaction, and AI-powered replies.

---

## 🚀 Project Overview

This project shows how to build a real-time voice-based AI assistant that communicates using speech input and speech output.  
Smart replies are generated using Gemini AI, while user data is protected using token-based security.

Each user can sign up, log in, customize their assistant, and continue later with saved settings — similar to a personal AI helper.

---

## ✨ Key Features

### 🎙️ Voice Input and Output
- Uses Web Speech API  
- Converts user voice into text  
- Replies back using speech synthesis  
- Supports creative voice styles

### 🧠 Intelligent Responses
- Powered by Gemini AI  
- Context-aware replies  
- Natural conversation flow

### 🔐 Secure Authentication
- User sign up and login  
- Password encryption using bcrypt  
- Session handling using JWT

### 🖼️ Assistant Image Upload
- Image upload support  
- Cloud-based image storage  
- Fast and secure media handling

### 🎨 Full Customization
- Custom assistant name  
- Custom assistant image  
- Personalized voice style

### 👤 User Memory
- Stores user assistant settings  
- Automatically restores data after login

---

## 🛠️ Tech Stack

### Frontend
- React  
- Web Speech API  

### Backend
- Node  
- Express  

### Database
- MongoDB  

### AI Engine
- Gemini AI  

### Authentication
- JWT  
- bcrypt  

### Media Handling
- Multer  
- Cloudinary  

---

## 📁 Frontend Structure
```
frontend
├─ node_modules
├─ public
├─ src
│  ├─ assets
│  ├─ components
│  │  └─ Card.jsx
│  ├─ context
│  │  └─ UserContext.jsx
│  ├─ pages
│  │  ├─ Customize.jsx
│  │  ├─ Customize2.jsx
│  │  ├─ Home.jsx
│  │  ├─ SignIn.jsx
│  │  └─ SignUp.jsx
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
└─ vite.config.js
```

## 📁 Backend Structure

```
backend
├─ config
│  ├─ cloudinary.js
│  ├─ db.js
│  └─ token.js
├─ controllers
│  ├─ auth.controllers.js
│  └─ user.controllers.js
├─ middlewares
│  ├─ isAuth.js
│  └─ multer.js
├─ models
│  └─ user.models.js
├─ node_modules
├─ public
├─ routers
│  ├─ auth.routes.js
│  └─ user.routes.js
├─ .env
├─ .gitignore
├─ gemini.js
├─ package.json
├─ package-lock.json
└─ server.js
```
## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```
git clone https://github.com/Shakthivelk24/virtual-assistant.git
cd virtual-assistant
```
### 2️⃣ Install Dependencies
#### Backend
```
cd backend
npm install
```
#### Frontend
```
cd frontend
npm install
```
### 3️⃣ Environment Variables
Create a .env file inside the backend folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
### 4️⃣ Run the Application
#### Start Backend
```
cd backend
npm run dev
```
#### Start Frontend
```
cd frontend
npm run dev
```


---

## 🔄 Application Flow

- User signs up or logs in  
- Token validates the session  
- User customizes assistant name and image  
- Voice input captured using Web Speech API  
- Request sent to Gemini AI  
- AI reply converted to speech  
- Assistant responds like a real AI

---

## 🎯 Use Cases

- Personal AI assistant  
- Learning MERN stack with AI  
- Voice-based applications  
- Portfolio project  
- College final-year project  

---

## 🤝 Contributing

Contributions are welcome.  
You can fork the repository, raise issues, or submit pull requests.

---

## 📜 License

This project uses the MIT license.

---

## 👨‍💻 Author

**Shakthivel K**  
Full Stack Developer | MERN | AI Enthusiast

---

> “Technology becomes powerful when it listens, understands, and speaks back.”

Thanks for visiting. Keep building and keep learning 🚀
