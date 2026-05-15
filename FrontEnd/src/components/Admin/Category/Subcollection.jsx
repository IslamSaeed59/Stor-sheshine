import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCategories } from "../../../Services/api";
import { toast } from "react-toastify";
import Header from "../../../Layout/Admin/Header";

const Subcollection = () => {
  const { id } = useParams();
  const [subcollections, setSubcollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentCategory, setParentCategory] = useState(null);

  useEffect(() => {
    const fetchSubcollections = async () => {
      try {
        const response = await getCategories();
        const allCategories = response.data || [];

        // Find parent category
        const parent = allCategories.find((c) => c.id === parseInt(id));
        setParentCategory(parent);

        // Filter for children
        const children = allCategories.filter(
          (cat) => cat.parentId === parseInt(id),
        );
        setSubcollections(children);
      } catch (error) {
        console.error("Error fetching subcollections:", error);
        toast.error("Failed to load subcollections");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubcollections();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Header
        title={
          parentCategory
            ? `${parentCategory.name} Subcollections`
            : "Subcollections"
        }
        buttonText="Back to Categories"
        navigation="/admin/category"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcollections.length > 0 ? (
          subcollections.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 overflow-hidden bg-gray-100 relative group">
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {sub.name}
                </h3>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Created:{" "}
                    {new Date(sub.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            <p className="text-lg font-medium">No subcollections found</p>
            <p className="text-sm mt-1">
              This category does not have any child categories yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subcollection;
