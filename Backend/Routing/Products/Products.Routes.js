const express = require("express");
const router = express.Router();
const productController = require("../../Controllers/Products/Product.Controller");

// ===================================
// 🔎 Search Routes (أول حاجة دايمًا)
// ===================================

// Product Search
router.get("/search", productController.searchProducts);

// Category Search
router.get("/categories/search", productController.searchCategories);

// Variant Search
router.get("/variants/search", productController.searchProductVariants);

// ===================================
// 📂 Category Routes
// ===================================

router.post("/categories", productController.CreateCategory);
router.get("/categories", productController.getCategories);
router.get("/categories/:id", productController.getCategoryById);
router.put("/categories/:id", productController.updateCategory);
router.delete("/categories/:id", productController.deleteCategory);
router.get("/smiller/:categoryId", productController.getProductsByCategory);

// ===================================
// 🧬 Variant Routes
// ===================================

// Get all variants for a product
router.get(
  "/variants/product/:productId",
  productController.getProductVariants,
);

router.post("/variants", productController.createProductVariant);
router.get("/variants/:id", productController.getProductVariantById);
router.put("/variants/:id", productController.updateProductVariant);
router.delete("/variants/:id", productController.deleteProductVariant);

// ===================================
// 📦 Product Routes (خلي :id آخر حاجة خالص)
// ===================================

// Filter by category
router.get("/category/:categoryId", productController.searchProductsByCategory);

router.post("/", productController.createProduct);
router.get("/", productController.getProducts);

// Feature & Bestseller (must come before /:id)
router.get("/bestsellers", productController.getBestsellerProducts);
router.get("/featured", productController.getFeaturedProducts);

router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
