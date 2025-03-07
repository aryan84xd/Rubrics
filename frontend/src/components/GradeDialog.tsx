import React from 'react';
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

interface Student {
  _id: string;
  sapid: string;
  name: string;
}

interface GradeForm {
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
}

interface GradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  gradeForm: GradeForm;
  onGradeInputChange: (field: keyof GradeForm, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const GradeDialog: React.FC<GradeDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  student, 
  gradeForm, 
  onGradeInputChange, 
  onSubmit,
  isSubmitting 
}) => {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform-none sm:max-w-md bg-background p-6 border rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Grade Student: {student.name}</DialogTitle>
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
                onGradeInputChange("knowledge", e.target.value)
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
                onGradeInputChange("description", e.target.value)
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
                onGradeInputChange("demonstration", e.target.value)
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
                onGradeInputChange("strategy", e.target.value)
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
                onGradeInputChange("attitude", e.target.value)
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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeDialog;