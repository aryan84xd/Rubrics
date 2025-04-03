import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string | null;
  lastAssignmentNumber: number;
  onSubmit: (assignmentData: {
    classId: string;
    assignmentNumber: number;
    title: string;
    description: string;
    dateOfAssignment: string;
  }) => void;
  isSubmitting: boolean;
}

const CreateAssignmentDialog: React.FC<CreateAssignmentDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  classId,
  lastAssignmentNumber,
  onSubmit,
  isSubmitting 
}) => {
  const [assignmentData, setAssignmentData] = useState({
    assignmentNumber: lastAssignmentNumber + 1,
    title: '',
    description: '',
    dateOfAssignment: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: string, value: string) => {
    setAssignmentData({
      ...assignmentData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    if (!classId) return;
  
    onSubmit({
      classId,
      ...assignmentData
    });
  
    // Reset form fields after submission
    setAssignmentData({
      assignmentNumber: lastAssignmentNumber + 1,
      title: '',
      description: '',
      dateOfAssignment: new Date().toISOString().split('T')[0],
    });
  
    onOpenChange(false); // Close the dialog after submission
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform-none sm:max-w-md bg-background p-6 border rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignmentNumber" className="text-right">
              Assignment Number
            </Label>
            <Input
              id="assignmentNumber"
              type="number"
              className="col-span-3"
              value={assignmentData.assignmentNumber}
              onChange={(e) => handleInputChange("assignmentNumber", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              className="col-span-3"
              value={assignmentData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateOfAssignment" className="text-right">
              Date
            </Label>
            <Input
              id="dateOfAssignment"
              type="date"
              className="col-span-3"
              value={assignmentData.dateOfAssignment}
              onChange={(e) => handleInputChange("dateOfAssignment", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              className="col-span-3"
              rows={4}
              value={assignmentData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
            {isSubmitting ? "Creating..." : "Create Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;