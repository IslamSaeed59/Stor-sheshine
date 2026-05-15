import { useEffect, useState } from "react";
import Header from "../../../Layout/Admin/Header";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteUser, getUsers } from "../../../Services/api";
import UserTabel from "./UserTabel";

const UserPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        setUsers(response.data);
      } catch (error) {
        toast.error(error.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      toast.success("User deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting user.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
         <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
         <p className="text-sm font-medium text-gray-500 animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Header
        title="User Management"
        buttonText="Add New User"
        navigation="/admin/users/create"
      />
      <div>
        <UserTabel users={users} onDelete={handleDeleteUser} />
      </div>
    </div>
  );
};

export default UserPage;
