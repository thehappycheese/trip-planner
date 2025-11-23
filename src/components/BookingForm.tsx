import { useState } from "react";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import type { Booking } from "@/datatypes";

export function BookingForm({
    booking,
    on_update,
}: {
    booking?: Booking
    on_update: (new_value?: Booking) => void
}) {
    const [enabled, set_enabled] = useState(false);
    return <>
        <div className="flex flex-row items-center gap-3">
            <Checkbox
                id="booking-check"
                checked={enabled}
                onCheckedChange={checked => {
                    set_enabled(checked===true);
                    if (checked!==true) {
                        on_update(undefined);
                    }
                }}
            />
            <FieldLabel htmlFor="booking-check">Add Booking</FieldLabel>
        </div>

        {enabled && (
            <div className="grid grid-cols-2 gap-2">
                <Field>
                    <Label>Start Time</Label>
                    <Input
                        type="datetime-local"
                        value={booking?.time_start}
                        onChange={e => {
                            const newStart = e.target.value;
                            const currentEnd = booking?.time_end ?? newStart;
                            on_update({
                                type:"booking",
                                time_start: newStart,
                                time_end: newStart > currentEnd ? newStart : currentEnd
                            });
                        }}
                    />
                </Field>
                <Field>
                    <Label>End Time</Label>
                    <Input
                        type="datetime-local"
                        value={booking?.time_end}
                        onChange={e => {
                            const newEnd = e.target.value;
                            const currentStart = booking?.time_start ?? newEnd;
                            on_update({
                                type:"booking",
                                time_start: newEnd < currentStart ? newEnd : currentStart,
                                time_end: newEnd
                            });
                        }}
                    />
                </Field>
            </div>
        )}
    </>
}