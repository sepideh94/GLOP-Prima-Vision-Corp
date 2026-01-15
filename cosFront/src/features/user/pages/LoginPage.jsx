import { useState } from 'react';
import { useNavigate} from 'react-router-dom';
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
  const [showPassword, setShowPassword] = useState(false);

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
      const userRole = res.role || "SPECTATOR";

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
        ATHLETE: "/athlete",
        COMMISSIONNER: "/commissioner",
        VOLONTEER: "/volunteer",
        SPECTATOR: "/spectator", 
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
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.leftAccentBar}></div>

          <div>
            <div style={styles.badge}>CiblOrgaSport</div>

            <h1 style={styles.title}>
              Plateforme digitale des {" "}
              <span style={styles.titleHighlight}>événements sportifs</span>
            </h1>

            <p style={styles.subtitle}>
              Retrouvez toutes les informations essentielles, 
              accédez à vos services et suivez vos événements sportifs en quelques clics.
              Tout votre univers sportif, réuni en un seul endroit.
            </p>

            <div style={styles.roles}>
              <span style={styles.roleChip}>Programmes</span>
              <span style={styles.roleChip}>Événements</span>
              <span style={styles.roleChip}>Résultats</span>
            </div>
          </div>

          <p style={styles.footerText}>
            Sécurité renforcée • Accès par rôle • Données synchronisées
          </p>
        </div>

        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>Connexion</h2>
          <p style={styles.rightDesc}>
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Adresse email</label>
            <input
              type="email"
              name="email"
              style={styles.input}
              onChange={handleChange}
              required
            />

            <label style={styles.label}>Mot de passe</label>

          <div style={styles.passwordWrapper}>
           <input
             type={showPassword ? "text" : "password"}
             name="password"
             style={styles.passwordInput}
             onChange={handleChange}
             required
          />

          <button
             type="button"
             onClick={() => setShowPassword(!showPassword)}
             style={styles.eyeButton}
             aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
          <svg
             xmlns="http://www.w3.org/2000/svg"
             width="20"
             height="20"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="1.8"
             strokeLinecap="round"
             strokeLinejoin="round"
          >
          {showPassword ? (
          <>
          {/* eye-off */}
          <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.74-1.73 1.83-3.29 3.19-4.6" />
          <path d="M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8a11.05 11.05 0 01-2.16 3.19" />
          <path d="M1 1l22 22" />
          </>
          ) : (
          <>
          {/* eye */}
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
          </>
          )}
          </svg>
          </button>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
           {loading ? "Connexion..." : "Se connecter"}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
  minHeight: "100vh",
  padding: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: `
    radial-gradient(circle at 20% 30%, rgba(163, 230, 53, 0.25), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.20), transparent 55%),
    linear-gradient(135deg, #F1F5F9, #CBD5E1)
  `,
  color: "#E5E7EB",
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
},
  shell: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
    background: "linear-gradient(135deg, #050816, #0B1220)",
  },

  leftPanel: {
    flex: 1.1,
    padding: "40px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    background:
      "linear-gradient(145deg, #050816 0%, #0F172A 40%, #0B1220 100%)",
  },

  leftAccentBar: {
    position: "absolute",
    left: 0,
    top: "15%",
    bottom: "15%",
    width: "6px",
    background:
      "linear-gradient(180deg, #22D3EE, #A3E635)",
    borderRadius: "0 4px 4px 0",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.5)",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "28px",
    color: "#E5E7EB",
  },

  title: {
    fontSize: "30px",
    lineHeight: 1.25,
    fontWeight: 800,
    margin: 0,
  },

  titleHighlight: {
    color: "#A3E635",
  },

  subtitle: {
    marginTop: "20px",
    fontSize: "14px",
    maxWidth: "440px",
    color: "#CBD5F5",
  },

  roles: {
    marginTop: "30px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  roleChip: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.5)",
  },

  footerText: {
    marginTop: "30px",
    fontSize: "12px",
    color: "#9CA3AF",
  },

  rightPanel: {
    flex: 1,
    padding: "40px 45px",
    background:
      "radial-gradient(circle at top right, #A3E63520, #050816 60%)",
    borderLeft: "1px solid rgba(15,23,42,0.8)",
    display: "flex",
    flexDirection: "column",
  },

  rightTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 700,
    color: "#F9FAFB",
  },

  rightDesc: {
    marginTop: "10px",
    marginBottom: "24px",
    fontSize: "13px",
    color: "#9CA3AF",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "5px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#E5E7EB",
  },

  input: {
    marginTop: "4px",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #1F2937",
    background: "rgba(15,23,42,0.9)",
    color: "#F9FAFB",
    fontSize: "14px",
    outline: "none",
  },

  button: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "999px",
    border: "none",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    color: "#020617",
    background:
      "linear-gradient(90deg, #22D3EE 0%, #A3E635 50%, #22D3EE 100%)",
    boxShadow: "0 10px 30px rgba(34,211,238,0.35)",
  },

  infoText: {
    marginTop: "22px",
    fontSize: "12px",
    color: "#9CA3AF",
  },

  error: {
    marginBottom: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "rgba(220, 38, 38, 0.15)",
    border: "1px solid rgba(248,113,113,0.6)",
    color: "#FCA5A5",
    fontSize: "13px",
  },
  eyeButton: {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#9CA3AF",
  padding: 0,
},
passwordWrapper: {
  position: "relative",
  width: "100%",
},

passwordInput: {
  marginTop: "4px",
  padding: "11px 40px 11px 12px", 
  borderRadius: "10px",
  border: "1px solid #1F2937",
  background: "rgba(15,23,42,0.9)",
  color: "#F9FAFB",
  fontSize: "14px",
  outline: "none",
  width: "100%",
},
};

styles.button[":hover"] = {};

export default LoginPage;