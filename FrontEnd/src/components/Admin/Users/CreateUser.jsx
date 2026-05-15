import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createUser } from "../../../Services/api"; // Assuming this function exists in your api.js
import Header from "../../../Layout/Admin/Header";
import { ArrowLeft } from "lucide-react";

const CreateUser = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: "user",
    },
  });
  const navigate = useNavigate();

  // Watch the 'role' field to conditionally render employee fields
  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data) => {
    try {
      // Structure the data to match the user model, including the nested profile
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        profile: {
          Address: data.address,
          DOB: data.dob,
        },
      };

      // If the role is 'employee', add the employee-specific data
      if (data.role === "employee") {
        userData.employee = {
          DOH: data.doh, // Date of Hire
          salary: parseFloat(data.salary),
        };
      }

      await createUser(userData);
      toast.success("User created successfully!");
      navigate("/admin/users");
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(error.response?.data?.message || "Failed to create user.");
    }
  };

  // Reusable input component for styling consistency
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
      <Header title="Create New User" showButton={false} />
      <div className="bg-white rounded-xl shadow-md m-4 p-8">
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
              required="Password is required."
              error={errors.password}
            />
            <Input
              label="Phone Number"
              name="phone"
              required="Phone number is required."
              error={errors.phone}
            />
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Address"
              name="address"
              required="Address is required."
              error={errors.address}
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              required="Date of Birth is required."
              error={errors.dob}
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
              defaultValue="user"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Employee-specific fields, shown conditionally */}
          {selectedRole === "employee" && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-black">
                Employee Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Date of Hire (DOH)"
                  name="doh"
                  type="date"
                  required="Date of Hire is required for employees."
                  error={errors.doh}
                />
                <Input
                  label="Salary"
                  name="salary"
                  type="number"
                  step="100"
                  required="Salary is required for employees."
                  error={errors.salary}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-[#a91853] text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
