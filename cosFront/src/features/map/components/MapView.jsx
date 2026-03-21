import { useEffect, useRef, useState } from "react";
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { Box, Typography } from "@mui/material";

const MARKER_COLORS = {
  SITE: { background: "#1976d2", glyphColor: "#fff", borderColor: "#1565c0" },
  FAN_ZONE: { background: "#f57c00", glyphColor: "#fff", borderColor: "#e65100" },
  EVENT: { background: "#00acc1", glyphColor: "#fff", borderColor: "#00838f" },
  ATHLETE: { background: "#e53935", glyphColor: "#fff", borderColor: "#b71c1c" },
  USER: { background: "#43a047", glyphColor: "#fff", borderColor: "#2e7d32" },
};

function PolylineOverlay({ path }) {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !path?.length) return;
    polylineRef.current = new window.google.maps.Polyline({
      path,
      strokeColor: "#1976d2",
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    });
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path]);

  return null;
}

/**
 * Reusable Google Maps component.
 *
 * Props:
 *   markers: Array<{ id, lat, lng, type: 'SITE'|'FAN_ZONE'|'EVENT'|'ATHLETE'|'USER', label, info }>
 *   polylinePath: Array<{ lat, lng }>  — optional route polyline
 *   center: { lat, lng }
 *   zoom: number
 *   height: string  — CSS height, default '400px'
 */
export default function MapView({
  markers = [],
  polylinePath,
  center = { lat: 48.8566, lng: 2.3522 },
  zoom = 13,
  height = "400px",
}) {
  const [selectedMarker, setSelectedMarker] = useState(null);

  return (
    <Box sx={{ width: "100%", height }}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        mapId="ciblorgasport-map"
        style={{ width: "100%", height: "100%" }}
      >
        {markers.map((m) => {
          const colors = MARKER_COLORS[m.type] || MARKER_COLORS.EVENT;
          return (
            <AdvancedMarker
              key={m.id}
              position={{ lat: m.lat, lng: m.lng }}
              onClick={() => setSelectedMarker(m)}
            >
              <Pin
                background={colors.background}
                glyphColor={colors.glyphColor}
                borderColor={colors.borderColor}
              />
            </AdvancedMarker>
          );
        })}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <Box sx={{ p: 0.5, maxWidth: 220 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedMarker.label}
              </Typography>
              {selectedMarker.info && (
                <Typography variant="body2" color="text.secondary">
                  {selectedMarker.info}
                </Typography>
              )}
            </Box>
          </InfoWindow>
        )}

        {polylinePath?.length > 0 && <PolylineOverlay path={polylinePath} />}
      </Map>
    </Box>
  );
}
