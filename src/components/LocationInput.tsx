import { useRef } from 'react'
import type { Coordinate } from "@/datatypes"
import { Field, FieldLabel } from '@/components/ui/field' // Adjust import path
import { Input } from '@/components/ui/input'
import { MapPicker, type MapPickerRef } from './MapPicker'
import { LocationSearchBar } from './LocationSearchBar'

interface LocationData {
    name: string
    position?: Coordinate
}


interface LocationInputProps {
    name: string
    position: Coordinate
    onUpdate: (updates: Partial<LocationData>) => void
}

export function LocationInput({ name, position, onUpdate }: LocationInputProps) {
    const map_picker_ref = useRef<MapPickerRef>(null);

    const handleChangeGeocode = (selectedName: string, selectedPosition: Coordinate) => {
        onUpdate({ name: selectedName, position: selectedPosition })
        map_picker_ref.current?.panTo(position)
    }

    const handleNameChange = (newName: string) => {
        // Manual text edit clears geocoded status
        onUpdate({ name: newName, position})
    }

    const handlePositionChange = (newPosition: Coordinate) => {
        // Map click or manual coordinate entry clears geocoded status
        onUpdate({ name, position: newPosition })
    }

    return (
        <>
            <Field>
                <FieldLabel>Location Name</FieldLabel>
                <LocationSearchBar
                    value={name}
                    onChange={handleNameChange}
                    onChangeGeocode={handleChangeGeocode}
                />
            </Field>

            <Field>
                <FieldLabel>Select Location (click on map)</FieldLabel>
                <div className="rounded overflow-hidden border">
                    <MapPicker
                        ref={map_picker_ref}
                        position={position}
                        onPositionChange={handlePositionChange}
                    />
                </div>
                <div className='grid grid-cols-2 gap-2 mt-2'>
                    <Input
                        type="number"
                        placeholder="Lat"
                        value={position?.x || ''}
                        onChange={(e) => {
                            const new_position = {
                                x: Number(e.target.value),
                                y: position?.y ?? 0
                            };
                            handlePositionChange(new_position);
                            map_picker_ref.current?.panTo(new_position);
                        }}
                    />
                    <Input
                        type="number"
                        placeholder="Lng"
                        value={position?.y || ''}
                        onChange={(e) => {
                            const new_position = {
                                x: position?.x ?? 0,
                                y: Number(e.target.value)
                            }
                            handlePositionChange(new_position);
                            map_picker_ref.current?.panTo(new_position);
                        }}
                    />
                </div>
            </Field>
        </>
    )
}