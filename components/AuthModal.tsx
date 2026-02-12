import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { modalType, closeModal, openLogin, openSignup, login, loginWithGoogle, signup } = useAuth();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password validation requirements
  const requirements = [
    { label: 'Mínimo de 8 caracteres', test: (p: string) => p.length >= 8 },
    { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
  ];

  const isPasswordValid = requirements.every(r => r.test(password));
  const doPasswordsMatch = password === confirmPassword;

  // Reset state when modal type changes
  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setName('');
    setRestaurantName('');
    setPhone('');
    setAcceptTerms(false);
    setError('');
    setSuccessMsg('');
    setIsLoading(false);
  }, [modalType]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  if (!modalType) return null;

  const isLogin = modalType === 'login';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
        await loginWithGoogle();
        // Redirect handled by context state change
    } catch (err) {
        setError('Falha ao conectar com Google. Tente novamente.');
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!isLogin) {
        if (!isPasswordValid) {
            setError('A senha não atende aos requisitos de segurança.');
            return;
        }
        if (!doPasswordsMatch) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!acceptTerms) {
            setError('Você deve aceitar os Termos de Uso.');
            return;
        }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password, restaurantName, phone);
        setSuccessMsg("Cadastro realizado! Seu teste grátis foi ativado.");
        // Short delay to read message before context closes modal/redirects
        await new Promise(r => setTimeout(r, 1000)); 
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-[fade-in_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    {isLogin ? 'Acessar Conta' : 'Começar Grátis'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {isLogin 
                    ? 'Gerencie seu restaurante de qualquer lugar.' 
                    : 'Teste grátis por 7 dias. Sem cartão de crédito.'}
                </p>
            </div>
            <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
            <i className="fas fa-times text-lg"></i>
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* Option 2: Social Login (Priority) */}
            <button 
                onClick={handleGoogleLogin}
                type="button"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-sm relative overflow-hidden"
            >
                {/* Simulated Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                {isLoading ? 'Conectando...' : 'Continuar com Google'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 uppercase">ou via email</span>
                </div>
            </div>

            {/* Option 1: Manual Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Restaurante</label>
                                <input 
                                    type="text" 
                                    value={restaurantName}
                                    onChange={(e) => setRestaurantName(e.target.value)}
                                    placeholder="Nome do negócio"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Telefone</label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="84 123 4567"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Profissional</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                    />
                </div>

                <div className={!isLogin ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase">Senha</label>
                            {isLogin && <a href="#" className="text-xs text-primary hover:underline">Esqueceu?</a>}
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isLogin ? "Sua senha" : "Crie uma senha"}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>
                    
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirmar Senha</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a senha"
                                required
                                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all text-sm ${
                                    confirmPassword && !doPasswordsMatch 
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                    : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                                }`}
                            />
                        </div>
                    )}
                </div>

                {/* Password Requirements (Signup Only) */}
                {!isLogin && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Sua senha deve ter:</p>
                        <div className="grid grid-cols-1 gap-1">
                            {requirements.map((req, index) => {
                            const met = req.test(password);
                            return (
                                <div 
                                key={index} 
                                className={`text-xs flex items-center gap-2 transition-colors duration-200 ${
                                    met ? 'text-green-600 font-medium' : 'text-gray-400'
                                }`}
                                >
                                <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle text-[6px]'}`}></i>
                                {req.label}
                                </div>
                            );
                            })}
                        </div>
                    </div>
                )}

                {/* Terms (Signup Only) */}
                {!isLogin && (
                    <div className="flex items-start gap-3 mt-2">
                        <input 
                            type="checkbox" 
                            id="terms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-xs text-gray-500 leading-tight cursor-pointer select-none">
                            Ao criar conta, você concorda com nossos <a href="#" className="text-primary hover:underline">Termos de Serviço</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
                        </label>
                    </div>
                )}

                {/* Feedback Messages */}
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-[shake_0.3s_ease-in-out]">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100 flex items-center gap-2">
                        <i className="fas fa-check-circle"></i> {successMsg}
                    </div>
                )}

                <button 
                    type="submit"
                    className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4
                    ${isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-light text-white hover:shadow-xl hover:-translate-y-0.5'}`}
                    disabled={isLoading}
                >
                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : (isLogin ? 'Entrar no Sistema' : 'Criar Conta Grátis')}
                </button>
            </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 text-center bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button 
                onClick={isLogin ? openSignup : openLogin} 
                className="ml-1 text-primary font-bold hover:underline"
            >
                {isLogin ? 'Cadastre-se' : 'Fazer Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};