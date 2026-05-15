import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCategories, deleteCategory } from "../../../Services/api";
import Header from "../../../Layout/Admin/Header";
import {
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  Loader2,
  Search,
  Edit,
} from "lucide-react";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return "Main Category";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Unknown Parent";
  };

  const toggleExpand = (categoryId) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((category) => category.id !== id));
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderRow = (category, level = 0) => {
    const children = filteredCategories.filter(
      (c) => c.parentId === category.id,
    );
    const hasChildren = children.length > 0;
    
    // Auto-expand if searching and there's a match inside
    const isExpanded = searchTerm ? true : expanded[category.id];

    return (
      <React.Fragment key={category.id}>
        <tr className="group hover:bg-gray-50/50 transition-colors duration-200">
          <td className="px-6 py-4 whitespace-nowrap">
            <div
              className="flex items-center gap-3"
              style={{ paddingLeft: `${level * 28}px` }}
            >
              <div className="w-6 flex justify-center">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(category.id)}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
                  >
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-2" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${level === 0 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                   {level === 0 ? <FolderOpen size={16} /> : <Folder size={14} />}
                </div>
                <div>
                   <span className={`block font-medium ${level === 0 ? "text-gray-900 text-sm" : "text-gray-700 text-[13px]"}`}>
                     {category.name}
                   </span>
                   {hasChildren && level === 0 && !searchTerm && (
                     <span className="text-[10px] text-gray-400 font-medium">
                       {children.length} subcategories
                     </span>
                   )}
                </div>
              </div>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
             {level === 0 ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-700">
                  Primary
                </span>
             ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-gray-100 text-gray-600">
                  {getParentName(category.parentId)}
                </span>
             )}
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(category.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </td>

          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex items-center justify-end gap-1">
              <button
                 onClick={() => navigate(`/admin/category/update/${category.id}`)}
                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 title="Edit Category"
              >
                <Edit size={16} strokeWidth={2}/>
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Category"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && children.map((child) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
         <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
         <p className="text-sm font-medium text-gray-500 animate-pulse">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Header
        title="Categories"
        buttonText="Add Category"
        navigation="/admin/category/create"
      />

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-primary/5 placeholder:text-gray-400 outline-none"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Category Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Classification
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Date Created
                </th>
                <th scope="col" className="px-6 py-4 text-right text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredCategories.length > 0 ? (
                filteredCategories
                  .filter((c) => !c.parentId || (searchTerm && c.parentId)) // If searching, show all matches. If not, only roots.
                  .map((category) => {
                     // When not searching, only render root nodes here (renderRow handles children recursively)
                     if (!searchTerm && category.parentId) return null;
                     return renderRow(category);
                  })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen size={24} className="text-gray-300" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">No categories found</h3>
                      <p className="text-xs text-gray-500">
                        {searchTerm ? "No categories match your search." : "Create your first category to organize your products."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Category;
