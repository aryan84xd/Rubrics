import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Upload } from "lucide-react";

interface Assignment {
  _id: string;
  assignmentNumber: number;
  title: string;
  description: string;
  dateOfAssignment: string;
}

interface AssignmentSelectionProps {
  assignments: Assignment[];
  selectedAssignment: string | null;
  onAssignmentSelect: (assignment: Assignment) => void;
  onCreateAssignmentClick: () => void;
  onUploadStudents: () => void;
}

const AssignmentSelection: React.FC<AssignmentSelectionProps> = ({
  assignments,
  selectedAssignment,
  onAssignmentSelect,
  onCreateAssignmentClick,
  onUploadStudents,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Assignments</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadStudents}
          className="flex items-center gap-1"
        >
          <Upload size={16} />
          <span>Upload Students</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateAssignmentClick}
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          <span>New Assignment</span>
        </Button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {assignments.map((assignment) => (
          <Button
            key={assignment._id}
            variant={
              selectedAssignment === assignment._id ? "secondary" : "outline"
            }
            onClick={() => onAssignmentSelect(assignment)}
          >
            Assignment {assignment.assignmentNumber}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AssignmentSelection;
