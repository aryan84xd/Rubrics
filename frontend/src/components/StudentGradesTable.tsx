import React from 'react';
import { Button } from "@/components/ui/button";

interface Student {
  _id: string;
  sapid: string;
  name: string;
}

interface Grade {
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
  total: number;
}

interface StudentGradesTableProps {
  students: Student[];
  grades: Record<string, Grade>;
  onOpenGradeDialog: (student: Student) => void;
}

const StudentGradesTable: React.FC<StudentGradesTableProps> = ({ 
  students, 
  grades, 
  onOpenGradeDialog 
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Students & Grades
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">
                Sapid
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Knowledge
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Description
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Demonstration
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Strategy
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Attitude
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Total Grade
              </th>
              <th className="border border-gray-300 px-4 py-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="bg-white">
                <td className="border border-gray-300 px-4 py-2">
                  {student.sapid}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {student.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {grades[student.sapid]?.knowledge ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {grades[student.sapid]?.description ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {grades[student.sapid]?.demonstration ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {grades[student.sapid]?.strategy ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {grades[student.sapid]?.attitude ?? "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {grades[student.sapid]?.total ?? "Not graded"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {!grades[student.sapid] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenGradeDialog(student)}
                    >
                      Grade
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentGradesTable;