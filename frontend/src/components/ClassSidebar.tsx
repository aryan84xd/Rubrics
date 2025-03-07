import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Class {
  _id: string;
  name: string;
  courseCode: string;
}

interface ClassSidebarProps {
  classes: Class[];
  selectedClass: string | null;
  onClassSelect: (classId: string) => void;
}

const ClassSidebar: React.FC<ClassSidebarProps> = ({ 
  classes, 
  selectedClass, 
  onClassSelect 
}) => {
  return (
    <aside className="w-1/5 bg-white border-r shadow-sm p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Your Classes
      </h2>
      <Separator className="mb-4" />
      {classes.map((cls) => (
        <Button
          key={cls._id}
          variant={selectedClass === cls._id ? "secondary" : "outline"}
          className="w-full justify-start mb-2"
          onClick={() => onClassSelect(cls._id)}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">{cls.name}</span>
            <span className="text-xs text-gray-500">{cls.courseCode}</span>
          </div>
        </Button>
      ))}
    </aside>
  );
};

export default ClassSidebar;