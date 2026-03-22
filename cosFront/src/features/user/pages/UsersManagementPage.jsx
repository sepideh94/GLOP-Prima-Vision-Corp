import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  LockReset as LockResetIcon,
  Description as DescriptionIcon,
  TaskAlt as TaskAltIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import userService from "../services/userService";
import CommissionerFormDialog from "../components/CommissionerFormDialog";

const ITEMS_PER_PAGE = 20;

export default function UsersManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState(null);
  const [openRefuseAccreditationDialog, setOpenRefuseAccreditationDialog] = useState(false);
  const [refuseReason, setRefuseReason] = useState("");
  const [accreditationAvailability, setAccreditationAvailability] = useState({});

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();

      // L'endpoint retourne une liste simple d'utilisateurs (List<UserResponse>)
      if (Array.isArray(response)) {
        setUsers(response);
        setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
        await preloadAccreditationAvailability(response);
      } else {
        setUsers([]);
        setTotalPages(1);
        setAccreditationAvailability({});
      }
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des utilisateurs",
      );
      setOpenSnackbar(true);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const preloadAccreditationAvailability = async (userList) => {
    const commissioners = (userList || []).filter((u) => isCommissionerRole(u.role));
    if (commissioners.length === 0) {
      setAccreditationAvailability({});
      return;
    }

    const checks = await Promise.all(
      commissioners.map(async (u) => {
        try {
          await userService.downloadCommissionerAccreditation(u.id);
          return [u.id, true];
        } catch {
          return [u.id, false];
        }
      })
    );

    setAccreditationAvailability(Object.fromEntries(checks));
  };

  const handleOpenCreate = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSaveCommissioner = async (formData) => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error("Tous les champs sont obligatoires");
      }

      // Créer le payload sans mot de passe
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      // Vérifier que les champs ne sont pas vides après trim
      if (!payload.firstName || !payload.lastName || !payload.email) {
        throw new Error("Les champs ne peuvent pas être vides");
      }

      console.log("Payload envoyé:", payload);

      const result = await userService.createCommissioner(payload);
      console.log("Commissaire créé avec succès:", result);

      // Afficher un message de succès indiquant qu'un email a été envoyé
      setSuccessMessage(
        `Commissaire créé avec succès. Un email d'invitation a été envoyé à ${result.email || payload.email}.`,
      );
      setOpenSnackbar(true);
      setOpenForm(false);

      // Recharger la liste des utilisateurs
      loadUsers();
    } catch (err) {
      console.error("Erreur complète:", err);
      console.error("Response status:", err.response?.status);
      console.error(
        "Response data:",
        JSON.stringify(err.response?.data, null, 2),
      );

      // Extraire le message d'erreur du backend (format ApiError)
      let errorMsg = "Erreur lors de la création du commissaire";

      if (err.response?.data) {
        const data = err.response.data;

        // Format ApiError du backend
        if (data.message) {
          errorMsg = data.message;

          // Si il y a des erreurs de validation, les ajouter
          if (
            data.validationErrors &&
            Object.keys(data.validationErrors).length > 0
          ) {
            const validationMsgs = Object.values(data.validationErrors).join(
              ", ",
            );
            errorMsg += ` : ${validationMsgs}`;
          }
        }
        // Si c'est une string
        else if (typeof data === "string") {
          errorMsg = data;
        }
        // Si c'est un tableau d'erreurs
        else if (Array.isArray(data)) {
          errorMsg = data.map((e) => e.message || e).join(", ");
        }
        // Si c'est un objet avec une erreur
        else if (data.error) {
          errorMsg = data.error;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      throw new Error(errorMsg);
    }
  };

  const handleViewDetails = async (user) => {
    try {
      const details = await userService.getUserDetails(user.id);
      setSelectedUser(details);
      setOpenDetailsDialog(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des détails",
      );
      setOpenSnackbar(true);
    }
  };

  const handleToggleStatus = (user) => {
    const userRole = (user.role || "").toUpperCase();
    if (userRole === "ADMIN" || userRole === "ROLE_ADMIN") {
      setError("Le compte administrateur ne peut pas être désactivé");
      setOpenSnackbar(true);
      return;
    }
    setSelectedUser(user);
    setConfirmActionType("toggle");
    setConfirmAction(() => async () => {
      try {
        const isActive = user.isAccountActive;
        await userService.toggleUserStatus(user.id, !isActive);
        setSuccessMessage(
          isActive
            ? "Utilisateur désactivé avec succès"
            : "Utilisateur activé avec succès",
        );
        setOpenSnackbar(true);
        loadUsers();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de la modification du statut",
        );
        setOpenSnackbar(true);
      }
    });
    setOpenConfirmDialog(true);
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setConfirmActionType("reset");
    setConfirmAction(() => async () => {
      try {
        await userService.resetPassword(user.id);
        setSuccessMessage("Mot de passe réinitialisé avec succès");
        setOpenSnackbar(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de la réinitialisation du mot de passe",
        );
        setOpenSnackbar(true);
      }
    });
    setOpenConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await confirmAction();
    }
    setOpenConfirmDialog(false);
    setSelectedUser(null);
    setConfirmAction(null);
    setConfirmActionType(null);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
    setSuccessMessage(null);
  };

  const isCommissionerRole = (role) => {
    const value = (role || "").toUpperCase();
    return value === "COMMISSIONER" || value === "ROLE_COMMISSIONER" || value === "COMMISSIONNER" || value === "ROLE_COMMISSIONNER";
  };

  const openBlob = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleViewAccreditation = async (user) => {
    try {
      const blob = await userService.downloadCommissionerAccreditation(user.id);
      openBlob(blob, `accreditation-commissioner-${user.id}`);
      setAccreditationAvailability((prev) => ({ ...prev, [user.id]: true }));
    } catch (err) {
      setAccreditationAvailability((prev) => ({ ...prev, [user.id]: false }));
      setError(
        "Impossible d'ouvrir le document d'accréditation (aucun document soumis pour ce commissaire)."
      );
      setOpenSnackbar(true);
    }
  };

  const handleValidateAccreditation = async (user) => {
    if (!accreditationAvailability[user.id]) {
      setError("Validation impossible : aucun document CEN soumis par ce commissaire.");
      setOpenSnackbar(true);
      return;
    }
    try {
      await userService.validateCommissionerAccreditation(user.id);
      setSuccessMessage("Accréditation validée avec succès.");
      setOpenSnackbar(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la validation de l'accréditation."
      );
      setOpenSnackbar(true);
    }
  };

  const handleOpenRefuseAccreditation = (user) => {
    if (!accreditationAvailability[user.id]) {
      setError("Refus impossible : aucun document CEN soumis par ce commissaire.");
      setOpenSnackbar(true);
      return;
    }
    setSelectedUser(user);
    setRefuseReason("");
    setOpenRefuseAccreditationDialog(true);
  };

  const handleSubmitRefuseAccreditation = async () => {
    if (!selectedUser || !refuseReason.trim()) return;
    try {
      await userService.refuseCommissionerAccreditation(
        selectedUser.id,
        refuseReason.trim()
      );
      setSuccessMessage("Accréditation refusée et motif envoyé au commissaire.");
      setOpenSnackbar(true);
      setOpenRefuseAccreditationDialog(false);
      setSelectedUser(null);
      setRefuseReason("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du refus de l'accréditation."
      );
      setOpenSnackbar(true);
    }
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      ADMIN: "Administrateur",
      ROLE_ADMIN: "Administrateur",
      COMMISSIONER: "Commissaire",
      ROLE_COMMISSIONER: "Commissaire",
      COMMISSIONNER: "Commissaire",
      ROLE_COMMISSIONNER: "Commissaire",
      ATHLETE: "Athlète",
      ROLE_ATHLETE: "Athlète",
      // Backend utilise `ROLE_VOLONTEER` (avec O) et pas `ROLE_VOLUNTEER`
      VOLONTEER: "Volontaires",
      ROLE_VOLONTEER: "Volontaires",
      SPECTATOR: "Spectateur",
      ROLE_SPECTATOR: "Spectateur",
    };
    return roleMap[role] || role;
  };

  const getStatusChip = (isActive) => {
    const enabled = isActive !== undefined ? isActive : true;
    return enabled ? (
      <Chip
        label="Actif"
        size="small"
        sx={{
          background: "rgba(34,197,94,0.25)",
          color: appTheme.colors.dark,
          fontWeight: 600,
        }}
      />
    ) : (
      <Chip
        label="Inactif"
        size="small"
        sx={{
          background: "rgba(239,68,68,0.25)",
          color: appTheme.colors.dark,
          fontWeight: 600,
        }}
      />
    );
  };

  // Filtrage côté client
  const allFilteredUsers = users.filter((user) => {
    // Filtre par recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const name =
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      if (!name.includes(search) && !email.includes(search)) {
        return false;
      }
    }

    // Filtre par rôle
    if (roleFilter !== "ALL") {
      const userRole = (user.role || "").toUpperCase();
      const filterRole = roleFilter.toUpperCase();
      if (userRole !== filterRole && userRole !== `ROLE_${filterRole}`) {
        return false;
      }
    }

    // Filtre par statut (isAccountActive dans develop)
    if (statusFilter !== "ALL") {
      const isActive = user.isAccountActive;
      if (statusFilter === "ACTIVE" && !isActive) {
        return false;
      }
      if (statusFilter === "INACTIVE" && isActive) {
        return false;
      }
    }

    return true;
  });

  // Pagination côté client
  const filteredUsers = allFilteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalFilteredPages = Math.ceil(
    allFilteredUsers.length / ITEMS_PER_PAGE,
  );

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

      {/* TITRE + BOUTON */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 900,
            color: appTheme.colors.dark,
            letterSpacing: "-0.5px",
          }}
        >
          Gestion des utilisateurs
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Créer un commissaire
        </Button>
      </Box>

      {/* FILTRES ET RECHERCHE */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Rôle</InputLabel>
          <Select
            value={roleFilter}
            label="Rôle"
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="ALL">Tous</MenuItem>
            <MenuItem value="ADMIN">Administrateur</MenuItem>
            <MenuItem value="COMMISSIONNER">Commissaire</MenuItem>
            <MenuItem value="ATHLETE">Athlète</MenuItem>
            <MenuItem value="VOLONTEER">Volontaires</MenuItem>
            <MenuItem value="SPECTATOR">Spectateur</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="ALL">Tous</MenuItem>
            <MenuItem value="ACTIVE">Actif</MenuItem>
            <MenuItem value="INACTIVE">Inactif</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: appTheme.radius.lg,
              overflow: "hidden",
              boxShadow: appTheme.shadows.card,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: appTheme.gradients.card }}>
                  <TableCell
                    sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}
                  >
                    Nom
                  </TableCell>
                  <TableCell
                    sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}
                  >
                    Rôle
                  </TableCell>
                  <TableCell
                    sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}
                  >
                    Statut
                  </TableCell>
                  <TableCell
                    sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color={appTheme.colors.textMuted}>
                        Aucun utilisateur trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          size="small"
                          sx={{
                            background: appTheme.colors.darkSoft,
                            color: appTheme.colors.textPrimary,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {getStatusChip(user.isAccountActive)}
                      </TableCell>
                      <TableCell>
                        {isCommissionerRole(user.role) && (
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: accreditationAvailability[user.id] ? "#16a34a" : "#dc2626",
                              mb: 0.8,
                            }}
                          >
                            {accreditationAvailability[user.id]
                              ? "Document CEN: Reçu"
                              : "Document CEN: Non reçu"}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {isCommissionerRole(user.role) && (
                            <>
                              <Tooltip
                                title={
                                  accreditationAvailability[user.id]
                                    ? "Voir document d'accréditation"
                                    : "Aucun document CEN soumis"
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewAccreditation(user)}
                                  sx={{ color: appTheme.colors.cyan }}
                                >
                                  <DescriptionIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  accreditationAvailability[user.id]
                                    ? "Valider l'accréditation"
                                    : "Validation indisponible sans document CEN"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!accreditationAvailability[user.id]}
                                    onClick={() => handleValidateAccreditation(user)}
                                    sx={{ color: "#22c55e" }}
                                  >
                                    <TaskAltIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip
                                title={
                                  accreditationAvailability[user.id]
                                    ? "Refuser l'accréditation"
                                    : "Refus indisponible sans document CEN"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!accreditationAvailability[user.id]}
                                    onClick={() => handleOpenRefuseAccreditation(user)}
                                    sx={{ color: "#ef4444" }}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Voir les détails (bientôt disponible)">
                            <span>
                              <IconButton
                                size="small"
                                disabled
                                sx={{
                                  color: appTheme.colors.cyan,
                                  opacity: 0.5,
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              user.isAccountActive
                                ? "Désactiver (bientôt disponible)"
                                : "Activer (bientôt disponible)"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled
                                sx={{
                                  color: user.isAccountActive
                                    ? "#ef4444"
                                    : "#22c55e",
                                  opacity: 0.5,
                                }}
                              >
                                {user.isAccountActive ? (
                                  <BlockIcon fontSize="small" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Réinitialiser le mot de passe (bientôt disponible)">
                            <span>
                              <IconButton
                                size="small"
                                disabled
                                sx={{
                                  color: appTheme.colors.violet,
                                  opacity: 0.5,
                                }}
                              >
                                <LockResetIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          {totalFilteredPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalFilteredPages}
                page={currentPage}
                onChange={(e, value) => setCurrentPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* DIALOG DÉTAILS */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Détails de l'utilisateur</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <Typography>
                <strong>Nom:</strong> {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography>
                <strong>Rôle:</strong> {getRoleLabel(selectedUser.role)}
              </Typography>
              <Typography>
                <strong>Statut:</strong>{" "}
                {selectedUser.isAccountActive ? "Actif" : "Inactif"}
              </Typography>
              {selectedUser.createdAt && (
                <Typography>
                  <strong>Créé le:</strong>{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DE CONFIRMATION */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedUser &&
              (confirmActionType === "toggle"
                ? `Êtes-vous sûr de vouloir ${
                    selectedUser.isAccountActive ? "désactiver" : "activer"
                  } cet utilisateur ?`
                : "Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Annuler</Button>
          <Button
            onClick={handleConfirmAction}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRefuseAccreditationDialog}
        onClose={() => setOpenRefuseAccreditationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Refuser l'accréditation commissaire</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>
            Merci d'indiquer le motif qui sera envoyé au commissaire.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Motif du refus"
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.target.value)}
            placeholder="Ex: document illisible, merci d'envoyer une version plus nette."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRefuseAccreditationDialog(false)}>Annuler</Button>
          <Button
            onClick={handleSubmitRefuseAccreditation}
            disabled={!refuseReason.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              color: "#fff",
            }}
          >
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>

      {/* FORMULAIRE CRÉATION COMMISSAIRE */}
      <CommissionerFormDialog
        open={openForm}
        onClose={handleCloseForm}
        onSave={handleSaveCommissioner}
      />

      {/* SNACKBAR POUR ERREURS/SUCCÈS */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
