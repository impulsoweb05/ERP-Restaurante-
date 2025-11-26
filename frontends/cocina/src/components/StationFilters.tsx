'use client';

import type { KitchenStation, StationInfo } from '@/types';

interface StationFiltersProps {
  stations: StationInfo[];
  selectedStation: KitchenStation | 'all';
  onSelectStation: (station: KitchenStation | 'all') => void;
}

export default function StationFilters({
  stations,
  selectedStation,
  onSelectStation,
}: StationFiltersProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-gray-800/50 border-b border-gray-700 overflow-x-auto">
      {/* All stations button */}
      <button
        onClick={() => onSelectStation('all')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
          selectedStation === 'all'
            ? 'bg-primary-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        <span>🍽️</span>
        <span>Todas</span>
      </button>

      {/* Station buttons */}
      {stations.map((station) => (
        <button
          key={station.id}
          onClick={() => onSelectStation(station.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            selectedStation === station.id
              ? 'text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          style={{
            backgroundColor:
              selectedStation === station.id ? station.color : undefined,
          }}
        >
          <span>{station.icon}</span>
          <span>{station.name}</span>
        </button>
      ))}
    </div>
  );
}
