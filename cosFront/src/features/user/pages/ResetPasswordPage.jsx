import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../../../common/api/authService';

const HOME_IMAGES_VERSION = "20250324e";
const HERO_IMG = `${import.meta.env.BASE_URL}images/home/hero-natation.jpg?v=${HOME_IMAGES_VERSION}`;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token manquant.');
    }
  }, [token]);

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
    setMessage('');

    if (!token) {
      setError('Token manquant.');
      setLoading(false);
      return;
    }

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      
      setMessage('Votre mot de passe a été défini avec succès.');
      
      // Rediriger vers la page de login après 2 secondes
      setTimeout(() => {
        navigate('/login?passwordSet=true');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation.');
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
              Définir votre {" "}
              <span style={styles.titleHighlight}>mot de passe</span>
            </h1>

            <p style={styles.subtitle}>
              Créez un mot de passe sécurisé pour accéder à votre compte. 
              Assurez-vous qu'il contient au moins 6 caractères.
            </p>

            <div style={styles.roles}>
              <span style={styles.roleChip}>Sécurité</span>
              <span style={styles.roleChip}>Confidentialité</span>
            </div>
          </div>

          <p style={styles.footerText}>
            Mot de passe sécurisé • Accès protégé • Données chiffrées
          </p>
        </div>

        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>Définir votre mot de passe</h2>
          <p style={styles.rightDesc}>
            Entrez votre mot de passe ci-dessous.
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          {!token && (
            <div style={styles.error}>
              Token manquant. Veuillez utiliser le lien reçu par email.
            </div>
          )}

          {token && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <label htmlFor="reset-new-password" style={styles.label}>Nouveau mot de passe</label>
              <div style={styles.passwordWrapper}>
                <input
                  id="reset-new-password"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  style={styles.passwordInput}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                  aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {showNewPassword ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.74-1.73 1.83-3.29 3.19-4.6" />
                        <path d="M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8a11.05 11.05 0 01-2.16 3.19" />
                        <path d="M1 1l22 22" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <label htmlFor="reset-confirm-password" style={styles.label}>Confirmer le nouveau mot de passe</label>
              <div style={styles.passwordWrapper}>
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={styles.passwordInput}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {showConfirmPassword ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.74-1.73 1.83-3.29 3.19-4.6" />
                        <path d="M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8a11.05 11.05 0 01-2.16 3.19" />
                        <path d="M1 1l22 22" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Enregistrement..." : "Valider"}
              </button>
            </form>
          )}

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
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
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
    border: "1px solid rgba(100,116,139,0.38)",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  },
};

export default ResetPasswordPage;
