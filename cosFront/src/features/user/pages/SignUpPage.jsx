import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../common/contexts/AuthContext';
import authService from '../../../common/api/authService';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SPECTATOR',
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.signUp(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.role
      );

      // Stocker dans AuthContext
      login({
        token: res.token,
        user: {
          email: formData.email,
          role: formData.role,
        },
      });

      // Mapper le rôle vers la route correspondante
      const roleRouteMap = {
        'SPECTATOR': '/spectator',
        'ATHLETE': '/athlete',
        'VOLONTEER': '/volunteer',
        'COMMISSIONNER': '/commissioner',
        'ADMIN': '/admin'
      };
      
      // Rediriger vers la page appropriée selon le rôle
      const route = roleRouteMap[formData.role] || '/spectator';
      navigate(route);

    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inscription</h2>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Prénom</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

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

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="SPECTATOR">Spectateur</option>
              <option value="ATHLETE">Athlète</option>
              <option value="VOLONTEER">Volontaire</option>
              <option value="COMMISSIONNER">Commissaire</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div style={styles.linkContainer}>
          <p style={styles.linkText}>
            Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', paddingTop: '50px', paddingBottom: '50px' },
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
  linkContainer: { marginTop: '20px', textAlign: 'center' },
  linkText: { fontSize: '14px', color: '#666' },
  link: { color: '#007bff', textDecoration: 'none', fontWeight: '600' }
};

export default SignUpPage;

