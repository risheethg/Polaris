# Polaris: Your Personal Career Navigator

Polaris is an innovative web application designed to guide users on their professional journey. By leveraging AI-powered personality assessments and data-driven insights, Polaris helps users discover their ideal career paths and provides a personalized, step-by-step roadmap to achieve their goals. The platform visualizes career opportunities as a "constellation," making career exploration intuitive and inspiring.

## 🌐 Live Application

**🚀 [Access Polaris Live Application](https://career-planner-frontend-339983439986.us-central1.run.app)**

- **Frontend**: https://career-planner-frontend-339983439986.us-central1.run.app
- **Backend API**: https://career-planner-api-339983439986.us-central1.run.app
- **API Documentation**: https://career-planner-api-339983439986.us-central1.run.app/docs

## ✨ Features

- **AI-Powered Personality Assessment**: Utilizes the Holland Codes (RIASEC) model to analyze a user's personality and suggest fitting career clusters.
- **Interactive Career Constellation**: A 3D visualization of potential career paths, allowing users to explore various job opportunities in an engaging way.
- **Personalized Career Maps**: Generates detailed, step-by-step career roadmaps for a target role, considering the user's current profile, skills, and financial situation.
- **Skill Level Assessment**: Gauges a user's proficiency for a target role to tailor the career map more accurately.
- **User Profile Management**: Users can manage their personal, professional, and financial details to receive more refined recommendations.
- **Secure Authentication**: Uses Firebase for secure Google Sign-In and user management.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Deployment**: [Google Cloud Run](https://cloud.google.com/run)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: [Python](https://www.python.org/)
- **AI/LLM Integration**: [LangChain](https://www.langchain.com/) with Google Gemini
- **Database**: [Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: Firebase Admin SDK
- **Deployment**: [Google Cloud Run](https://cloud.google.com/run)

### Infrastructure
- **Containerization**: Docker
- **Container Registry**: Google Container Registry
- **Cloud Platform**: Google Cloud Platform
- **CI/CD**: Docker + Google Cloud Run
## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (for local development)
- A Firebase project set up with Google Authentication enabled
- Google Cloud Platform account (for deployment)

### Local Development Setup

#### Frontend Setup
```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd CareerPlanner/frontend

# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file and add your Firebase configuration
cp .env.local.template .env.local
# Edit .env.local with your Firebase config

# Start the development server
npm run dev
```

#### Backend Setup
```sh
# Navigate to backend directory
cd ../backend

# Install Python dependencies
pip install -r requirements.txt

# Set up Firebase credentials
# Place your firebase-key.json file in the backend directory

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### Docker Development
```sh
# Build and run both frontend and backend
docker-compose up --build

# Frontend will be available at http://localhost:8080
# Backend will be available at http://localhost:8000
```

## 🐳 Docker Setup

### Local Docker Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd CareerPlanner

# Place your Firebase service account key
# Copy firebase-key.json to the backend/ directory

# Build and run the containers
docker-compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

## ☁️ Cloud Deployment

The application is deployed on Google Cloud Platform using Cloud Run for both frontend and backend services.

### Deployment Architecture
- **Frontend**: Containerized React app deployed to Google Cloud Run
- **Backend**: Containerized FastAPI app deployed to Google Cloud Run  
- **Database**: Google Firestore (NoSQL)
- **Authentication**: Firebase Auth with Google Sign-In
- **Container Registry**: Google Container Registry

### Environment Configuration

#### Frontend Environment Variables (.env.production)
```env
VITE_API_BASE_URL=https://career-planner-api-339983439986.us-central1.run.app
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

#### Backend Configuration
- Firebase service account key mounted as secret in Cloud Run
- CORS configured for cross-origin requests
- Health checks enabled for Cloud Run

## 📂 Project Structure

```
CareerPlanner/
├── backend/
│   ├── app/
│   │   ├── core/          # Core configurations (DB, Firebase, Security)
│   │   ├── models/        # Pydantic data models
│   │   ├── repos/         # Data access layer
│   │   ├── routes/        # FastAPI route handlers
│   │   ├── services/      # Business logic services
│   │   └── main.py        # FastAPI app entry point
│   ├── scripts/           # ML training scripts and models
│   ├── logger/            # Application logs
│   ├── firebase-key.json  # Firebase service account (gitignored)
│   ├── Dockerfile.api     # Production Docker image
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components (shadcn/ui)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Main application pages/routes
│   │   ├── context/       # React context providers
│   │   └── App.tsx        # Main app component with routing
│   ├── .env.production    # Production environment variables
│   ├── Dockerfile.frontend # Production Docker image
│   └── package.json       # Frontend dependencies
├── scraper/               # Job data scraping utilities
└── docker-compose.yaml   # Local development orchestration
```

## ⚙️ Key Components & Pages

-   **`Landing.tsx`**: The entry point of the application, featuring the sign-in flow.
-   **`PersonalDetailsForm.tsx`**: Collects user's professional and financial information.
-   **`Assessment.tsx`**: The RIASEC personality assessment quiz.
-   **`Results.tsx`**: Displays the user's personality profile results after the assessment.
-   **`Dashboard.tsx`**: The main dashboard showing the 3D career constellation.
-   **`LevelAssessment.tsx`**: A quiz to determine a user's skill level for a specific job.
-   **`CareerMap.tsx`**: Visualizes the AI-generated, step-by-step career path.
-   **`Profile.tsx`**: User profile page with personality chart and options to update details or retake assessments.

## 💡 Debug Mode

The application includes a debug mode to accelerate testing by pre-filling forms and assessments. To enable it, append `?debug=true` to the URL on the relevant pages:

- Personal Details Form: `/details-form?debug=true`
- Assessment: `/assessment?debug=true`

## 🔧 API Endpoints

The backend provides a comprehensive REST API. Key endpoints include:

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/token` - User login
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user details
- `POST /api/v1/assessments` - Submit personality assessment
- `POST /api/v1/career-map/generate` - Generate career roadmap
- `GET /api/v1/ml/jobs/recommend` - Get job recommendations
- `POST /api/v1/level-test/generate-quiz` - Generate skill assessment

Full API documentation is available at: https://career-planner-api-339983439986.us-central1.run.app/docs

## 🚀 Deployment Instructions

### Prerequisites
- Google Cloud Platform account
- Docker installed locally
- Firebase project with authentication enabled

### Deploy to Google Cloud Run

1. **Set up environment variables:**
   ```powershell
   $env:PROJECT_ID = "your-gcp-project-id"
   $env:REGION = "us-central1"
   $env:FRONTEND_IMAGE_URI = "gcr.io/$env:PROJECT_ID/career-planner-frontend"
   $env:API_IMAGE_URI = "gcr.io/$env:PROJECT_ID/career-planner-api"
   ```

2. **Build and push frontend:**
   ```powershell
   cd frontend
   docker build -t $env:FRONTEND_IMAGE_URI -f Dockerfile.frontend .
   docker push $env:FRONTEND_IMAGE_URI
   gcloud run deploy career-planner-frontend --image=$env:FRONTEND_IMAGE_URI --platform=managed --region=$env:REGION --allow-unauthenticated --port=80
   ```

3. **Build and push backend:**
   ```powershell
   cd ../backend
   docker build -t $env:API_IMAGE_URI -f Dockerfile.api .
   docker push $env:API_IMAGE_URI
   gcloud run deploy career-planner-api --image=$env:API_IMAGE_URI --platform=managed --region=$env:REGION --allow-unauthenticated --port=8080
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Holland Codes (RIASEC)](https://en.wikipedia.org/wiki/Holland_Codes) for the personality assessment framework
- [Google Gemini](https://ai.google.dev/) for AI-powered career insights
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Firebase](https://firebase.google.com/) for authentication and database services

---

**Built with ❤️ for career explorers everywhere**
