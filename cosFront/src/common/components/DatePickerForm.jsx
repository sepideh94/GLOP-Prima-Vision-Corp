import { TextField } from '@mui/material';

/**
 * Datepicker form component reusable - documentation des paramètres
 *
 * @param {Object} props
 * @param {string} props.label - Libellé du champ
 * @param {string} props.name - Nom attribut du champ
 * @param {string} props.value - Date actuelle format YYYY-MM-DD
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Champ requis
 * @param {boolean} props.fullWidth - Si ça doit prendre toute la largeur
 * @param {boolean} props.error - Indicateur d'erreur
 * @param {string} props.helperText - Helper/error texte à afficher
 * @param {string} props.minDate - Min date autorisée (format YYYY-MM-DD)
 * @param {string} props.maxDate - Max date autorisée (YYYY-MM-DD format)
 * @param {boolean} props.disablePast - Désactivé les dates passées
 * @param {Object} props.sx - Style personnalisé
 */
export default function DatePickerForm({
  label,
  name,
  value,
  onChange,
  required = false,
  fullWidth = false,
  error = false,
  helperText = '',
  minDate = null,
  maxDate = null,
  disablePast = false,
  sx = {},
  ...otherProps
}) {
  // Calcul min date
  const getMinDate = () => {
    const today = new Date().toISOString().split('T')[0];

    if (disablePast && minDate) {
      return minDate >= today ? minDate : today;
    }

    if (disablePast) {
      return today;
    }

    return minDate || undefined;
  };
  const getMaxDate = () => {
    return maxDate || undefined;
  };

  return (
    <TextField
      type="date"
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        min: getMinDate(),
        max: getMaxDate(),
      }}
      sx={sx}
      {...otherProps}
    />
  );
}
