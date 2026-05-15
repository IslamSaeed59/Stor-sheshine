const { DataTypes } = require("sequelize");
const { sequelize } = require("../../Config/db");

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, { timestamps: true });

module.exports = Category;
