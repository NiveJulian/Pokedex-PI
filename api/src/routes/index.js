const { Router } = require('express');
const pokemonController = require('../controllers/pokemonController');
const typeController = require('../controllers/typeController');

const router = Router();

// Rutas para los pokemones
router.get('/pokemons', pokemonController.getPokemons);
// router.get('/allpokemons', pokemonController.getAllPokemons);
router.get('/pokemons/name', pokemonController.getPokemonByName);
router.get('/pokemons/:idPokemon', pokemonController.getPokemonById);

router.post('/pokemons', pokemonController.createPokemon);

router.get('/types', typeController.getTypes);
// Agrega las demás rutas relacionadas con los tipos de pokemon...

module.exports = router;
