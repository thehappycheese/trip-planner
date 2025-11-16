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

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type Coordinate = { x: number, y: number }
type Location = {
    type: "location"
    name: string
    position: Coordinate
    booking?: Booking
}
type Transport = {
    type: "transport"
    name: string
    booking?: Booking
}
type Booking = {
    type: "booking"
    time_start: string
    time_end: string
}
type Adventure = {
    type: "adventure"
    day: string
    itin: (Location | Transport)[]
}
type TripTimeline = {
    itin: (Location | Adventure | Transport)[]
}

function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : initialValue
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue] as const
}

function MapPicker({ position, onPositionChange }: { position: Coordinate, onPositionChange: (pos: Coordinate) => void }) {
    function MapClickHandler() {
        useMapEvents({
            click: (e) => {
                onPositionChange({ x: e.latlng.lat, y: e.latlng.lng })
            },
        })
        return null
    }

    return (
        <MapContainer center={[position.x || 0, position.y || 0]} zoom={2} style={{ height: '300px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            {position.x !== 0 && position.y !== 0 && <Marker position={[position.x, position.y]} />}
        </MapContainer>
    )
}


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
    const [itemType, setItemType] = useState<'location' | 'transport' | 'adventure'>('location')
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

        let newItem: Location | Transport | Adventure

        if (itemType === 'location') {
            newItem = { type: 'location', name, position, booking }
        } else if (itemType === 'transport') {
            newItem = { type: 'transport', name, booking }
        } else {
            newItem = { type: 'adventure', day, itin: [] }
        }

        onAdd(newItem)
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
                <Tabs value={itemType} onValueChange={setItemType}>
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

function TimelineItem({
    item,
    index,
    isSelected,
    isFirst,
    isLast,
    onToggleSelect,
    onRemove,
    onMoveUp,
    onMoveDown
}: {
    item: Location | Transport | Adventure
    index: number
    isSelected: boolean
    isFirst: boolean
    isLast: boolean
    onToggleSelect: (index: number) => void
    onRemove: (index: number) => void
    onMoveUp: (index: number) => void
    onMoveDown: (index: number) => void
}) {
    return (
        <div className={`p-3 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-slate-50'}`}>
            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(index)}
                    className="mt-1"
                />

                <div className="flex-1">
                    <div className="font-medium">
                        {item.type === 'location' && `📍 ${item.name}`}
                        {item.type === 'transport' && `🚗 ${item.name}`}
                        {item.type === 'adventure' && `🗓️ Adventure - Day ${item.day}`}
                    </div>

                    {item.type === 'location' && (
                        <div className="text-sm text-gray-600 mt-1">
                            Coordinates: {item.position.x.toFixed(4)}, {item.position.y.toFixed(4)}
                        </div>
                    )}

                    {item.type !== 'adventure' && item.booking && (
                        <div className="text-sm text-gray-600 mt-1">
                            📅 {new Date(item.booking.time_start).toLocaleString()} → {new Date(item.booking.time_end).toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveUp(index)}
                        disabled={isFirst}
                    >
                        ↑
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveDown(index)}
                        disabled={isLast}
                    >
                        ↓
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                    >
                        ✕
                    </Button>
                </div>
            </div>
        </div>
    )
}

function TimelineView({
    timeline,
    onClear,
    onRemove,
    onMoveUp,
    onMoveDown,
    selectedItems,
    setSelectedItems,
}: {
    timeline: TripTimeline
    selectedItems:Set<number>, 
    setSelectedItems:(new_value:Set<number>)=>void,
    onClear: () => void
    onRemove: (index: number) => void
    onMoveUp: (index: number) => void
    onMoveDown: (index: number) => void
}) {
    

    const handleToggleSelect = (index: number) => {
        const newSelected = new Set(selectedItems)
        if (newSelected.has(index)) {
            newSelected.delete(index)
        } else {
            newSelected.add(index)
        }
        setSelectedItems(newSelected)
    }

    const handleRemoveSelected = () => {
        const indices = Array.from(selectedItems).sort((a, b) => b - a)
        indices.forEach(index => onRemove(index))
        setSelectedItems(new Set())
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Trip Timeline ({timeline.itin.length} items)</h2>
                <div className="flex gap-2">
                    {selectedItems.size > 0 && (
                        <Button variant="outline" size="sm" onClick={handleRemoveSelected}>
                            Remove Selected ({selectedItems.size})
                        </Button>
                    )}
                    {timeline.itin.length > 0 && (
                        <Button variant="outline" size="sm" onClick={onClear}>
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {timeline.itin.length === 0 ? (
                <p className="text-gray-500">No items yet. Add some above!</p>
            ) : (
                <div className="space-y-2">
                    {timeline.itin.map((item, i) => (
                        <TimelineItem
                            key={i}
                            item={item}
                            index={i}
                            isSelected={selectedItems.has(i)}
                            isFirst={i === 0}
                            isLast={i === timeline.itin.length - 1}
                            onToggleSelect={handleToggleSelect}
                            onRemove={onRemove}
                            onMoveUp={onMoveUp}
                            onMoveDown={onMoveDown}
                        />
                    ))}
                </div>
            )}
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
          />
        </div>
      </div>
    </div>
  )
}

export default App