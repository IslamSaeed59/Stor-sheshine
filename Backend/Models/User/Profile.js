const { DataTypes } = require("sequelize");
const { sequelize } = require("../../Config/db");

const Profile = sequelize.define(
  "Profile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DOB: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // userId will be added automatically by associations, but we can define it if we want strict typing
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Profile;
