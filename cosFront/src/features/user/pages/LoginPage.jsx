import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../common/contexts/AuthContext';
import authService from '../../../common/api/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.signIn(formData.email, formData.password);

      // Utiliser le rôle renvoyé par le backend
      const userRole = res.role || "SPECTATEUR";

      // Stocker dans AuthContext
      login({
        token: res.token,
        user: {
          email: formData.email,
          role: userRole,
        },
      });

      const roleRoutes = {
        ADMIN: "/admin",
        SPECTATEUR: "/spectator",
        ATHLETE: "/athlete",
        COMMISSAIRE: "/commissioner",
        VOLONTAIRE: "/volunteer",
      };

      const redirectPath = roleRoutes[userRole.toUpperCase()] || "/spectator";
      navigate(redirectPath);

    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Connexion</h2>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.divider}></div>

        <div style={styles.linkContainer}>
          <p style={styles.linkText}>
            Pas encore de compte ?
          </p>
          <Link to="/signup" style={styles.signupButton}>
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', paddingTop: '90px' },
  card: { background: 'white', padding: '40px', borderRadius: '8px', width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  title: { fontSize: '24px', textAlign: 'center', marginBottom: '20px' },
  error: { background: '#fee', color: '#c33', padding: '10px', marginBottom: '20px', borderRadius: '5px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontWeight: '600', marginBottom: '5px' },
  input: { padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px' },
  button: { 
    padding: '12px', 
    background: '#007bff', 
    color: 'white', 
    border: 'none',
    borderRadius: '5px', 
    marginTop: '15px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  divider: { 
    margin: '25px 0', 
    borderTop: '1px solid #e0e0e0' 
  },
  linkContainer: { 
    marginTop: '20px', 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  linkText: { 
    fontSize: '14px', 
    color: '#666',
    margin: 0
  },
  signupButton: { 
    display: 'inline-block',
    padding: '10px 20px',
    background: '#28a745', 
    color: 'white', 
    textDecoration: 'none', 
    fontWeight: '600',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'background 0.3s'
  },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: '600' }
};

export default LoginPage;
