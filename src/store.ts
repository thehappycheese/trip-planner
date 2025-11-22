import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Adventure, CurrentFormItem, Location, Transport } from './datatypes';



export type Store = {
    current_form_item: CurrentFormItem
    itin: (Location | Adventure | Transport)[]
    selected_item?: number
}
type Actions = {
    //update:(partial:Partial<CurrentFormItem>)=>void
    clear_current_form_item: () => void,
    add_current_form_item: () => void,
    clear_timeline: () => void,
};

const initialFormItem: CurrentFormItem = {
    item_type: 'location',
    name: '',
    position: { x: 0, y: 0 },
    itin:[],
    day: '',
    bookingStart: '',
    bookingEnd: '',
    hasBooking: false,
};

export const useTripStore = create<Actions & Store>()(
    persist(
        (set, get) => ({
            current_form_item: { ...initialFormItem },

            clear_current_form_item: () => set(state => ({
                current_form_item: { ...initialFormItem, item_type: state.current_form_item.item_type }
            })),

            add_current_form_item: () => {
                const state = get();
                const {
                    item_type:type,
                    position,
                    day,
                    name,
                    hasBooking,
                    bookingStart,
                    bookingEnd,
                    itin,
                } = state.current_form_item;
                const new_item = {
                    type,
                    ...( (type==='location') ? {position} : {}),
                    ...( (type==='transport' || type==='location') ? {name} : {}),
                    ...( (type==='adventure') ? {day, itin} : {}),
                    ...( (hasBooking) ? {booking:{
                        type:"booking",
                        time_start:bookingStart,
                        time_end:bookingEnd,
                    }} : {}),
                }


                // If we have a selected item AND it's an adventure, add to its nested itin
                if (state.selected_item !== undefined) {
                    const selected_item = state.itin[state.selected_item];

                    if (
                        state.current_form_item.item_type !== "adventure"
                        && selected_item 
                        && selected_item.type === "adventure"
                    ) {
                        // Update the adventure's itin array
                        const updatedItin = [...state.itin];
                        updatedItin[state.selected_item] = {
                            ...selected_item,
                            itin: [...selected_item.itin, new_item]
                        };
                        set({
                            itin: updatedItin,
                            current_form_item: { ...initialFormItem, item_type: state.current_form_item.item_type }
                        });
                        return;
                    }
                }

                // Otherwise, add to main itin array (this now runs when selected_item is undefined)
                set({
                    itin: [...state.itin, new_item],
                    current_form_item: { ...initialFormItem, item_type: state.current_form_item.item_type }
                });
            },
            clear_timeline: () => {
                set(state => ({ ...state, itin: [] }))
            },
            selected_item: undefined,
            itin: []
        }),
        {
            name: "store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);