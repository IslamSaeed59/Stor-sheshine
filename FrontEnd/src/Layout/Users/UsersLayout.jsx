import { Outlet } from "react-router-dom";
import UserTopBar from "./UserTopBar";
import Footer from "./Footer";
import CartDrawer from "../../components/Users/Cart/CartDrawer";

const UsersLayout = () => {
  // This layout provides the main structure for all user-facing pages.
  // It includes the top navigation bar, the main content area, and the footer.
  return (
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
  );
};

export default UsersLayout;
