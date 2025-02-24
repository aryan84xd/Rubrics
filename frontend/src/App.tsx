import AppRoutes from "./routes/AppRoutes";
// import "./globals.css"
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
import RubricsDisplay from "./pages/RubricsDisplay";
import RubricsPage from "./pages/RubricsPage";

export default function App() {
  return (
    <>
      <div>
        <Router>
          <div className="content-container">
            <Routes>
              <Route path="*" element={<Navigate to="/loginprof" />} />
              <Route path="/loginprof" element={<LoginProf />} />
              <Route path="/loginstudent" element={<LoginStudent />} />
              <Route path="/regprof" element={<ProfRegister />} />
              <Route path="/regstudent" element={<StudentRegister />} />
              <Route path="/rubrics" element={<RubricsPage />} />
              {/* <Route path="/rubrics" element={<RubricsDisplay />} /> */}

              {/* <Route
                path="/rubrics"
                element={
                  <RubricsDisplay
                    entry={{
                      assignmentId: "A101",
                      rollNumber: "2024123",
                      year: 2024,
                      knowledge: 4,
                      description: 3,
                      demonstration: 5,
                      strategy: 4,
                      attitude: 5,
                    }}
                  />
                }
              /> */}

              {/* <Route path="/main" element={<MainLayout/>} /> */}
            </Routes>
          </div>
        </Router>
      </div>
    </>
    // return <AppRoutes />
  );
}
