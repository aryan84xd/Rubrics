import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LoginProf from "./pages/LoginProf";
import LoginStudent from "./pages/LoginStudent";
import ProfRegister from "./pages/ProfRegister";
import StudentRegister from "./pages/StudentReg";
import DashboardProf from "./pages/DashboardProf";
import DashboardStudent from "./pages/DashboardStudent";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/loginprof" />} />
        <Route path="/loginprof" element={<LoginProf />} />
        <Route path="/loginstudent" element={<LoginStudent />} />
        <Route path="/regprof" element={<ProfRegister />} />
        <Route path="/regstudent" element={<StudentRegister />} />
        <Route
          path="/dashboardprof"
          element={
            <ProtectedRoute allowedRoles={["professor"]}>
              <DashboardProf />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboardstudent"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardStudent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}