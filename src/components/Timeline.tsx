import type { Adventure, Location, Transport } from "@/datatypes"
import { MapContainer, TileLayer } from "react-leaflet"
import { Button } from "./ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card"

import { useTripStore } from "@/store"
import { useState } from "react"

export function TimelineItem({
    item,
    index,
    parent_index,
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
    parent_index?: number
    isSelected?: boolean
    isFirst: boolean
    isLast: boolean
    onToggleSelect?: (index: number | [number, number]) => void
    onRemove?: (index: number | [number, number]) => void
    onMoveUp?: (index: number | [number, number]) => void
    onMoveDown?: (index: number | [number, number]) => void
}) {
    const [is_expanded, set_expanded] = useState(true);
    return (
        <div className={`p-3 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-slate-50'}`}>
            <div className="flex items-start justify-between">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect?.(parent_index ? [parent_index, index] : index)}
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
                    {item.type==="adventure" && <Button
                        variant="ghost"
                        size="sm"
                        onClick={()=>set_expanded(!is_expanded)}
                    >{is_expanded?"-":"+"}</Button>}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveUp?.(parent_index ? [parent_index, index] : index)}
                        disabled={isFirst}
                    >↑</Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveDown?.(parent_index ? [parent_index, index] : index)}
                        disabled={isLast}
                    >↓</Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove?.(parent_index ? [parent_index, index] : index)}
                    >✕</Button>
                </div>
            </div>
            {item.type === "adventure" && is_expanded && <div className="flex flex-col gap-2 p-2 ml-2 mr-2 bg-white rounded shadow-inner">
                {item.itin.map(
                    (sub_item, sub_index) =>
                        <TimelineItem
                            key={sub_index}
                            item={sub_item}
                            index={sub_index}
                            parent_index={index}
                            isFirst={sub_index == 0}
                            isLast={item.itin.length - 1 === sub_index}
                            onToggleSelect={() => onToggleSelect?.([index, sub_index])}
                            onRemove={() => onRemove?.([index, sub_index])}
                            onMoveUp={() => onMoveUp?.([index, sub_index])}
                            onMoveDown={() => onMoveDown?.([index, sub_index])}
                        />
                )}
            </div>}
        </div>
    )
}

export function TimelineView() {
    const itin = useTripStore(s => s.itin);
    const selected_item = useTripStore(s => s.selected_item);
    const clear_timeline = useTripStore(s => s.clear_timeline);
    const move_up = useTripStore(s => s.move_up);
    const move_down = useTripStore(s => s.move_down);
    const remove = useTripStore(s => s.remove);
    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>Trip Timeline</CardTitle>
                <CardAction>
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
                </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
                {
                    itin.length === 0 ? (
                        <p className="text-gray-500">No items yet. Add some above!</p>
                    ) : (
                        itin.map((item, i) => <TimelineItem
                            key={i}
                            item={item}
                            index={i}
                            isSelected={i === selected_item}
                            isFirst={i === 0}
                            isLast={i === itin.length - 1}
                            onToggleSelect={() => useTripStore.setState({ selected_item: (i === selected_item) ? undefined : i })}
                            onRemove={(index) => remove(index)}
                            onMoveUp={(index) => move_up(index)}
                            onMoveDown={(index) => move_down(index)}
                        />)
                    )
                }
            </CardContent>
        </Card>
    )
}