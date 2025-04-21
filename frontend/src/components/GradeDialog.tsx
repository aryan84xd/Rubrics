import React, { useEffect, useState } from "react";
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
import { getClassDetails } from "@/utils/ProffApi"; // Import the API function

interface Student {
  _id: string;
  sapid: string;
  name: string;
}

interface GradeForm {
  [key: string]: number;
}

interface GradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  classId: string;
  onGradeInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const GradeDialog: React.FC<GradeDialogProps> = ({
  isOpen,
  onOpenChange,
  student,
  classId,
  onGradeInputChange,
  onSubmit,
  isSubmitting,
}) => {
  const [classDetails, setClassDetails] = useState<{
    gradingScheme: Record<string, number>;
  } | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeForm>({});

  useEffect(() => {
    if (classId) {
      getClassDetails(classId)
        .then((data) => {
          console.log("Class details fetched in dialog:", data);
          setClassDetails(data.class);

          // Initialize gradeForm with only categories that have a non-zero max value
          const initialForm: GradeForm = {};
          Object.entries(data.class.gradingScheme).forEach(
            ([category, maxMarks]) => {
              if (maxMarks > 0) {
                initialForm[category] = 0; // Start with 0
              }
            }
          );
          setGradeForm(initialForm);
        })
        .catch((error) =>
          console.error("Error fetching class details:", error)
        );
    }
  }, [classId]);

  if (!student || !classDetails) return null;

  // Calculate total score
  const totalScore = Object.values(gradeForm).reduce(
    (sum, val) => sum + val,
    0
  );

  // Handle input change with validation to ensure total does not exceed 25
  const handleGradeChange = (category: string, value: string) => {
    const newValue = Math.min(
      Number(value),
      classDetails.gradingScheme[category]
    ); // Cap at max marks per category
    const newTotal = totalScore - gradeForm[category] + newValue;

    if (newTotal <= 25) {
      setGradeForm((prev) => ({ ...prev, [category]: newValue }));
      onGradeInputChange(category, newValue.toString());
    }
  };
  const handleSubmit = () => {
    onSubmit(); // Call the existing submit function
    setGradeForm(() => {
      const resetForm: GradeForm = {};
      Object.entries(classDetails!.gradingScheme).forEach(
        ([category, maxMarks]) => {
          if (maxMarks > 0) {
            resetForm[category] = 0;
          }
        }
      );
      return resetForm;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 sm:max-w-lg bg-background p-6 border rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Grade Student: {student.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {Object.entries(classDetails.gradingScheme).map(
            ([category, maxMarks]) =>
              maxMarks > 0 ? (
                <div
                  key={category}
                  className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6"
                >
                  <Label
                    htmlFor={category}
                    className="text-right w-full text-lg"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} (0-
                    {maxMarks})
                  </Label>
                  <Input
                    id={category}
                    type="number"
                    min="0"
                    max={maxMarks}
                    className="w-full max-w-lg p-3 text-lg"
                    value={gradeForm[category]}
                    onChange={(e) =>
                      handleGradeChange(category, e.target.value)
                    }
                  />
                </div>
              ) : null
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
            <Label className="text-right font-bold text-lg w-full">Total</Label>
            <div className="font-bold text-lg w-full max-w-lg">
              {totalScore} / 25
            </div>
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
            {isSubmitting ? "Submitting..." : "Submit Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeDialog;
