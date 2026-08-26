import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Truck, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import { setSession } from '../auth.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.login(email, password);
      setSession({ token: data.token, email: data.email, name: data.name });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <div className="brand brand--lg">
          <span className="brand__mark">
            <Truck size={26} />
          </span>
          <div>
            <strong>Precise Timing</strong>
            <span>Admin · On Time. Every Time.</span>
          </div>
        </div>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to review website, chatbot, Yelp, and Thumbtack leads.</p>
        <form onSubmit={onSubmit}>
          <label>
            <span>Email</span>
            <span className="field">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
              />
            </span>
          </label>
          <label>
            <span>Password</span>
            <span className="field">
              <Lock size={16} />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </span>
          </label>
          {error ? <p className="alert alert--err">{error}</p> : null}
          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Signing in…' : 'Enter dashboard'}
          </button>
        </form>
        <p className="login__hint">
          <Sparkles size={14} /> Same Gmail inbox powers Yelp &amp; Thumbtack parsing.
        </p>
      </div>
    </div>
  );
}
