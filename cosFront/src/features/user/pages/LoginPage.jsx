import { useState, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../common/contexts/AuthContext';
import authService from '../../../common/api/authService';
import { consumeSpectatorSignupWelcomeName } from '../../../common/utils/spectatorWelcomeName';

const HOME_IMAGES_VERSION = "20250324e";
const HERO_IMG = `${import.meta.env.BASE_URL}images/home/hero-natation.jpg?v=${HOME_IMAGES_VERSION}`;

/** Évite les redirections ouvertes (open redirect) : uniquement chemins internes relatifs. */
function safeInternalNextPath(next) {
  if (!next || typeof next !== "string") return null;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  const lower = t.toLowerCase();
  if (lower.startsWith("http:") || lower.startsWith("https:") || lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return null;
  }
  return t;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const activationBanner = useMemo(() => {
    const activated = searchParams.get("activated");
    const already = searchParams.get("already");
    const reason = searchParams.get("reason");
    if (activated === "true") {
      return already === "true"
        ? { type: "info", text: "Ce compte est déjà activé. Vous pouvez vous connecter." }
        : { type: "success", text: "Compte activé avec succès. Vous pouvez vous connecter." };
    }
    if (activated === "false" && reason === "token_expired") {
      return { type: "warning", text: "Le lien d'activation a expiré. Inscrivez-vous à nouveau ou contactez le support." };
    }
    return null;
  }, [searchParams]);

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

      const firstNameFromSignup = consumeSpectatorSignupWelcomeName(formData.email);

      // Stocker dans AuthContext (prénom : inscription récente même navigateur, sinon inchangé)
      login({
        token: res.token,
        user: {
          id: res.userId,
          email: formData.email,
          role: userRole,
          ...(firstNameFromSignup ? { firstName: firstNameFromSignup } : {}),
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
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
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

          <p style={{ ...styles.footerText, ...styles.leftContent }}>
            Sécurité renforcée • Accès par rôle • Données synchronisées
          </p>
        </div>

        <div style={styles.rightPanel}>
          <h2 style={styles.rightTitle}>Connexion</h2>
          <p style={styles.rightDesc}>
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          {error && <div style={styles.error}>{error}</div>}

          {activationBanner && (
            <div
              style={{
                ...styles.banner,
                background:
                  activationBanner.type === "success"
                    ? "rgba(34,197,94,0.15)"
                    : activationBanner.type === "warning"
                      ? "rgba(250,204,21,0.2)"
                      : "rgba(59,130,246,0.12)",
                borderColor:
                  activationBanner.type === "success"
                    ? "rgba(34,197,94,0.45)"
                    : activationBanner.type === "warning"
                      ? "rgba(234,179,8,0.5)"
                      : "rgba(59,130,246,0.35)",
                color: "#0f172a",
              }}
            >
              {activationBanner.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label htmlFor="login-email" style={styles.label}>Adresse email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              style={styles.input}
              onChange={handleChange}
              required
            />

            <label htmlFor="login-password" style={styles.label}>Mot de passe</label>

          <div style={styles.passwordWrapper}>
           <input
             id="login-password"
             type={showPassword ? "text" : "password"}
             className="password-field"
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
            <div style={styles.forgotPasswordContainer}>
              <Link to="/forgot-password" style={styles.forgotPasswordLink}>
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div style={styles.signupContainer}>
            <Link to="/signup" style={styles.signupButton}>
              Inscription
            </Link>
          </div>
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
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.55)",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "28px",
    color: "#ffffff",
    fontWeight: 600,
  },

  title: {
    fontSize: "30px",
    lineHeight: 1.25,
    fontWeight: 800,
    margin: 0,
    color: "#f8fafc",
  },

  titleHighlight: {
    color: "#5eead4",
    textShadow: "0 0 28px rgba(45,212,191,0.45)",
  },

  subtitle: {
    marginTop: "20px",
    fontSize: "15px",
    maxWidth: "440px",
    color: "#e2e8f0",
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
    color: "#64748b",
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

  infoText: {
    marginTop: "22px",
    fontSize: "12px",
    color: "#9CA3AF",
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
  banner: {
    marginBottom: "14px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid",
    fontSize: "0.95rem",
    fontWeight: 800,
    lineHeight: 1.45,
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

  forgotPasswordContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "4px",
    marginBottom: "4px",
  },

  forgotPasswordLink: {
    fontSize: "12px",
    color: "#0369a1",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.2s ease",
  },

  signupContainer: {
    marginTop: "24px",
    textAlign: "center",
  },

  signupButton: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: "999px",
    border: "2px solid #22d3ee",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    color: "#0369a1",
    background: "transparent",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
};

styles.button[":hover"] = {};

export default LoginPage;