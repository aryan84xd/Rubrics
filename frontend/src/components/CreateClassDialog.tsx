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
  });
  // Handles grading scheme changes
  const handleGradeChange = (category: string, value: number) => {
    const updatedScheme = { ...classData.gradingScheme, [category]: value };

    // Ensure the sum is exactly 25
    const total = Object.values(updatedScheme).reduce((sum, v) => sum + v, 0);

    if (total <= 25) {
      setClassData({
        ...classData,
        gradingScheme: updatedScheme,
      });
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setClassData({
      ...classData,
      [field]: value,
    });
  };

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
    });

    // Close modal after submission
    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          // Reset when modal is closed
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
          });
        }
      }}
    >
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform-none sm:max-w-md bg-background p-6 border rounded-lg shadow-lg">
        {/* Dialog content goes here */}

        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Class Information Inputs */}
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
            <div key={field} className="grid grid-cols-4 items-center gap-4">
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

          {/* Grading Scheme Section */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold">
              Grading Scheme (Total:{" "}
              {Object.values(classData.gradingScheme).reduce(
                (sum, v) => sum + v,
                0
              )}
              /25)
            </h3>
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassDialog;
