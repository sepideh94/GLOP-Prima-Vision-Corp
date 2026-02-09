import { useEffect, useState } from "react";
import {
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 Button,
 TextField,
 Grid,
 MenuItem,
 Alert,
 Box,
 Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DatePickerForm from "../../../common/components/DatePickerForm";
import appTheme from "../../../common/theme/appTheme";




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


const SITE_OPTIONS = [
 { value: 1, label: "Site 1 - Piscine principale" },
 { value: 2, label: "Site 2 - Piscine secondaire" },
];


const ROUND_OPTIONS = [
 { value: 1, label: "Round 1 - Qualifications" },
 { value: 2, label: "Round 2 - Demi-finale" },
 { value: 3, label: "Round 3 - Finale" },
];


const getMinWidth = (options, label) => {
 const maxOptionLength = Math.max(...options.map(opt => opt.label.length));
 const labelLength = label.length;
 const maxLength = Math.max(maxOptionLength, labelLength);
 return `${Math.max(maxLength * 8 + 60, 150)}px`;
};


const emptyForm = {
 trialName: "",
 roundNumber: "",
 description: "",
 rules: "",
 startDate: "",
 startHour: "",
 endHour: "",
 mode: "",
 categoryGender: "",
 siteId: "",
 roundId: "",
};


export default function TrialFormDialog({ open, onClose, onSave, initialData, competition, existingTrials = [] }) {
 const isEdit = Boolean(initialData);
 const [form, setForm] = useState(emptyForm);
 const [error, setError] = useState("");


 useEffect(() => {
   if (open) {
     if (initialData) {
       setForm({
         trialName: initialData.trialName || "",
         roundNumber: initialData.roundNumber ?? "",
         description: initialData.description || "",
         rules: initialData.rules || "",
         startDate: initialData.startDate || "",
         startHour: initialData.startHour ? initialData.startHour.substring(0, 5) : "",
         endHour: initialData.endHour ? initialData.endHour.substring(0, 5) : "",
         mode: initialData.mode || "",
         categoryGender: initialData.categoryGender || "",
         siteId: initialData.siteId || "",
         roundId: initialData.roundId || "",
       });
     } else {
       setForm(emptyForm);
     }
     setError("");
   }
 }, [open, initialData]);


 const handleChange = (e) => {
   const { name, value } = e.target;
   setForm((prev) => ({
     ...prev,
     [name]: value,
   }));
 };


 const handleSubmit = async () => {
   if (
     !form.trialName ||
     !form.startDate ||
     !form.startHour ||
     !form.endHour ||
     !form.mode ||
     !form.categoryGender ||
     !form.siteId ||
     !form.roundId
   ) {
     setError("Merci de remplir tous les champs obligatoires (*)");
     return;
   }

   // Check for duplicate: same date, same start hour, same site
   const isDuplicate = existingTrials.some((trial) => {
     // Skip the current trial if editing
     if (initialData && trial.id === initialData.id) return false;

     const trialStartHour = trial.startHour ? trial.startHour.substring(0, 5) : "";
     return (
       trial.startDate === form.startDate &&
       trialStartHour === form.startHour &&
       Number(trial.siteId) === Number(form.siteId)
     );
   });

   if (isDuplicate) {
     setError("Une épreuve existe déjà à cette date, heure et sur ce site.");
     return;
   }

   // Use the single date for both start and end date
   const payload = {
     ...form,
     endDate: form.startDate,
   };

   setError("");
   try {
     await onSave(payload);
   } catch (err) {
     setError(err.response?.data?.message || "Une erreur s'est produite");
   }
 };


 const dialogTitle = initialData
   ? "Modifier une épreuve"
   : "Créer une épreuve";

 const formatCompDate = (dateString) => {
   if (!dateString) return "";
   const date = new Date(dateString);
   if (Number.isNaN(date.getTime())) return dateString;
   return date.toLocaleDateString("fr-FR");
 };

 return (
   <Dialog
     open={open}
     onClose={onClose}
     maxWidth={false}
     fullWidth
     sx={{
       "& .MuiDialog-container": {
         "& .MuiDialog-paper": {
           width: "90%",
           maxWidth: "1200px",
         },
       },
     }}
   >
     <DialogTitle>{dialogTitle}</DialogTitle>


     <DialogContent dividers>
       {error && (
         <p style={{ color: "red", marginBottom: 16 }}>{error}</p>
       )}

       {competition && (
         <Alert
           severity="info"
           icon={<EmojiEventsIcon />}
           sx={{
             mb: 3,
             borderRadius: 2,
             "& .MuiAlert-message": { width: "100%" },
           }}
         >
           <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
             Compétition : {competition.name}
           </Typography>
           <Box sx={{ display: "flex", gap: 3 }}>
             <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
               <strong>Début :</strong> {formatCompDate(competition.startDate)}
             </Typography>
             <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
               <strong>Fin :</strong> {formatCompDate(competition.endDate)}
             </Typography>
           </Box>
         </Alert>
       )}

       <Grid container spacing={2} sx={{ mt: 1 }}>
         {/* Type d'épreuve */}
         <Grid item xs={12} sm={6} md={6}>
           <TextField
             select
             fullWidth
             label="Type d'épreuve *"
             name="trialName"
             value={form.trialName}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             SelectProps={{
               MenuProps: {
                 PaperProps: {
                   style: {
                     maxHeight: 300,
                   },
                 },
               },
             }}
             sx={{
               minWidth: getMinWidth(TRIAL_NAME_OPTIONS, "Type d'épreuve *"),
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
               "& .MuiSelect-select": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
                 textOverflow: "clip",
               },
             }}
           >
             {TRIAL_NAME_OPTIONS.map((opt) => (
               <MenuItem key={opt.value} value={opt.value}>
                 {opt.label}
               </MenuItem>
             ))}
           </TextField>
         </Grid>


         {/* Round number (optionnel) */}
         <Grid item xs={12} sm={6} md={4}>
           <TextField
             fullWidth
             type="number"
             label="Numéro de round (optionnel)"
             name="roundNumber"
             value={form.roundNumber}
             onChange={handleChange}
             inputProps={{ min: 1 }}
           />
         </Grid>


         {/* Description */}
         <Grid item xs={12}>
           <TextField
             fullWidth
             label="Description"
             name="description"
             value={form.description}
             onChange={handleChange}
             multiline
             rows={2}
           />
         </Grid>


         {/* Règles */}
         <Grid item xs={12}>
           <TextField
             fullWidth
             label="Règles"
             name="rules"
             value={form.rules}
             onChange={handleChange}
             multiline
             rows={2}
           />
         </Grid>


         {/* Dates et heures */}
         <Grid item xs={12} sm={6} md={3}>
           <DatePickerForm
             fullWidth
             label="Date*"
             name="startDate"
             value={form.startDate}
             onChange={handleChange}
             disablePast
           />
         </Grid>


         <Grid item xs={12} sm={6} md={3}>
           <TextField
             fullWidth
             label="Heure de début *"
             type="time"
             name="startHour"
             value={form.startHour}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             inputProps={{
               onKeyDown: (e) => e.preventDefault(),
             }}
             sx={{
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
             }}
           />
         </Grid>

         <Grid item xs={12} sm={6} md={3}>
           <TextField
             fullWidth
             label="Heure de fin *"
             type="time"
             name="endHour"
             value={form.endHour}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             inputProps={{
               onKeyDown: (e) => e.preventDefault(),
             }}
             sx={{
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
             }}
           />
         </Grid>


         {/* Mode & Catégorie */}
         <Grid item xs={12} sm={6} md={3}>
           <TextField
             select
             fullWidth
             label="Mode *"
             name="mode"
             value={form.mode}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             SelectProps={{
               MenuProps: {
                 PaperProps: {
                   style: {
                     maxHeight: 300,
                   },
                 },
               },
             }}
             sx={{
               minWidth: getMinWidth(MODE_OPTIONS, "Mode *"),
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
               "& .MuiSelect-select": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
                 textOverflow: "clip",
               },
             }}
           >
             {MODE_OPTIONS.map((opt) => (
               <MenuItem key={opt.value} value={opt.value}>
                 {opt.label}
               </MenuItem>
             ))}
           </TextField>
         </Grid>


         <Grid item xs={12} sm={6} md={3}>
           <TextField
             select
             fullWidth
             label="Catégorie *"
             name="categoryGender"
             value={form.categoryGender}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             SelectProps={{
               MenuProps: {
                 PaperProps: {
                   style: {
                     maxHeight: 300,
                   },
                 },
               },
             }}
             sx={{
               minWidth: getMinWidth(CATEGORY_OPTIONS, "Catégorie *"),
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
               "& .MuiSelect-select": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
                 textOverflow: "clip",
               },
             }}
           >
             {CATEGORY_OPTIONS.map((opt) => (
               <MenuItem key={opt.value} value={opt.value}>
                 {opt.label}
               </MenuItem>
             ))}
           </TextField>
         </Grid>


         {/* Site & Round */}
         <Grid item xs={12} sm={6} md={3}>
           <TextField
             select
             fullWidth
             label="Site *"
             name="siteId"
             value={form.siteId}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             SelectProps={{
               MenuProps: {
                 PaperProps: {
                   style: {
                     maxHeight: 300,
                   },
                 },
               },
             }}
             sx={{
               minWidth: getMinWidth(SITE_OPTIONS, "Site *"),
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
               "& .MuiSelect-select": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
                 textOverflow: "clip",
               },
             }}
           >
             {SITE_OPTIONS.map((opt) => (
               <MenuItem key={opt.value} value={opt.value}>
                 {opt.label}
               </MenuItem>
             ))}
           </TextField>
         </Grid>


         <Grid item xs={12} sm={6} md={3}>
           <TextField
             select
             fullWidth
             label="Round *"
             name="roundId"
             value={form.roundId}
             onChange={handleChange}
             InputLabelProps={{ shrink: true }}
             SelectProps={{
               MenuProps: {
                 PaperProps: {
                   style: {
                     maxHeight: 300,
                   },
                 },
               },
             }}
             sx={{
               minWidth: getMinWidth(ROUND_OPTIONS, "Round *"),
               "& .MuiInputLabel-root": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
               },
               "& .MuiSelect-select": {
                 whiteSpace: "nowrap",
                 overflow: "visible",
                 textOverflow: "clip",
               },
             }}
           >
             {ROUND_OPTIONS.map((opt) => (
               <MenuItem key={opt.value} value={opt.value}>
                 {opt.label}
               </MenuItem>
             ))}
           </TextField>
         </Grid>
       </Grid>
     </DialogContent>


     <DialogActions>
       <Button
       onClick={onClose}
       sx={{
        mb: 2,
        textTransform: "none",
        fontWeight: 700,
        px: 3,
        py: 1.1,
        minWidth: 130, 
        borderRadius: appTheme.radius.pill,
        background: "linear-gradient(135deg, #86efac, #4ade80)",
        color: "#064e3b",
        boxShadow: "0 6px 16px rgba(74,222,128,0.35)",
        "&:hover": {
        background: "linear-gradient(135deg, #4ade80, #22c55e)",
       },
      }}
      >
      Annuler
      </Button>

       <Button onClick={handleSubmit}
       sx={{
        mb: 2,
        textTransform: "none",
        fontWeight: 700,
        minWidth: 130,
        px: 3,
        py: 1.1,
        borderRadius: appTheme.radius.pill,
        background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
        color: appTheme.colors.dark,
        }}>
         Enregistrer
       </Button>
     </DialogActions>
   </Dialog>
 );
}