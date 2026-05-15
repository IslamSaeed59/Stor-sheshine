import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const TopBar = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20 transition-all duration-300">
      
      {/* Left items - Mobile Menu & Search (Placeholder) */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 lg:hidden transition-colors rounded-full hover:bg-gray-50"
          aria-label="Open Sidebar"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
        
        {/* Sleek Search Bar for Desktop */}
        <div className="hidden md:flex items-center relative w-full max-w-sm group">
          <Search size={18} strokeWidth={1.5} className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search orders, products, or users..." 
            className="w-full bg-gray-50 text-sm border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-primary/5 rounded-full pl-12 pr-4 py-2.5 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-900" 
          />
        </div>
      </div>

      {/* Right side icons and profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-50 group">
          <Bell size={20} strokeWidth={1.5} className="group-hover:animate-wiggle" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </button>

        <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Admin Avatar"
                className="w-10 h-10 rounded-full border border-gray-200 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            {user && (
              <div className="hidden md:flex flex-col items-start px-1">
                <span className="text-sm font-semibold text-gray-900 tracking-wide">{user.name}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{user.role}</span>
              </div>
            )}

            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`text-gray-400 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180 text-gray-900" : ""
              } hidden md:block`}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-30"
              >
                <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@sheshine.com'}</p>
                </div>

                <div className="p-2 space-y-1">
                  {user && (
                    <Link
                      to={`/Profile/${user.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} strokeWidth={1.5} className="text-gray-400" />
                      My Profile
                    </Link>
                  )}
                  {/* Settings Placeholder */}
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} strokeWidth={1.5} className="text-gray-400" />
                    Account Settings
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-50 mt-1">
                  <button
                    onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
