import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

      // POUR L'INSTANT : on met un rôle par défaut.
      // Le backend doit renvoyer le rôle plus tard.
      const userRole = "SPECTATEUR";

      // Stocker dans AuthContext
      login({
        token: res.token,
        user: {
          email: formData.email,
          role: userRole,
        },
      });

      // Rediriger vers page spectateur ou autre
      navigate("/spectator");

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
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', paddingTop: '90px' },
  card: { background: 'white', padding: '40px', borderRadius: '8px', width: '400px' },
  title: { fontSize: '24px', textAlign: 'center' },
  error: { background: '#fee', color: '#c33', padding: '10px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontWeight: '600' },
  input: { padding: '12px', border: '1px solid #ccc', borderRadius: '5px' },
  button: { padding: '12px', background: '#007bff', color: 'white', borderRadius: '5px', marginTop: '15px' }
};

export default LoginPage;
