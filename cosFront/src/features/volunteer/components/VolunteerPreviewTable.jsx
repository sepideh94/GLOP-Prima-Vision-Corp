import { Box, Typography } from "@mui/material";
import { getStatusStyle } from "../utils/volunteerStatus";

export default function VolunteerPreviewTable({ preview }) {
  return (
    <>
      <Typography fontWeight={800} mb={2}>
        Aperçu des volontaires ({preview.length})
      </Typography>

      <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {preview.map((p, index) => (
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