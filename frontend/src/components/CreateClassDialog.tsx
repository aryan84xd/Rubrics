import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseOutcome {
  code: string;
  outcome: string;
  bloomsLevel: string;
}

interface CreateClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (classData: {
    name: string;
    facultyName: string;
    courseCode: string;
    year: string;
    semester: string;
    batch: string;
    department: string;
    academicYear: string;
    gradingScheme: Record<string, number>;
    numberOfAssignments: number;
    assignmentCOs: number[];
    courseOutcomes: CourseOutcome[];
  }) => void;
  isSubmitting: boolean;
}

const fixedCategories = [
  "knowledge",
  "description",
  "demonstration",
  "strategy",
  "interpret",
  "attitude",
  "nonVerbalCommunication",
];



const CreateClassDialog: React.FC<CreateClassDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}) => {
  // Step tracker
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Data state
  const [classData, setClassData] = useState({
    name: "",
    facultyName: "",
    courseCode: "",
    year: "",
    semester: "",
    batch: "",
    department: "",
    academicYear: "",
    gradingScheme: {
      knowledge: 0,
      description: 0,
      demonstration: 0,
      strategy: 0,
      interpret: 0,
      attitude: 0,
      nonVerbalCommunication: 0,
    },
    numberOfAssignments: 1,
    assignmentCOs: [1],
    courseOutcomes: [
      {
        code: "CO1",
        outcome: "",
        bloomsLevel: "Understand",
      },
    ],
  });

  // Handle basic input changes
  const handleInputChange = (field: string, value: string) => {
    setClassData({
      ...classData,
      [field]: value,
    });
  };

  // Handle number input changes
  const handleNumberInputChange = (field: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;

    if (field === "numberOfAssignments") {
      // Ensure at least 1 assignment
      const newCount = Math.max(1, numValue);

      // Update assignment COs array length to match new count
      const newAssignmentCOs = [...classData.assignmentCOs];

      if (newCount > classData.assignmentCOs.length) {
        // Add new entries with default CO value of 1
        while (newAssignmentCOs.length < newCount) {
          newAssignmentCOs.push(1);
        }
      } else if (newCount < classData.assignmentCOs.length) {
        // Remove excess entries
        newAssignmentCOs.splice(newCount);
      }

      setClassData({
        ...classData,
        numberOfAssignments: newCount,
        assignmentCOs: newAssignmentCOs,
      });
    } else {
      setClassData({
        ...classData,
        [field]: numValue,
      });
    }
  };

  // Handle Course Outcomes changes
  const handleCourseOutcomeChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newCourseOutcomes = [...classData.courseOutcomes];

    // Type assertion to access the dynamic field
    (newCourseOutcomes[index] as any)[field] = value;

    setClassData({
      ...classData,
      courseOutcomes: newCourseOutcomes,
    });
  };

  // Add a new Course Outcome
  const addCourseOutcome = () => {
    const newIndex = classData.courseOutcomes.length + 1;
    setClassData({
      ...classData,
      courseOutcomes: [
        ...classData.courseOutcomes,
        {
          code: `CO${newIndex}`,
          outcome: "",
          bloomsLevel: "Understand",
        },
      ],
    });
  };

  // Remove a Course Outcome
  const removeCourseOutcome = (index: number) => {
    if (classData.courseOutcomes.length <= 1) {
      return; // Don't remove the last CO
    }

    const newCourseOutcomes = [...classData.courseOutcomes];
    newCourseOutcomes.splice(index, 1);

    // Update the codes for remaining COs
    newCourseOutcomes.forEach((co, idx) => {
      co.code = `CO${idx + 1}`;
    });

    // Update assignment COs (decrease values greater than removed index)
    const newAssignmentCOs = classData.assignmentCOs.map((co) => {
      const coNum = parseInt(co.toString(), 10);
      // If CO was referencing something beyond the removed one, decrement it
      if (coNum > index + 1) {
        return coNum - 1;
      }
      // If CO was referencing the removed one, set to 1
      if (coNum === index + 1 && index + 1 > newCourseOutcomes.length) {
        return 1;
      }
      return coNum;
    });

    setClassData({
      ...classData,
      courseOutcomes: newCourseOutcomes,
      assignmentCOs: newAssignmentCOs,
    });
  };

  // Handle grading scheme changes
  const handleGradeChange = (category: string, value: number) => {
    const updatedScheme = { ...classData.gradingScheme, [category]: value };

    // Ensure the sum is not more than 25
    const total = Object.values(updatedScheme).reduce((sum, v) => sum + v, 0);

    if (total <= 25) {
      setClassData({
        ...classData,
        gradingScheme: updatedScheme,
      });
    }
  };

  // Handle assignment CO changes
  const handleAssignmentCOChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10) || 1;
    // Ensure the CO value is valid (not beyond the number of available COs)
    const validValue = Math.min(numValue, classData.courseOutcomes.length);

    const newAssignmentCOs = [...classData.assignmentCOs];
    newAssignmentCOs[index] = validValue;

    setClassData({
      ...classData,
      assignmentCOs: newAssignmentCOs,
    });
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final submission
  const handleSubmit = () => {
    const total = Object.values(classData.gradingScheme).reduce(
      (sum, v) => sum + v,
      0
    );

    if (total !== 25) {
      alert("The total grading scheme must sum up to 25.");
      return;
    }

    onSubmit(classData);

    // Reset form after submission
    setClassData({
      name: "",
      facultyName: "",
      courseCode: "",
      year: "",
      semester: "",
      batch: "",
      department: "",
      academicYear: "",
      gradingScheme: {
        knowledge: 0,
        description: 0,
        demonstration: 0,
        strategy: 0,
        interpret: 0,
        attitude: 0,
        nonVerbalCommunication: 0,
      },
      numberOfAssignments: 1,
      assignmentCOs: [1],
      courseOutcomes: [
        {
          code: "CO1",
          outcome: "",
          bloomsLevel: "Understand",
        },
      ],
    });

    // Reset to first step
    setCurrentStep(1);

    // Close modal after submission
    onOpenChange(false);
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setClassData({
        name: "",
        facultyName: "",
        courseCode: "",
        year: "",
        semester: "",
        batch: "",
        department: "",
        academicYear: "",
        gradingScheme: {
          knowledge: 0,
          description: 0,
          demonstration: 0,
          strategy: 0,
          interpret: 0,
          attitude: 0,
          nonVerbalCommunication: 0,
        },
        numberOfAssignments: 1,
        assignmentCOs: [1],
        courseOutcomes: [
          {
            code: "CO1",
            outcome: "",
            bloomsLevel: "Understand",
          },
        ],
      });
      setCurrentStep(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 sm:max-w-xl bg-background p-6 border rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Create New Class - Step {currentStep} of {totalSteps}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Step 1: Basic Class Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Class Information</h3>
              {[
                "name",
                "facultyName",
                "courseCode",
                "year",
                "semester",
                "batch",
                "department",
                "academicYear",
              ].map((field) => (
                <div
                  key={field}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={field} className="text-right capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Input
                    id={field}
                    className="col-span-3"
                    value={(classData as any)[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Course Outcomes */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Course Outcomes</h3>
              <p className="text-sm text-gray-500">
                Define course outcomes and their Bloom's taxonomy levels
              </p>

              {classData.courseOutcomes.map((co, index) => (
                <div
                  key={`co-${index}`}
                  className="space-y-3 p-3 border rounded"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{co.code}</h4>
                    {classData.courseOutcomes.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCourseOutcome(index)}
                        className="text-red-500"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor={`co-outcome-${index}`}
                      className="text-right"
                    >
                      Outcome
                    </Label>
                    <Input
                      id={`co-outcome-${index}`}
                      className="col-span-3"
                      value={co.outcome}
                      onChange={(e) =>
                        handleCourseOutcomeChange(
                          index,
                          "outcome",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor={`co-bloomsLevel-${index}`}
                      className="text-right"
                    >
                      Bloom's Level
                    </Label>
                    <Input
                      id={`co-bloomsLevel-${index}`}
                      className="col-span-3"
                      value={co.bloomsLevel}
                      onChange={(e) =>
                        handleCourseOutcomeChange(
                          index,
                          "bloomsLevel",
                          e.target.value
                        )
                      }
                      placeholder="Apply"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCourseOutcome}
                className="w-full"
              >
                Add Course Outcome
              </Button>
            </div>
          )}

          {/* Step 3: Grading Scheme */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Grading Scheme (Total:{" "}
                {Object.values(classData.gradingScheme).reduce(
                  (sum, v) => sum + v,
                  0
                )}
                /25)
              </h3>
              <p className="text-sm text-gray-500">
                Allocate points to each category (total must be 25)
              </p>

              {fixedCategories.map((category) => (
                <div
                  key={category}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={category} className="text-right capitalize">
                    {category.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Input
                    id={category}
                    type="number"
                    className="col-span-3"
                    min="0"
                    value={classData.gradingScheme[category]}
                    onChange={(e) =>
                      handleGradeChange(
                        category,
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Assignments and Course Outcomes */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Number of Assignments */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numberOfAssignments" className="text-right">
                  Number of Assignments
                </Label>
                <Input
                  id="numberOfAssignments"
                  type="number"
                  className="col-span-3"
                  min="1"
                  value={classData.numberOfAssignments}
                  onChange={(e) =>
                    handleNumberInputChange(
                      "numberOfAssignments",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Assignment COs */}
              <div className="space-y-4 mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium">
                  Assignment Course Outcomes
                </h3>
                <p className="text-sm text-gray-500">
                  Specify the Course Outcome number for each assignment
                </p>

                {Array.from({ length: classData.numberOfAssignments }).map(
                  (_, index) => (
                    <div
                      key={`assignment-${index}`}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <Label htmlFor={`co-${index}`} className="text-right">
                        Assignment {index + 1} CO
                      </Label>
                      <Select
                        value={classData.assignmentCOs[index].toString()}
                        onValueChange={(value) =>
                          handleAssignmentCOChange(index, value)
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select CO" />
                        </SelectTrigger>
                        <SelectContent>
                          {classData.courseOutcomes.map((co, coIndex) => (
                            <SelectItem
                              key={coIndex}
                              value={(coIndex + 1).toString()}
                            >
                              {co.code} - {co.outcome.substring(0, 20)}
                              {co.outcome.length > 20 ? "..." : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {/* Navigation Buttons */}
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancel
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Class"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassDialog;
