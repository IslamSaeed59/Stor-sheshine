import { Outlet, useLocation } from "react-router-dom";
import UserTopBar from "./UserTopBar";
import Footer from "./Footer";
import CartDrawer from "../../components/Users/Cart/CartDrawer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const UsersLayout = () => {
  const [isSiteLoading, setIsSiteLoading] = useState(true);

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    // Show loader on route change
    setIsSiteLoading(true);

    // Listen for custom event from the Hero component
    const handleAppReady = () => setIsSiteLoading(false);
    window.addEventListener("app-ready", handleAppReady);

    // Fallback: wait longer on homepage for hero image, short time on other pages
    const fallbackTime = isHomePage ? 10000 : 800;
    const timeout = setTimeout(() => setIsSiteLoading(false), fallbackTime);

    // If it's not the home page, we can also just dispatch it early if there's no Hero
    if (!isHomePage) {
      setTimeout(() => setIsSiteLoading(false), 400);
    }

    return () => {
      window.removeEventListener("app-ready", handleAppReady);
      clearTimeout(timeout);
    };
  }, [location.pathname]);
  // This layout provides the main structure for all user-facing pages.
  // It includes the top navigation bar, the main content area, and the footer.
  return (
    <>
      <AnimatePresence>
        {isSiteLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-widest flex items-center mb-8">
                SHE<span className="text-primary">SHINE</span>
              </h1>
              
              <div className="w-48 h-[2px] bg-gray-100 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-primary"
                  initial={{ left: "-100%", width: "50%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-gray-50 text-gray-800 ">
        <UserTopBar />
      <main className="flex-grow">
        <div>
          <Outlet />
        </div>
      </main>
      <Footer />
      <CartDrawer />
      </div>
    </>
  );
};

export default UsersLayout;
