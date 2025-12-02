import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
      <span className="navbar-brand fw-bold text-white">
        CiblOrgaSport
      </span>

      <div className="ms-auto d-flex align-items-center gap-3">
        {user && (
          <>
            <span className="text-white small">
              {user.email} · <strong>{user.role}</strong>
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={logout}
            >
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
