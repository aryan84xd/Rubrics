import axios from "axios";

const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔹 Ensures cookies are sent with every request
});

// 🔹 Interfaces
interface UserInfo {
  _id: string;
  sapid: string;
  name: string;
  rollNumber?: string;
  year?: string;
  role: string;
}

interface ClassInfo {
  _id: string;
  name: string;
  facultyName: string;
  courseCode: string;
  year: number;
  semester: number;
  batch: string;
  department: string;
  academicYear: string;
}

interface Assignment {
  _id: string;
  assignmentNumber: number;
  title: string;
  dateOfAssignment: string;
  dueDate: string;
  description: string;
}

interface Grade {
  studentId: UserInfo;
  assignmentNumber: number;
  title: string;
  dateOfAssignment: string;
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
  total: number;
}

// 🔹 API Functions

// Get logged-in user details
export const fetchUserDetails = async (): Promise<{ user: UserInfo }> => {
  try {
    const response = await api.get<{ user: UserInfo }>("/auth/details");
    console.log("User authenticated", response.data);
    return response.data;
  } catch {
    throw new Error("Not authenticated");
  }
};

// Get professor's classes
export const getProfClasses = async (): Promise<{ classes: ClassInfo[] }> => {
  try {
    const response = await api.get<{ classes: ClassInfo[] }>("/class/my-classes");
    console.log("Professor's classes fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch classes");
  }
};

// Get class assignments
export const getClassAssignments = async (classId: string): Promise<{ assignments: Assignment[] }> => {
  try {
    const response = await api.get<{ assignments: Assignment[] }>(`/class/${classId}/assignments`);
    console.log("Assignments fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch assignments");
  }
};

// Get class details & students
export const getClassDetails = async (classId: string): Promise<{ class: ClassInfo; students: UserInfo[] }> => {
  try {
    const response = await api.get<{ class: ClassInfo; students: UserInfo[] }>(`/class/${classId}`);
    console.log("Class details fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch class details");
  }
};

// Get grades for a student in a class
export const getGradesByClass = async (classId: string): Promise<{ grades: Grade[]; classAverage: number | null }> => {
  try {
    const response = await api.get<{ grades: Grade[]; classAverage: number | null }>(`/grade/class/${classId}`);
    console.log("Grades fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch grades");
  }
};

// Get grades for a specific assignment in a class
export const getGradesForAssignment = async (classId: string, assignmentId: string): Promise<{ grades: Grade[] }> => {
  try {
    const response = await api.get<{ grades: Grade[] }>(`/assignment/class/${classId}/assignment/${assignmentId}`);
    console.log("Grades fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching grades:", error);
    throw new Error("Failed to fetch grades");
  }
};

// 🔹 Add a Grade
export const addGrade = async (gradeData: {
  assignmentId: string;
  sapid: string;
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
}): Promise<{ message: string; grade: Grade }> => {
  try {
    const response = await api.post<{ message: string; grade: Grade }>("/grade/add", gradeData);
    console.log("Grade added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding grade:", error);
    throw new Error("Failed to add grade");
  }
};
