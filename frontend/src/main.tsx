import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./firebase.ts"; // Initialize Firebase
import { AuthProvider } from "./hooks/useAuth.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
