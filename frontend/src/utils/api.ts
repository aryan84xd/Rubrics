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
const BASE_URL = "http://localhost:8080";
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

        const response = await axios.post<RegisterResponse>(
            `${BASE_URL}/auth/register`,
            { sapid, password, name, role, rollNumber, year },
            { withCredentials: true } // Ensures cookies are sent/received
        );

        console.log("Registration successful", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Registration failed");
        }
        throw new Error("Something went wrong");
    }
};

export const loginUser = async (sapid: string, password: string): Promise<LoginResponse> => {
    try {
        console.log("Logging in with SAP ID:", sapid);
        
        const response = await axios.post<LoginResponse>(
            `${BASE_URL}/auth/login`,
            { sapid, password },
            { withCredentials: true } // Ensures cookies are sent/received
        );

        console.log("Login successful", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || "Login failed");
        }
        throw new Error("Something went wrong");
    }
};
