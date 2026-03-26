import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../common/api/authService';
import { saveSpectatorSignupWelcomeName } from '../../../common/utils/spectatorWelcomeName';

const HOME_IMAGES_VERSION = "20250324e";
const HERO_IMG = `${import.meta.env.BASE_URL}images/home/hero-natation.jpg?v=${HOME_IMAGES_VERSION}`;

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Forcer le rôle à SPECTATOR car seuls les spectateurs peuvent créer un compte
      await authService.signUp(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        'SPECTATOR'
      );

      // Sauvegarder l'email avant de réinitialiser le formulaire
      const userEmail = formData.email;
      saveSpectatorSignupWelcomeName(formData.firstName, formData.email);

      // Afficher le message de succès et réinitialiser le formulaire
      setSuccess(true);
      setSuccessEmail(userEmail);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        .password-field::-ms-reveal,
        .password-field::-ms-clear {
          display: none;
        }
      `}</style>
      <div style={styles.shell}>
        <div style={styles.leftPanel}>
          <div style={styles.leftPanelOverlay}></div>
          <div style={styles.leftAccentBar}></div>

          <div style={styles.leftContent}>
            <div style={styles.badge}>CiblOrgaSport</div>

            <h1 style={styles.title}>
              Rejoignez la {" "}
              <span style={styles.titleHighlight}>communauté sportive</span>
            </h1>

            <p style={styles.subtitle}>
              Créez votre compte spectateur et accédez à tous les événements sportifs. 
              Suivez les compétitions, consultez les résultats et restez informé de l'actualité sportive.
            </p>

            <div style={styles.roles}>
              <span style={styles.roleChip}>Événements</span>
              <span style={styles.roleChip}>Résultats</span>
              <span style={styles.roleChip}>Programmes</span>
            </div>
          </div>

          <p style={{ ...styles.footerText, ...styles.leftContent }}>
            Inscription gratuite • Accès immédiat • Données sécurisées
          </p>
        </div>

        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>Inscription</h2>
          <p style={styles.rightDesc}>
            Créez votre compte spectateur pour accéder à la plateforme.
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {success && (
            <div style={styles.success}>
              <div style={styles.successTitle}>Vérifiez votre boîte mail</div>
              <div style={styles.successText}>
                Un email d'activation a été envoyé à {successEmail}. 
                Cliquez sur le lien dans l'email pour activer votre compte.
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} style={styles.form}>
            <label htmlFor="signup-firstname" style={styles.label}>Prénom</label>
            <input
              id="signup-firstname"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <label htmlFor="signup-lastname" style={styles.label}>Nom</label>
            <input
              id="signup-lastname"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <label htmlFor="signup-email" style={styles.label}>Adresse email</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <label htmlFor="signup-password" style={styles.label}>Mot de passe</label>
            <div style={styles.passwordWrapper}>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                className="password-field"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
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

            <label htmlFor="signup-confirm-password" style={styles.label}>Confirmer le mot de passe</label>
            <div style={styles.passwordWrapper}>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="password-field"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={styles.passwordInput}
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
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
          )}

          <div style={styles.loginContainer}>
            <p style={styles.loginText}>
              Déjà un compte ? <Link to="/login" style={styles.loginLink}>Se connecter</Link>
            </p>
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
    boxShadow: "0 10px 36px rgba(15,23,42,0.14)",
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
  },

  leftPanel: {
    flex: 1.1,
    padding: "40px 50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    background:
      "linear-gradient(152deg, #1e3a5f 0%, #1e293b 42%, #172554 100%)",
    color: "#f8fafc",
  },
  leftPanelOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(105deg, rgba(34,211,238,0.14) 0%, transparent 48%, rgba(163,230,53,0.08) 100%)",
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
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
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "#f1f5f9",
    fontWeight: 600,
  },

  footerText: {
    marginTop: "30px",
    fontSize: "12px",
    color: "#cbd5e1",
    letterSpacing: "0.02em",
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
    padding: "16px 20px",
    borderRadius: "12px",
    background: "#ecfeff",
    border: "1px solid #38bdf8",
    color: "#0c4a6e",
  },

  successTitle: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#0c4a6e",
  },

  successText: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#334155",
    fontWeight: 500,
  },

  loginContainer: {
    marginTop: "24px",
    textAlign: "center",
  },

  loginText: {
    fontSize: "13px",
    color: "#334155",
    margin: 0,
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

export default SignUpPage;
