// src/utils/api.ts

interface LoginResponse {
    message: string;
    token: string;
    role: string;
    userId: string;
}

export const loginUser = async (sapid: string, password: string): Promise<LoginResponse> => {
    try {
        console.log("Logging in with SAP ID:", sapid);
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sapid, password }),
            credentials: "include", // Ensures cookies are sent/received
        });
        console.log("Response:", response);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }
        console.log("Login successful");
        return response.json() as Promise<LoginResponse>;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Something went wrong");
    }
};
export async function registerUser({
  sapid,
  password,
  name,
  role,
}: {
  sapid: string;
  password: string;
  name: string;
  role: "professor";
}) {
  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sapid, password, name, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}
