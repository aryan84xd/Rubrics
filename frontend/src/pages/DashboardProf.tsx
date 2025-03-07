import React, { useState, useEffect, useRef } from "react";
import {
  getProfClasses,
  getClassAssignments,
  getGradesForAssignment,
  getClassDetails,
  addGrade,
} from "@/utils/ProffApi";

// Import our new components
import Header from "@/components/Header";
import ClassSidebar from "@/components/ClassSidebar";
import AssignmentSelection from "@/components/AssignmentSelection";
import AssignmentDetailsCard from "@/components/AssignmentDetailsCard";
import StudentGradesTable from "@/components/StudentGradesTable";
import GradeDialog from "@/components/GradeDialog";
import EmptyState from "@/components/EmptyState";

// TypeScript Interfaces
interface Professor {
  name: string;
  id?: string;
}

interface Class {
  _id: string;
  name: string;
  courseCode: string;
}

interface Assignment {
  _id: string;
  title: string;
  assignmentNumber: number;
  description: string;
  dateOfAssignment: string;
}

interface Student {
  _id: string;
  sapid: string;
  name: string;
}

interface Grade {
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
  total: number;
}

interface GradeForm {
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
}

const DashboardProf: React.FC = () => {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeForm>({
    knowledge: 0,
    description: 0,
    demonstration: 0,
    strategy: 0,
    attitude: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Mock professor data - in a real app, you would fetch this
    setProfessor({
      name: "Dr. Jane Smith",
      id: "PROF123"
    });
    
    getProfClasses().then((data) => setClasses(data.classes));
  }, []);

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...");
    // In a real app, you would call an API or clear auth tokens
    // window.location.href = "/login";
  };

  const handleClassSelect = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedAssignment(null);
    setAssignmentDetails(null);
    setStudents([]);
    setGrades({});

    try {
      const assignmentData = await getClassAssignments(classId);
      setAssignments(assignmentData.assignments);

      const classDetails = await getClassDetails(classId);
      setStudents(classDetails.students);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignmentSelect = async (assignment: Assignment) => {
    setSelectedAssignment(assignment._id);
    setAssignmentDetails(assignment);

    if (!students.length) {
      console.error("No students available");
      return;
    }

    try {
      const data = await getGradesForAssignment(selectedClass as string, assignment._id);
      console.log("Grades data:", data);

      // Process the grades into a lookup object by student sapid
      const gradesMap: Record<string, Grade> = {};
      data.grades.forEach((grade: any) => {
        const studentId = grade.studentId.sapid;
        gradesMap[studentId] = {
          knowledge: grade.knowledge,
          description: grade.description,
          demonstration: grade.demonstration,
          strategy: grade.strategy,
          attitude: grade.attitude,
          total:
            grade.knowledge +
            grade.description +
            grade.demonstration +
            grade.strategy +
            grade.attitude,
        };
      });

      setGrades(gradesMap);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const handleOpenGradeDialog = (student: Student) => {
    setSelectedStudent(student);
    setGradeForm({
      knowledge: 0,
      description: 0,
      demonstration: 0,
      strategy: 0,
      attitude: 0,
    });
    setIsGradeDialogOpen(true);
  };

  const handleGradeInputChange = (field: keyof GradeForm, value: string) => {
    // Ensure the value is within 0-5 range
    const numValue = parseInt(value);
    const validValue = isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), 5);

    setGradeForm({
      ...gradeForm,
      [field]: validValue,
    });
  };

  const handleSubmitGrade = async () => {
    if (!selectedStudent || !selectedAssignment || !assignmentDetails) return;

    setIsSubmitting(true);

    try {
      const gradeData = {
        assignmentId: selectedAssignment,
        sapid: selectedStudent.sapid,
        ...gradeForm,
      };

      const response = await addGrade(gradeData);
      console.log("Grade added:", response);

      // Update the grades state
      setGrades((prev) => ({
        ...prev,
        [selectedStudent.sapid]: {
          ...gradeForm,
          total: Object.values(gradeForm).reduce((sum, val) => sum + val, 0),
        },
      }));

      setIsGradeDialogOpen(false);
    } catch (error) {
      console.error("Error submitting grade:", error);
      alert("Failed to submit grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      <Header 
        professor={professor || undefined} 
        onLogout={handleLogout} 
      />

      <div className="flex flex-1 w-full">
        <ClassSidebar 
          classes={classes} 
          selectedClass={selectedClass} 
          onClassSelect={handleClassSelect} 
        />

        <main ref={mainRef} className="w-4/5 bg-gray-50 p-6 overflow-y-auto">
          {selectedClass ? (
            <div>
              <AssignmentSelection 
                assignments={assignments} 
                selectedAssignment={selectedAssignment} 
                onAssignmentSelect={handleAssignmentSelect} 
              />

              <AssignmentDetailsCard assignmentDetails={assignmentDetails} />

              {selectedAssignment && (
                <StudentGradesTable 
                  students={students} 
                  grades={grades} 
                  onOpenGradeDialog={handleOpenGradeDialog} 
                />
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      <GradeDialog 
        isOpen={isGradeDialogOpen}
        onOpenChange={setIsGradeDialogOpen}
        student={selectedStudent}
        gradeForm={gradeForm}
        onGradeInputChange={handleGradeInputChange}
        onSubmit={handleSubmitGrade}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardProf;