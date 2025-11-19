export type ItemType = 'location' | 'transport' | 'adventure';
export type Coordinate = { x: number, y: number }
export type Location = {
    type: "location"
    name: string
    position: Coordinate
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
    day: string
    itin: (Location | Transport)[]
}
export type TripTimeline = {
    itin: (Location | Adventure | Transport)[]
}
export type CurrentFormItem = {
    item_type: ItemType;
    name: string;
    position: Coordinate;
    day: string;
    bookingStart: string;
    bookingEnd: string;
    hasBooking: boolean;
};
