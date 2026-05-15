import React from "react";
import SidebarEmployee from "./SidebarEmployee";
import TopBar from "../Admin/TopBar";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 font-saira">
      {/* Sidebar */}
      <SidebarEmployee />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
