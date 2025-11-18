import type { Adventure, Location, Transport, TripTimeline } from "@/datatypes"
import { MapContainer, TileLayer } from "react-leaflet"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

export function TimelineItem({
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
            <div className="flex items-start justify-between">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(index)}
                    className="mt-1"
                />

                <div className="grow flex justify-between">
                    <div>
                        <div className="font-medium">
                            {item.type === 'location' && `📍 ${item.name}`}
                            {item.type === 'transport' && `🚗 ${item.name}`}
                            {item.type === 'adventure' && `🗓️ Adventure - Day ${item.day}`}
                        </div>
                        {item.type !== 'adventure' && item.booking && (
                            <div className="text-sm text-gray-600 mt-1">
                                📅 {new Date(item.booking.time_start).toLocaleString()} → {new Date(item.booking.time_end).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {item.type === 'location' && (
                        <div>
                        <MapContainer
                            center={[item.position.x || 0, item.position.y || 0]}
                            zoom={15}
                            style={{ height: '4em', width: '6em' }}
                            zoomControl={false}
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        </MapContainer>
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

export function TimelineView({
    timeline,
    onClear,
    onRemove,
    onMoveUp,
    onMoveDown,
    selectedItems,
    setSelectedItems,
    onEditSelected,
}: {
    timeline: TripTimeline
    selectedItems:Set<number>, 
    setSelectedItems:(new_value:Set<number>)=>void,
    onClear: () => void
    onRemove: (index: number) => void
    onMoveUp: (index: number) => void
    onMoveDown: (index: number) => void
    onEditSelected: () => void
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
                    {selectedItems.size ===1 && (
                        <Button variant="outline" size="sm" onClick={onEditSelected}>
                            Edit
                        </Button>
                    )}
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