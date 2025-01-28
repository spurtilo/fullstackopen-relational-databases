const { Model, DataTypes } = require('sequelize');

const { sequelize } = require('../utils/db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: 'user',
  }
);

module.exports = User;
