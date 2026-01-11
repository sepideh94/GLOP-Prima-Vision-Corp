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
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import userService from "../services/userService";
import CommissionerFormDialog from "../components/CommissionerFormDialog";

const ITEMS_PER_PAGE = 20;

export default function UsersManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Désactivé car l'endpoint n'existe pas encore
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState(null);

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Désactivé temporairement car l'endpoint GET /api/admin/users n'existe pas encore côté backend
  // useEffect(() => {
  //   loadUsers();
  // }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
      };
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await userService.getUsers(params);
      
      // Gérer différentes structures de réponse possibles
      if (Array.isArray(response)) {
        setUsers(response);
        setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
      } else if (response.content) {
        // Pagination Spring Boot
        setUsers(response.content || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des utilisateurs"
      );
      setOpenSnackbar(true);
      setUsers([]);
    } finally {
      setLoading(false);
    }
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

      // Générer un mot de passe temporaire aléatoire
      const tempPassword = generateTempPassword();
      
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: tempPassword,
      };

      // Vérifier que les champs ne sont pas vides après trim
      if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
        throw new Error("Les champs ne peuvent pas être vides");
      }

      console.log("Payload envoyé:", { ...payload, password: "***" }); // Log sans afficher le mot de passe
      
      const result = await userService.createCommissioner(payload);
      console.log("Commissaire créé avec succès:", result);
      
      // Stocker le mot de passe temporaire et les infos utilisateur pour les afficher dans un dialog
      setTempPassword(tempPassword);
      setCreatedUser({
        email: result.email || payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      });
      setOpenForm(false);
      setOpenPasswordDialog(true);
      // Ne pas recharger les users car l'endpoint GET /api/admin/users n'existe pas encore
      // loadUsers();
    } catch (err) {
      console.error("Erreur complète:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", JSON.stringify(err.response?.data, null, 2));
      
      // Extraire le message d'erreur du backend (format ApiError)
      let errorMsg = "Erreur lors de la création du commissaire";
      
      if (err.response?.data) {
        const data = err.response.data;
        
        // Format ApiError du backend
        if (data.message) {
          errorMsg = data.message;
          
          // Si il y a des erreurs de validation, les ajouter
          if (data.validationErrors && Object.keys(data.validationErrors).length > 0) {
            const validationMsgs = Object.values(data.validationErrors).join(', ');
            errorMsg += ` : ${validationMsgs}`;
          }
        }
        // Si c'est une string
        else if (typeof data === 'string') {
          errorMsg = data;
        }
        // Si c'est un tableau d'erreurs
        else if (Array.isArray(data)) {
          errorMsg = data.map(e => e.message || e).join(', ');
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

  // Générer un mot de passe temporaire sécurisé
  const generateTempPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    // S'assurer qu'il y a au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    // Remplir le reste
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    // Mélanger les caractères
    return password.split("").sort(() => Math.random() - 0.5).join("");
  };

  const handleViewDetails = async (user) => {
    try {
      const details = await userService.getUserDetails(user.id);
      setSelectedUser(details);
      setOpenDetailsDialog(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des détails"
      );
      setOpenSnackbar(true);
    }
  };

  const handleToggleStatus = (user) => {
    if (user.role === "ADMIN" || user.role === "ROLE_ADMIN") {
      setError("Le compte administrateur ne peut pas être désactivé");
      setOpenSnackbar(true);
      return;
    }
    setSelectedUser(user);
    setConfirmActionType("toggle");
    setConfirmAction(() => async () => {
      try {
        await userService.toggleUserStatus(user.id, !user.enabled);
        setSuccessMessage(
          user.enabled
            ? "Utilisateur désactivé avec succès"
            : "Utilisateur activé avec succès"
        );
        setOpenSnackbar(true);
        loadUsers();
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de la modification du statut"
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
            "Erreur lors de la réinitialisation du mot de passe"
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

  const getRoleLabel = (role) => {
    const roleMap = {
      ADMIN: "Administrateur",
      ROLE_ADMIN: "Administrateur",
      COMMISSIONER: "Commissaire",
      ROLE_COMMISSIONER: "Commissaire",
      ATHLETE: "Athlète",
      ROLE_ATHLETE: "Athlète",
      VOLUNTEER: "Bénévole",
      ROLE_VOLUNTEER: "Bénévole",
      SPECTATOR: "Spectateur",
      ROLE_SPECTATOR: "Spectateur",
    };
    return roleMap[role] || role;
  };

  const getStatusChip = (enabled) => {
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

  // Filtrage côté client si nécessaire (en complément de l'API)
  const filteredUsers = users.filter((user) => {
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const name = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      if (!name.includes(search) && !email.includes(search)) {
        return false;
      }
    }
    return true;
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
            <MenuItem value="COMMISSIONER">Commissaire</MenuItem>
            <MenuItem value="ATHLETE">Athlète</MenuItem>
            <MenuItem value="VOLUNTEER">Bénévole</MenuItem>
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
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Nom
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Rôle
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Statut
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color={appTheme.colors.textMuted}>
                        La liste des utilisateurs n'est pas encore disponible. L'endpoint GET /api/admin/users doit être implémenté côté backend.
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
                      <TableCell>{getStatusChip(user.enabled)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(user)}
                              sx={{ color: appTheme.colors.cyan }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              user.enabled ? "Désactiver" : "Activer"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(user)}
                                disabled={
                                  user.role === "ADMIN" ||
                                  user.role === "ROLE_ADMIN"
                                }
                                sx={{
                                  color: user.enabled
                                    ? "#ef4444"
                                    : "#22c55e",
                                }}
                              >
                                {user.enabled ? (
                                  <BlockIcon fontSize="small" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Réinitialiser le mot de passe">
                            <IconButton
                              size="small"
                              onClick={() => handleResetPassword(user)}
                              sx={{ color: appTheme.colors.violet }}
                            >
                              <LockResetIcon fontSize="small" />
                            </IconButton>
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
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
                {selectedUser.enabled ? "Actif" : "Inactif"}
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
                    selectedUser.enabled
                      ? "désactiver"
                      : "activer"
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

      {/* DIALOG MOT DE PASSE TEMPORAIRE */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => {
          setOpenPasswordDialog(false);
          setTempPassword(null);
          setCreatedUser(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Commissaire créé avec succès</DialogTitle>
        <DialogContent>
          {createdUser && tempPassword && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Le compte commissaire a été créé avec succès !
              </Alert>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Informations de connexion :
                </Typography>
                <Typography>
                  <strong>Email :</strong> {createdUser.email}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Mot de passe temporaire :</strong>
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    background: appTheme.colors.darkSoft,
                    borderRadius: 2,
                    border: `2px solid ${appTheme.colors.cyan}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: appTheme.colors.cyan,
                      textAlign: "center",
                      letterSpacing: "2px",
                    }}
                  >
                    {tempPassword}
                  </Typography>
                </Box>
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  ⚠️ Notez ce mot de passe, il ne sera plus affiché après la fermeture de cette fenêtre.
                </Alert>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPasswordDialog(false);
              setTempPassword(null);
              setCreatedUser(null);
            }}
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
            J'ai noté le mot de passe
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
