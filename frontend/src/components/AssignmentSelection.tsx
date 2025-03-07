import React from 'react';
import { Button } from "@/components/ui/button";

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
}

const AssignmentSelection: React.FC<AssignmentSelectionProps> = ({ 
  assignments, 
  selectedAssignment, 
  onAssignmentSelect 
}) => {
  return (
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