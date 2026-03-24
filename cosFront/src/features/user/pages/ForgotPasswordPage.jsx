import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../common/api/authService';

const HOME_IMAGES_VERSION = "20250324e";
const HERO_IMG = `${import.meta.env.BASE_URL}images/home/hero-natation.jpg?v=${HOME_IMAGES_VERSION}`;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.forgotPassword(email);
      setMessage('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.leftPanelOverlay}></div>
          <div style={styles.leftAccentBar}></div>

          <div>
            <div style={styles.badge}>CiblOrgaSport</div>

            <h1 style={styles.title}>
              Mot de passe {" "}
              <span style={styles.titleHighlight}>oublié ?</span>
            </h1>

            <p style={styles.subtitle}>
              Pas de problème ! Entrez votre adresse email et nous vous enverrons 
              un lien sécurisé pour réinitialiser votre mot de passe en quelques minutes.
            </p>

            <div style={styles.roles}>
              <span style={styles.roleChip}>Sécurité</span>
              <span style={styles.roleChip}>Récupération</span>
            </div>
          </div>

          <p style={styles.footerText}>
            Lien sécurisé • Expiration limitée • Données protégées
          </p>
        </div>

        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>Mot de passe oublié</h2>
          <p style={styles.rightDesc}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label htmlFor="forgot-email" style={styles.label}>Adresse email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="votre@email.com"
            />

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Envoi..." : "Envoyer un email de réinitialisation"}
            </button>
          </form>

          <div style={styles.loginContainer}>
            <Link to="/login" style={styles.loginLink}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `
      linear-gradient(125deg, rgba(2,6,23,0.62) 0%, rgba(15,23,42,0.52) 38%, rgba(2,6,23,0.64) 100%),
      radial-gradient(circle at 12% 18%, rgba(34,211,238,0.2) 0%, transparent 42%),
      radial-gradient(circle at 88% 12%, rgba(167,139,250,0.18) 0%, transparent 40%),
      url(${HERO_IMG})
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#0f172a",
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shell: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 28px 80px rgba(2,6,23,0.45)",
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(2,6,23,0.45)",
    backdropFilter: "blur(8px)",
  },

  leftPanel: {
    flex: 1.1,
    padding: "40px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    background: "linear-gradient(145deg, rgba(2,6,23,0.65) 0%, rgba(15,23,42,0.55) 100%)",
    color: "#f8fafc",
  },
  leftPanelOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(98deg, rgba(2,6,23,0.72) 0%, rgba(15,23,42,0.45) 38%, rgba(2,6,23,0.34) 100%)",
    pointerEvents: "none",
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
    background: "rgba(2,6,23,0.42)",
    border: "1px solid rgba(255,255,255,0.45)",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "28px",
    color: "#f8fafc",
  },

  title: {
    fontSize: "30px",
    lineHeight: 1.25,
    fontWeight: 800,
    margin: 0,
  },

  titleHighlight: {
    color: "#67e8f9",
  },

  subtitle: {
    marginTop: "20px",
    fontSize: "14px",
    maxWidth: "440px",
    color: "rgba(241,245,249,0.95)",
    lineHeight: 1.65,
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
    background: "rgba(2,6,23,0.35)",
    border: "1px solid rgba(255,255,255,0.38)",
    color: "#e2e8f0",
  },

  footerText: {
    marginTop: "30px",
    fontSize: "12px",
    color: "rgba(226,232,240,0.86)",
  },

  rightPanel: {
    flex: 1,
    padding: "40px 45px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.98) 100%)",
    borderLeft: "1px solid rgba(226,232,240,0.85)",
    display: "flex",
    flexDirection: "column",
  },

  rightTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 700,
    color: "#0f172a",
  },

  rightDesc: {
    marginTop: "10px",
    marginBottom: "24px",
    fontSize: "13px",
    color: "#334155",
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
    color: "#0f172a",
  },

  input: {
    marginTop: "4px",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(100,116,139,0.38)",
    background: "#ffffff",
    color: "#0f172a",
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
    background:
      "linear-gradient(90deg, #0ea5e9 0%, #22d3ee 55%, #4ade80 100%)",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(14,165,233,0.35)",
  },

  error: {
    marginBottom: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#fff1f2",
    border: "1px solid #fca5a5",
    color: "#ef4444",
    fontSize: "13px",
  },

  success: {
    marginBottom: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "#ecfeff",
    border: "1px solid #38bdf8",
    color: "#0c4a6e",
    fontWeight: 600,
    fontSize: "13px",
  },

  loginContainer: {
    marginTop: "24px",
    textAlign: "center",
  },

  loginLink: {
    fontSize: "13px",
    color: "#0369a1",
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.2s ease",
  },
};

export default ForgotPasswordPage;
