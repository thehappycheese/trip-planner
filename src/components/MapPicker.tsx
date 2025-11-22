import { forwardRef, useImperativeHandle, useRef } from "react"
import type { Coordinate } from "@/datatypes"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

export interface MapPickerRef {
    zoomToPosition: (zoom: number) => void
    panTo: (position: Coordinate, zoom?: number) => void
}

export const MapPicker = forwardRef<MapPickerRef, { 
    position?: Coordinate
    onPositionChange: (pos: Coordinate) => void 
}>(({ position, onPositionChange }, ref) => {
    const mapRef = useRef<L.Map | null>(null)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        zoomToPosition: (zoom: number) => {
            if (mapRef.current && position) {
                mapRef.current.setView([position.x, position.y], zoom)
            }
        },
        panTo: (pos: Coordinate, zoom?: number) => {
            if (mapRef.current) {
                mapRef.current.setView([pos.x, pos.y], zoom ?? mapRef.current.getZoom())
            }
        }
    }))

    function MapSetup() {
        const map = useMap()
        mapRef.current = map
        
        useMapEvents({
            click: (e) => {
                onPositionChange({ x: e.latlng.lat, y: e.latlng.lng })
            },
        })
        return null
    }

    return (
        <MapContainer 
            center={[position?.x ?? 0, position?.y ?? 0]} 
            zoom={2} 
            style={{ height: '300px', width: '100%' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapSetup />
            {position && position.x !== 0 && position.y !== 0 && (
                <Marker position={[position.x, position.y]} />
            )}
        </MapContainer>
    )
})

MapPicker.displayName = 'MapPicker'