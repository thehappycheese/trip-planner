import { forwardRef, useImperativeHandle, useRef } from "react"
import type { Coordinate } from "@/datatypes"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

export interface MapPickerRef {
    set_zoom: (zoom: number) => void
    set_pan_zoom: (position: Coordinate, zoom?: number) => void
}
export interface MapPickerProps { 
    position?: Coordinate
    onPositionChange: (pos: Coordinate) => void 
}

export const MapPicker = forwardRef<MapPickerRef, MapPickerProps>(({ position, onPositionChange }, ref) => {
    const map_ref = useRef<L.Map | null>(null)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        set_pan: (new_position: Coordinate) => {
            if (map_ref.current && new_position) {
                map_ref.current.setView([new_position.x, new_position.y], map_ref.current.getZoom())
            }
        },
        set_zoom: (new_zoom: number) => {
            if (map_ref.current && position) {
                map_ref.current.setView([position.x, position.y], new_zoom)
            }
        },
        set_pan_zoom: (new_position: Coordinate, new_zoom?: number) => {
            if (map_ref.current) {
                map_ref.current.setView([new_position.x, new_position.y], new_zoom ?? map_ref.current.getZoom())
            }
        }
    }))

    function MapSetup() {
        const map = useMap()
        map_ref.current = map
        map.setView([-27.1375627,120.6326831], 2);
        
        useMapEvents({
            click: (e) => {
                onPositionChange({ x: e.latlng.lat, y: e.latlng.lng })
            },
        })
        return null
    }

    return (
        <MapContainer 
            // center={[position?.x ?? 0, position?.y ?? 0]} 
            // zoom={2} 
            
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