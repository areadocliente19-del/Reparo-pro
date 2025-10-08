import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface LoginProps {
  onLogin: (email: string, password: string) => { success: boolean, error?: string };
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'forgotPassword'>('login');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Forgot password state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // General state
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = onLogin(email, password);
      if (!result.success) {
        setError(result.error || 'Falha no login.');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage('');
    setIsLoading(true);
    
    setTimeout(() => {
      setRecoveryMessage('Se uma conta com este e-mail existir, um link de recuperação foi enviado.');
      setIsLoading(false);
    }, 1000);
  };

  const switchToLoginView = () => {
    setView('login');
    setError('');
    setRecoveryMessage('');
    setRecoveryIdentifier('');
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 text-gray-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89c-.31.25-.68.42-1.07.49l-2.9.42c-1.62.23-2.28 2.18-1.09 3.33l2.1 2.05c.24.24.36.58.31.92l-.5 2.88c-.28 1.6.93 2.83 2.36 2.12l2.6-1.37c.33-.17.71-.17 1.04 0l2.6 1.37c1.43.71 2.64-.52 2.36-2.12l-.5-2.88c-.05-.34.07-.68.31-.92l2.1-2.05c1.19-1.15.53-3.1-1.09-3.33l-2.9-.42c-.39-.07-.76-.24-1.07-.49L11.49 3.17z" clipRule="evenodd" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">ReparoPro</h1>
            <p className="text-gray-400 mt-1">
                {view === 'login' ? 'Acesso ao sistema de orçamentos' : 'Recuperação de Acesso'}
            </p>
        </div>

        {view === 'login' ? (
          <Card>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <Input
                id="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@reparopro.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
              <Input
                id="password"
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />

              {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => setView('forgotPassword')} 
                    className="text-sm text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                      Esqueceu sua senha?
                  </button>
              </div>
            </form>
          </Card>
        ) : (
          <Card>
            <h2 className="text-center text-xl font-bold text-white mb-2">Recuperar Senha</h2>
            <p className="text-center text-gray-400 text-sm mb-6">Digite seu e-mail para receber as instruções de recuperação.</p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              <Input
                id="recoveryIdentifier"
                label="E-mail"
                type="email"
                value={recoveryIdentifier}
                onChange={(e) => setRecoveryIdentifier(e.target.value)}
                placeholder="Seu e-mail de acesso"
                required
                disabled={isLoading}
              />

              {recoveryMessage && <p className="text-green-400 text-sm text-center" role="status">{recoveryMessage}</p>}

              <Button type="submit" className="w-full" disabled={isLoading || !!recoveryMessage}>
                {isLoading ? 'Enviando...' : 'Enviar Instruções'}
              </Button>

              <div className="text-center">
                  <button
                    type="button"
                    onClick={switchToLoginView}
                    className="text-sm text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                      Voltar para o Login
                  </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;