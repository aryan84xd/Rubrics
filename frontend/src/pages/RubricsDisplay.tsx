import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RubricsEntry {
  assignmentId: string;
  rollNumber: string;
  year: number;
  knowledge: number;
  description: number;
  demonstration: number;
  strategy: number;
  attitude: number;
}

const criteriaDescriptions = {
  knowledge: "Understanding of the subject matter",
  description: "Clarity and completeness of explanations",
  demonstration: "Ability to showcase practical applications",
  strategy: "Approach to problem-solving",
  attitude: "Enthusiasm and engagement with the material",
};

// const RubricsDisplay: React.FC<{ entry: RubricsEntry | null }> = ({ entry }) => {  //required props to be passed to the component
const RubricsDisplay: React.FC<{ entry?: RubricsEntry }> = ({ entry }) => {
  // to allow entry to be undefined
  if (!entry) {
    return <div>No rubrics data available.</div>;
  }

  const totalScore = Object.entries(entry)
    .filter(([key]) =>
      [
        "knowledge",
        "description",
        "demonstration",
        "strategy",
        "attitude",
      ].includes(key)
    )
    .reduce(
      (sum, [, value]) => sum + (typeof value === "number" ? value : 0),
      0
    );

  const maxScore = 25; // 5 criteria * 5 points each

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Assignment Rubrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <p>
            <strong>Assignment ID:</strong> {entry.assignmentId}
          </p>
          <p>
            <strong>Roll Number:</strong> {entry.rollNumber}
          </p>
          <p>
            <strong>Year:</strong> {entry.year}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Criteria</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(
              Object.keys(criteriaDescriptions) as Array<
                keyof typeof criteriaDescriptions
              >
            ).map((criterion) => (
              <TableRow key={criterion}>
                <TableCell className="font-medium text-left p-4">
                  {criterion.charAt(0).toUpperCase() + criterion.slice(1)}
                </TableCell>
                <TableCell className="text-left">{criteriaDescriptions[criterion]}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={entry[criterion] === 5 ? "default" : "secondary"}
                  >
                    {entry[criterion]} / 5
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} className="font-bold text-right">
                Total Score
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="default" className="text-lg">
                  {totalScore} / {maxScore}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RubricsDisplay;
