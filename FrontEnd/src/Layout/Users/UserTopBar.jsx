import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut,  User, Heart, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";

const UserTopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { getCartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    toast.dark("Logout successful!");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ];

  // Determine navbar styling based on scroll state and whether it's the home page
  const navbarClasses = `fixed w-full top-0 z-40 transition-all duration-300 ease-in-out ${
    scrolled || !isHomePage
      ? "bg-white/90 backdrop-blur-md shadow-sm text-gray-900 py-3"
      : "bg-transparent text-white py-5"
  }`;

  const navItemClass = (isActive) =>
    `relative px-1 py-2 text-sm font-medium transition-colors hover:text-primary ${
      isActive ? "text-primary" : ""
    }`;

  const iconClass = `transition-colors hover:text-primary cursor-pointer`;

  return (
    <>
      <header className={navbarClasses}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Mobile menu button & Icons (Left side on mobile) */}
            <div className="flex items-center lg:hidden w-1/3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:text-primary transition-colors focus:outline-none -ml-2 p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Navigation (Left side on desktop) */}
            <div className="hidden lg:flex lg:items-center lg:space-x-10 w-1/3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => navItemClass(isActive)}
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10 tracking-wide uppercase text-xs">{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          calcMode="spring"
                          transition={{ bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Logo (Center) */}
            <div className="flex-shrink-0 flex justify-center w-1/3">
              <Link to="/" className="text-3xl font-serif font-bold tracking-widest flex items-center">
                SHE<span className={scrolled || !isHomePage ? "text-primary" : "text-white"}>SHINE</span>
              </Link>
            </div>

            {/* Icons (Right Side) */}
            <div className="flex items-center justify-end space-x-5 w-1/3">
              
              <div className="hidden sm:flex items-center space-x-5">
                {user && user.role === "admin" && (
                  <Link to="/admin" className={iconClass} title="Admin Dashboard">
                    <LayoutDashboard size={20} />
                  </Link>
                )}

                <Link to={user?.id ? `/Profile/${user.id}` : "/login"} className={iconClass}>
                  <User size={20} />
                </Link>

                {user && (
                  <button onClick={handleLogout} className={iconClass} title="Logout">
                    <LogOut size={20} />
                  </button>
                )}

                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className={`${iconClass} relative`} 
                  title="Cart"
                >
                  <ShoppingBag size={20} />
                  <AnimatePresence>
                    {getCartCount() > 0 && (
                      <motion.span
                        key={getCartCount()}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                      >
                        {getCartCount()}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>


            </div>
          </div>
        </nav>
      </header>

  
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-white pt-24 px-6 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col space-y-6 text-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-2xl font-serif tracking-widest ${
                      isActive ? "text-primary" : "text-gray-900"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              <div className="w-16 h-px bg-gray-200 mx-auto my-4"></div>

              <div className="flex justify-center space-x-8 text-gray-600">
                <Link to={user?.id ? `/Profile/${user.id}` : "/login"} onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center hover:text-primary">
                  <User size={24} className="mb-2" />
                  <span className="text-xs uppercase tracking-wider">Profile</span>
                </Link>
                {user && (
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex flex-col items-center hover:text-primary">
                    <LogOut size={24} className="mb-2" />
                    <span className="text-xs uppercase tracking-wider">Logout</span>
                  </button>
                )}
                
                <button 
                  onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }} 
                  className="flex flex-col items-center hover:text-primary relative"
                >
                  <div className="relative mb-2">
                    <ShoppingBag size={24} />
                    <AnimatePresence>
                      {getCartCount() > 0 && (
                        <motion.span
                          key={getCartCount()}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                        >
                          {getCartCount()}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs uppercase tracking-wider">Cart</span>
                </button>
              </div>

              {user && user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-8 text-sm uppercase tracking-wider text-gray-500 hover:text-primary"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserTopBar;
