import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { LocationForm } from "./LocationForm";
import { BookingForm } from "./BookingForm";
import { Button } from "./ui/button";
import { useState } from "react";
import type { RequiredBy } from "@/lib/type_utilities";
import {type Adventure, type Location, type Transport, type ItemType} from "../datatypes"
import { useTripStore } from "@/store";


export type CurrentFormItem = {
    current_type: ItemType
    location: RequiredBy<Location, "type">
    adventure: RequiredBy<Adventure, "type">
    transport: RequiredBy<Transport, "type">
}
export function ItemForm({value, on_change}:{
    value:CurrentFormItem,
    on_change:(new_value:CurrentFormItem)=>void
}) {
    const [item, set_item] = useState({
        current_type:"location" as unknown as ItemType,
        location:{type:"location"} as RequiredBy<Location, "type">,
        adventure:{type:"adventure"} as RequiredBy<Adventure, "type">,
        transport:{type:"transport"} as RequiredBy<Transport, "type">,
    })
    const store = useTripStore();
    const handleSubmit = () => {
        store.add_item(item[item.current_type])
    }

    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>Add Item</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={item.current_type} onValueChange={current_type => set_item({ ...item, current_type })}>
                    <TabsList >
                        <TabsTrigger value="adventure">Adventure</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        <TabsTrigger value="transport">Transport</TabsTrigger>
                    </TabsList>
                    <TabsContent value="adventure">
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input value={item.adventure.name} onChange={e => set_item({...item, adventure:{...item.adventure, name: e.target.value }})} />
                        </Field>
                        <Field>
                            <FieldLabel>Day</FieldLabel>
                            <Input
                                type="date"
                                value={item.adventure.day} onChange={e => set_item({...item, adventure:{...item.adventure, day: e.target.value }})}
                            />
                        </Field>
                    </TabsContent>
                    <TabsContent value="location">
                        <FieldGroup>
                            <LocationForm
                                value={item.location}
                                on_change={location => set_item({ ...item, location })}
                            />
                        </FieldGroup>
                    </TabsContent>
                    <TabsContent value="transport">
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input value={item.transport.name} onChange={e => set_item({...item, transport:{...item.transport, name: e.target.value }})} />
                        </Field>
                        <FieldGroup>
                            
                            <BookingForm
                                booking={item.transport.booking}
                                on_update={booking=>set_item({...item, transport:{...item.transport, booking}})}
                            />
                        </FieldGroup>
                    </TabsContent>
                </Tabs>


                <Button onClick={handleSubmit} className="w-full mt-4">Add to Timeline</Button>
            </CardContent>
        </Card>
    )
}
