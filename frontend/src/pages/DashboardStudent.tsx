import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { fetchStudentDetails, getStudentClasses, getGradesByClass, generateRubrics } from "@/utils/Studentapi";
import { GradesTable } from "@/components/GradesTable";

interface StudentDetails {
  user: {
    _id: string;
    sapid: string;
    name: string;
    year?: string;
    role: string;
  };
}

interface StudentClass {
  _id: string;
  name: string;
  facultyName: string;
  courseCode: string;
  semester: number;
  batch: string;
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
  gradingScheme: Record<string, number>; // Add this property
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
  [key: string]: number | string; // Add this to make it compatible
}
interface GradesResponse {
  studentDetails: StudentDetails;
  classDetails: ClassDetails;
  grades: Grade[];
  classAverage: number | null;
}
export default function DashboardStudent() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const studentData = await fetchStudentDetails();
        const classData = await getStudentClasses();
        setStudent(studentData);
        setClasses(classData.classes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const fetchGrades = async (classId: string) => {
    try {
      const gradesData = await getGradesByClass(classId) as GradesResponse;
      setGrades(gradesData);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };
  
  const handleGenerateRubrics = async () => {
    if (!selectedClass) return;

    setIsLoading(true);
    try {
      await generateRubrics(selectedClass);
    } catch (error) {
      console.error("Error generating rubrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    fetchGrades(classId);
  };

  const handleLogout = () => {
    navigate("/loginprof");
      
  };
 console.log("grades", grades);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white shadow-md px-6 py-4 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <div className="flex items-center gap-4">
          {student && (
            <span className="text-sm font-medium text-gray-600">
              {student.user.name} ({student.user.sapid})
            </span>
          )}
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      {/* Content Container */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <aside className="w-1/5 bg-white border-r shadow-sm p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Classes</h2>
          <Separator className="mb-4" />
          <div className="space-y-2">
            {classes.map((cls) => (
              <Button
                key={cls._id}
                variant={selectedClass === cls._id ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => handleClassSelect(cls._id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{cls.name}</span>
                  <span className="text-xs text-gray-500">{cls.courseCode}</span>
                </div>
              </Button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-4/5 bg-gray-50 p-6 overflow-y-auto">
          {selectedClass ? (
            grades ? (
              <GradesTable
                classId={selectedClass}
                grades={grades}
                isLoading={isLoading}
                onGenerateRubrics={handleGenerateRubrics}
              />
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p className="text-lg">Loading grades...</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-lg mb-4">Select a class to view grades</p>
                <p className="text-sm text-gray-400">
                  Choose a class from the sidebar to see your assignment grades
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}