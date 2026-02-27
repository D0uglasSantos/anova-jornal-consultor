import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { apiRequest } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface LoginPageProps {
  onLoginSuccess: (userData: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      toast.success(`Bem-vindo, ${data.nome || username}!`);
      onLoginSuccess({ ...data, username });
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
      toast.error('Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <Toaster position="top-center" />
      {/* Background concentric circles effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[150vw] h-[150vw] border border-white/5 rounded-full absolute"></div>
        <div className="w-[120vw] h-[120vw] border border-white/5 rounded-full absolute"></div>
        <div className="w-[90vw] h-[90vw] border border-white/5 rounded-full absolute"></div>
        <div className="w-[60vw] h-[60vw] border border-white/5 rounded-full absolute"></div>
        <div className="w-[30vw] h-[30vw] border border-white/5 rounded-full absolute"></div>
      </div>

      <div className="z-10 w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2xl mx-4">
        <div className="flex flex-col items-center mb-8">
          {/* Logo - Anova Official */}
          <div className="w-24 h-24 mb-4 flex items-center justify-center">
             <img 
               src="/assets/logo-dark.svg" 
               alt="Anova Logo" 
               className="w-full h-full object-contain"
             />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] text-center">Plataforma de Operações</h1>
          <p className="text-sm text-gray-500 mt-1">Anova Investimentos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="seu email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-gray-900 placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs text-gray-500 hover:text-black transition-colors">
              Esqueceu sua senha?
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1a1a1a] text-white font-semibold rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Entrando...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
