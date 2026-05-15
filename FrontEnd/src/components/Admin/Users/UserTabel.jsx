import { useState } from "react";
import { Edit, Trash2, UserCog, MoreVertical, X, Save, Shield, User, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { updateEmployee } from "../../../Services/api";

const EmployeeEditModal = ({ user, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      DOH: user.employee?.DOH ? new Date(user.employee.DOH).toISOString().split("T")[0] : "",
      salary: user.employee?.salary || 0,
      isWorking: user.employee?.isWorking ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateEmployee(user.employee.id, data);
      toast.success("Employee details updated successfully!");
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase size={18} className="text-primary" />
            Edit Employee: {user.name}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
           
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1.5">
              Monthly Salary (EGP)
            </label>
            <input
              id="salary"
              type="number"
              {...register("salary")}
              className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-all focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-primary/5 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="relative flex items-center">
              <input
                id="isWorking"
                type="checkbox"
                {...register("isWorking")}
                className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white peer-checked:bg-gray-900 peer-checked:border-gray-900 transition-all flex items-center justify-center">
                <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-900">Active Employee</span>
              <span className="block text-xs text-gray-500">Is this person currently working?</span>
            </div>
           </label>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserTabel = ({ users, onDelete }) => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleRowClick = (user) => {
    if (user.role === "employee" && user.employee) {
      setSelectedUser(user);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Shield size={14} className="text-purple-600" />;
      case 'employee': return <Briefcase size={14} className="text-blue-600" />;
      default: return <User size={14} className="text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': 
        return "bg-purple-100 text-purple-700 border-purple-200";
      case 'employee': 
        return "bg-blue-100 text-blue-700 border-blue-200";
      default: 
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
       {selectedUser && (
        <EmployeeEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={() => {
            setSelectedUser(null);
            window.location.reload(); 
          }}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 animate-fade-in-up">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  User Details
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Contact
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Role
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Joined
                </th>
                <th scope="col" className="px-6 py-4 text-right text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {users.length > 0 ? (
                 users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group cursor-pointer"
                    onClick={() => handleRowClick(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-100">
                           {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                       <div className="text-sm text-gray-900">{user.phone || "—"}</div>
                       <div className="text-xs text-gray-500 truncate max-w-[150px]">{user.profile?.Address || "No address"}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric'})}</div>
                       <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-1">
                         <button
                           onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/update/${user.id}`); }}
                           className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                           title="Edit User"
                         >
                           <Edit size={16} strokeWidth={2}/>
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); navigate(`/admin/profiles/update/${user.profile?.id}`); }}
                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Edit Profile Settings"
                         >
                           <UserCog size={16} strokeWidth={2} />
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); onDelete(user.id); }}
                           className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="Delete User"
                         >
                           <Trash2 size={16} strokeWidth={2}/>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                       <div className="flex flex-col items-center justify-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                           <User size={24} className="text-gray-300" />
                         </div>
                         <h3 className="text-sm font-semibold text-gray-900 mb-1">No users found</h3>
                         <p className="text-xs text-gray-500">There are no users registered in the system yet.</p>
                       </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserTabel;
