import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductsSidBar from "./ProductsSidBar";
import ProductsGrid from "./ProductsGrid";
import { getProducts } from "../../../Services/api";
import {
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const PRODUCTS_PER_PAGE = 20;

const UserProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    const categoryId = searchParams.get("categoryId");
    const subCategories = searchParams.get("subCategories");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const pageParam = parseInt(searchParams.get("page")) || 1;

    setCurrentPage(pageParam);

    const initialFilters = {};
    if (categoryId) initialFilters.categoryId = categoryId;
    if (subCategories) initialFilters.subCategories = subCategories;
    if (search) initialFilters.search = search;
    if (minPrice) initialFilters.minPrice = minPrice;
    if (maxPrice) initialFilters.maxPrice = maxPrice;

    const hasInitialFilters = Object.keys(initialFilters).length > 0;

    if (hasInitialFilters) {
      setActiveFilters(initialFilters);
      fetchProducts(pageParam, initialFilters);
    } else {
      fetchProducts(pageParam, {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The page change data-fetching is now fully handled by `handlePageChange` directly.

  const syncFiltersToUrl = (filters, page = 1) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.subCategories)
      params.set("subCategories", filters.subCategories);
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  };

  const fetchProducts = async (page = 1, currentFilters = activeFilters) => {
    setLoading(true);
    try {
      // Map categoryId to category for the backend API
      const apiFilters = { ...currentFilters };
      if (apiFilters.categoryId) {
        apiFilters.category = apiFilters.categoryId;
        delete apiFilters.categoryId;
      }
      
      const params = { page, limit, ...apiFilters };
      
      const response = await getProducts(params);
      const fetchedProducts = response.data.products || [];
      const pagination = response.data.pagination || {};

      setProducts(fetchedProducts);
      setTotalPages(pagination.totalPages || 1);
      setTotalProducts(pagination.totalProducts || fetchedProducts.length);
      setCurrentPage(pagination.currentPage || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    syncFiltersToUrl(filters, 1);
    fetchProducts(1, filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
    fetchProducts(1, {});
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    syncFiltersToUrl(activeFilters, page);
    fetchProducts(page, activeFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      const adjustedStart = Math.max(1, end - maxVisible + 1);

      if (adjustedStart > 1) {
        pages.push(1);
        if (adjustedStart > 2) pages.push("...");
      }

      for (let i = adjustedStart; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => activeFilters[key],
  );
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white overflow-hidden pt-12">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-0 w-72 bg-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full relative pt-0 lg:pt-0">
          <div className="lg:hidden absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <ProductsSidBar
            onFilterChange={handleFilterChange}
            activeFilters={activeFilters}
          />
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto w-full relative custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                The Collection
              </h1>
              <p className="text-gray-500 text-sm tracking-wide font-light">
                {totalProducts > 0
                  ? `Showing ${startItem}-${endItem} of ${totalProducts} products`
                  : "Discover our premium selection"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-6 py-2 border border-gray-200 text-sm font-medium tracking-widest uppercase hover:border-gray-900 transition-colors"
              >
                <Filter size={16} />
                Filter
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="hidden lg:flex items-center gap-2 px-6 py-2 text-sm font-medium tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium tracking-widest uppercase text-gray-400">
                Loading collection...
              </p>
            </div>
          ) : (
            <>
              <ProductsGrid products={products} />

              {totalPages > 1 && (
                <div className="mt-16 flex justify-center border-t border-gray-100 pt-10 pb-16">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} strokeWidth={1.5} />
                    </button>

                    <div className="flex items-center gap-1 mx-4">
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`dots-${index}`}
                            className="px-2 text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 flex items-center justify-center text-sm transition-all ${
                              currentPage === page
                                ? "bg-gray-900 text-white font-medium"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProducts;
