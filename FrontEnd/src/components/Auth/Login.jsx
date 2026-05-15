import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Mail } from "lucide-react";
import { login } from "../../Services/api";
import Footer from "../../Layout/Users/Footer";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      if (response.data.token) {
        const { token, ...userData } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        toast.success("Login successful!");

        // Navigate based on user role
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "employee") {
          navigate("/employee");
        } else {
          navigate("/"); // Or a user-specific dashboard
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow flex">
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG9by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80"
            alt="Fashion model"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img
                src="https://placehold.co/100x100/cc1f69/FFFFFF/png?text=SheShine"
                alt="SheShine Logo"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-100 shadow-md"
              />
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome Back!
              </h1>
              <p className="text-gray-500 mt-2">Sign in to manage your store</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-3 bg-gray-50 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className={`w-full pl-10 pr-3 py-3 bg-gray-50 border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-gray-900 hover:text-black"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-[#a91853] text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
