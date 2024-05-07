import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { SearchBar } from "../SearchBar/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import { getPokemonByName, getPokemons } from "../../redux/Actions/actions";
import PokemonLogo from "../../assets/Pokemon_logo.png";
import { useEffect, useState } from "react";
import Alert from "../Alert/Alert";

export const Nav = () => {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.error);
  const [currentPage, setCurrentPage] = useState(1);

  const [showAlert, setShowAlert] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleSubmit = async (namePokemon) => {
    dispatch(getPokemonByName(namePokemon));
    navigate(`/home?search=${namePokemon}`);
  };

  const handleLogoClick = () => {
    dispatch(getPokemons(currentPage)); // Llama a la nueva acción para obtener todos los pokémones
  };
  // Mostrar la alerta solo cuando se detecte un error después de una búsqueda
  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  return (
    <>
      {showAlert && (
        <Alert
          message="Por favor verifica la información que envías"
          onClose={handleAlertClose}
        />
      )}
      <header className="container">
        <Link to="/home" className="logo" onClick={handleLogoClick}>
          <img src={PokemonLogo} alt="Logo Pokemon" />
        </Link>
        {location.pathname === "/home" && <SearchBar onSearch={handleSubmit} />}
        <Link to="/form" className="btn-form">
          Crear pokemon
        </Link>
      </header>

      <Outlet />
    </>
  );
};
