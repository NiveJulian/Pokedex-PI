import { useEffect, useState } from "react";
import { CardDetail } from "../components/CardDetail/CardDetail";
import Loader from "../components/Loader/Loader";
import { getPokemonById } from "../redux/Actions/actions";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import IconLeft from "../components/Icons/IconLeft";

export const PokemonPage = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { id } = useParams(); 
  const pokemonId = parseInt(id);
  const pokemon = useSelector((state) => state.pokemons.find(pokemon => pokemon?.id === pokemonId));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startTime = Date.now();

        dispatch(getPokemonById(pokemonId)); 

        const endTime = Date.now(); 
        const serverResponseTime = endTime - startTime;
        return serverResponseTime
      } catch (error) {
        console.error("Error al obtener datos del servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, pokemonId]); 

  return (
    <div className="container-page">
      <div className="card-pokemon container">
        {/* Botón para volver a la página principal */}
        <Link to="/home" className="btn-back"> <IconLeft/>Volver al Home</Link>
        
        {/* Contenido de la página */}
        {loading ? (
          <Loader />
        ) : (
          pokemon && <CardDetail pokemon={pokemon} />
        )}
      </div>
    </div>
  );
};
