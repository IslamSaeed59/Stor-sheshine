import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getUserById, updateUser } from "../../../Services/api";
import Header from "../../../Layout/Admin/Header";
import { ArrowLeft } from "lucide-react";
import { RingLoader } from "react-spinners";

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data: user } = await getUserById(id);

        reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to fetch user data.");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate, reset]);

  const onSubmit = async (data) => {
    if (!isDirty) {
      toast.info("No changes to save.");
      return navigate("/admin/users");
    }

    try {
      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      };

      // Only include password if it's been entered
      if (data.password) {
        userData.password = data.password;
      }

      await updateUser(id, userData);
      toast.success("User updated successfully!");
      navigate("/admin/users");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(error.response?.data?.message || "Failed to update user.");
    }
  };

  // Reusable input component
  const Input = ({ label, name, type = "text", required, error, ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name, { required })}
        className={`mt-1 block w-full px-3 py-2 bg-white border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  );

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-900 hover:text-black font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Users</span>
      </button>
      <Header title="Edit User" showButton={false} />
      <div className="bg-white rounded-xl shadow-md m-4 p-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RingLoader color="#111827" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                required="Full name is required."
                error={errors.name}
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                required="A valid email is required."
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
                error={errors.password}
              />
              <Input
                label="Phone Number"
                name="phone"
                required="Phone number is required."
                error={errors.phone}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                {...register("role", { required: "Role is required." })}
                className={`mt-1 block w-full px-3 py-2 bg-white border ${
                  errors.role ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 hover:bg-[#a91853] text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateUser;
