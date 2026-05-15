import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./Layout/Admin/AdminLayout";
import Products from "./components/Admin/Products/Products";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreatProduct from "./components/Admin/Products/CreatProduct";
import Login from "./components/Auth/Login";
import UpdateProduct from "./components/Admin/Products/UpdateProduct";
import UserPage from "./components/Admin/Users/UserPage";
import CreateUser from "./components/Admin/Users/CreateUser";
import UpdateUser from "./components/Admin/Users/UpdateUser";
import UpdateProfile from "./components/Admin/Users/UpdateProfile";
import ProfilePage from "./components/Admin/Users/ProfilePage";
import MainPageAdmin from "./components/Admin/MainPage/MainPageAdmin";
import Admin from "./components/protection/Admin";
import Employee from "./components/protection/Employee";
import EmployeeLayout from "./Layout/Employee/EmployeeLayout";
import UsersLayout from "./Layout/Users/UsersLayout";
import Home from "./components/Users/MainPage/Home";
import CreateCategory from "./components/Admin/Category/CreateCategory";
import UpdateCategory from "./components/Admin/Category/UpdateCategory";
import Category from "./components/Admin/Category/Category";
import ProductCard from "./components/Admin/Products/ProductCard";
import UserProducts from "./components/Users/Products/UserProducts";
import ProductDetails from "./components/Users/Products/ProductDetails";
import CartDrawer from "./components/Users/Cart/CartDrawer";
import ScrollToTop from "./components/utils/ScrollToTop";
import { CartProvider } from "./context/CartContext";

const App = () => {
  return (
    <>
      <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <Admin>
                <AdminLayout />
              </Admin>
            }
          >

            {/* Main Page */}
            <Route path="mainpage" element={<MainPageAdmin />} />
            {/* Category */}
            <Route path="category" element={<Category />} />
            <Route path="category/create" element={<CreateCategory />} />
            <Route path="category/update/:id" element={<UpdateCategory />} />
            {/* Products */}
            <Route index element={<Products />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductCard />} />
            <Route path="products/create" element={<CreatProduct />} />
            <Route path="products/update/:id" element={<UpdateProduct />} />
            {/* Users */}
            <Route path="users" element={<UserPage />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/update/:id" element={<UpdateUser />} />
            {/* Profiles */}
            <Route path="profiles/update/:id" element={<UpdateProfile />} />
            {/* Orders */}
          </Route>
          {/* EmployeeLayout */}
          <Route
            path="/employee"
            element={
              <Employee>
                <EmployeeLayout />
              </Employee>
            }
          ></Route>
          {/* Users Layout */}
          <Route path="/" element={<UsersLayout />}>
            <Route index element={<Home />} />
            <Route path="Profile/:id" element={<ProfilePage />} />
            {/* UserProducts */}
            <Route path="Products" element={<UserProducts />} />
            <Route path="Product/:id" element={<ProductDetails />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </CartProvider>
    </>
  );
};

export default App;
