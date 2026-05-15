import React, { useEffect, useState } from "react";
import { getCategories } from "../../../Services/api";
import { Search, X, ChevronRight, Check } from "lucide-react";

const ProductsSidBar = ({ onFilterChange, activeFilters = {} }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filters, setFilters] = useState({
    categoryId: activeFilters.categoryId || "",
    subCategories: activeFilters.subCategories || "",
    minPrice: activeFilters.minPrice || "",
    maxPrice: activeFilters.maxPrice || "",
    search: activeFilters.search || "",
  });

  useEffect(() => {
    setFilters({
      categoryId: activeFilters.categoryId || "",
      subCategories: activeFilters.subCategories || "",
      minPrice: activeFilters.minPrice || "",
      maxPrice: activeFilters.maxPrice || "",
      search: activeFilters.search || "",
    });
  }, [activeFilters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        console.log("response", response.data);
        const allCategories = response.data || [];

        const mainCategories = allCategories.filter((cat) => !cat.parentId);
        const organizedCategories = mainCategories.map((mainCat) => ({
          ...mainCat,
          subCategories: allCategories.filter(
            (cat) => cat.parentId === (mainCat.id || mainCat.id),
          ),
        }));

        setCategories(organizedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryClick = (categoryId) => {
    const newFilters = {
      ...filters,
      categoryId: filters.categoryId === categoryId ? "" : categoryId,
      subCategories: "", // Clear subcategories when navigating to a new specific category
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const clearSearch = () => {
    const newFilters = { ...filters, search: "" };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      categoryId: "",
      subCategories: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 pb-10">
      {/* Header */}
      <div className="px-6 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-900">
          Refine By
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs uppercase tracking-widest text-primary hover:text-gray-900 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative group">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder="Search collections..."
            className="w-full pl-0 pr-8 py-2 text-sm border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-900 bg-transparent placeholder-gray-400 text-gray-900 transition-colors"
          />
          <Search
            size={16}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Categories Section */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">
            Categories
          </h4>
          <div className="space-y-4">
            <button
              onClick={() => handleCategoryClick("")}
              className="w-full text-left flex items-center justify-between group"
            >
              <span
                className={`text-sm tracking-wide transition-colors ${filters.categoryId === "" ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}`}
              >
                All Collections
              </span>
              {filters.categoryId === "" && (
                <Check size={14} className="text-gray-900" />
              )}
            </button>

            {categories.map((category) => {
              const categoryId = category.id || category.id;
              const isExpanded = expandedCategories[categoryId];
              const hasSubcategories =
                category.subCategories && category.subCategories.length > 0;
              const isActive = filters.categoryId === categoryId;

              return (
                <div key={categoryId} className="space-y-3">
                  <button
                    onClick={() =>
                      hasSubcategories
                        ? toggleExpanded(categoryId)
                        : handleCategoryClick(categoryId)
                    }
                    className="w-full text-left flex items-center justify-between group"
                  >
                    <span
                      className={`text-sm tracking-wide transition-colors ${isActive ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}`}
                    >
                      {category.name}
                    </span>
                    <div className="flex items-center">
                      {isActive && !hasSubcategories && (
                        <Check size={14} className="text-gray-900" />
                      )}
                      {hasSubcategories && (
                        <ChevronRight
                          size={14}
                          className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      )}
                    </div>
                  </button>

                  {/* Subcategories (if any) */}
                  {hasSubcategories && isExpanded && (
                    <div className="pl-4 border-l border-gray-100 space-y-3 mt-3 ml-1">
                      {category.subCategories.map((subCategory) => {
                        const subId = subCategory.id || subCategory.id;
                        const isSubActive = filters.categoryId === subId;
                        return (
                          <button
                            key={subId}
                            onClick={() => handleCategoryClick(subId)}
                            className="w-full text-left flex items-center justify-between group"
                          >
                            <span
                              className={`text-xs tracking-wide transition-colors ${isSubActive ? "text-gray-900 font-medium" : "text-gray-400 hover:text-gray-900"}`}
                            >
                              {subCategory.name}
                            </span>
                            {isSubActive && (
                              <Check size={12} className="text-gray-900" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="p-6">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">
            Price Range
          </h4>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                $
              </span>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleInputChange}
                placeholder="Min"
                className="w-full pl-4 pr-0 py-2 text-sm border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-900 bg-transparent text-gray-900 transition-colors"
                min="0"
              />
            </div>
            <span className="text-gray-300">—</span>
            <div className="flex-1 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                $
              </span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleInputChange}
                placeholder="Max"
                className="w-full pl-4 pr-0 py-2 text-sm border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-900 bg-transparent text-gray-900 transition-colors"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: "Under $100", min: "0", max: "100" },
              { label: "$100 - $250", min: "100", max: "250" },
              { label: "$250 & Above", min: "250", max: "" },
            ].map((range, idx) => {
              const isActive =
                filters.minPrice === range.min &&
                filters.maxPrice === range.max;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      minPrice: range.min,
                      maxPrice: range.max,
                    };
                    setFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                  className={`w-full text-left flex items-center gap-3 group`}
                >
                  <div
                    className={`w-3 h-3 border rounded-sm transition-colors ${isActive ? "bg-primary border-primary" : "border-gray-300 group-hover:border-gray-900"}`}
                  >
                    {isActive && <Check size={10} className="text-white" />}
                  </div>
                  <span
                    className={`text-xs tracking-wide ${isActive ? "text-gray-900 font-medium" : "text-gray-500 group-hover:text-gray-900"}`}
                  >
                    {range.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsSidBar;
