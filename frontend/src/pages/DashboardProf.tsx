import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfClasses,
  getClassAssignments,
  getGradesForAssignment,
  getClassDetails,
  addGrade,
  createClass,
  createAssignment,
} from "@/utils/ProffApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Import our components
import Header from "@/components/Header";
import ClassSidebar from "@/components/ClassSidebar";
import AssignmentSelection from "@/components/AssignmentSelection";
import AssignmentDetailsCard from "@/components/AssignmentDetailsCard";
import StudentGradesTable from "@/components/StudentGradesTable";
import GradeDialog from "@/components/GradeDialog";
import EmptyState from "@/components/EmptyState";
import CreateClassDialog from "@/components/CreateClassDialog";
import CreateAssignmentDialog from "@/components/CreateAssignmentDialog";
import { uploadStudentsToClass, fetchUserDetails } from "@/utils/ProffApi";
// TypeScript Interfaces
interface Professor {
  _id: string;
  name: string;
  sapid?: string;
  role: string;
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
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null
  );
  const [assignmentDetails, setAssignmentDetails] = useState<Assignment | null>(
    null
  );
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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const Navigate = useNavigate();
  // New state variables for create dialogs
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] =
    useState(false);

  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const userData = await fetchUserDetails();
        setProfessor({
          name: userData.user.name,
          id: userData.user._id,
          sapid: userData.user.sapid,
        });
      } catch (error) {
        console.error("Error fetching professor details:", error);
        // Handle error (e.g., redirect to login)
      }
    };

    fetchProfessorData();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await getProfClasses();
      setClasses(data.classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleLogout = () => {
   Navigate("/loginprof");
  };

  const handleClassSelect = async (classId: string) => {
    setIsLoadingAssignments(true);
    setSelectedClass(classId);
    setAssignments([]);
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
    } finally {
      setIsLoadingAssignments(false);
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
      const data = await getGradesForAssignment(
        selectedClass as string,
        assignment._id
      );
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

  // New handlers for create class functionality
  const handleCreateClassClick = () => {
    setIsCreateClassDialogOpen(true);
  };

  const handleSubmitClass = async (classData: {
    name: string;
    facultyName: string;
    courseCode: string;
    year: string;
    semester: string;
    batch: string;
    department: string;
    academicYear: string;
  }) => {
    setIsSubmitting(true);

    try {
      const response = await createClass(classData);
      console.log("Class created:", response);

      // Refresh the classes list
      await fetchClasses();
      setSelectedClass(response._id); // 🔹 Auto-select the new class
      setAssignments([]);

      setIsCreateClassDialogOpen(false);
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // New handlers for create assignment functionality
  const handleCreateAssignmentClick = () => {
    if (!selectedClass) {
      alert("Please select a class first.");
      return;
    }
    setIsCreateAssignmentDialogOpen(true);
  };

  const handleSubmitAssignment = async (assignmentData: {
    classId: string;
    assignmentNumber: number;
    title: string;
    description: string;
    dateOfAssignment: string;
  }) => {
    setIsSubmitting(true);

    try {
      const response = await createAssignment(assignmentData);
      console.log("Assignment created:", response);

      // Refresh assignments for the selected class
      if (selectedClass) {
        const assignmentData = await getClassAssignments(selectedClass);
        setAssignments(assignmentData.assignments);
      }

      setIsCreateAssignmentDialogOpen(false);
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUploadStudents = async () => {
    if (!selectedClass || !selectedFile) return;

    setIsSubmitting(true);
    try {
      await uploadStudentsToClass(selectedClass, selectedFile);
      // Refresh students list
      const classDetails = await getClassDetails(selectedClass);
      setStudents(classDetails.students);
      alert("Students uploaded successfully!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload students. Please check the file format.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      <Header
        professor={professor || { name: "Loading...", id: "" }}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 w-full">
        <ClassSidebar
          classes={classes}
          selectedClass={selectedClass}
          onClassSelect={handleClassSelect}
          onCreateClassClick={handleCreateClassClick}
        />

        <main ref={mainRef} className="w-4/5 bg-gray-50 p-6 overflow-y-auto">
          {selectedClass ? (
            <div>
              {isUploadDialogOpen && (
                <Dialog
                  open={isUploadDialogOpen}
                  onOpenChange={setIsUploadDialogOpen}
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Upload Students</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center gap-2">
                        <Label htmlFor="studentFile">Excel File</Label>
                        <Input
                          id="studentFile"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Supported formats: .xlsx, .xls
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUploadStudents}
                        disabled={!selectedFile || isSubmitting}
                      >
                        {isSubmitting ? "Uploading..." : "Upload"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <AssignmentSelection
                assignments={assignments}
                selectedAssignment={selectedAssignment}
                onAssignmentSelect={handleAssignmentSelect}
                onCreateAssignmentClick={handleCreateAssignmentClick}
                onUploadStudents={() => setIsUploadDialogOpen(true)}
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

      {/* Grade Dialog */}
      <GradeDialog
        isOpen={isGradeDialogOpen}
        onOpenChange={setIsGradeDialogOpen}
        student={selectedStudent}
        gradeForm={gradeForm}
        onGradeInputChange={handleGradeInputChange}
        onSubmit={handleSubmitGrade}
        isSubmitting={isSubmitting}
      />

      {/* Create Class Dialog */}
      <CreateClassDialog
        isOpen={isCreateClassDialogOpen}
        onOpenChange={setIsCreateClassDialogOpen}
        onSubmit={handleSubmitClass}
        isSubmitting={isSubmitting}
      />

      {/* Create Assignment Dialog */}
      <CreateAssignmentDialog
        isOpen={isCreateAssignmentDialogOpen}
        onOpenChange={setIsCreateAssignmentDialogOpen}
        classId={selectedClass}
        lastAssignmentNumber={
          assignments.length > 0
            ? Math.max(...assignments.map((a) => a.assignmentNumber))
            : 0
        }
        onSubmit={handleSubmitAssignment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardProf;
