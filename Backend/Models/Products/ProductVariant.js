const { DataTypes } = require("sequelize");
const { sequelize } = require("../../Config/db");

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.JSON, // For array of strings
      defaultValue: [],
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    imageVariant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sizeChart: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = ProductVariant;
