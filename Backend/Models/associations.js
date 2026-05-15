const User = require("./User/User");
const Profile = require("./User/Profile");
const Employee = require("./User/Employee");

const Product = require("./Products/Product");
const Category = require("./Products/Category");
const ProductVariant = require("./Products/ProductVariant");
const MainPage = require("./MainPage/MainPage");

// User relationships
User.hasOne(Profile, { foreignKey: "userId", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Employee, { foreignKey: "userId", onDelete: "CASCADE" });
Employee.belongsTo(User, { foreignKey: "userId" });

// Category relationships (Self-referencing for subcategories)
Category.hasMany(Category, { as: "SubCategories", foreignKey: "parentId" });
Category.belongsTo(Category, { as: "ParentCategory", foreignKey: "parentId" });

// Product relationships
Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Product.hasMany(ProductVariant, { foreignKey: "productId", onDelete: "CASCADE" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  User,
  Profile,
  Employee,
  Product,
  Category,
  ProductVariant,
  MainPage,
};
