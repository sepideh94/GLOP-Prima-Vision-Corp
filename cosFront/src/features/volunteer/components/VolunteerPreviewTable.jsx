import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { getStatusStyle } from "../utils/volunteerStatus";

export default function VolunteerPreviewTable({ preview }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPreview = useMemo(() => {
    if (!sortConfig.key) return preview;

    const getName = (p) => `${p.firstName || ""} ${p.lastName || ""}`.trim();

    return [...preview].sort((a, b) => {
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
  }, [preview, sortConfig]);

  return (
    <>
      <Typography fontWeight={800} mb={2}>
        Aperçu des volontaires ({preview.length})
      </Typography>

      <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
        <table className="table table-sm">
          <thead>
            <tr>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("fullName")}>
                Nom <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("email")}>
                Email <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("status")}>
                Statut <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedPreview.map((p, index) => (
              <tr key={`${p.email}-${index}`}>
                <td>
                  {p.firstName} {p.lastName}
                </td>

                <td>{p.email}</td>

                <td>
                  <span style={getStatusStyle(p.status)}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </>
  );
}