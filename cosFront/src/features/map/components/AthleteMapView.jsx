import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import StopIcon from "@mui/icons-material/Stop";
import MapView from "./MapView";
import DirectionsPanel from "./DirectionsPanel";
import useAthleteTracking from "../hooks/useAthleteTracking";
import useMeetingInfo from "../hooks/useMeetingInfo";

/**
 * Props:
 *   athleteId: number
 */
export default function AthleteMapView({ athleteId }) {
  const { tracking, position, error: trackError, startTracking, stopTracking } =
    useAthleteTracking(athleteId);
  const { info, loading: infoLoading } = useMeetingInfo(athleteId);

  const [routePath, setRoutePath] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const markers = [];
  if (position) {
    markers.push({ id: "me", lat: position.lat, lng: position.lng, type: "USER", label: "Ma position" });
  }
  if (info?.meetingPoints) {
    info.meetingPoints.forEach((mp) => {
      markers.push({
        id: `mp-${mp.siteId}`,
        lat: mp.siteLatitude,
        lng: mp.siteLongitude,
        type: "SITE",
        label: mp.siteName,
        info: mp.trialName,
      });
    });
  }

  const mapCenter = position || (info?.meetingPoints?.[0]
    ? { lat: info.meetingPoints[0].siteLatitude, lng: info.meetingPoints[0].siteLongitude }
    : { lat: 48.8566, lng: 2.3522 });

  return (
    <Box>
      {trackError && <Alert severity="warning" sx={{ mb: 1 }}>{trackError}</Alert>}

      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        {!tracking ? (
          <Button
            variant="contained"
            startIcon={<MyLocationIcon />}
            onClick={startTracking}
            size="small"
          >
            Activer le suivi
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={stopTracking}
            size="small"
          >
            Arrêter le suivi
          </Button>
        )}
        {tracking && (
          <Typography variant="body2" color="success.main" sx={{ alignSelf: "center" }}>
            Suivi actif
          </Typography>
        )}
      </Box>

      <MapView
        markers={markers}
        polylinePath={routePath}
        center={mapCenter}
        zoom={14}
        height="350px"
      />

      {infoLoading && <CircularProgress size={20} sx={{ mt: 1 }} />}

      {info?.meetingPoints?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Mes points de rendez-vous
          </Typography>
          <List dense>
            {info.meetingPoints.map((mp, i) => (
              <div key={mp.siteId}>
                <ListItem
                  button
                  selected={selectedMeeting?.siteId === mp.siteId}
                  onClick={() => setSelectedMeeting(mp)}
                >
                  <ListItemText
                    primary={mp.siteName}
                    secondary={`${mp.trialName} — ${mp.startDate} à ${mp.startHour}`}
                  />
                </ListItem>
                {i < info.meetingPoints.length - 1 && <Divider />}
              </div>
            ))}
          </List>

          {selectedMeeting && position && (
            <DirectionsPanel
              originLat={position.lat}
              originLng={position.lng}
              destinationParams={{ siteId: selectedMeeting.siteId }}
              onRoute={setRoutePath}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
