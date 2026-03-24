import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { swimmingMediaUrlsForCompetitionId } from "../swimmingVisuals";

/**
 * Vignette natation : liste d’URLs Unsplash (rotation par id), puis dégradé si échec.
 */
export default function CompetitionSwimImage({ competitionId, height = 168, sx = {} }) {
  const orderedUrls = useMemo(
    () => swimmingMediaUrlsForCompetitionId(competitionId),
    [competitionId]
  );

  const [failCount, setFailCount] = useState(0);
  const src = orderedUrls[failCount];
  const showImage = failCount < orderedUrls.length;

  return (
    <Box
      sx={{
        position: "relative",
        height,
        width: "100%",
        overflow: "hidden",
        flexShrink: 0,
        background:
          "linear-gradient(135deg, #0c4a6e 0%, #0891b2 45%, #164e63 100%)",
        ...sx,
      }}
    >
      {showImage && src && (
        <Box
          component="img"
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailCount((c) => c + 1)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      )}
    </Box>
  );
}
