import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Users, Store, Tag, Home } from "lucide-react";

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      name: "Storefront",
      path: "/",
      icon: <Store size={20} />,
      isExternal: true,
    },
    {
      name: "Main Page",
      path: "/admin/mainpage",
      icon: <Home size={20} />,
    },
    { name: "Categories", path: "/admin/category", icon: <Tag size={20} /> },
    {
      name: "Products",
      path: "/admin/products",
      icon: <ShoppingBag size={20} />,
    },
    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Branding */}
      <div className="flex items-center justify-center p-8 border-b border-gray-50 max-h-20">
        <Link
          to="/admin"
          onClick={onClose}
          className="text-2xl font-serif font-bold tracking-widest text-gray-900"
        >
          SHE<span className="text-primary">SHINE</span>
          <span className="block text-[8px] tracking-[0.3em] font-sans text-gray-400 font-normal mt-1 uppercase text-center">
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
        <h4 className="px-4 text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Management
        </h4>

        {navItems.map((item) => {
          const isActive =
            (location.pathname.startsWith(item.path) && item.path !== "/") ||
            location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-100"
                  : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-sm tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  {item.name}
                </span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-gray-50">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">SheShine Admin</p>
          <p className="text-[10px] text-gray-400">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
