import { Box } from "@mui/material";
import { MAP_MARKER_COLORS } from "../mapMarkerColors";

export default function MarkerColorDot({ markerType }) {
  const c = MAP_MARKER_COLORS[markerType] || MAP_MARKER_COLORS.EVENT;
  return (
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        bgcolor: c.background,
        border: `2px solid ${c.borderColor}`,
        flexShrink: 0,
      }}
    />
  );
}
