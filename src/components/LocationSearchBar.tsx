import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Coordinate } from "@/datatypes"
import { Popover, PopoverContent } from './ui/popover'
import { PopoverAnchor, PopoverTrigger } from '@radix-ui/react-popover'

interface GeocodingResult {
    place_id: string
    display_name: string
    lat: string
    lon: string
}

export type LocationSearchBarData = {
    type:"empty"
    search_string:string,
} | {
    type:"search_result"
    search_string:string,
    display_name:string
    position:Coordinate
    place_id:string
} | {
    type:"no_results",
    search_string:string,
};

export function LocationSearchBar({
    value,
    on_change,
}: {
    value: LocationSearchBarData
    on_change:(new_value:LocationSearchBarData)=>void
}) {

    const [results, set_results] = useState<GeocodingResult[]>([])
    const [loading, set_loading] = useState(false)
    const [error, set_error] = useState<string | null>(null)
    const [show_results, set_show_results] = useState(false)

    const handle_search = async () => {
        if (!value.search_string.trim()) return

        set_loading(true)
        set_error(null)
        set_show_results(false)

        try {
            // Using Nominatim (OpenStreetMap) as example - free and no API key needed
            // Rate limit: 1 request per second
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(value.search_string.trim())}&format=json&limit=10`,
                {
                    headers: {
                        'User-Agent': 'YourAppName/1.0' // Required by Nominatim
                    }
                }
            )

            if (!response.ok) throw new Error('Geocoding request failed')

            const data: GeocodingResult[] = await response.json()
            set_results(data)
            set_show_results(true)
        } catch (err) {
            set_error(err instanceof Error ? err.message : 'Search failed')
            set_results([])
        } finally {
            set_loading(false)
        }
    }

    const handle_result_click = (result: GeocodingResult) => {
        on_change({
            type:"search_result",
            search_string:value.search_string,
            display_name:result.display_name,
            place_id:result.place_id,
            position:{ x: parseFloat(result.lat), y: parseFloat(result.lon) },
        })
        set_show_results(false)
        set_results([])
    }

    const handle_key_down = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handle_search()
        }
    }

    return (
        <div>
            <Popover
                open={loading || Boolean(error) || (show_results && results.length > 0)}
            >
                <PopoverAnchor asChild>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={value.search_string}
                                onChange={(e) => on_change({...value, search_string:e.target.value})}
                                onKeyDown={handle_key_down}
                                placeholder="Search For Location or Click on Map Below..."
                            />
                        </div>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                onClick={handle_search}
                                disabled={loading || !value.search_string.trim()}
                                size="icon"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                    </div>
                    
                </PopoverAnchor>


                <PopoverContent align="start" className="z-99999">
                        {(loading || error || (show_results && results.length===0)) &&
                            <div className="mb-2 text-sm">
                                {loading && <span className="text-muted-foreground">Searching...</span>}
                                {error && <span className="text-red-600">Error: {error}</span>}
                                {show_results && results.length === 0 && !loading && <span className="text-muted-foreground">No Results Found</span>}
                            </div>
                        }
                        {show_results && results.length>0 &&
                        <ScrollArea className="h-50">
                                {results.map((result) => (
                                    <button
                                        key={result.place_id}
                                        type="button"
                                        onClick={() => handle_result_click(result)}
                                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm transition-colors cursor-pointer"
                                    >
                                        {result.display_name}
                                    </button>
                                ))}
                        </ScrollArea>
                        }
                </PopoverContent>
            </Popover>
        </div>
    )
}
