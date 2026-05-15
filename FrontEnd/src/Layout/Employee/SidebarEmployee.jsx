import { ShoppingBag, ShoppingBagIcon } from "lucide-react";
import React from "react";
import { Link, NavLink } from "react-router-dom";

const SidebarEmployee = () => {
  const navLinkClasses =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 font-medium text-xl transition-all duration-200 hover:bg-gray-900 hover:text-white";
  const activeNavLinkClasses = "bg-gray-900 text-white";

  return (
    <div className="flex min-h-screen w-64 flex-col bg-white shadow-lg ">
      <div className="flex items-center justify-center p-6 ">
        <Link
          to="/Employee"
          className="text-3xl font-bold"
          style={{ color: "#111827" }}
        >
          SheShine
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {/* <NavLink
          to="/Employee/products"
          className={({ isActive }) =>
            `${navLinkClasses} ${
              isActive ? activeNavLinkClasses : ""
            } font-semibold`
          }
        >
          <ShoppingBag className="h-5 w-5" />
          Products
        </NavLink> */}

        <NavLink
          to="/Employee/orders"
          className={({ isActive }) =>
            `${navLinkClasses} ${
              isActive ? activeNavLinkClasses : ""
            } font-semibold`
          }
        >
          <ShoppingBagIcon className="h-5 w-5" />
          Orders
        </NavLink>
      </nav>
    </div>
  );
};

export default SidebarEmployee;
