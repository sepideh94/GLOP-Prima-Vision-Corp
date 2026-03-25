import { useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { STATUS_LABELS, getStatusStyle } from "../utils/volunteerStatus";
import appTheme from "../../../common/theme/appTheme";

export default function VolunteersTable({
  volunteers,
  selectedCompetition,
  onOpenModal,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    // On désactive le tri sur la colonne "Participations" (action) quand elle n'est pas une colonne de statut.
    setSortConfig({ key: null, direction: "asc" });
  }, [selectedCompetition]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedVolunteers = useMemo(() => {
    if (!sortConfig.key) return volunteers;

    const getName = (v) => `${v.firstName || ""} ${v.lastName || ""}`.trim();

    return [...volunteers].sort((a, b) => {
      let aValue;
      let bValue;

      if (sortConfig.key === "fullName") {
        aValue = getName(a);
        bValue = getName(b);
      } else if (sortConfig.key === "email") {
        aValue = a.email || "";
        bValue = b.email || "";
      } else if (sortConfig.key === "status") {
        aValue = a.status || "";
        bValue = b.status || "";
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [volunteers, sortConfig]);

  return (
    <table className="table align-middle">
      <thead>
        <tr>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("fullName")}>
            Nom <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
          </th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("email")}>
            Email <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
          </th>
          <th
            style={{
              textAlign: "center",
              cursor: selectedCompetition ? "pointer" : "default",
            }}
            onClick={selectedCompetition ? () => handleSort("status") : undefined}
          >
            {selectedCompetition ? (
              <>
                Statut <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
              </>
            ) : (
              "Participations"
            )}
          </th>
        </tr>
      </thead>

      <tbody>
        {sortedVolunteers.map((v) => (
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