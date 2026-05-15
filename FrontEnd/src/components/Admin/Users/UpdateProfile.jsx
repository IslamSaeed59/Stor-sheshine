import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfileById, updateProfile } from "../../../Services/api";
import Header from "../../../Layout/Admin/Header";
import { ArrowLeft } from "lucide-react";
import { RingLoader } from "react-spinners";

const UpdateProfile = () => {
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
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: profile } = await getProfileById(id);
        // Format date for input[type=date] which expects 'YYYY-MM-DD'
        const dob = profile.DOB
          ? new Date(profile.DOB).toISOString().split("T")[0]
          : "";

        reset({
          Address: profile.Address,
          DOB: dob,
        });
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Failed to fetch profile data.");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate, reset]);

  const onSubmit = async (data) => {
    if (!isDirty) {
      toast.info("No changes to save.");
      return navigate("/admin/users");
    }

    try {
      await updateProfile(id, data);
      toast.success("Profile updated successfully!");
      navigate("/admin/users");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
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
      <Header title="Edit User Profile" showButton={false} />
      <div className="bg-white rounded-xl shadow-md m-4 p-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RingLoader color="#111827" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Address"
              name="Address"
              required="Address is required."
              error={errors.Address}
            />
            <Input
              label="Date of Birth"
              name="DOB"
              type="date"
              required="Date of Birth is required."
              error={errors.DOB}
            />

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

export default UpdateProfile;
