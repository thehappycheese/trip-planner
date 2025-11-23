import { useRef, useState } from 'react'
import type { Coordinate } from "@/datatypes"
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { MapPicker, type MapPickerRef } from './MapPicker'
import { LocationSearchBar, type LocationSearchBarData } from './LocationSearchBar'
import { type Location } from "../datatypes"
import { BookingForm } from './BookingForm'
import type { RequiredBy } from '@/lib/type_utilities'



export function LocationForm({
    value,
    on_change,
}:{
    value:RequiredBy<Location, "type">,
    on_change:(location:Location)=>void
}) {
    return <FieldGroup>
        <LocationFormInner
            value={value}
            on_update={value => on_change(value)}
        />
        <BookingForm
            booking={value.booking}
            on_update={booking => on_change({ ...value, booking })}
        />
    </FieldGroup>
}

interface LocationInputProps {
    value: Location,
    on_update: (updates: Location) => void
}

function LocationFormInner({ value, on_update }: LocationInputProps) {

    const map_picker_ref = useRef<MapPickerRef>(null);

    const [location_search_bar_data, set_location_search_bar_data] = useState<LocationSearchBarData>(
        { type: "empty", search_string:""}
    );

    const handlePositionChange = (new_position: Coordinate, pan: boolean = false) => {
        // Map click or manual coordinate entry clears geocoded status
        set_location_search_bar_data({
            type:"empty", search_string:""
        });
        on_update({
            ...value,
            position: new_position,
            geocoded_name: undefined,
            place_id: undefined,
            reference_method: "clicked_map_or_manual_entry"
        });
        if (pan) {
            map_picker_ref.current?.set_pan_zoom(new_position);
        }
    };

    const handleLocationSearchBarChange = (new_value: LocationSearchBarData) => {
        if (new_value.type === "search_result") {
            on_update({
                ...value,
                type: "location",
                geocoded_name: new_value.display_name,
                place_id: new_value.place_id,
                position: new_value.position,
                reference_method: "search_result",
            });
            map_picker_ref.current?.set_pan_zoom(new_value.position);
        }
        set_location_search_bar_data(new_value)
    };

    return <>
        <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
                type="text"
                value={value?.name}
                onChange={e => on_update({ ...value, name: e.target.value })}
            />
        </Field>
        <Field>
            <FieldLabel>Location</FieldLabel>
            <LocationSearchBar
                value={location_search_bar_data}
                on_change={handleLocationSearchBarChange}
            />
            <div className="rounded overflow-hidden border">
                <MapPicker
                    ref={map_picker_ref}
                    position={value.position}
                    on_change={new_position => handlePositionChange(new_position, false)}
                />
            </div>
        </Field>
        <Field>
            <div className='grid grid-cols-[auto_1fr_auto_1fr] gap-2 mt-2'>
                <FieldLabel>Lat</FieldLabel>
                <Input
                    type="number"
                    placeholder="Lng"
                    value={value.position?.x || ''}
                    onChange={(e) => {
                        const new_position = {
                            x: Number(e.target.value),
                            y: value.position?.y ?? 0
                        };
                        handlePositionChange(new_position, true);
                    }}
                />
                <FieldLabel>Lon</FieldLabel>
                <Input
                    type="number"
                    placeholder="Lat"
                    value={value.position?.y || ''}
                    onChange={(e) => {
                        const new_position = {
                            x: value.position?.x ?? 0,
                            y: Number(e.target.value)
                        };
                        handlePositionChange(new_position, true);
                    }}
                />
            </div>
        </Field>
    </>;
}