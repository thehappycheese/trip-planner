import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as L from 'leaflet'

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type Coordinate = {x:number, y:number}
type Location = {
    type:"location"
    name:string
    position:Coordinate
    booking?:Booking
}
type Transport = {
    type:"transport"
    name:string
    booking?:Booking
}
type Booking = {
    type:"booking"
    time_start:string
    time_end:string
}
type Adventure = {
    type:"adventure"
    day:string
    locations:(Location | Transport)[]
}
type TripTimeline = {
    itin:(Location | Adventure | Transport)[]
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
      newItem = { type: 'adventure', day, locations: [] }
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
        <div>
          <Label>Type</Label>
          <Select value={itemType} onValueChange={(v: any) => setItemType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {itemType !== 'adventure' && (
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        {itemType === 'location' && (
          <div>
            <Label>Select Location (click on map)</Label>
            <div className="mt-2 rounded overflow-hidden border">
              <MapPicker position={position} onPositionChange={setPosition} />
            </div>
            <div className="flex gap-2 mt-2">
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
          </div>
        )}

        {itemType === 'adventure' && (
          <div>
            <Label>Day</Label>
            <Input value={day} onChange={(e) => setDay(e.target.value)} placeholder="e.g., 2024-01-15" />
          </div>
        )}

        {itemType !== 'adventure' && (
          <>
            <div className="flex items-center gap-2">
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
                <div>
                  <Label>Start Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={bookingStart} 
                    onChange={(e) => setBookingStart(e.target.value)} 
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={bookingEnd} 
                    onChange={(e) => setBookingEnd(e.target.value)} 
                  />
                </div>
              </div>
            )}
          </>
        )}

        <Button onClick={handleSubmit} className="w-full">Add to Timeline</Button>
      </div>
    </Card>
  )
}

function TimelineView({ timeline }: { timeline: TripTimeline }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Trip Timeline ({timeline.itin.length} items)</h2>
      
      {timeline.itin.length === 0 ? (
        <p className="text-gray-500">No items yet. Add some above!</p>
      ) : (
        <div className="space-y-2">
          {timeline.itin.map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded border">
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
          ))}
        </div>
      )}
    </Card>
  )
}

function App() {
  const [timeline, setTimeline] = useState<TripTimeline>({ itin: [] })

  const handleAddItem = (item: Location | Transport | Adventure) => {
    setTimeline({ itin: [...timeline.itin, item] })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Trip Timeline Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ItemForm onAdd={handleAddItem} />
          <TimelineView timeline={timeline} />
        </div>
      </div>
    </div>
  )
}

export default App