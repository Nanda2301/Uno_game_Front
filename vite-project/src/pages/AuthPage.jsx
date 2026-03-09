import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', userName: '', email: '', password: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Bem-vindo de volta! 🎴');
        navigate('/lobby');
      } else {
        await register(form);
        toast.success('Conta criada! Faça login.');
        setMode('login');
        setForm(f => ({ ...f, password: '' }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Algo deu errado';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen arena-bg-pattern flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-uno-red opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-uno-blue opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              {/* Stacked card effect */}
              <div className="absolute -left-3 -top-1 w-16 h-22 bg-uno-blue rounded-xl rotate-[-12deg] opacity-60" style={{height:'80px'}} />
              <div className="absolute -right-3 -top-1 w-16 h-22 bg-uno-green rounded-xl rotate-[12deg] opacity-60" style={{height:'80px'}} />
              <div className="relative w-16 bg-uno-red rounded-xl flex items-center justify-center z-10" style={{height:'80px'}}>
                <span className="font-display text-white text-4xl tracking-wider" style={{textShadow:'2px 2px 0 rgba(0,0,0,0.3)'}}>UNO</span>
              </div>
            </div>
          </div>
          <h1 className="font-display text-5xl text-white tracking-widest neon-text-red">ARENA</h1>
          <p className="text-gray-400 font-body mt-2 text-sm tracking-widest uppercase">Multiplayer Card Battle</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8">
          {/* Mode Tabs */}
          <div className="flex bg-arena-bg rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg font-body font-semibold text-sm transition-all duration-200 uppercase tracking-wider ${
                  mode === m
                    ? 'bg-uno-red text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="animate-slide-up">
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-body">Nome completo</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                    className="input-field"
                  />
                </div>
                <div className="animate-slide-up" style={{animationDelay:'50ms'}}>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-body">Username</label>
                  <input
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    placeholder="@username"
                    required
                    className="input-field"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-body">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-body">Senha</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processando...
                </>
              ) : mode === 'login' ? 'ENTRAR NA ARENA' : 'CRIAR CONTA'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          UNO Arena © 2024 — Jala University
        </p>
      </div>
    </div>
  );
}