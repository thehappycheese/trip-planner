import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Adventure, ItinType, Location, Transport } from './datatypes';
import { move_down, move_up } from './lib/array_utilities';



export type Store = {
    itin: (Location | Adventure | Transport)[]
    selected_item?: number
}
type Actions = {
    add_item: (new_item:ItinType)=>void,
    clear_timeline: () => void,
    move_up: (index: number | [number, number]) => void,
    move_down: (index: number | [number, number]) => void,
    remove: (index: number | [number, number]) => void,
};

export const useTripStore = create<Actions & Store>()(
    persist(
        (set, get) => ({

            move_up: index => set(state => {
                if (Array.isArray(index)) {
                    const [parent_index, child_index] = index;
                    const new_itin = [...state.itin];
                    const parent = new_itin[parent_index] as Adventure;
                    new_itin[parent_index] = {
                        ...parent,
                        itin: move_up(parent.itin, child_index)
                    };
                    return { itin: new_itin };
                }
                return { itin: move_up(state.itin, index) };
            }),

            move_down: index => set(state => {
                if (Array.isArray(index)) {
                    const [parentIdx, childIdx] = index;
                    const new_itin = [...state.itin];
                    const parent = new_itin[parentIdx] as Adventure;
                    new_itin[parentIdx] = {
                        ...parent,
                        itin: move_down(parent.itin, childIdx)
                    };
                    return { itin: new_itin };
                }
                return { itin: move_down(state.itin, index) };
            }),
            remove: index => set(state=>{
                if (Array.isArray(index)) {
                    const [parent_index, child_index] = index;
                    const parent = state.itin[parent_index] as Adventure;
                    const new_sub_itin = [...parent.itin];
                    new_sub_itin.splice(child_index);
                    const new_itin = [...state.itin]
                    new_itin[parent_index] = {
                        ...new_itin[parent_index],
                        itin:new_sub_itin
                    }
                    return { itin: new_itin };
                }
                const new_itin = state.itin;
                new_itin.splice(index)
                return { itin: new_itin };
            }),

            

            add_item:(new_item:ItinType) => {
                set(state=>({
                    ...state, itin:[...state.itin, new_item]
                }))
            },

            // add_current_form_item: () => {
            //     const state = get();
            //     const {
            //         item_type: type,
            //         position,
            //         day,
            //         name,
            //         hasBooking,
            //         bookingStart,
            //         bookingEnd,
            //         itin,
            //     } = state.current_form_item;
            //     const new_item = {
            //         type,
            //         ...((type === 'location') ? { position } : {}),
            //         ...((type === 'transport' || type === 'location') ? { name } : {}),
            //         ...((type === 'adventure') ? { day, itin } : {}),
            //         ...((hasBooking) ? {
            //             booking: {
            //                 type: "booking",
            //                 time_start: bookingStart,
            //                 time_end: bookingEnd,
            //             }
            //         } : {}),
            //     }


            //     // If we have a selected item AND it's an adventure, add to its nested itin
            //     if (state.selected_item !== undefined) {
            //         const selected_item = state.itin[state.selected_item];

            //         if (
            //             state.current_form_item.item_type !== "adventure"
            //             && selected_item
            //             && selected_item.type === "adventure"
            //         ) {
            //             // Update the adventure's itin array
            //             const updatedItin = [...state.itin];
            //             updatedItin[state.selected_item] = {
            //                 ...selected_item,
            //                 itin: [...selected_item.itin, new_item]
            //             };
            //             set({
            //                 itin: updatedItin,
            //                 current_form_item: { ...initialFormItem, item_type: state.current_form_item.item_type }
            //             });
            //             return;
            //         }
            //     }

            //     // Otherwise, add to main itin array (this now runs when selected_item is undefined)
            //     set({
            //         itin: [...state.itin, new_item],
            //         current_form_item: { ...initialFormItem, item_type: state.current_form_item.item_type }
            //     });
            // },
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