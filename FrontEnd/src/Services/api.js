import axios from "axios";

// Create an axios instance
const apiClient = axios.create({
  // baseURL: "https://api-chi-eight-27.vercel.app/api/",
  baseURL: "http://localhost:9000/api/",

  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Or wherever you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
//==============
// Upload Image
//==============
export const uploadImage = (imageData) =>
  apiClient.post("/upload", imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const uploadCategoryImage = (imageData) =>
  apiClient.post("/upload/categories", imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const uploadVariantImage = (imageData) =>
  apiClient.post("/upload/imageVariant", imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const uploadsizeChartImage = (imageData) =>
  apiClient.post("/upload/sizeChart", imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/*//==============
Auth
///////////////*/
export const login = (credentials) =>
  apiClient.post("/auth/login", credentials);

/*//==============
Users
///////////////*/
export const getUsers = () => apiClient.get("/users");
export const getUserById = (userId) => apiClient.get(`/users/${userId}`);
export const createUser = (userData) => apiClient.post("/users", userData);
export const updateUser = (userId, userData) =>
  apiClient.put(`/users/${userId}`, userData);
export const deleteUser = (userId) => apiClient.delete(`/users/${userId}`);

/*//==============
Profiles
///////////////*/
export const getProfiles = () => apiClient.get("/profiles");
export const getProfileById = (profileId) =>
  apiClient.get(`/profiles/${profileId}`);
export const updateProfile = (profileId, profileData) =>
  apiClient.put(`/profiles/${profileId}`, profileData);
export const deleteProfile = (profileId) =>
  apiClient.delete(`/profiles/${profileId}`);

/*//==============
Employees
///////////////*/

export const getEmployees = () => apiClient.get("/employees");
export const getEmployeeById = (employeeId) =>
  apiClient.get(`/employees/${employeeId}`);
export const updateEmployee = (employeeId, employeeData) =>
  apiClient.put(`/employees/${employeeId}`, employeeData);
export const deleteEmployee = (employeeId) =>
  apiClient.delete(`/employees/${employeeId}`);

// ==========================
//  Products CRUD
// ==========================

export const createProduct = (productData) =>
  apiClient.post("/products", productData);

export const getProducts = (params = {}) =>
  apiClient.get("/products", { params });
export const getProductById = (productId) =>
  apiClient.get(`/products/${productId}`);
export const updateProduct = (productId, productData) =>
  apiClient.put(`/products/${productId}`, productData);
export const deleteProduct = (productId) =>
  apiClient.delete(`/products/${productId}`);
export const searchProducts = (query) =>
  apiClient.get(`/products/search?query=${query}`);

export const getProductsByCategory = (categoryId) =>
  apiClient.get(`products/smiller/${categoryId}`);

export const getBestsellerProducts = () =>
  apiClient.get("/products/bestsellers");
export const getFeaturedProducts = () => apiClient.get("/products/featured");

// ==========================
// Category CRUD
// ==========================

export const getCategories = () => apiClient.get("/products/categories");
export const getCategoryById = (categoryId) =>
  apiClient.get(`/products/categories/${categoryId}`);
export const createCategory = (categoryData) =>
  apiClient.post("/products/categories", categoryData);
export const updateCategory = (categoryId, categoryData) =>
  apiClient.put(`/products/categories/${categoryId}`, categoryData);
export const deleteCategory = (categoryId) =>
  apiClient.delete(`/products/categories/${categoryId}`);

export const searchProductsByCategory = (categoryId) =>
  apiClient.get(`/products/category/${categoryId}`);

export const searchCategories = (query) =>
  apiClient.get(`/products/categories/search?query=${query}`);

// ==========================
// Variant CRUD
// ==========================

export const getVariants = () => apiClient.get("/products/variants");
export const getVariantById = (variantId) =>
  apiClient.get(`/products/variants/${variantId}`);
export const createVariant = (variantData) =>
  apiClient.post("/products/variants", variantData);
export const updateVariant = (variantId, variantData) =>
  apiClient.put(`/products/variants/${variantId}`, variantData);
export const deleteVariant = (variantId) =>
  apiClient.delete(`/products/variants/${variantId}`);

export const searchVariants = (query) =>
  apiClient.get(`/products/variants/search?query=${query}`);

export const getProductVariants = (productId) =>
  apiClient.get(`/products/variants/product/${productId}`);

// ==========================
// MainPage CRUD
// ==========================

export const getMainPage = () => apiClient.get("/mainpage");
export const createMainPage = (mainPageData) =>
  apiClient.post("/mainpage", mainPageData);
export const updateMainPage = (mainPageData) =>
  apiClient.put("/mainpage", mainPageData);

export const uploadMainPageImage = (imageData) =>
  apiClient.post("/upload/mainpage", imageData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export default apiClient;
