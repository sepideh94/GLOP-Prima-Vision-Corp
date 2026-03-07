import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import appTheme from "../../../common/theme/appTheme";

const impactLabels = {
  TOUS: "Tous les utilisateurs",
  COMMISSIONNERS: "Commissaires uniquement",
  COMMISSIONNERS_ATHLETES: "Commissaires et athlètes",
};

const getStatusColor = (status) => {
  switch (status) {
    case "OUVERT":
      return "#ef4444";
    case "EN_COURS":
      return "#facc15";
    case "RESOLU":
    case "CLOS":
      return "#22c55e";
    default:
      return "#64748b";
  }
};

export default function IncidentTable({
  incidents,
  competitions,
  getCompetitionName,
  onSort,
}) {
  return (
    <div className="card" style={{ borderRadius: 22, overflow: "hidden" }}>
      <div className="card-header d-flex justify-content-between">
        <strong>Liste des incidents</strong>
      </div>

      <div className="card-body">
        <table className="table align-middle table-hover">
          <thead>
            <tr>
              <td style={{ cursor: "pointer" }} onClick={() => onSort("title")}>
                <strong>Titre</strong>{" "}
                <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />
              </td>

              <td
                style={{ cursor: "pointer" }}
                onClick={() => onSort("impactLevel")}
              >
                <strong>Impact</strong>{" "}
                <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />
              </td>

              <td
                style={{ cursor: "pointer" }}
                onClick={() => onSort("status")}
              >
                <strong>Statut</strong>{" "}
                <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />
              </td>

              <td>
                <strong>Compétition</strong>
              </td>

              <td>
                <strong>Actions</strong>
              </td>
            </tr>
          </thead>

          <tbody>
            {incidents.map((i) => (
              <tr key={i.id}>
                <td className="fw-bold">{i.title}</td>

                <td>{impactLabels[i.impactLevel]}</td>

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
                    {i.status}
                  </span>
                </td>

                <td>
                  {i.competitionId
                    ? getCompetitionName(i.competitionId)
                    : "-"}
                </td>

                <td>
                  <button
                    className="btn"
                    style={{
                      borderRadius: appTheme.radius.pill,
                      background:
                        "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                      color: "#fff",
                      fontWeight: 700,
                      padding: "4px 12px",
                      marginRight: 8,
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </button>

                  <button
                    className="btn"
                    style={{
                      borderRadius: appTheme.radius.pill,
                      background: appTheme.gradients.navbar,
                      color: appTheme.colors.dark,
                      fontWeight: 700,
                      padding: "4px 12px",
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
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