// AI-assisted: see docs/AI_LOG.md #7
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { DEFAULT_LOCATION, toLatLng } from '../utils/geo';

/**
 * Mapa con la ruta guardada dibujada con Polyline (sin Static Maps ni llamadas extra a la API).
 * points: [{lat,lng}] · markers: [{ point, title, color }]
 */
export default function RouteMap({ points = [], markers = [], style, showsUserLocation = false }) {
  const mapRef = useRef(null);
  const coordinates = points.map(toLatLng);
  const fitKey = coordinates.length ? `${coordinates.length}-${coordinates[0].latitude}` : 'empty';

  useEffect(() => {
    const all = [...coordinates, ...markers.map((m) => toLatLng(m.point))];
    if (all.length < 2) return undefined;
    // Pequeño retraso para que el mapa termine de montarse antes de ajustar la cámara
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(all, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  const first = markers[0]?.point ?? points[0] ?? DEFAULT_LOCATION;

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      showsUserLocation={showsUserLocation}
      initialRegion={{ ...toLatLng(first), latitudeDelta: 0.05, longitudeDelta: 0.05 }}
    >
      {coordinates.length > 1 ? <Polyline coordinates={coordinates} strokeWidth={5} strokeColor="#1565C0" /> : null}
      {markers.map((marker) => (
        <Marker key={marker.title} coordinate={toLatLng(marker.point)} title={marker.title} pinColor={marker.color} />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 220, borderRadius: 12 },
});
