import axios from "axios";

interface LoginResponse {
  message: string;
  token: string;
  role: string;
  userId: string;
}

interface RegisterResponse {
  message: string;
}

interface VerifyResponse {
  userId: string;
  role: string;
}
interface UserDetails {
    user: {
        _id: string;
        sapid: string;
        name: string;
        rollNumber?: string;
        year?: string;
        role: string;
    };
}

const BASE_URL = "https://rubrics-kq04.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔹 Ensures cookies are sent with every request
});

// 🔹 Register User
export const registerUser = async (
  sapid: string,
  password: string,
  name: string,
  role: string,
  rollNumber?: string,
  year?: string
): Promise<RegisterResponse> => {
  try {
    console.log("Registering user with SAP ID:", sapid);

    const response = await api.post<RegisterResponse>("/auth/register", {
      sapid,
      password,
      name,
      role,
      rollNumber,
      year,
    });

    console.log("Registration successful", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error("Something went wrong");
  }
};

// 🔹 Login User
export const loginUser = async (
  sapid: string,
  password: string
): Promise<LoginResponse> => {
  try {
    console.log("Logging in with SAP ID:", sapid);

    const response = await api.post<LoginResponse>("/auth/login", {
      sapid,
      password,
    });

    console.log("Login successful", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Something went wrong");
  }
};

// 🔹 Verify Authentication
export const verifyUser = async (): Promise<VerifyResponse> => {
  try {
    const response = await api.get<VerifyResponse>("/auth/verify");
    console.log("User authenticated", response.data);
    return response.data; // { userId, role }
  } catch {
    throw new Error("Not authenticated");
  }
};

// 🔹 Logout User
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
    console.log("Logout successful");
  } catch {
    throw new Error("Logout failed");
  }
};

export const UserDetails = async (): Promise<VerifyResponse> => {
    try {
        const response = await api.get<VerifyResponse>("/user/me");
        console.log("User authenticated", response.data);
        return response.data; // { user: { _id, sapid, name, role, ... } }
    } catch {
        throw new Error("Not authenticated");
    }
};

export default api;
