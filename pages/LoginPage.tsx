import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirige a la página de inicio después del login
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-app-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-app-surface rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-app-accent">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-app-secondary">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md app-input"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-app-secondary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md app-input"
            />
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 font-semibold text-white rounded-md app-button btn-primary">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
