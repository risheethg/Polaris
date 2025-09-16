import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./firebase.ts"; // Initialize Firebase

createRoot(document.getElementById("root")!).render(<App />);
