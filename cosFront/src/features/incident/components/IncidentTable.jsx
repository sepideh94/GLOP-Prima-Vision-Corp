import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import SearchIcon from "@mui/icons-material/Search";

import { TextField, InputAdornment, Typography } from "@mui/material";
import appTheme from "../../../common/theme/appTheme";

const impactLabels = {
  TOUS: "Tous les utilisateurs",
  COMMISSIONNER: "Commissaires",
  ATHLETE: "Athlètes",
  VOLONTEER: "Volontaires",
  SPECTATOR: "Spectateurs",
};

const statusLabels = {
  EN_COURS: "En cours",
  RESOLU: "Résolu",
};

const siteLabels = {
  1: "Piscine principale",
  2: "Piscine secondaire",
};

const getStatusColor = (status) => {
  switch (status) {
    case "EN_COURS":
      return "#facc15";
    case "RESOLU":
      return "#22c55e";
    default:
      return "#64748b";
  }
};

export default function IncidentTable({
  incidents = [],
  searchTerm,
  setSearchTerm,
  getEventName,
  onSort,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}) {

  const getImpactLabel = (levels) => {
    if (!levels || !levels.length) return "-";
    return levels.map((l) => impactLabels[l] || l).join(", ");
  };

  return (
    <div className="card" style={{ borderRadius: 22, overflow: "hidden", border: "none" }}>

      <div className="card-header d-flex justify-content-between align-items-center">

        <Typography sx={{ fontWeight: 700 }}>
          Liste des incidents
        </Typography>

        <TextField
          size="small"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

      </div>

      <div className="card-body">

        <table className="table align-middle table-hover">

          <thead>
            <tr>

              <th onClick={() => onSort("title")} style={{ cursor: "pointer" }}>
                Titre <UnfoldMoreIcon sx={{ fontSize: 16 }} />
              </th>

              <th
                onClick={() => onSort("impactLevels")}
                style={{ cursor: "pointer" }}
              >
                Impact <UnfoldMoreIcon sx={{ fontSize: 16 }} />
              </th>

              <th
                onClick={() => onSort("siteId")}
                style={{ cursor: "pointer" }}
              >
                Site concerné <UnfoldMoreIcon sx={{ fontSize: 16 }} />
              </th>

              <th
                onClick={() => onSort("eventId")}
                style={{ cursor: "pointer" }}
              >
                Événement concerné <UnfoldMoreIcon sx={{ fontSize: 16 }} />
              </th>

              <th onClick={() => onSort("status")} style={{ cursor: "pointer" }}>
                Statut <UnfoldMoreIcon sx={{ fontSize: 16 }} />
              </th>

              <th style={{ width: 220 }}>Actions</th>

            </tr>
          </thead>

          <tbody>

            {incidents.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  Aucun incident trouvé
                </td>
              </tr>
            )}

            {incidents.map((i) => (

              <tr key={i.id}>

                <td className="fw-bold">{i.title}</td>

                <td>
                  {getImpactLabel(i.impactLevels)}
                </td>

                <td>
                  {i.siteId ? siteLabels[i.siteId] || i.siteId : "-"}
                </td>

                <td>
                  {getEventName ? getEventName(i.eventId) : "-"}
                </td>

                <td>
                  <span
                    style={{
                      background: getStatusColor(i.status),
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {statusLabels[i.status] || i.status}
                  </span>
                </td>

                <td>

                  <button
                    className="btn"
                    onClick={() => onView(i)}
                    style={{
                      borderRadius: appTheme.radius.pill,
                      background: "linear-gradient(135deg,#a78bfa,#8b5cf6)",
                      color: "#fff",
                      marginRight: 6,
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </button>

                  <button
                    className="btn"
                    onClick={() => onEdit(i)}
                    disabled={i.status === "RESOLU"}
                    style={{
                      borderRadius: appTheme.radius.pill,
                      background: i.status === "RESOLU" ? "#cbd5e1" : appTheme.gradients.navbar,
                      color: appTheme.colors.dark,
                      marginRight: 6,
                      opacity: i.status === "RESOLU" ? 0.6 : 1,
                    }}
                    >
                     <EditIcon sx={{ fontSize: 16 }} />
                  </button>

                  <button
                    className="btn"
                    onClick={() => onChangeStatus(i)}
                    disabled={i.status === "RESOLU"}
                    style={{
                      borderRadius: appTheme.radius.pill,
                      background: i.status === "RESOLU" ? "#cbd5e1" : "#22c55e",
                      color: "#fff",
                      marginRight: 6,
                      opacity: i.status === "RESOLU" ? 0.6 : 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  </button>

                  <button
                    className="btn"
                    onClick={() => onDelete(i)}
                    style={{
                      borderRadius: appTheme.radius.pill,
                      background: "#ef4444",
                      color: "#fff",
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}