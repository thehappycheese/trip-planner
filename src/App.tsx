import 'leaflet/dist/leaflet.css';
import { ItemForm } from './components/ItemForm';
import { TimelineView } from './components/Timeline';

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Trip Timeline Builder</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <ItemForm />
                    <TimelineView />
                </div>
            </div>
        </div>
    )
}