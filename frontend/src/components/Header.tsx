// 1. Header component
import React from 'react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  professor?: {
    name: string;
    id?: string;
    sapid?:
    string;
  };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ professor, onLogout }) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white shadow-md px-6 py-4 w-full">
      <h1 className="text-2xl font-bold text-gray-800">
        Professor Dashboard
      </h1>
      <div className="flex items-center gap-4">
        {professor && (
          <span className="text-sm font-medium text-gray-600">
            {professor.name} {professor.sapid&& `(${professor.sapid})`}
          </span>
        )}
        <Button onClick={onLogout} variant="outline">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;