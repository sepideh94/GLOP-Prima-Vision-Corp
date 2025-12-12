import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import trialService from "../services/trialService";
import competitionService from "../../competition/services/competitionService";
import TrialFormDialog from "./TrialFormDialog";

const getLabelFromEnum = (value, options) => {
  const found = options.find((opt) => opt.value === value);
  return found ? found.label : value || "-";
};

const TRIAL_NAME_OPTIONS = [
  { value: "FIFTY_M_FREESTYLE", label: "50m nage libre" },
  { value: "HUNDRED_M_FREESTYLE", label: "100m nage libre" },
  { value: "TWO_HUNDRED_M_FREESTYLE", label: "200m nage libre" },
  { value: "FOUR_HUNDRED_M_FREESTYLE", label: "400m nage libre" },
  { value: "FIVE_HUNDRED_M_FREESTYLE", label: "500m nage libre" },
  { value: "EIGHT_HUNDRED_M_FREESTYLE", label: "800m nage libre" },
  { value: "FIFTEEN_HUNDRED_M_FREESTYLE", label: "1500m nage libre" },
  { value: "HUNDRED_M_BACKSTROKE", label: "100m dos" },
  { value: "TWO_HUNDRED_M_BACKSTROKE", label: "200m dos" },
  { value: "HUNDRED_M_BREASTSTROKE", label: "100m brasse" },
  { value: "TWO_HUNDRED_M_BREASTSTROKE", label: "200m brasse" },
  { value: "HUNDRED_M_BUTTERFLY", label: "100m papillon" },
  { value: "TWO_HUNDRED_M_BUTTERFLY", label: "200m papillon" },
  { value: "TWO_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "200m 4 nages" },
  { value: "FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "400m 4 nages" },
  { value: "RELAY_4X100M_FREESTYLE", label: "Relais 4×100m nage libre" },
  { value: "RELAY_4X200M_FREESTYLE", label: "Relais 4×200m nage libre" },
  { value: "RELAY_4X100M_MEDLEY", label: "Relais 4×100m 4 nages" },
];

const MODE_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individuel" },
  { value: "TEAM", label: "Équipe" },
];

const CATEGORY_OPTIONS = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
  { value: "MIXTE", label: "Mixte" },
];

const formatTime = (time) => {
  if (!time) return "";
  // "09:00:00" -> "09:00"
  return time.length >= 5 ? time.substring(0, 5) : time;
};

const formatDateTime = (date, time) => {
  if (!date) return "";
  if (!time) return date;
  return `${date} à ${formatTime(time)}`;
};

export default function TrialListPage() {
  const { competitionId } = useParams();

  const [competition, setCompetition] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [openForm, setOpenForm] = useState(false);
  const [editingTrial, setEditingTrial] = useState(null);

  // Charger la compétition et son événement
  useEffect(() => {
    competitionService
      .getCompetition(competitionId)
      .then((res) => {
        setCompetition(res);

        if (res.parentEventId) {
          competitionService.getEvent(res.parentEventId).then((event) => {
            setEventInfo(event);
          });
        }
      })
      .catch((err) => console.error("Erreur getCompetition :", err));
  }, [competitionId]);

  // Charger les trials
  useEffect(() => {
    trialService
      .getTrialsByCompetition(competitionId)
      .then((res) => setTrials(res))
      .catch((err) => console.error("Erreur getTrials :", err))
      .finally(() => setLoading(false));
  }, [competitionId]);

  const handleOpenCreate = () => {
    setEditingTrial(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (trial) => {
    setEditingTrial(trial);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingTrial(null);
  };

  const handleSave = async (form) => {
    try {
      const payload = {
        trialName: form.trialName,
        roundNumber: form.roundNumber ? Number(form.roundNumber) : null,
        description: form.description || null,
        rules: form.rules || null,
        startDate: form.startDate,
        startHour:
          form.startHour && form.startHour.length === 5
            ? `${form.startHour}:00`
            : form.startHour,
        endDate: form.endDate,
        endHour:
          form.endHour && form.endHour.length === 5
            ? `${form.endHour}:00`
            : form.endHour,
        mode: form.mode,
        categoryGender: form.categoryGender,
        siteId: Number(form.siteId),
        competitionId: Number(competitionId),
        roundId: Number(form.roundId),
      };

      if (editingTrial) {
        const updated = await trialService.updateTrial(editingTrial.id, payload);
        setTrials((prev) =>
          prev.map((t) => (t.id === editingTrial.id ? updated : t))
        );
      } else {
        const created = await trialService.createTrial(payload);
        setTrials((prev) => [...prev, created]);
      }

      setOpenForm(false);
      setEditingTrial(null);
    } catch (err) {
      console.error("Erreur sauvegarde épreuve :", err);
      if (err.response) {
        alert(
          `Erreur lors de la sauvegarde (status ${err.response.status})`
        );
      } else {
        alert("Erreur réseau lors de la sauvegarde de l'épreuve");
      }
    }
  };

  if (loading) return <p>Chargement...</p>;

  // Filtrage
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTrials = trials.filter((t) => {
    if (!normalizedSearch) return true;

    const name = (t.name || "").toLowerCase();
    const description = (t.description || "").toLowerCase();
    const typeLabel = getLabelFromEnum(t.trialName, TRIAL_NAME_OPTIONS).toLowerCase();
    const modeLabel = getLabelFromEnum(t.mode, MODE_OPTIONS).toLowerCase();
    const categoryLabel = getLabelFromEnum(
      t.categoryGender,
      CATEGORY_OPTIONS
    ).toLowerCase();

    const start = formatDateTime(t.startDate, t.startHour).toLowerCase();
    const end = formatDateTime(t.endDate, t.endHour).toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      typeLabel.includes(normalizedSearch) ||
      modeLabel.includes(normalizedSearch) ||
      categoryLabel.includes(normalizedSearch) ||
      start.includes(normalizedSearch) ||
      end.includes(normalizedSearch)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrials = filteredTrials.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box sx={{ p: 4 }}>
      {/* Breadcrumb */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {eventInfo?.name}
        {competition && ` / ${competition.name}`}
      {" / Épreuves"}
      </Typography>

      {/* Titre */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Épreuves — {competition?.name}
      </Typography>

      {/* Bouton ajouter */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Ajouter une épreuve
        </Button>
      </Box>

      {/* Tableau des épreuves */}
      {trials.length === 0 ? (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography>Aucune épreuve pour cette compétition.</Typography>
        </Card>
      ) : (
        <div className="row gx-3">
          <div className="col-sm-12 col-12">
            <div className="card">
              {/* En-tête */}
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="card-title">Liste des épreuves</div>

                {/* Barre de recherche */}
                <div style={{ width: 320 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Rechercher par nom, type, date, mode..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Corps */}
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <td>Nom généré</td>
                        <td>Type</td>
                        <td>Round</td>
                        <td>Début</td>
                        <td>Fin</td>
                        <td>Mode</td>
                        <td>Catégorie</td>
                        <td>Actions</td>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTrials.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center text-muted py-4"
                          >
                            Aucune épreuve ne correspond à la recherche.
                          </td>
                        </tr>
                      ) : (
                        currentTrials.map((t) => (
                          <tr key={t.id}>
                            {/* Nom généré */}
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-flag me-3 fs-4 text-primary"></i>
                                <p className="m-0 fw-bold">{t.name}</p>
                              </div>
                            </td>

                            {/* Type */}
                            <td>
                              {getLabelFromEnum(
                                t.trialName,
                                TRIAL_NAME_OPTIONS
                              )}
                            </td>

                            {/* Round */}
                            <td>
                              {t.roundNumber
                                ? `Round ${t.roundNumber}`
                                : "-"}
                            </td>

                            {/* Début */}
                            <td>
                              {formatDateTime(t.startDate, t.startHour)}
                            </td>

                            {/* Fin */}
                            <td>{formatDateTime(t.endDate, t.endHour)}</td>

                            {/* Mode */}
                            <td>
                              {getLabelFromEnum(t.mode, MODE_OPTIONS)}
                            </td>

                            {/* Catégorie */}
                            <td>
                              {getLabelFromEnum(
                                t.categoryGender,
                                CATEGORY_OPTIONS
                              )}
                            </td>

                            {/* Actions */}
                            <td>
                              <button
                                className="btn btn-primary me-2"
                                onClick={() => handleOpenEdit(t)}
                              >
                                Modifier
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          ←
                        </button>
                      </li>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${
                          currentPage === totalPages || totalPages === 0
                            ? "disabled"
                            : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={
                            currentPage === totalPages || totalPages === 0
                          }
                        >
                          →
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup création / édition */}
      <TrialFormDialog
        open={openForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        initialData={editingTrial}
      />
    </Box>
  );
}
