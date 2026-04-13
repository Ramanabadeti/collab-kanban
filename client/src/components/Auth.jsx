import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Auth() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      login(data.token, data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">📋</span>
          <h1>CollabBoard</h1>
          <p>Real-time collaborative Kanban boards</p>
        </div>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="field"><label>Username</label><input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="johndoe" /></div>
          )}
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" /></div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}</button>
        </form>
        <div className="auth-demo">Demo: demo@collabboard.com / demo123</div>
      </div>
    </div>
  );
}
