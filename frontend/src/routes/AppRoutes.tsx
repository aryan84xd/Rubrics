import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/pages/LoginProf"
import LoginProf from "@/pages/LoginProf"
import LoginStudent from "@/pages/LoginStudent"
import ProfRegister from "@/pages/ProfRegister"
// import Dashboard from "@/pages/Dashboard"

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/loginprof" element={<LoginProf />} />
        <Route path="/loginstudent" element={<LoginStudent />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* Redirect to login if no route matches */}
        <Route path="*" element={<Navigate to="/loginprof" />} />
        <Route path="/regprof" element={<ProfRegister />} />
      </Routes>
    </Router>
  )
}
