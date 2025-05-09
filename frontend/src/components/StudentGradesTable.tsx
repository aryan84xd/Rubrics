import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getClassDetails } from "@/utils/ProffApi"; // API function to fetch class details

interface Student {
  _id: string;
  sapid: string;
  name: string;
}

interface Grade {
  [key: string]: number; // Dynamic grading categories
}

interface StudentGradesTableProps {
  classId: string;
  grades: Record<string, Grade>;
  onOpenGradeDialog: (student: Student) => void;
}

const StudentGradesTable: React.FC<StudentGradesTableProps> = ({
  classId,
  grades,
  onOpenGradeDialog,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [gradingCategories, setGradingCategories] = useState<string[]>([]);
  const [classInfo, setClassInfo] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        const data = await getClassDetails(classId);

        console.log("Fetched class details:", data.class);
        console.log("Fetched students:", data.students);

        setStudents(data.students);
        setClassInfo(data.class);

        // Extract grading categories dynamically and filter out categories with value 0
        const validCategories = Object.entries(data.class.gradingScheme)
          .filter(([_, value]) => value !== 0)
          .map(([key]) => key);

        console.log("Valid grading categories:", validCategories);
        setGradingCategories(validCategories);
      } catch (error) {
        console.error("Error fetching class details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) fetchClassDetails();
  }, [classId]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {classInfo ? `Class: ${classInfo.name}` : "Loading class details..."}
      </h2>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Sapid</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                {gradingCategories.map((category) => (
                  <th
                    key={category}
                    className="border border-gray-300 px-4 py-2 capitalize"
                  >
                    {category.replace(/([A-Z])/g, " $1")}{" "}
                    {/* Format CamelCase */}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2">
                  Total Grade
                </th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
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
                  {gradingCategories.map((category) => (
                    <td
                      key={category}
                      className="border border-gray-300 px-4 py-2 text-center"
                    >
                      {grades[student.sapid]?.[category] ?? "-"}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {grades[student.sapid]?.total ?? "Not graded"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenGradeDialog(student)}
                    >
                      {grades[student.sapid] ? "Update" : "Grade"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentGradesTable;
