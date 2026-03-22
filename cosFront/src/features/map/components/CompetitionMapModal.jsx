import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MapView from "./MapView";
import athleteLocationService from "../services/athleteLocationService";
import { DEV_MEETING_POINTS } from "../devMocks";

CompetitionMapModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  athleteId: PropTypes.number,
  competitionId: PropTypes.number,
  competitionName: PropTypes.string,
};

export default function CompetitionMapModal({ open, onClose, athleteId, competitionId, competitionName }) {
  const [meetingPoints, setMeetingPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !athleteId || !competitionId) return;
    setLoading(true);
    athleteLocationService.getMeetingInfo(athleteId, competitionId)
      .then(setMeetingPoints)
      .catch(() => {
        if (import.meta.env.DEV) {
          console.warn("[dev] Backend inaccessible — meeting points simulés.");
          setMeetingPoints(DEV_MEETING_POINTS);
        }
      })
      .finally(() => setLoading(false));
  }, [open, athleteId, competitionId]);

  const markers = meetingPoints.map((mp) => ({
    id: `mp-${mp.siteId}`,
    lat: mp.latitude,
    lng: mp.longitude,
    type: "SITE",
    label: mp.siteAddress,
    info: mp.trialName,
  }));

  const mapCenter = meetingPoints[0]
    ? { lat: meetingPoints[0].latitude, lng: meetingPoints[0].longitude }
    : { lat: 50.604457, lng: 3.136702 };

  const openInGoogleMaps = (mp) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${mp.latitude},${mp.longitude}`, "_blank");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography fontWeight={700}>Plans — {competitionName}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <MapView markers={markers} center={mapCenter} zoom={13} height="350px" />

            {meetingPoints.length > 0 ? (
              <List dense sx={{ mt: 1 }}>
                {meetingPoints.map((mp, i) => (
                  <div key={mp.siteId ?? i}>
                    <ListItem>
                      <ListItemText
                        primary={mp.trialName}
                        secondary={`${mp.siteAddress} — ${mp.startDate} à ${mp.startHour}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewIcon fontSize="small" />}
                          onClick={() => openInGoogleMaps(mp)}
                        >
                          Itinéraire
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {i < meetingPoints.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                Aucune épreuve à venir avec un site assigné.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
