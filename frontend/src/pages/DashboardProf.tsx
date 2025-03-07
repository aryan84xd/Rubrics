import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  fetchStudentDetails,
  getProfClasses,
  getClassAssignments,
  getGradesForAssignment,
  getClassDetails,
  addGrade,
} from "@/utils/ProffApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DashboardProf = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    knowledge: 0,
    description: 0,
    demonstration: 0,
    strategy: 0,
    attitude: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainRef = useRef(null); // Reference for main section

  useEffect(() => {
    getProfClasses().then((data) => setClasses(data.classes));
  }, []);

  const handleClassSelect = async (classId) => {
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

  const handleAssignmentSelect = async (assignment) => {
    setSelectedAssignment(assignment._id);
    setAssignmentDetails(assignment);

    if (!students.length) {
      console.error("No students available");
      return;
    }

    try {
      const data = await getGradesForAssignment(selectedClass, assignment._id);
      console.log("Grades data:", data);

      // Process the grades into a lookup object by student sapid
      const gradesMap = {};
      data.grades.forEach((grade) => {
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

  const handleOpenGradeDialog = (student) => {
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

  const handleGradeInputChange = (field, value) => {
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
    console.log(selectedStudent);
    console.log(selectedStudent.sapid, selectedAssignment, gradeForm);

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
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white shadow-md px-6 py-4 w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          Professor Dashboard
        </h1>
      </header>

      <div className="flex flex-1 w-full">
        <aside className="w-1/5 bg-white border-r shadow-sm p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Your Classes
          </h2>
          <Separator className="mb-4" />
          {classes.map((cls) => (
            <Button
              key={cls._id}
              variant={selectedClass === cls._id ? "secondary" : "outline"}
              className="w-full justify-start mb-2"
              onClick={() => handleClassSelect(cls._id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{cls.name}</span>
                <span className="text-xs text-gray-500">{cls.courseCode}</span>
              </div>
            </Button>
          ))}
        </aside>

        <main ref={mainRef} className="w-4/5 bg-gray-50 p-6 overflow-y-auto">
          {selectedClass ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Assignments
              </h2>
              <div className="flex gap-2 mb-6 flex-wrap">
                {assignments.map((assignment) => (
                  <Button
                    key={assignment._id}
                    variant={
                      selectedAssignment === assignment._id
                        ? "secondary"
                        : "outline"
                    }
                    onClick={() => handleAssignmentSelect(assignment)}
                  >
                    Assignment {assignment.assignmentNumber}
                  </Button>
                ))}
              </div>

              {assignmentDetails && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{assignmentDetails.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">
                      <strong>Assignment Number:</strong>{" "}
                      {assignmentDetails.assignmentNumber}
                    </p>
                    <p className="mb-2">
                      <strong>Description:</strong>{" "}
                      {assignmentDetails.description}
                    </p>
                    <p>
                      <strong>Date of Assignment:</strong>{" "}
                      {new Date(
                        assignmentDetails.dateOfAssignment
                      ).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedAssignment && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Students & Grades
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 px-4 py-2">
                            Sapid
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Name
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Knowledge
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Description
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Demonstration
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Strategy
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Attitude
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Total Grade
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student._id} className="bg-white">
                            <td className="border border-gray-300 px-4 py-2">
                              {student.sapid}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {student.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {grades[student.sapid]?.knowledge ?? "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {grades[student.sapid]?.description ?? "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {grades[student.sapid]?.demonstration ?? "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {grades[student.sapid]?.strategy ?? "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {grades[student.sapid]?.attitude ?? "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {grades[student.sapid]?.total ?? "Not graded"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {!grades[student.sapid] && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenGradeDialog(student)}
                                >
                                  Grade
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-lg mb-4">
                  Select a class to view assignments
                </p>
                <p className="text-sm text-gray-400">
                  Choose a class from the sidebar to see assignments and student
                  grades
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialog Component */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform-none sm:max-w-md bg-background p-6 border rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Grade Student: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="knowledge" className="text-right">
                Knowledge (0-5)
              </Label>
              <Input
                id="knowledge"
                type="number"
                min="0"
                max="5"
                className="col-span-3"
                value={gradeForm.knowledge}
                onChange={(e) =>
                  handleGradeInputChange("knowledge", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description (0-5)
              </Label>
              <Input
                id="description"
                type="number"
                min="0"
                max="5"
                className="col-span-3"
                value={gradeForm.description}
                onChange={(e) =>
                  handleGradeInputChange("description", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="demonstration" className="text-right">
                Demonstration (0-5)
              </Label>
              <Input
                id="demonstration"
                type="number"
                min="0"
                max="5"
                className="col-span-3"
                value={gradeForm.demonstration}
                onChange={(e) =>
                  handleGradeInputChange("demonstration", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="strategy" className="text-right">
                Strategy (0-5)
              </Label>
              <Input
                id="strategy"
                type="number"
                min="0"
                max="5"
                className="col-span-3"
                value={gradeForm.strategy}
                onChange={(e) =>
                  handleGradeInputChange("strategy", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attitude" className="text-right">
                Attitude (0-5)
              </Label>
              <Input
                id="attitude"
                type="number"
                min="0"
                max="5"
                className="col-span-3"
                value={gradeForm.attitude}
                onChange={(e) =>
                  handleGradeInputChange("attitude", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Total</Label>
              <div className="col-span-3 font-bold">
                {Object.values(gradeForm).reduce((sum, val) => sum + val, 0)} /
                25
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsGradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmitGrade}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardProf;
