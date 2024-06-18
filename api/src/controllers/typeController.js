const URL = "https://pokeapi.co/api/v2/type";
const axios = require("axios");
const { Type } = require("../db");

exports.getTypes = async (req, res) => {
  try {
    const existingTypes = await Type.findAll();
    
    if (existingTypes.length === 0) {
      const response = await axios.get("https://pokeapi.co/api/v2/type?limit=21");
      const typesFromApi = response.data.results.map((type) => ({
        name: type.name,
      }));
      const createdTypes = await Type.bulkCreate(typesFromApi);
      return res.json(createdTypes);
    } else {
      return res.json(existingTypes);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los tipos de Pokémon" });
  }
};
