import { useState } from 'react';
import { Link } from 'react-router-dom';

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
      // TODO: Implémenter l'appel API pour la réinitialisation du mot de passe
      // await authService.forgotPassword(email);
      
      setMessage('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
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
            <label style={styles.label}>Adresse email</label>
            <input
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

  error: {
    marginBottom: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "rgba(220, 38, 38, 0.15)",
    border: "1px solid rgba(248,113,113,0.6)",
    color: "#FCA5A5",
    fontSize: "13px",
  },

  success: {
    marginBottom: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px solid rgba(34, 211, 238, 0.6)",
    color: "#A3E635",
    fontSize: "13px",
  },

  loginContainer: {
    marginTop: "24px",
    textAlign: "center",
  },

  loginLink: {
    fontSize: "13px",
    color: "#A3E635",
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.2s ease",
  },
};

export default ForgotPasswordPage;
