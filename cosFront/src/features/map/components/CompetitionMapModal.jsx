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
  ListItemButton,
  ListItemIcon,
  Divider,
  CircularProgress,
  Box,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapView from "./MapView";
import DirectionsPanel from "./DirectionsPanel";
import MarkerColorDot from "./MarkerColorDot";
import { GEO_FALLBACK_POSITION, isGeoFallbackEnabled } from "../geoFallbackConfig";
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
  const [userPin, setUserPin] = useState(null);
  const [mapRecenterNonce, setMapRecenterNonce] = useState(0);
  const [selectedMp, setSelectedMp] = useState(null);
  const [routePath, setRoutePath] = useState(null);

  useEffect(() => {
    if (!open) {
      setUserPin(null);
      setMapRecenterNonce(0);
      setSelectedMp(null);
      setRoutePath(null);
    }
  }, [open]);

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

  const markers = [
    ...meetingPoints.map((mp) => ({
      id: `mp-${mp.siteId}`,
      lat: mp.latitude,
      lng: mp.longitude,
      type: "EVENT",
      label: mp.trialName,
      info: mp.siteAddress,
    })),
    ...(userPin
      ? [
          {
            id: "user-me",
            lat: userPin.lat,
            lng: userPin.lng,
            type: "USER",
            label: "Ma position",
            info: "Vous",
          },
        ]
      : []),
  ];

  const defaultCenter = meetingPoints[0]
    ? { lat: meetingPoints[0].latitude, lng: meetingPoints[0].longitude }
    : { lat: 50.604457, lng: 3.136702 };

  const mapCenter = userPin ?? defaultCenter;

  const handleLocateMe = () => {
    const applyPin = (lat, lng) => {
      setUserPin({ lat, lng });
      setMapRecenterNonce((n) => n + 1);
    };
    if (!navigator.geolocation) {
      if (isGeoFallbackEnabled()) {
        applyPin(GEO_FALLBACK_POSITION.lat, GEO_FALLBACK_POSITION.lng);
      }
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => applyPin(coords.latitude, coords.longitude),
      (err) => {
        if (isGeoFallbackEnabled() && (err.code === 2 || err.code === 3)) {
          applyPin(GEO_FALLBACK_POSITION.lat, GEO_FALLBACK_POSITION.lng);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Carte
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MyLocationIcon />}
                onClick={handleLocateMe}
              >
                Me localiser
              </Button>
            </Box>

            <MapView
              markers={markers}
              polylinePath={routePath}
              center={mapCenter}
              zoom={13}
              recenterNonce={mapRecenterNonce}
              height="320px"
            />

            {selectedMp && !userPin && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Utilisez « Me localiser » pour calculer un itinéraire jusqu’au site sur la carte.
              </Alert>
            )}

            {meetingPoints.length > 0 ? (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                  Sites d’épreuve
                </Typography>
                <List dense disablePadding>
                  {meetingPoints.map((mp, i) => (
                    <div key={mp.siteId ?? i}>
                      <ListItem
                        disablePadding
                        secondaryAction={(
                          <Button
                            size="small"
                            variant="outlined"
                            endIcon={<OpenInNewIcon fontSize="small" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openInGoogleMaps(mp);
                            }}
                          >
                            Google Maps
                          </Button>
                        )}
                      >
                        <ListItemButton
                          selected={selectedMp?.siteId === mp.siteId}
                          onClick={() => {
                            setRoutePath(null);
                            setSelectedMp(mp);
                          }}
                          sx={{ pr: 14 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <MarkerColorDot markerType="EVENT" />
                          </ListItemIcon>
                          <ListItemText
                            primary={mp.trialName}
                            secondary={`${mp.siteAddress} — ${mp.startDate} à ${mp.startHour}`}
                          />
                        </ListItemButton>
                      </ListItem>
                      {i < meetingPoints.length - 1 && <Divider component="li" />}
                    </div>
                  ))}
                </List>

                {selectedMp && userPin && (
                  <Box sx={{ mt: 2 }}>
                    <DirectionsPanel
                      originLat={userPin.lat}
                      originLng={userPin.lng}
                      destinationParams={{ siteId: selectedMp.siteId }}
                      onRoute={setRoutePath}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                Aucune épreuve à venir avec un site assigné.
              </Typography>
            )}
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
}
