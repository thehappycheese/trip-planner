import type { Adventure, Location, Transport } from "@/datatypes"
import { MapContainer, TileLayer } from "react-leaflet"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

import { useTripStore } from "@/store"

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
    isSelected?: boolean
    isFirst: boolean
    isLast: boolean
    onToggleSelect?: (index: number) => void
    onRemove?: (index: number) => void
    onMoveUp?: (index: number) => void
    onMoveDown?: (index: number) => void
}) {
    //return <div>{JSON.stringify(item)}</div>
    return (
        <div className={`p-3 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-slate-50'}`}>
            <div className="flex items-start justify-between">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect?.(index)}
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
                            <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <div>📅</div>
                                <div>
                                    {new Date(item.booking.time_start).toLocaleString()} <br />
                                    {new Date(item.booking.time_end).toLocaleString()}
                                </div>
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
                        onClick={() => onMoveUp?.(index)}
                        disabled={isFirst}
                    >
                        ↑
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveDown?.(index)}
                        disabled={isLast}
                    >
                        ↓
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove?.(index)}
                    >
                        ✕
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 ml-10 mr-4">
                {(item.type === "adventure") && item.itin.map(
                    (sub_item, index) => <div key={index}>
                        <TimelineItem
                            item={sub_item}
                            index={index}
                            isFirst={index==0}
                            isLast={item.itin.length-1===index}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export function TimelineView() {
    const itin = useTripStore(s => s.itin);
    const selected_item = useTripStore(s => s.selected_item);
    const clear_timeline = useTripStore(s => s.clear_timeline);
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Trip Timeline ({itin.length} items)</h2>
                <div className="flex gap-2">
                    {selected_item && (
                        <Button variant="outline" size="sm" onClick={() => alert("not implemented yet")}>
                            Edit
                        </Button>
                    )}
                    {selected_item && (
                        <Button variant="outline" size="sm" onClick={() => alert("not implemented yet")}>
                            Remove Selected
                        </Button>
                    )}
                    {itin.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clear_timeline}>
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {itin.length === 0 ? (
                <p className="text-gray-500">No items yet. Add some above!</p>
            ) : (
                <div className="space-y-2">
                    {itin.map((item, i) => (
                        <TimelineItem
                            key={i}
                            item={item}
                            index={i}
                            isSelected={i === selected_item}
                            isFirst={i === 0}
                            isLast={i === itin.length - 1}
                            onToggleSelect={() => useTripStore.setState({ selected_item: (i === selected_item) ? undefined : i })}
                            onRemove={() => alert("not implemented yet")}
                            onMoveUp={() => alert("not implemented yet")}
                            onMoveDown={() => alert("not implemented yet")}
                        />
                    ))}
                </div>
            )}
        </Card>
    )
}