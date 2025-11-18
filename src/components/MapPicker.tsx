import type { Coordinate } from "@/datatypes"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

export function MapPicker({ position, onPositionChange }: { position: Coordinate, onPositionChange: (pos: Coordinate) => void }) {
    function MapClickHandler() {
        useMapEvents({
            click: (e) => {
                onPositionChange({ x: e.latlng.lat, y: e.latlng.lng })
            },
        })
        return null
    }

    return (
        <MapContainer center={[position.x || 0, position.y || 0]} zoom={2} style={{ height: '300px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            {position.x !== 0 && position.y !== 0 && <Marker position={[position.x, position.y]} />}
        </MapContainer>
    )
}