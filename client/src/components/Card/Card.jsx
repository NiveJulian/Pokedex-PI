import { Link } from "react-router-dom";
import styles from "./Card.module.css"

export const Card = ({ pokemon }) => {
  return (
    <Link to={`/pokemon/${pokemon.id}`} className="card-pokemon">
      <div className="card-img">
        <img src={pokemon.image} alt={`Pokemon ${pokemon.name}`} />
      </div>
      <div className="card-info">
        <span className="pokemon-id">N° {pokemon.id}</span>
        <h3>{pokemon.name}</h3>
        <div className='card-types'>
          {pokemon.types &&
            pokemon.types.map((type) => (
              <span key={type} className={type}>
                {type}
              </span>
            ))}
        </div>
      </div>
    </Link>
  );
};
