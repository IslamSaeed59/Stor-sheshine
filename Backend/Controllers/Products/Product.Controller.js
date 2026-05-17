const {
  Product,
  ProductVariant,
  Category,
} = require("../../Models/associations");
const asyncHandler = require("../../Middleware/asyncHandler");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

// Helper function to delete local files
const deleteLocalFile = async (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(__dirname, "../../..", imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Local file deletion error:", err);
  }
};

exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    basePrice,
    categoryId,
    brand,
    size,
    color,
    price,
    stock,
    images,
    imageVariant,
    sizeChart,
    discount,
  } = req.body;
  const product = await Product.create({
    name,
    description,
    basePrice,
    categoryId,
    brand,
    images,
    discount,
  });

  const variant = await ProductVariant.create({
    size,
    color,
    price,
    stock,
    imageVariant,
    sizeChart,
    productId: product.id,
  });

  res.status(201).json({ product, variant });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, category, subCategories, minPrice, maxPrice } =
    req.query;

  const query = {};

  if (search) {
    query[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (category || subCategories) {
    const targetIds = [];
    if (category) targetIds.push(category);
    if (subCategories) {
      targetIds.push(...subCategories.split(","));
    }
    if (targetIds.length > 0) {
      query.categoryId = { [Op.in]: targetIds };
    }
  }

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice && !isNaN(parseFloat(minPrice)))
      query.basePrice[Op.gte] = parseFloat(minPrice);
    if (maxPrice && !isNaN(parseFloat(maxPrice)))
      query.basePrice[Op.lte] = parseFloat(maxPrice);
  }

  // If pagination params are provided, paginate; otherwise return all
  let products;
  let totalProducts;
  let totalPages;
  let currentPage;

  const includeConfig = [
    {
      model: Category,
      attributes: ["id", "name", "parentId"],
    },
    {
      model: ProductVariant,
      attributes: ["id", "size", "stock", "color", "price"],
    },
  ];

  if (page && limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    totalProducts = await Product.count({ where: query });
    totalPages = Math.ceil(totalProducts / limitNum);
    currentPage = pageNum;

    products = await Product.findAll({
      where: query,
      attributes: [
        "id",
        "name",
        "isBestseller",
        "images",
        "discount",
        "basePrice",
        "categoryId",
        "createdAt",
      ],
      include: includeConfig,
      order: [["name", "ASC"]],
      offset,
      limit: limitNum,
    });
  } else {
    // No pagination → return ALL products sorted A to Z
    products = await Product.findAll({
      where: query,
      attributes: [
        "id",
        "name",
        "isBestseller",
        "images",
        "discount",
        "basePrice",
        "categoryId",
      ],
      include: includeConfig,
      order: [["name", "ASC"]],
    });
    totalProducts = products.length;
    totalPages = 1;
    currentPage = 1;
  }

  // Format to match old output style (optional, but good for backward compatibility)
  const productsWithData = products.map((product) => {
    const p = product.toJSON();
    return {
      ...p,
      Category: p.Category,
      ProductVariants: p.ProductVariants,
    };
  });

  res.json({
    products: productsWithData,
    pagination: {
      totalProducts,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id, {
    include: [{ model: Category }, { model: ProductVariant }],
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const p = product.toJSON();

  res.json({
    ...p,
    Category: p.Category,
    ProductVariants: p.ProductVariants,
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { images } = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Handle local image deletion for replaced or removed images
  if (req.body.hasOwnProperty("images") && Array.isArray(images)) {
    const newImageUrls = images.filter((img) => typeof img === "string");
    const oldImages = product.images || [];
    const imagesToDelete = oldImages.filter(
      (oldImg) => !newImageUrls.includes(oldImg),
    );

    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((img) => deleteLocalFile(img)));
    }
  }

  await product.update(req.body);

  res.json(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id, {
    include: [ProductVariant],
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete all product images from local storage
  if (product.images && product.images.length > 0) {
    await Promise.all(product.images.map((img) => deleteLocalFile(img)));
  }

  // Delete all associated variant images from local storage
  const variants = product.ProductVariants || [];
  for (const variant of variants) {
    if (variant.imageVariant) await deleteLocalFile(variant.imageVariant);
    if (variant.sizeChart) await deleteLocalFile(variant.sizeChart);
  }

  await product.destroy(); // Due to cascading, variants will be deleted
  res.json({ message: "Product removed" });
});

exports.CreateCategory = asyncHandler(async (req, res) => {
  const { name, parentId, image } = req.body;
  const category = await Category.create({ name, parentId, image });
  res.status(201).json(category);
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // If the image is being changed (or removed entirely), delete the old image from local storage
  if (
    req.body.hasOwnProperty("image") &&
    req.body.image !== category.image &&
    category.image
  ) {
    await deleteLocalFile(category.image);
  }

  await category.update(req.body);

  res.json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Delete associated image from local storage if it exists
  if (category.image) {
    await deleteLocalFile(category.image);
  }

  // Delete all subcategories
  await Category.destroy({ where: { parentId: id } });

  await category.destroy();

  res.json({ message: "Category removed" });
});

exports.createProductVariant = asyncHandler(async (req, res) => {
  const { productId, size, color, price, stock, imageVariant, sizeChart } =
    req.body;
  const variant = await ProductVariant.create({
    productId,
    size,
    color,
    price,
    stock,
    imageVariant,
    sizeChart,
  });
  res.status(201).json(variant);
});

exports.getProductVariants = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const variants = await ProductVariant.findAll({ where: { productId } });
  res.json(variants);
});

exports.getProductVariantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const variant = await ProductVariant.findByPk(id);
  if (!variant) {
    res.status(404);
    throw new Error("Variant not found");
  }
  res.json(variant);
});

exports.updateProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const variant = await ProductVariant.findByPk(id);
  if (!variant) {
    res.status(404);
    throw new Error("Variant not found");
  }

  // Check if imageVariant was updated/removed
  if (
    req.body.hasOwnProperty("imageVariant") &&
    req.body.imageVariant !== variant.imageVariant &&
    variant.imageVariant
  ) {
    await deleteLocalFile(variant.imageVariant);
  }

  // Check if sizeChart was updated/removed
  if (
    req.body.hasOwnProperty("sizeChart") &&
    req.body.sizeChart !== variant.sizeChart &&
    variant.sizeChart
  ) {
    await deleteLocalFile(variant.sizeChart);
  }

  await variant.update(req.body);

  res.json(variant);
});

exports.deleteProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const variant = await ProductVariant.findByPk(id);

  if (!variant) {
    res.status(404);
    throw new Error("Variant not found");
  }

  if (variant.imageVariant) await deleteLocalFile(variant.imageVariant);
  if (variant.sizeChart) await deleteLocalFile(variant.sizeChart);

  await variant.destroy();
  res.json({ message: "Variant removed" });
});

exports.searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const products = await Product.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
      ],
    },
  });
  res.json(products);
});

exports.searchCategories = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const categories = await Category.findAll({
    where: {
      name: { [Op.like]: `%${query}%` },
    },
  });
  res.json(categories);
});

exports.searchProductVariants = asyncHandler(async (req, res) => {
  const { query } = req.query;
  // Searching inside JSON array for colors using LIKE is simple but not perfect.
  const variants = await ProductVariant.findAll({
    where: {
      [Op.or]: [
        { size: { [Op.like]: `%${query}%` } },
        { color: { [Op.like]: `%${query}%` } },
      ],
    },
  });
  res.json(variants);
});

exports.searchProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const products = await Product.findAll({ where: { categoryId } });
  res.json(products);
});

exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const products = await Product.findAll({
    where: { categoryId },
    include: [{ model: ProductVariant, attributes: ["stock"] }],
  });

  const productsWithStock = products.map((p) => {
    const pt = p.toJSON();
    return { ...pt };
  });

  res.json(productsWithStock);
});

exports.getBestsellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { isBestseller: true },
    attributes: [
      "id",
      "name",
      "isBestseller",
      "images",
      "discount",
      "basePrice",
      "categoryId",
      "createdAt",
    ],
    include: [
      { model: Category, attributes: ["name", "parentId"] },
      { model: ProductVariant, attributes: ["size"] },
    ],
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  res.json(products);
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { isFeatured: true },
    attributes: [
      "id",
      "name",
      "isBestseller",
      "images",
      "discount",
      "basePrice",
      "categoryId",
      "createdAt",
    ],
    include: [
      { model: Category, attributes: ["name", "parentId"] },
      { model: ProductVariant, attributes: ["size"] },
    ],
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  res.json(products);
});
