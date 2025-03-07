import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssignmentDetails {
  _id: string;
  title: string;
  assignmentNumber: number;
  description: string;
  dateOfAssignment: string;
}

interface AssignmentDetailsCardProps {
  assignmentDetails: AssignmentDetails | null;
}

const AssignmentDetailsCard: React.FC<AssignmentDetailsCardProps> = ({ assignmentDetails }) => {
  if (!assignmentDetails) return null;

  return (
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
  );
};

export default AssignmentDetailsCard;