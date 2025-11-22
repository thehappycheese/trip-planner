import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Field,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import 'leaflet/dist/leaflet.css';
import { LocationInput } from './components/LocationInput';
import { TimelineView } from './components/Timeline';
import type { CurrentFormItem, ItemType } from './datatypes';
import { useTripStore } from './store';

function BookingForm({
    hasBooking, setHasBooking,
    bookingStart, setBookingStart,
    bookingEnd, setBookingEnd,
}: {
    hasBooking: boolean, setHasBooking: (v: boolean) => void,
    bookingStart: string, setBookingStart: (v: string) => void,
    bookingEnd: string, setBookingEnd: (v: string) => void,
}) {
    return <><div className="flex items-center gap-2">
        <input
            type="checkbox"
            id="booking-check"
            checked={hasBooking}
            onChange={(e) => setHasBooking(e.target.checked)}
        />
        <Label htmlFor="booking-check">Add Booking</Label>
    </div>

        {hasBooking && (
            <div className="grid grid-cols-2 gap-2">
                <Field>
                    <Label>Start Time</Label>
                    <Input
                        type="datetime-local"
                        value={bookingStart}
                        onChange={(e) => setBookingStart(e.target.value)}
                    />
                </Field>
                <Field>
                    <Label>End Time</Label>
                    <Input
                        type="datetime-local"
                        value={bookingEnd}
                        onChange={(e) => setBookingEnd(e.target.value)}
                    />
                </Field>
            </div>
        )}
    </>
}


function ItemForm() {
    const {
        item_type,
        name,
        position,
        day,
        bookingStart,
        bookingEnd,
        hasBooking,
    } = useTripStore(state => state.current_form_item);
    
    const {
        clear_current_form_item,
        add_current_form_item,
    } = useTripStore();
    const update = (v:Partial<CurrentFormItem>)=>useTripStore.setState(state=>({...state, current_form_item:{...state.current_form_item, ...v}}))

    const handleSubmit = () => {


        add_current_form_item()
        clear_current_form_item()
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Add Item</h2>
            <div className="space-y-4">
                <Tabs value={item_type} onValueChange={v => update({ item_type: v as ItemType })}>
                    <TabsList >
                        <TabsTrigger value="adventure">Adventure</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        <TabsTrigger value="travel">Travel</TabsTrigger>
                    </TabsList>
                    <TabsContent value="adventure">
                        <Field>
                            <Label>Name</Label>
                            <Input value={name} onChange={e => update({ name: e.target.value })} />
                        </Field>
                    </TabsContent>
                    <TabsContent value="location">
                        <FieldGroup>
                            <LocationInput
                                name={name}
                                position={position}
                                onUpdate={value => update({ name: value.name, position:value.position })}
                            />
                            <BookingForm
                                {...{
                                    hasBooking, setHasBooking: hasBooking => update({ hasBooking }),
                                    bookingStart, setBookingStart: bookingStart => update({ bookingStart }),
                                    bookingEnd, setBookingEnd: bookingEnd => update({ bookingEnd }),
                                }}
                            />
                        </FieldGroup>
                    </TabsContent>
                    <TabsContent value="travel">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Day</FieldLabel>
                                <Input value={day} onChange={(e) => update({ day: e.target.value })} placeholder="e.g., 2024-01-15" />
                            </Field>
                            <BookingForm
                                {...{
                                    hasBooking, setHasBooking: hasBooking => update({ hasBooking }),
                                    bookingStart, setBookingStart: bookingStart => update({ bookingStart }),
                                    bookingEnd, setBookingEnd: bookingEnd => update({ bookingEnd }),
                                }}
                            />
                        </FieldGroup>
                    </TabsContent>
                </Tabs>


                <Button onClick={handleSubmit} className="w-full">Add to Timeline</Button>
            </div>
        </Card>
    )
}



function App() {



    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Trip Timeline Builder</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <ItemForm />
                    <TimelineView/>
                </div>
            </div>
        </div>
    )
}

export default App