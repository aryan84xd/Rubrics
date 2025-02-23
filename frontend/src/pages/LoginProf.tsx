"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import "@/index.css"

export default function LoginProf() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (email && password) {
      console.log("Login attempted with:", { email, password })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setError("Invalid email or password. Please try again.")
    } else {
      setError("Please enter both email and password.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-black">
      <Card className="w-full max-w-md bg-white shadow-lg p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black text-center">Professor Login</CardTitle>
          <CardDescription className="text-center text-black">Access the Rubrics System</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-start">
                <Label htmlFor="email" className="text-black">Email</Label>
              </div>
              <Input
                className="text-black"
                id="email"
                type="email"
                placeholder="professor@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-start">
                <Label htmlFor="password" className="text-black">Password</Label>
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
          <CardFooter className="pt-8">
            <Button type="submit" className="p-5">
              Log In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
