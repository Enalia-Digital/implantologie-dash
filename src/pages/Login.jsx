import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) navigate('/dashboard', { replace: true });
    else setError(res.error);
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 7,
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(ellipse 600px 400px at 50% 0%, rgba(191,0,255,0.05), transparent 70%), var(--bg-root)',
        padding: 20,
      }}
    >
      <div
        className="fade-in-up"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '40px 36px',
          maxWidth: 380,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="Enalia Digital" style={{ height: 32, display: 'inline-block' }} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, marginBottom: 32 }}>
            Agente Cualificador de Llamadas
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginBottom: 28 }} />

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="tucorreo@empresa.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(191,0,255,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(191,0,255,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 16 }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              padding: 11,
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-bright)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
          >
            Acceder
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 28 }}>
          Acceso restringido · Enalia Digital
        </div>
      </div>
    </div>
  );
}
