import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import incidentService from "../services/incidentService";

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default function IncidentsPage() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getAll();
      const safeData = Array.isArray(data) ? data : [];
      setIncidents(safeData);
    } catch {
      setIncidents([]);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredIncidents = incidents.filter((i) => {
    if (!normalizedSearch) return true;
    return (
      (i.title || "").toLowerCase().includes(normalizedSearch) ||
      (i.description || "").toLowerCase().includes(normalizedSearch) ||
      (i.impactLevel || "").toLowerCase().includes(normalizedSearch) ||
      (i.status || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.1,
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
          color: appTheme.colors.dark,
        }}
      >
        Retour
      </Button>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des incidents
        </Typography>

        <Button
          startIcon={<AddIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: appTheme.gradients.navbar,
            color: appTheme.colors.dark,
          }}
        >
          Créer un incident
        </Button>
      </Box>

      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: appTheme.radius.lg,
          background: appTheme.gradients.card,
          boxShadow: appTheme.shadows.card,
        }}
      >
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <div className="card" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div className="card-header d-flex justify-content-between">
          <strong>Liste des incidents</strong>
        </div>

        <div className="card-body">
          <table className="table align-middle table-hover">
            <thead>
              <tr>
                <td
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("title")}
                >
                  <strong>Titre</strong>{" "}
                  <UnfoldMoreIcon
                    sx={{
                      fontSize: 16,
                      verticalAlign: "middle",
                      ml: 0.5,
                    }}
                  />
                </td>

                <td
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("impactLevel")}
                >
                  <strong>Impact</strong>{" "}
                  <UnfoldMoreIcon
                    sx={{
                      fontSize: 16,
                      verticalAlign: "middle",
                      ml: 0.5,
                    }}
                  />
                </td>

                <td
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("status")}
                >
                  <strong>Statut</strong>{" "}
                  <UnfoldMoreIcon
                    sx={{
                      fontSize: 16,
                      verticalAlign: "middle",
                      ml: 0.5,
                    }}
                  />
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
              {sortedIncidents.map((i) => (
                <tr key={i.id}>
                  <td className="fw-bold">{i.title}</td>

                  <td>{i.impactLevel}</td>

                  <td>{i.status}</td>

                  <td>{i.competitionId ? i.competitionId : "-"}</td>

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
    </Box>
  );
}