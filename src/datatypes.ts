import type { RequiredBy } from "./lib/type_utilities";

export type ItemType = 'location' | 'transport' | 'adventure';
export type Coordinate = { x: number, y: number }
export type Location = {
    type: "location"
    name?: string
    geocoded_name?:string
    reference_method?:"search_result"|"clicked_map_or_manual_entry"
    position?: Coordinate
    viewport?:{top_left:Coordinate, bottom_right:Coordinate}
    place_id?:string
    booking?: Booking
}
export type Transport = {
    type: "transport"
    name: string
    booking?: Booking
}
export type Booking = {
    type: "booking"
    time_start: string
    time_end: string
}
export type Adventure = {
    type: "adventure"
    name: string
    day: string
    /** itin Should never contain an adventure. Cant be enforced neatly by type system :(*/
    itin: ItinType[]
}

export type ItinType = Location | Transport | Adventure;

export type CurrentFormItem = RequiredBy<ItinType, "type">
