// API configuration utility

// This line now strictly requires VITE_API_BASE_URL to be set in your environment file (.env.production).
// The build will fail if it's missing, preventing a deployment with an incorrect API URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// We add a check to ensure the app crashes loudly during development if the variable is missing.
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    users: {
      register: `${API_BASE_URL}/api/v1/users/register`,
      token: `${API_BASE_URL}/api/v1/users/token`,
      me: `${API_BASE_URL}/api/v1/users/me`,
    },
    assessments: `${API_BASE_URL}/api/v1/assessments`,
    careerMap: {
      generate: `${API_BASE_URL}/api/v1/career-map/generate`,
    },
    ml: {
      recommend: `${API_BASE_URL}/api/v1/ml/jobs/recommend`,
      clusterProfiles: `${API_BASE_URL}/api/v1/ml/jobs/cluster-profiles`,
      allJobs: `${API_BASE_URL}/api/v1/ml/jobs/all`,
    },
    levelTest: {
      generateQuiz: `${API_BASE_URL}/api/v1/level-test/generate-quiz`,
      submitQuiz: `${API_BASE_URL}/api/v1/level-test/submit-quiz`,
    }
  }
};

export default apiConfig;