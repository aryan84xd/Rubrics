import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DashboardProf() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session and redirect to login
    navigate("/loginprof");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold">Welcome to the Professor Dashboard</h1>
      <Button onClick={handleLogout} className="mt-4">
        Log Out
      </Button>
    </div>
  );
}
