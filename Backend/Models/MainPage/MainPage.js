const { DataTypes } = require("sequelize");
const { sequelize } = require("../../Config/db");

const MainPage = sequelize.define("MainPage", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  HeroName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  HeroImage: {
    type: DataTypes.JSON, // For array of strings
    defaultValue: [],
  },
  HeroDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  HeroButton: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CollectionsName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CollectionsDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  OfferName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  OfferDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  AboutName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  AboutDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  AboutImage: {
    type: DataTypes.JSON, // For array of strings
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = MainPage;
