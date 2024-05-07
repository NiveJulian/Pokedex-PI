const URL = "https://pokeapi.co/api/v2/type";
const axios = require("axios");
const { Type } = require("../db");

exports.getTypes = async (req, res) => {
  try {
    const response = await axios.get("https://pokeapi.co/api/v2/type");
    const types = response.data.results; 
    for (const typeData of types) {
      const typeName = typeData.name;
      const existingType = await Type.findOne({ where: { name: typeName } });
      
      if (!existingType) {
        await Type.create({ name: typeName });
      }
    }

    res.json(types)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los tipos de pokemon" });
  }
};
