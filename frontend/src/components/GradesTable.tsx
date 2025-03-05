// GradesTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Grade {
  assignmentNumber: number;
  title: string;
  dateOfAssignment: string;
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
  total: number;
}

interface GradesResponse {
  classDetails: {
    name: string;
    facultyName: string;
    courseCode: string;
  };
  grades: Grade[];
  classAverage: number;
}

interface GradesTableProps {
  grades: GradesResponse;
  isLoading: boolean;
  onGenerateRubrics: () => void;
}

export const GradesTable = ({ grades, isLoading, onGenerateRubrics }: GradesTableProps) => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {grades.classDetails.name} - Grades
        </h2>
        <p className="text-sm text-gray-600">
          {grades.classDetails.facultyName} | {grades.classDetails.courseCode}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Knowledge</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Demonstration</TableHead>
            <TableHead>Strategy</TableHead>
            <TableHead>Attitude</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.grades.map((grade) => (
            <TableRow key={grade.assignmentNumber}>
              <TableCell>{grade.assignmentNumber}</TableCell>
              <TableCell>{grade.title}</TableCell>
              <TableCell>
                {new Date(grade.dateOfAssignment).toLocaleDateString()}
              </TableCell>
              <TableCell>{grade.knowledge}</TableCell>
              <TableCell>{grade.description}</TableCell>
              <TableCell>{grade.demonstration}</TableCell>
              <TableCell>{grade.strategy}</TableCell>
              <TableCell>{grade.attitude}</TableCell>
              <TableCell className="font-bold">{grade.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
       
        <p className="text-sm text-gray-600">
          Class Average: {grades.classAverage.toFixed(2)}
        </p>
        <Button
          onClick={onGenerateRubrics}
          disabled={isLoading}
          className="ml-auto"
        >
          {isLoading ? "Generating..." : "Generate Rubrics"}
        </Button>
      </div>
    </div>
  );
};