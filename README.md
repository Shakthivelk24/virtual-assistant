# 🤖 AI Virtual Assistant — MERN Stack, Android & DevSecOps

A smart, voice-enabled AI virtual assistant built using the MERN stack, Gemini AI, and modern Android technologies. The application allows users to interact with an intelligent assistant through voice and text, customize its name and appearance, and save personalized settings.

The project also incorporates **DevSecOps practices** to improve application security, automate CI/CD workflows, scan vulnerabilities, and monitor deployment health.

---

## 🚀 Project Overview

AI Virtual Assistant is a full-stack application that provides a personalized, voice-enabled AI experience. Gemini AI generates intelligent responses, while JWT authentication protects user accounts and MongoDB stores user information and assistant preferences.

The web application is packaged as an Android app using **Capacitor**, allowing users to install and access the assistant on their Android devices.

The project also explores a secure deployment workflow using DevOps and DevSecOps tools for automated building, code quality analysis, vulnerability scanning, containerization, deployment, and monitoring.

---

## ✨ Key Features

### 🎙️ Voice Input and Output
- Voice input using speech recognition.
- Text-to-speech responses.
- Hands-free interaction with the AI assistant.
- Support for configurable assistant voice settings.

### 🧠 AI-Powered Responses
- Powered by Google Gemini AI.
- Context-aware responses.
- Natural conversational interaction.

### 🔐 Secure Authentication
- User registration and sign-in.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API endpoints.

### 🖼️ Assistant Image Upload
- Upload a custom assistant image.
- Cloud-based image storage using Cloudinary.
- Personalized assistant appearance.

### 🎨 Assistant Customization
- Customize the assistant's name.
- Choose a custom assistant image.
- Personalize voice settings.

### 👤 User Preferences
- Store user-specific assistant settings.
- Restore saved settings after login.
- Provide a personalized experience for each user.

### 📱 Android Application
- Android app built using Capacitor.
- Reuses the React frontend.
- Accesses the deployed backend through HTTPS.
- Supports installation on compatible Android devices.
- Native Android packaging and launcher icon customization.

### 🛡️ DevSecOps Integration
- **Jenkins:** Automates the CI/CD pipeline.
- **SonarQube:** Analyzes code quality and identifies code issues.
- **Docker:** Builds and packages application components into containers.
- **Trivy:** Scans container images for known vulnerabilities.
- **OWASP ZAP:** Performs dynamic security testing against the running web application.
- **Kubernetes:** Supports container orchestration and deployment.
- **Prometheus:** Collects application and infrastructure metrics.
- **Grafana:** Visualizes monitoring metrics through dashboards.

The DevSecOps pipeline is designed to integrate security checks into the software delivery process. Actual pipeline stages and deployment status depend on the configured environment.

---

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5 and CSS3
- Web Speech API
- Capacitor

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB
- Mongoose

### Artificial Intelligence
- Google Gemini AI

### Authentication and Security
- JSON Web Tokens (JWT)
- bcrypt
- CORS
- Protected API routes

### Media Storage
- Multer
- Cloudinary

### Android Development
- Capacitor Android
- Android Studio
- Gradle

### DevOps and DevSecOps
- Jenkins
- Docker
- Kubernetes
- SonarQube
- Trivy
- OWASP ZAP
- Prometheus
- Grafana
- Nginx

### Deployment
- Vercel for backend hosting
- MongoDB Atlas for cloud database hosting
- Android App Bundle (`.aab`) for Google Play distribution

---

## 🏗️ Application Architecture

```text
                  Android Application
                         |
                      Capacitor
                         |
                    React Frontend
                         |
                     HTTPS REST API
                         |
                  Express.js Backend
                    /           \
                   /             \
             Gemini AI        MongoDB Atlas
                                  |
                           User Preferences

              DevSecOps CI/CD Pipeline
                         |
                      Jenkins
                         |
             +-----------+-----------+
             |           |           |
          SonarQube    Docker       Tests
                         |
                       Trivy
                         |
                  Kubernetes Deploy
                         |
                     OWASP ZAP
                         |
                Prometheus + Grafana
```

---

## 📁 Project Structure

```text
virtual-assistant/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── Card.jsx
│   │   ├── context/
│   │   │   └── UserContext.jsx
│   │   ├── pages/
│   │   │   ├── Customize.jsx
│   │   │   ├── Customize2.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── SignIn.jsx
│   │   │   └── SignUp.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── android/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── token.js
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   └── user.controllers.js
│   ├── middlewares/
│   │   ├── isAuth.js
│   │   └── multer.js
│   ├── models/
│   │   └── user.models.js
│   ├── routers/
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── metrics/
│   ├── app.js
│   ├── server.js
│   ├── gemini.js
│   └── package.json
│
├── Jenkinsfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

*The structure above is illustrative. Adjust filenames and folders to match the actual repository.*

---

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Shakthivelk24/virtual-assistant.git
cd virtual-assistant
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
PORT=5000
```

Use the exact environment variable names required by your code. Never commit real secrets to GitHub. Configure production environment variables separately in your hosting provider.

Start the backend using the script defined in `backend/package.json`, for example:

```bash
npm run dev
```

### 3. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

Configure the frontend API URL in the appropriate frontend `.env` file:

```env
VITE_SERVER_URL=https://your-deployed-backend.vercel.app/api
```

Replace the example URL with your actual backend URL.

Start the frontend:

```bash
npm run dev
```

### 4. Run the Android application

Ensure Android Studio and the required Android SDK are installed.

```bash
npm run build
npx cap sync android
npx cap open android
```

Run the application on an emulator or a connected Android device using Android Studio.

### 5. Build an Android package

For a debug APK:

```bash
cd android
gradlew.bat assembleDebug
```

The APK is usually generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

For Google Play distribution, generate a **signed Android App Bundle (`.aab`)** using Android Studio.

---

## 🔄 Application Workflow

1. A user registers or signs in.
2. The backend validates credentials and issues an authentication token.
3. The user customizes the assistant's name, image, and voice preferences.
4. Speech recognition captures voice input.
5. The frontend sends the request to the backend.
6. Gemini AI generates a response.
7. The response is displayed and spoken using the configured text-to-speech implementation.
8. User preferences are saved in MongoDB and restored after login.

---

## 🔒 DevSecOps Pipeline Workflow

The planned CI/CD workflow is:

1. **Source Control:** Code is maintained in GitHub.
2. **Continuous Integration:** Jenkins checks out the repository and executes the pipeline.
3. **Build and Test:** Dependencies are installed and application build/test steps run.
4. **Code Quality:** SonarQube analyzes source code.
5. **Containerization:** Docker builds the application images.
6. **Vulnerability Scanning:** Trivy scans container images for known vulnerabilities.
7. **Deployment:** Approved images are deployed to the configured Kubernetes environment.
8. **Dynamic Security Testing:** OWASP ZAP tests the deployed web application.
9. **Monitoring:** Prometheus collects metrics and Grafana presents dashboards.

Security thresholds, build failures, deployment approvals, and test gates should be configured in the Jenkins pipeline according to the project's requirements.

---

## 🎯 Use Cases

- Personal AI assistant.
- Voice-enabled Android application.
- AI-powered conversational interfaces.
- Full-stack MERN development project.
- Mobile app development using Capacitor.
- CI/CD automation and secure software delivery.
- Container security and application monitoring.
- Academic and portfolio demonstration.

---

## 🚀 Future Enhancements

- Add more language and voice options.
- Improve conversation history and user-controlled memory.
- Add offline-friendly application features where feasible.
- Enhance Android accessibility and background interaction.
- Expand automated unit, integration, and security tests.
- Add AI-assisted analysis to the DevSecOps monitoring dashboard.
- Improve deployment alerts and vulnerability reporting.
- Publish the Android application on Google Play after completing testing and policy requirements.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome. Fork the repository, create a branch, and submit a pull request.

---

## 📜 License

This project uses the MIT License. See the `LICENSE` file in the repository for the complete terms.

---

## 👨‍💻 Author

**Shakthivel K**

Full Stack Developer | MERN Stack | AI | Android | DevSecOps

---

*Building intelligent applications with AI, mobile technologies, and secure software delivery.*
