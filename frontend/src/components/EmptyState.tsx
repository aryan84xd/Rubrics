import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-lg mb-4">
          Select a class to view assignments
        </p>
        <p className="text-sm text-gray-400">
          Choose a class from the sidebar to see assignments and student grades
        </p>
      </div>
    </div>
  );
};

export default EmptyState;