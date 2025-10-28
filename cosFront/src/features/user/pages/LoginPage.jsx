import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../common/contexts/AuthContext";
import { loginApi } from "../services/authService";

// Redirections selon le rôle
const roleTarget = {
  ADMIN: "/admin",
  COMMISSAIRE: "/commissioner",
  ATHLETE: "/athlete",
  VOLONTAIRE: "/volunteer",
  SPECTATEUR: "/spectator",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginApi({ email, password });
      login(data);
      navigate(roleTarget[data.user.role] || "/");
    } catch {
      setError("Identifiants incorrects");
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
      style={{
        background:
          "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
      }}
    >
      <div className="card shadow-lg border-0 p-4" style={{ width: "400px" }}>
        <div className="text-center mb-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
            alt="logo"
            width="70"
            className="mb-2"
          />
          <h3 className="fw-bold text-primary">CiblOrgaSport</h3>
          <p className="text-muted mb-0">Connexion à votre espace</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@cos.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            Se connecter
          </button>

          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none">
              Mot de passe oublié ?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}