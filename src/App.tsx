import { useState, useEffect, type SetStateAction, type Dispatch } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import * as L from 'leaflet';
import type { Location, Adventure, Transport, Coordinate, TripTimeline } from './datatypes';
import { TimelineView } from './components/Timeline';
import { useLocalStorage } from './hooks/use_local_storage';
import { MapPicker } from './components/MapPicker';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function BookingForm({
    hasBooking, setHasBooking,
    bookingStart, setBookingStart,
    bookingEnd, setBookingEnd,
}: {
    hasBooking: boolean, setHasBooking: Dispatch<SetStateAction<boolean>>,
    bookingStart: string, setBookingStart: Dispatch<SetStateAction<string>>,
    bookingEnd: string, setBookingEnd: Dispatch<SetStateAction<string>>,
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


function ItemForm({ onAdd }: { onAdd: (item: Location | Transport | Adventure) => void }) {
    const [item_type, setItemType] = useState<'location' | 'transport' | 'adventure'>('location')
    const [name, setName] = useState('')
    const [position, setPosition] = useState<Coordinate>({ x: 0, y: 0 })
    const [day, setDay] = useState('')
    const [bookingStart, setBookingStart] = useState('')
    const [bookingEnd, setBookingEnd] = useState('')
    const [hasBooking, setHasBooking] = useState(false)

    const handleSubmit = () => {
        const booking = hasBooking && bookingStart && bookingEnd
            ? { type: 'booking' as const, time_start: bookingStart, time_end: bookingEnd }
            : undefined

        let new_item: Location | Transport | Adventure

        if (item_type === 'location') {
            new_item = { type: 'location', name, position, booking }
        } else if (item_type === 'transport') {
            new_item = { type: 'transport', name, booking }
        } else {
            new_item = { type: 'adventure', day, itin: [] }
        }

        onAdd(new_item)
        setName('')
        setDay('')
        setPosition({ x: 0, y: 0 })
        setBookingStart('')
        setBookingEnd('')
        setHasBooking(false)
    }

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Add Item</h2>

            <div className="space-y-4">

                {/* <Select value={itemType} onValueChange={(v: any) => setItemType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
            </SelectContent>
          </Select> */}
                <Tabs value={item_type} onValueChange={setItemType}>
                    <TabsList >
                        <TabsTrigger value="adventure">Adventure</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        <TabsTrigger value="travel">Travel</TabsTrigger>
                    </TabsList>
                    <TabsContent value="adventure">
                        <Field>
                            <Label>Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </Field>
                    </TabsContent>
                    <TabsContent value="location">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </Field>
                            <Field>
                                <FieldLabel>Select Location (click on map)</FieldLabel>
                                <div className="rounded overflow-hidden border">
                                    <MapPicker position={position} onPositionChange={setPosition} />
                                </div>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Input
                                        type="number"
                                        placeholder="Lat"
                                        value={position.x || ''}
                                        onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Lng"
                                        value={position.y || ''}
                                        onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
                                    />
                                </div>
                            </Field>
                            <BookingForm
                                {...{
                                    hasBooking, setHasBooking,
                                    bookingStart, setBookingStart,
                                    bookingEnd, setBookingEnd
                                }}
                            />
                        </FieldGroup>
                    </TabsContent>
                    <TabsContent value="travel">
                        <div>
                            <Label>Day</Label>
                            <Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="e.g., 2024-01-15" />
                        </div>
                        <BookingForm
                            {...{
                                hasBooking, setHasBooking,
                                bookingStart, setBookingStart,
                                bookingEnd, setBookingEnd
                            }}
                        />
                    </TabsContent>
                </Tabs>


                <Button onClick={handleSubmit} className="w-full">Add to Timeline</Button>
            </div>
        </Card>
    )
}



function App() {
  const [timeline, setTimeline] = useLocalStorage<TripTimeline>('tripTimeline', { itin: [] })
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const handleAddItem = (item_to_add: Location | Transport | Adventure) => {
    if (selectedItems.size===1){
        const index = selectedItems.values().next().value!;
        const item = timeline.itin[index];
        if(item.type==="adventure"){
            if(item_to_add.type!=="adventure"){
                const new_item:Adventure = {...item, itin:[...item.itin, item_to_add]};
                const new_timeline:TripTimeline = {...timeline, itin: [...timeline.itin] };
                new_timeline.itin[index]= new_item;
                setTimeline(new_timeline);
                return
            }
        }
    }
    setTimeline({...timeline, itin: [...timeline.itin, item_to_add] })
  }

  const handleClear = () => {
    setTimeline({ itin: [] })
  }

  const handleRemove = (index: number) => {
    setTimeline({ itin: timeline.itin.filter((_, i) => i !== index) })
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItin = [...timeline.itin]
    const temp = newItin[index]
    newItin[index] = newItin[index - 1]
    newItin[index - 1] = temp
    setTimeline({ itin: newItin })
  }

  const handleMoveDown = (index: number) => {
    if (index === timeline.itin.length - 1) return
    const newItin = [...timeline.itin]
    const temp = newItin[index]
    newItin[index] = newItin[index + 1]
    newItin[index + 1] = temp
    setTimeline({ itin: newItin })
  }
  const handleEditSelected = () =>{

  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Trip Timeline Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ItemForm onAdd={handleAddItem} />
          <TimelineView 
            timeline={timeline} 
            onClear={handleClear}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            onEditSelected={handleEditSelected}
          />
        </div>
      </div>
    </div>
  )
}

export default App