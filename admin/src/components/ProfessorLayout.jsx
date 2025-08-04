// src/components/ProfessorLayout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const ProfessorLayout = ({ children }) => {
  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="ml-64 p-6 w-full">{children}</main>
      </div>
    </div>
  );
};

export default ProfessorLayout;
