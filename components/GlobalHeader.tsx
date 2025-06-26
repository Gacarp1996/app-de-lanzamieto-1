import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GlobalHeader: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Estilos para el NavLink activo
  const activeLinkStyle = {
    textDecoration: 'underline',
    color: '#34D399', // Un color verde para destacar
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center fixed w-full top-0 z-10">
      <h1 className="text-xl font-bold">
        <Link to="/">Tenis Coaching App</Link>
      </h1>
      <nav>
        {currentUser ? (
          <div className="flex items-center">
            {/* --- LINKS DE NAVEGACIÓN --- */}
            <NavLink
              to="/"
              className="mr-4 hover:text-gray-300"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/players"
              className="mr-6 hover:text-gray-300"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Jugadores
            </NavLink>

            {/* --- BOTÓN DE LOGOUT --- */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          // Opcional: Mostrar un link a Login si no hay usuario
          <NavLink to="/login" className="hover:text-gray-300">
            Iniciar Sesión
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default GlobalHeader;