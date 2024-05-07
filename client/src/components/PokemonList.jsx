import { useState, useEffect } from "react";
import { Card } from "./Card/Card";
import {
  clearFilters,
  filterByAPI,
  filterByCreated,
  filterPokemons,
  sortPokemons,
} from "../redux/Actions/actions";
import { FilterBar } from "../components/FilterBar";
import Pagination from "./Pagination/Pagination";
import Loader from "./Loader/Loader";
import { useDispatch } from "react-redux";

export const PokemonList = ({ pokemons, currentPage, setCurrentPage }) => {
  const [loading, setLoading] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [checkboxState, setCheckboxState] = useState({
    asc: false,
    desc: false,
  });
  const dispatch = useDispatch();

  const handleCheckbox = (ev) => {
    const { name, checked } = ev.target;
    console.log(name)
    setCheckboxState({ ...checkboxState, [name]: checked });
    if (name === "asc" && checked) {
      dispatch(sortPokemons(name));
    } else if (name === "desc" && checked) {
      dispatch(sortPokemons("desc"));
    }

    if (name === "api" && checked) {
      dispatch(filterByAPI());
    } else if (name === "created" && checked) {
      dispatch(filterByCreated());
    }
    
    if (checked) {
      dispatch(filterPokemons(name));
    }else{
      dispatch(clearFilters());
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [pokemons]);

  const handlePageChange = (page) => {
    dispatch(clearFilters());
    setLoading(true);
    setCurrentPage(page);
    setCheckboxState({});
  };

  const handleToggleFilterActive = () => {
    setFilterActive(!filterActive);
  };

  const handleCloseFilterBar = () => {
    setFilterActive(false);
  };
  return (
    <div className="pokemon-list-container">
      <div className="container-filter container">
        <div className="icon-filter" onClick={handleToggleFilterActive}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          <span>Filtrar</span>
        </div>
      </div>
      <FilterBar
        active={filterActive}
        handleClose={handleCloseFilterBar}
        handleCheckbox={handleCheckbox}
        checkboxState={checkboxState}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={108}
        onPageChange={handlePageChange}
      />
      {loading ? (
        <Loader />
      ) : (
        <div className="card-list-pokemon container">
          {pokemons &&
            pokemons.map((pokemon, index) => (
              <div key={`${pokemon.id}-${index}`} className={`pokemon-card`}>
                <Card key={`${pokemon.id}-${index}`} pokemon={pokemon} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
