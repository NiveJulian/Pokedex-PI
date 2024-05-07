const axios = require("axios");
const { Pokemon, Type } = require("../db");
const { Op } = require("sequelize");

// ---------------------

exports.getPokemons = async (req, res) => {
  try {
    const page = req.query.page;
    const pageSize = 12;
    const offset = (page - 1) * pageSize;

    // Obtengo datos de la API
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`
    );
    const pokemonList = response.data.results;

    // Función para obtener la información necesaria de cada Pokémon
    const getBasicPokemonInfo = async (url) => {
      const detailedResponse = await axios.get(url);
      const { id, name, sprites, stats, height, weight, types } =
        detailedResponse.data;
      const life = stats.find((stat) => stat.stat.name === "hp").base_stat;
      const attack = stats.find(
        (stat) => stat.stat.name === "attack"
      ).base_stat;
      const defense = stats.find(
        (stat) => stat.stat.name === "defense"
      ).base_stat;
      const speed = stats.find((stat) => stat.stat.name === "speed").base_stat;

      const pokemonTypes = types.map((typeData) => typeData.type.name);

      return {
        id,
        name,
        image: sprites.other.dream_world.front_default,
        life,
        attack,
        defense,
        speed,
        height,
        weight,
        types: pokemonTypes,
      };
    };

    const detailedPokemons = await Promise.all(
      pokemonList.map(async (pokemon) => {
        return await getBasicPokemonInfo(pokemon.url);
      })
    );

    let pokemonsDb = await Pokemon.findAll({ include: Type });
    let pokemonOnDb = [];
    if (pokemonsDb && pokemonsDb.length > 0) {
      pokemonOnDb = pokemonsDb.map((pokemon) => ({
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        life: pokemon.life,
        attack: pokemon.attack,
        defense: pokemon.defense,
        speed: pokemon.speed,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map((type) => type.name),
      }));
    }

    const pokemons = { created: pokemonOnDb, api: detailedPokemons };
    res.json(pokemons);
  } catch (error) {
    // Manejar errores
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pokemons" });
  }
};

exports.getPokemonById = async (req, res) => {
  const { idPokemon } = req.params;
  try {
    let URL = "https://pokeapi.co/api/v2/pokemon";
    let pokemon;

    if (parseInt(idPokemon) < 800) {
      const response = await axios.get(`${URL}/${idPokemon}`);
      pokemon = response.data;

      const {
        id,
        name: pokemonName,
        sprites,
        stats,
        height,
        weight,
        types,
      } = pokemon;
      const life = stats.find((stat) => stat.stat.name === "hp").base_stat;
      const attack = stats.find(
        (stat) => stat.stat.name === "attack"
      ).base_stat;
      const defense = stats.find(
        (stat) => stat.stat.name === "defense"
      ).base_stat;
      const speed = stats.find((stat) => stat.stat.name === "speed").base_stat;
      const pokemonTypes = types.map((typeData) => typeData.type.name);

      const detailedPokemon = {
        id,
        name: pokemonName,
        image: sprites.other.dream_world.front_default,
        life,
        attack,
        defense,
        speed,
        height,
        weight,
        types: pokemonTypes,
      };

      res.json(detailedPokemon);
    } else {
      pokemon = await Pokemon.findByPk(idPokemon);
      if (!pokemon) {
        return res.status(404).json({ message: "Pokemon no encontrado" });
      }
      pokemon.dataValues.types = await Type.findAll({
        where: { pokemonId: idPokemon },
        attributes: ["name"],
      });

      res.json(pokemon);
    }
  } catch (error) {
    console.error("Error al obtener el Pokémon por ID:", error.message);
    res.status(500).json({ message: "Error al obtener el Pokémon por ID" });
  }
};

exports.getPokemonByName = async (req, res) => {
  const { name } = req.query;
  try {
    const dbPokemon = await Pokemon.findOne({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
      include: [
        {
          model: Type,
          attributes: ["name"],
        },
      ],
    });

    if (dbPokemon) {
      const types = dbPokemon.types.map((type) => type.name);
      const detailedPokemon = {
        ...dbPokemon.toJSON(),
        types,
      };
      return res.json(detailedPokemon);
    }

    const URL = `https://pokeapi.co/api/v2/pokemon/${name}`;

    const response = await axios.get(URL);
    const pokemonData = response.data;

    const {
      id,
      name: pokemonName,
      sprites,
      stats,
      height,
      weight,
      types,
    } = pokemonData;
    const life = stats.find((stat) => stat.stat.name === "hp").base_stat;
    const attack = stats.find((stat) => stat.stat.name === "attack").base_stat;
    const defense = stats.find(
      (stat) => stat.stat.name === "defense"
    ).base_stat;
    const speed = stats.find((stat) => stat.stat.name === "speed").base_stat;
    const pokemonTypes = types.map((typeData) => typeData.type.name);

    const detailedPokemon = {
      id,
      name: pokemonName,
      image: sprites.other.dream_world.front_default,
      life,
      attack,
      defense,
      speed,
      height,
      weight,
      types: pokemonTypes,
    };

    res.json(detailedPokemon);
  } catch (error) {
    console.error("Error al obtener el Pokémon por nombre:", error.message);
    res.status(500).json({ message: "Error al obtener el Pokémon por nombre" });
  }
};

exports.createPokemon = async (req, res) => {
  const { name, image, life, attack, defense, speed, height, weight, types } =
    req.body;

  if (!name || !life || !attack || !defense || !speed || !height || !weight) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const newPokemon = await Pokemon.create({
      name,
      image,
      life,
      attack,
      defense,
      speed,
      height,
      weight,
    });

    if (types && types.length > 0) {
      const typeRecords = await Type.findAll({
        where: { name: { [Op.in]: types } },
      });

      if (typeRecords.length !== types.length) {
        return res
          .status(400)
          .json({ message: "Algunos tipos proporcionados no existen." });
      }

      await newPokemon.addTypes(typeRecords);
    }

    res.status(201).json(newPokemon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el Pokémon" });
  }
};
