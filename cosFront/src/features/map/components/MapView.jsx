import { useEffect, useRef, useState } from "react";
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { Box, Typography } from "@mui/material";
import { MAP_MARKER_COLORS } from "../mapMarkerColors";

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

/** Recentre la carte quand `center` ou `recenterNonce` change (defaultCenter seul ne réagit pas aux mises à jour). */
function MapCameraSync({ center, zoom, recenterNonce }) {
  const map = useMap();

  useEffect(() => {
    if (!map || center?.lat == null || center?.lng == null) return;
    map.panTo({ lat: center.lat, lng: center.lng });
    if (zoom != null) map.setZoom(zoom);
  }, [map, center?.lat, center?.lng, zoom, recenterNonce]);

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
  /** Incrémenter (ex. clic « Me localiser ») pour forcer un recentrage même si les coords sont identiques. */
  recenterNonce = 0,
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
        <MapCameraSync center={center} zoom={zoom} recenterNonce={recenterNonce} />
        {markers.map((m) => {
          const colors = MAP_MARKER_COLORS[m.type] || MAP_MARKER_COLORS.EVENT;
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
