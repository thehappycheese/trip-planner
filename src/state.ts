import {create} from 'zustand';
import type { Coordinate, ItemType } from './datatypes';

type CurrentFormItem = {
    item_type: ItemType;
    name: string;
    position: Coordinate;
    day: string;
    bookingStart: string;
    bookingEnd: string;
    hasBooking: boolean;
}
type Actions = {
    update:(partial:Partial<CurrentFormItem>)=>void
    clear:()=>void,
}

export const useCurrentFormItem = create<CurrentFormItem & Actions>((set) => ({
    item_type: 'location',
    name: '',
    position: { x: 0, y: 0 },
    day: '',
    bookingStart: '',
    bookingEnd: '',
    hasBooking: false,
    
    update: (partial) => set((state) => ({ ...state, ...partial })),
    
    clear: () => set({
        name: '',
        position: { x: 0, y: 0 },
        day: '',
        bookingStart: '',
        bookingEnd: '',
        hasBooking: false,
    }),
}));
