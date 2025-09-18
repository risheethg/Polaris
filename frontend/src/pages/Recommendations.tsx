import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDebug } from '@/context/DebugContext';

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  skillMatch: number; // Cosine similarity score (0 to 1)
  personalityFit: string; // e.g., "Artistic", "Investigative"
}

// Dummy data for development
const dummyJobs: JobRecommendation[] = [
  { id: '1', title: 'Senior Frontend Developer', company: 'Tech Solutions Inc.', skillMatch: 0.92, personalityFit: 'Investigative' },
  { id: '2', title: 'UI/UX Designer', company: 'Creative Minds LLC', skillMatch: 0.88, personalityFit: 'Artistic' },
  { id: '3', title: 'Backend Engineer (Python)', company: 'DataCore', skillMatch: 0.85, personalityFit: 'Realistic' },
  { id: '4', title: 'Product Manager', company: 'Innovate Co.', skillMatch: 0.81, personalityFit: 'Enterprising' },
  { id: '5', title: 'DevOps Specialist', company: 'CloudNine', skillMatch: 0.78, personalityFit: 'Conventional' },
];

const Recommendations: React.FC = () => {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDebugMode } = useDebug();

  const cluster = location.state?.cluster || 'Unknown Cluster';

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      // TODO: Replace with actual backend API call
      // The backend will perform cosine similarity search within the 'cluster'
      // and return a ranked list of jobs.
      if (isDebugMode) {
        console.log(`[Debug] Using dummy data for cluster: ${cluster}`);
        // Simulate network delay
        setTimeout(() => {
          setRecommendations(dummyJobs);
          setLoading(false);
        }, 1000);
      } else {
        // Real fetch logic will go here.
        // For now, we'll just show a loading state.
        console.log(`[Production] Waiting for backend implementation for cluster: ${cluster}`);
        setRecommendations([]);
        // In a real scenario, you might keep it loading indefinitely or show a message.
        // For this example, we'll just stop loading after a bit.
        setTimeout(() => setLoading(false), 3000);
      }
    };

    fetchRecommendations();
  }, [isDebugMode, cluster]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Top Job Recommendations
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Based on your skills and personality profile for the <span className="font-semibold text-indigo-700">{cluster}</span> cluster.
        </p>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-700">Finding the best jobs for you...</p>
            {/* You can add a spinner here */}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {recommendations.map((job) => (
                <li key={job.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-indigo-600 truncate">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        Skill Match: {(job.skillMatch * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Personality Fit: {job.personalityFit}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500">No recommendations found. The backend might not be ready yet.</p>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
