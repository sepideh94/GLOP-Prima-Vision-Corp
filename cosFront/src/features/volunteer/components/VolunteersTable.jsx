import { Button } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { STATUS_LABELS, getStatusStyle } from "../utils/volunteerStatus";
import appTheme from "../../../common/theme/appTheme";

export default function VolunteersTable({
  volunteers,
  selectedCompetition,
  onOpenModal,
}) {
  return (
    <table className="table align-middle">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th style={{ textAlign: "center" }}>
            {selectedCompetition ? "Statut" : "Participations"}
          </th>
        </tr>
      </thead>

      <tbody>
        {volunteers.map((v) => (
          <tr key={v.id}>
            <td>
              {v.firstName} {v.lastName}
            </td>

            <td>{v.email}</td>

            <td style={{ textAlign: "center" }}>
              {selectedCompetition ? (
                <span style={getStatusStyle(v.status)}>
                  {STATUS_LABELS[v.status] || v.status}
                </span>
              ) : (
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onOpenModal(v)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2,
                    borderRadius: appTheme.radius.pill,
                    background:
                      "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                    color: "#fff",
                  }}
                >
                  Participations
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}