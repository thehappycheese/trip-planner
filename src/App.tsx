import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


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
    day:"string"
    locations:(Location | Transport)[]
}

type TripTimeline = {
    itin:(Location | Adventure | Transport)[]
}


function App() {
  const [timeline, setTimeline] = useState<TripTimeline>({ itin: [] })
  const [itemType, setItemType] = useState<'location' | 'transport' | 'adventure'>('location')
  const [name, setName] = useState('')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [day, setDay] = useState('')
  const [bookingStart, setBookingStart] = useState('')
  const [bookingEnd, setBookingEnd] = useState('')
  const [hasBooking, setHasBooking] = useState(false)

  const addItem = () => {
    const booking = hasBooking ? { type: 'booking' as const, time_start: bookingStart, time_end: bookingEnd } : undefined
    
    let newItem: Location | Transport | Adventure
    
    if (itemType === 'location') {
      newItem = { type: 'location', name, position: { x, y }, booking }
    } else if (itemType === 'transport') {
      newItem = { type: 'transport', name, booking }
    } else {
      newItem = { type: 'adventure', day, locations: [] }
    }
    
    setTimeline({ itin: [...timeline.itin, newItem] })
    setName('')
    setDay('')
    setBookingStart('')
    setBookingEnd('')
    setHasBooking(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card className="p-6 mb-4">
        <h2 className="text-xl font-bold mb-4">Add to Timeline</h2>
        
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
            <div className="flex gap-2">
              <div>
                <Label>X</Label>
                <Input type="number" value={x} onChange={(e) => setX(Number(e.target.value))} />
              </div>
              <div>
                <Label>Y</Label>
                <Input type="number" value={y} onChange={(e) => setY(Number(e.target.value))} />
              </div>
            </div>
          )}

          {itemType === 'adventure' && (
            <div>
              <Label>Day</Label>
              <Input value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
          )}

          {itemType !== 'adventure' && (
            <>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={hasBooking} onChange={(e) => setHasBooking(e.target.checked)} />
                <Label>Add Booking</Label>
              </div>
              
              {hasBooking && (
                <div className="flex gap-2">
                  <div>
                    <Label>Start</Label>
                    <Input type="datetime-local" value={bookingStart} onChange={(e) => setBookingStart(e.target.value)} />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input type="datetime-local" value={bookingEnd} onChange={(e) => setBookingEnd(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}

          <Button onClick={addItem}>Add</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Timeline ({timeline.itin.length})</h2>
        <div className="space-y-2">
          {timeline.itin.map((item, i) => (
            <div key={i} className="p-2 bg-slate-100 rounded">
              {item.type === 'location' && `📍 ${item.name} (${item.position.x}, ${item.position.y})`}
              {item.type === 'transport' && `🚗 ${item.name}`}
              {item.type === 'adventure' && `🗓️ Day ${item.day}`}
              {item.type !== 'adventure' && item.booking && ` • ${item.booking.time_start} - ${item.booking.time_end}`}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default App