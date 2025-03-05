import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "@/index.css";
import { loginUser } from "../utils/Authapi";

export default function LoginStudent() {
  const [sapid, setSapid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (sapid && password) {
      try {
        const data = await loginUser(sapid, password);
        console.log("Login successful:", data);
        navigate("/dashboardstudent"); // Redirect to student dashboard
        // Handle successful login, e.g., store token or redirect
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      }
    } else {
      setError("Please enter both SAP ID and password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-black">
      <Card className="w-full max-w-md bg-white shadow-lg p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black text-center">
            Student Login
          </CardTitle>
          <CardDescription className="text-center text-black">
            Access the Rubrics System
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-start">
                <Label htmlFor="sapid" className="text-black">
                  SAP ID
                </Label>
              </div>
              <Input
                className="text-black"
                id="sapid"
                type="text"
                placeholder="Enter your SAP ID"
                value={sapid}
                onChange={(e) => setSapid(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-start">
                <Label htmlFor="password" className="text-black">
                  Password
                </Label>
              </div>
              <Input
                className="text-black"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-8 flex justify-between">
            <div className="flex space-x-4">
              <Button type="submit" className="p-5">
                Log In
              </Button>
              <Link to="/regstudent">
                <Button variant="outline">Register</Button>
              </Link>
              <Link to="/loginprofessor">
                <Button variant="outline">Professor Login</Button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
