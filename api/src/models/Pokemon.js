const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Definir el modelo
  const Pokemon = sequelize.define(
    "pokemon",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      externalId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attack: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      defense: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      speed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdInDb: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

    },
    {
      timestamps: false,
    }
  );

  return Pokemon;
};
