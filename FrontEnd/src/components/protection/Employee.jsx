import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Employee = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem("user");

    if (!userString) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userString);

    if (user.role !== "employee") {
      navigate("/login");
    }
  }, [navigate]);

  return children;
};

export default Employee;
