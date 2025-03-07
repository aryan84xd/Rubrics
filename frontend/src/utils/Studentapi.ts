import axios from "axios";

interface StudentDetails {
  user: {
    _id: string;
    sapid: string;
    name: string;
    rollNumber?: string;
    year?: string;
    role: string;
  };
}

interface StudentClass {
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

interface StudentClassesResponse {
  classes: StudentClass[];
}

interface ClassDetails {
  _id: string;
  name: string;
  facultyName: string;
  courseCode: string;
  year: number;
  semester: number;
  batch: string;
  department: string;
  academicYear: string;
  profId: string;
}

interface Student {
  _id: string;
  name: string;
  sapid: string;
  email: string;
}

interface ClassDetailsResponse {
  class: ClassDetails;
  students: Student[];
}

interface Assignment {
  _id: string;
  assignmentNumber: number;
  title: string;
  dateOfAssignment: string;
  dueDate: string;
  description: string;
}

interface AssignmentsResponse {
  assignments: Assignment[];
}

interface Grade {
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

interface GradesResponse {
  studentDetails: StudentDetails;
  classDetails: ClassDetails;
  grades: Grade[];
  classAverage: number | null;
}



const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔹 Ensures cookies are sent with every request
});

// 🔹 Verify User (Get Logged-in User Details)
export const fetchStudentDetails = async (): Promise<StudentDetails> => {
  try {
    const response = await api.get<StudentDetails>("/auth/details");
    console.log("User authenticated", response.data);
    return response.data;
  } catch {
    throw new Error("Not authenticated");
  }
};

// 🔹 Get Student Classes
export const getStudentClasses = async (): Promise<StudentClassesResponse> => {
  try {
    const response = await api.get<StudentClassesResponse>(
      "class/my-classes-student"
    );
    console.log("Student classes fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch student classes");
  }
};

// 🔹 Get Class Details & Students
export const getClassDetails = async (
  classId: string
): Promise<ClassDetailsResponse> => {
  try {
    const response = await api.get<ClassDetailsResponse>(`/class/${classId}`);
    console.log("Class details fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch class details");
  }
};

// 🔹 Get Assignments for a Class
export const getClassAssignments = async (
  classId: string
): Promise<AssignmentsResponse> => {
  try {
    const response = await api.get<AssignmentsResponse>(
      `/class/${classId}/assignments`
    );
    console.log("Assignments fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch assignments");
  }
};

// 🔹 Get Grades for a Student in a Class
export const getGradesByClass = async (
  classId: string
): Promise<GradesResponse> => {
  try {
    const response = await api.get<GradesResponse>(`/grade/class/${classId}`);
    console.log("Grades fetched:", response.data);
    return response.data;
  } catch {
    throw new Error("Failed to fetch grades");
  }
};
export const generateRubrics = async (classId: string): Promise<void> => {
    try {
      window.open(`${BASE_URL}/pdf/generate/${classId}`, "_blank");
    } catch {
      throw new Error("Failed to fetch grades");
    }
  };
 
  