import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getClassDetails } from "@/utils/ProffApi"; // Fetch class info including grading categories

interface Grade {
  assignmentNumber: number;
  title: string;
  dateOfAssignment: string;
  [key: string]: number | string; // Allow dynamic grading categories
}

interface GradesResponse {
  classDetails: {
    name: string;
    facultyName: string;
    courseCode: string;
    gradingScheme: Record<string, number>; // Dynamic grading scheme
  };
  grades: Grade[];
  classAverage: number;
}

interface GradesTableProps {
  classId: string;
  grades: GradesResponse | null; // Make grades nullable to handle empty state
  isLoading: boolean;
  onGenerateRubrics: () => void;
}

export const GradesTable = ({ classId, grades, isLoading, onGenerateRubrics }: GradesTableProps) => {
  const [gradingCategories, setGradingCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [classInfo, setClassInfo] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const fetchGradingCategories = async () => {
      try {
        setLoading(true);
        
        const data = await getClassDetails(classId);
        console.log("Fetched class info:", data);
        setClassInfo(data.class);
        // Extract valid grading categories dynamically
        const validCategories = Object.entries(data.class.gradingScheme || {})
          .filter(([_, value]) => value !== 0)
          .map(([key]) => key);

        console.log("Dynamic grading categories:", validCategories);
        setGradingCategories(validCategories);
      } catch (error) {
        console.error("Error fetching class info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) fetchGradingCategories();
  }, [classId]);

  // Show loading state when data is being fetched
  if (loading) {
    return <p className="text-center py-4">Loading grading categories...</p>;
  }

  // Handle empty grades data
  if (!grades || !grades.classDetails || grades.grades.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {classInfo?.name || "Class"} - Grades
          </h2>
          <p className="text-sm text-gray-600">
            No grades available for this class
          </p>
        </div>
        
        <div className="p-8 text-center bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">No grades have been recorded yet</p>
          <Button onClick={onGenerateRubrics} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Rubrics"}
          </Button>
        </div>
      </div>
    );
  }

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
            {gradingCategories.map((category) => (
              <TableHead key={category} className="capitalize">
                {category.replace(/([A-Z])/g, " $1")}
              </TableHead>
            ))}
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
              {gradingCategories.map((category) => (
                <TableCell key={category}>
                  {typeof grade[category] === "number" ? grade[category] : "-"}
                </TableCell>
              ))}
              <TableCell className="font-bold">{grade.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Class Average: {grades.classAverage.toFixed(2)}
        </p>
        <Button onClick={onGenerateRubrics} disabled={isLoading} className="ml-auto">
          {isLoading ? "Generating..." : "Generate Rubrics"}
        </Button>
      </div>
    </div>
  );
};