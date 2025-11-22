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
    // Add other fields as needed from your geocoding API
}

interface LocationSearchBarProps {
    value: string
    onChange: (value: string) => void
    onChangeGeocode: (name: string, position: Coordinate, placeId?: string) => void
}

export function LocationSearchBar({
    value,
    onChange,
    onChangeGeocode: onLocationSelect,
}: LocationSearchBarProps) {
    const [results, setResults] = useState<GeocodingResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showResults, setShowResults] = useState(false)

    const handleSearch = async () => {
        if (!value.trim()) return

        setLoading(true)
        setError(null)
        setShowResults(false)

        try {
            // Using Nominatim (OpenStreetMap) as example - free and no API key needed
            // Rate limit: 1 request per second
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(value)}&format=json&limit=10`,
                {
                    headers: {
                        'User-Agent': 'YourAppName/1.0' // Required by Nominatim
                    }
                }
            )

            if (!response.ok) throw new Error('Geocoding request failed')

            const data: GeocodingResult[] = await response.json()
            setResults(data)
            setShowResults(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleResultClick = (result: GeocodingResult) => {
        onLocationSelect(
            result.display_name,
            { x: parseFloat(result.lat), y: parseFloat(result.lon) },
            result.place_id
        )
        setShowResults(false)
        setResults([])
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    return (
        <div className="relative">
            <Popover
                open={loading || Boolean(error) || (showResults && results.length > 0)}
            >
                <PopoverAnchor asChild>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter location name..."
                            />
                        </div>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                onClick={handleSearch}
                                disabled={loading || !value.trim()}
                                size="icon"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                    </div>
                    
                </PopoverAnchor>


                <PopoverContent align="start" className="z-99999">
                        {(loading || error || (showResults && results.length===0)) &&
                            <div className="mb-2 text-sm">
                                {loading && <span className="text-muted-foreground">Searching...</span>}
                                {error && <span className="text-red-600">Error: {error}</span>}
                                {showResults && results.length === 0 && !loading && <span className="text-muted-foreground">No Results Found</span>}
                            </div>
                        }
                        {showResults && results.length>0 &&
                        <ScrollArea className="h-50">
                                {results.map((result) => (
                                    <button
                                        key={result.place_id}
                                        type="button"
                                        onClick={() => handleResultClick(result)}
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