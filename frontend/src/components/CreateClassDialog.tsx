import React, { useState } from 'react';
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
  }) => void;
  isSubmitting: boolean;
}

const CreateClassDialog: React.FC<CreateClassDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  isSubmitting 
}) => {
  const [classData, setClassData] = useState({
    name: '',
    facultyName: '',
    courseCode: '',
    year: '',
    semester: '',
    batch: '',
    department: '',
    academicYear: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setClassData({
      ...classData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    onSubmit(classData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform-none sm:max-w-md bg-background p-6 border rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Class Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={classData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="facultyName" className="text-right">
              Faculty Name
            </Label>
            <Input
              id="facultyName"
              className="col-span-3"
              value={classData.facultyName}
              onChange={(e) => handleInputChange("facultyName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseCode" className="text-right">
              Course Code
            </Label>
            <Input
              id="courseCode"
              className="col-span-3"
              value={classData.courseCode}
              onChange={(e) => handleInputChange("courseCode", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <Input
              id="year"
              className="col-span-3"
              value={classData.year}
              onChange={(e) => handleInputChange("year", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="semester" className="text-right">
              Semester
            </Label>
            <Input
              id="semester"
              className="col-span-3"
              value={classData.semester}
              onChange={(e) => handleInputChange("semester", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="batch" className="text-right">
              Batch
            </Label>
            <Input
              id="batch"
              className="col-span-3"
              value={classData.batch}
              onChange={(e) => handleInputChange("batch", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Input
              id="department"
              className="col-span-3"
              value={classData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="academicYear" className="text-right">
              Academic Year
            </Label>
            <Input
              id="academicYear"
              className="col-span-3"
              value={classData.academicYear}
              onChange={(e) => handleInputChange("academicYear", e.target.value)}
            />
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
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassDialog;