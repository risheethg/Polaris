# Polaris: Your Personal Career Navigator

Polaris is an innovative web application designed to guide users on their professional journey. By leveraging AI-powered personality assessments and data-driven insights, Polaris helps users discover their ideal career paths and provides a personalized, step-by-step roadmap to achieve their goals. The platform visualizes career opportunities as a "constellation," making career exploration intuitive and inspiring.

## ✨ Features

- **AI-Powered Personality Assessment**: Utilizes the Holland Codes (RIASEC) model to analyze a user's personality and suggest fitting career clusters.
- **Interactive Career Constellation**: A 3D visualization of potential career paths, allowing users to explore various job opportunities in an engaging way.
- **Personalized Career Maps**: Generates detailed, step-by-step career roadmaps for a target role, considering the user's current profile, skills, and financial situation.
- **Skill Level Assessment**: Gauges a user's proficiency for a target role to tailor the career map more accurately.
- **User Profile Management**: Users can manage their personal, professional, and financial details to receive more refined recommendations.
- **Secure Authentication**: Uses Firebase for secure Google Sign-In and user management.

## 🛠️ Tech Stack

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Backend

**Use your preferred IDE**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: [Python](https://www.python.org/)
- **AI/LLM Integration**: [LangChain](https://www.langchain.com/) with Google Gemini
- **Database**: [Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: Firebase Admin SDK

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.
## 🚀 Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
To get the Polaris frontend running locally, follow these steps.

Follow these steps:
### Prerequisites

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project set up with Google Authentication enabled.

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>
### Installation & Setup

# Step 3: Install the necessary dependencies.
npm i
1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd Polaris/frontend
    ```

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
2.  **Install dependencies:**
    ```sh
    npm install
    ```

**Edit a file directly in GitHub**
3.  **Set up environment variables:**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.
    Create a `.env.local` file in the `frontend` directory and add your Firebase project configuration keys:

**Use GitHub Codespaces**
    ```env
    VITE_FIREBASE_API_KEY="your-api-key"
    VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    VITE_FIREBASE_APP_ID="your-app-id"
    ```

## 🐳 Docker Setup

Alternatively, you can run the entire application stack using Docker and Docker Compose.

### Prerequisites

- Docker
- A Firebase Admin SDK service account key file (`serviceAccountKey.json`).

### Running with Docker

1.  **Place Firebase credentials:** Put your `serviceAccountKey.json` file in the `backend/` directory.

2.  **Build and run the containers:**
    ```sh
    docker-compose up --build
    ```

3.  The frontend will be accessible at `http://localhost:8080` and the backend at `http://localhost:8000`.

## 📂 Project Structure

```
Polaris/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI endpoints
│   │   ├── core/         # Core logic, AI services, prompts
│   │   ├── models/       # Pydantic data models
│   │   └── main.py       # FastAPI app entry point
│   ├── serviceAccountKey.json # Firebase service account (gitignored)
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/       # Static assets (images, etc.)
│   │   ├── components/   # Reusable UI components (shadcn/ui)
│   │   ├── lib/          # Utility functions and Firebase config
│   │   ├── pages/        # Main application pages/routes
│   │   └── App.tsx       # Main app component with routing
│   ├── .env.local        # Environment variables (gitignored)
│   └── Dockerfile.dev
└── docker-compose.yaml   # Docker orchestration
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

The application includes a debug mode to accelerate testing by pre-filling forms and assessments. To enable it, append `?debug=true` to the URL on the relevant pages (`/details-form`, `/assessment`).

---

This README provides a solid foundation for your project. You can expand it further with sections on deployment and contribution guidelines.
