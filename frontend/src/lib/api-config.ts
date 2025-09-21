// API configuration utility
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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