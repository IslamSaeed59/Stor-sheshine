import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Admin = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem("user");

    if (!userString) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userString);

    if (user.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  return children;
};

export default Admin;
