import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getProducts,
  deleteProduct,
  getCategories,
} from "../../../Services/api";
import Header from "../../../Layout/Admin/Header";
import {
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const debounceTimerRef = React.useRef(null);

  useEffect(() => {
    fetchProducts(1, "", "");
    fetchCategories();
  }, []);

  const fetchProducts = async (
    page = currentPage,
    search = searchTerm,
    category = selectedCategory,
  ) => {
    setLoading(true);
    try {
      const response = await getProducts({
        page,
        limit: itemsPerPage,
        search,
        category,
      });
      setProducts(response.data.products || []);
      console.log(response.data.products);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalProducts(response.data.pagination.totalProducts || 0);
        setCurrentPage(response.data.pagination.currentPage || 1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setCurrentPage(1); // Reset to first page on search
      setSelectedCategory(""); // Reset category when searching
      fetchProducts(1, searchTerm, "");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      setSelectedCategory("");
      fetchProducts(1, value, "");
    }, 500);
  };

  const handleCategoryChange = (e) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSearchTerm("");
    setCurrentPage(1); // Reset to first page on category change

    fetchProducts(1, "", categoryId);
  };

  // Pagination Logic
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalProducts);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentProducts = products;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchProducts(pageNumber, searchTerm, selectedCategory);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Header
        title="Products Inventory"
        buttonText="Add New Product"
        navigation="/admin/products/create"
      />

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96 group">
          <div
            className="absolute inset-y-0 left-0 pl-4 flex items-center cursor-pointer"
            onClick={() => handleSearch({ key: "Enter" })}
          >
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary hover:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-primary/5 placeholder:text-gray-400 text-gray-900"
            placeholder="Search by name, brand, or SKU..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full md:w-64 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="block w-full pl-11 pr-10 py-3 bg-gray-50 border-transparent rounded-xl text-sm transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer text-gray-700"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase"
                >
                  Product Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase"
                >
                  Date Added
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-[11px] font-bold tracking-wider text-gray-500 uppercase"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-24">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-md"></div>
                        <img
                          src="/Logo1.png"
                          alt="Loading"
                          className="relative w-24 h-auto animate-bounce duration-1000"
                        />
                      </div>
                      <div className="flex justify-center gap-2">
                        <div
                          className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"
                          style={{ animationDelay: "0s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4 leading-normal">
                      <div className="flex items-center gap-4">
                        {/* Elegant Image Container */}
                        <div className="flex-shrink-0 h-14 w-10 bg-gray-50 rounded-md overflow-hidden ring-1 ring-gray-100">
                          {product.images ? (
                            <img
                              src={optimizeCloudinaryUrl(
                                Array.isArray(product.images)
                                  ? product.images[0]
                                  : product.images
                              )}
                              className="h-full w-full object-cover"
                              alt={product.name}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML =
                                  '<div class="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="min-w-0 max-w-[250px]">
                          <div className="font-semibold text-gray-900 truncate pb-0.5">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {product.brand && (
                              <span className="font-medium tracking-wide uppercase text-[10px] text-gray-400 mr-2">
                                {product.brand}
                              </span>
                            )}
                            {product.isBestseller && (
                              <span className="inline-flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                Best
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.Category?.name || "Uncategorized"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          EGP {parseFloat(product.basePrice).toFixed(2)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-xs text-primary font-medium">
                            -{product.discount}% Sale
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                      {new Date(product.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            navigate(`/admin/product/${product.id}`)
                          }
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/products/update/${product.id}`)
                          }
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        No products found
                      </h3>
                      <p className="text-xs text-gray-500 max-w-sm">
                        We couldn't find any products matching your current
                        search or category filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalProducts > itemsPerPage && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">{indexOfLastItem}</span> of{" "}
                  <span className="font-medium">{totalProducts}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => {
                      // Simple logic to show current, first, last, and immediate neighbors
                      if (
                        number === 1 ||
                        number === totalPages ||
                        (number >= currentPage - 1 && number <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === number
                                ? "z-10 bg-primary/10 border-primary text-primary"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {number}
                          </button>
                        );
                      } else if (
                        number === currentPage - 2 ||
                        number === currentPage + 2
                      ) {
                        return (
                          <span
                            key={number}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    },
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
            {/* Mobile Pagination */}
            <div className="flex items-center justify-between sm:hidden w-full">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
