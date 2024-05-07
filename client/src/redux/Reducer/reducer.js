// Importa las acciones que necesitas utilizar
import {
  GET_POKEMONS_SUCCESS,
  GET_POKEMONS_FAILURE,
  GET_POKEMON_BY_NAME_SUCCESS,
  GET_POKEMON_BY_NAME_FAILURE,
  GET_POKEMON_BY_ID_SUCCESS,
  GET_POKEMON_BY_ID_FAILURE,
  CREATE_POKEMON_SUCCESS,
  CREATE_POKEMON_FAILURE,
  GET_TYPES_SUCCESS,
  GET_TYPES_FAILURE,
  FILTER_POKEMONS,
  SORT_POKEMONS,
  CLEAR_FILTERS,
  FILTER_BY_API,
  FILTER_BY_CREATED,
} from "../Actions/actions";

// Define el estado inicial
const initialState = {
  pokemons: [],
  allPokemons: [],
  types: [],
  createdPokemons: [],
  foundPokemonName: null,
  error: null,
  filterType: null,
};

// Define el reducer
const rootReducer = (state = initialState, action) => {
  const { type, payload } = action;
  let filteredPokemons;
  let sortedPokemons;
  let selectedTypes;

  switch (type) {
    case GET_POKEMONS_SUCCESS:
      return {
        ...state,
        pokemons: payload.api,
        allPokemons: payload.api,
        createdPokemons: payload.created,
        error: null,
      };
    case GET_POKEMONS_FAILURE:
      return {
        ...state,
        error: payload,
      };
    case GET_POKEMON_BY_NAME_SUCCESS:
      return {
        ...state,
        pokemons: [payload.pokemon], // Agregar el nuevo Pokémon al array existente
        foundPokemonName: payload.foundPokemonName,
        error: null,
      };
    case GET_POKEMON_BY_NAME_FAILURE:
      return {
        ...state,
        error: payload,
      };
    case GET_POKEMON_BY_ID_SUCCESS:
      return {
        ...state,
        pokemons: [...state.pokemons, payload.pokemon], // Agregar el nuevo Pokémon al array existente
        error: null,
      };
    case GET_POKEMON_BY_ID_FAILURE:
      return {
        ...state,
        error: payload,
      };
    case CREATE_POKEMON_SUCCESS:
      return {
        ...state,
        pokemons: [...state.pokemons, payload],
        error: null,
      };
    case CREATE_POKEMON_FAILURE:
      return {
        ...state,
        error: payload,
      };
    case GET_TYPES_SUCCESS:
      return {
        ...state,
        types: payload,
        error: null,
      };
    case GET_TYPES_FAILURE:
      return {
        ...state,
        error: payload,
      };
    case FILTER_BY_API:
      return {
        ...state,
        pokemons: state.allPokemons,
        filterType: "api",
      };

    case FILTER_BY_CREATED:
      return {
        ...state,
        pokemons: state.createdPokemons,
        filterType: "created",
      };
    case FILTER_POKEMONS:
      selectedTypes = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      filteredPokemons = state.pokemons.filter((pokemon) => {
        return selectedTypes.every((type) => pokemon.types.includes(type));
      });
      return {
        ...state,
        filteredPokemons,
      };
    case SORT_POKEMONS:
      sortedPokemons = [...state.pokemons].sort((a, b) => {
        if (payload === "asc") {
          return a.name.localeCompare(b.name);
        } else if (payload === "desc") {
          return b.name.localeCompare(a.name);
        } else {
          return state.allPokemons;
        }
      });
      return {
        ...state,
        pokemons: sortedPokemons,
      };
    case CLEAR_FILTERS:
      return {
        ...state,
        pokemons: state.allPokemons,
        filteredPokemons: null,
      };
    default:
      return state;
  }
};

export default rootReducer;
