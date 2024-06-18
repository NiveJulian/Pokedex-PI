const axios = require("axios");
const { Pokemon, Type } = require("../db");
const { Op } = require("sequelize");
const cache = {}

exports.getPokemons = async (req, res) => {
  try {
    // "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
    // Busca en la API
    const search = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=100');
    let pokemons_api = await Promise.all(
      search.data.results.map(async (pokemon) => {
        const data = await axios.get(pokemon.url);

        const hpStat = data.data.stats.find((stat) => stat.stat.name === "hp");
        const attackStat = data.data.stats.find(
          (stat) => stat.stat.name === "attack"
        );
        const defenseStat = data.data.stats.find(
          (stat) => stat.stat.name === "defense"
        );
        const speedStat = data.data.stats.find(
          (stat) => stat.stat.name === "speed"
        );

        const typeNames = data.data.types.map((type) => type.type.name);

        const {
          id,
          name,
          sprites: {
            other: {
              "official-artwork": { front_default: image },
            },
          },
          height,
          weight,
        } = data.data;

        return {
          id,
          name,
          image,
          hp: hpStat ? hpStat.base_stat : null, // Manejar el caso cuando la estadística no está presente
          attack: attackStat ? attackStat.base_stat : null,
          defense: defenseStat ? defenseStat.base_stat : null,
          speed: speedStat ? speedStat.base_stat : null,
          height,
          weight,
          types: typeNames,
        };
      })
    );
    // Busca en la base de datos
    let pokemons_db_search = await Pokemon.findAll({ include: Type });
    let pokemons_db = pokemons_db_search.map((pokemon) => {
      return {
        id: pokemon.id,
        externalId: pokemon.externalId,
        name: pokemon.name,
        image: pokemon.image,
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        speed: pokemon.speed,
        height: pokemon.height,
        weight: pokemon.weight,
        // Obtener los tipos para cada pokemón
        types: pokemon.types.map((type) => type.name),
      };
    });

    cache.pokemons = { api: pokemons_api, created: pokemons_db };

    let pokemons = { api: pokemons_api, created: pokemons_db };
    res.status(200).json(pokemons);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getPokemonById = async (req, res) => {
  const { idPokemon } = req.params;
  try {
    let URL = "https://pokeapi.co/api/v2/pokemon";
    let pokemon;

    if (idPokemon && idPokemon.length <= 5) {
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
      const pokemonOnDb = await Pokemon.findOne({
        where: { id: idPokemon },
        include: Type,
      });
      if (!pokemonOnDb) {
        return res.status(404).json({ message: "Pokemon no encontrado" });
      }

      const pokemonData = pokemonOnDb.toJSON();

      pokemon = {
        id: pokemonData.id,
        externalId: pokemonData.externalId,
        name: pokemonData.name,
        image: pokemonData.image,
        life: pokemonData.life,
        attack: pokemonData.attack,
        defense: pokemonData.defense,
        speed: pokemonData.speed,
        height: pokemonData.height,
        weight: pokemonData.weight,
        types: pokemonData.types.map((type) => type.name),
      };
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
    const lowercaseName = name.toLowerCase(); 

    // Buscar en la base de datos
    const dbPokemon = await Pokemon.findOne({
      where: {
        // Utilizar el nombre en minúsculas para la búsqueda
        name: {
          [Op.iLike]: `%${lowercaseName}%`,
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

    // Llamar a la API externa
    const URL = `https://pokeapi.co/api/v2/pokemon/${lowercaseName}`;

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

  if (
    !name ||
    !life ||
    !attack ||
    !defense ||
    !speed ||
    !height ||
    !weight ||
    !types
  ) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {

    const existingPokemon = await Pokemon.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    })

    if (existingPokemon) {
      return res.status(404).json({ message: "El Pokémon ya existe." });
    }

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
        where: { id: { [Op.in]: types } },
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
