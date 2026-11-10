import React from 'react';
import { Property } from '../types';
import { X, Trash2, Check, ExternalLink, Calendar, MapPin, Building2 } from 'lucide-react';

interface PropertyCompareModalProps {
  properties: Property[];
  onClose: () => void;
  onRemove: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
  onBookViewing: (property: Property) => void;
}

export const PropertyCompareModal: React.FC<PropertyCompareModalProps> = ({
  properties,
  onClose,
  onRemove,
  onSelectProperty,
  onBookViewing,
}) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-[#FAF4E8]">
              Property Comparison Matrix
            </h3>
            <p className="text-xs text-[#FAF4E8]/60">
              Comparing {properties.length} selected holdings side-by-side
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#FAF4E8]/60 hover:text-white rounded-lg hover:bg-[#0D2638]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table / Grid */}
        <div className="overflow-x-auto p-6 flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E486A]/50">
                <th className="py-3 px-4 font-semibold text-[#C5A880] w-1/4">Metric / Parameter</th>
                {properties.map((p) => (
                  <th key={p.id} className="py-3 px-4 text-left w-1/3 min-w-[220px]">
                    <div className="relative">
                      <button
                        onClick={() => onRemove(p.id)}
                        className="absolute -top-1 -right-1 p-1 text-[#FAF4E8]/50 hover:text-red-400"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={p.featuredImage}
                        alt={p.title}
                        className="w-full h-28 object-cover rounded-lg mb-2 border border-[#1E486A]/40"
                      />
                      <h4 className="font-display font-bold text-sm text-[#FAF4E8] line-clamp-1">{p.title}</h4>
                      <div className="text-xs font-semibold text-[#38bdf8] mt-0.5">Price on Request</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E486A]/30">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Corridor / Location</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-[#FAF4E8]/90 font-medium">
                    {p.corridor}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Category & Purpose</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-[#FAF4E8]/90">
                    {p.type} · {p.purpose}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Land Size / Dimensions</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-data text-[#FAF4E8]">
                    {p.landSize}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Rooms / Capacity</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-[#FAF4E8]/90 font-data">
                    {p.bedrooms ? `${p.bedrooms} Bedrooms` : p.units ? `${p.units} Tenancy Suites` : 'Open Parcel'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Title Instrument</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 text-[#25D366] font-medium">
                    {p.titleType}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Survey Beacon ID</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-data text-xs text-[#C5A880]">
                    {p.beaconCoordinates}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Annual Rental Yield</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4 font-data font-semibold text-[#25D366]">
                    {p.rentalYieldPercent ? `${p.rentalYieldPercent}% / year` : 'Capital Appreciation'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-[#FAF4E8]/80">Actions</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProperty(p);
                        }}
                        className="py-1.5 px-2.5 text-xs font-semibold text-[#FAF4E8] bg-[#0D2638] hover:bg-[#112E43] rounded-lg border border-[#1E486A] text-center"
                      >
                        View Full Dossier
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onBookViewing(p);
                        }}
                        className="py-1.5 px-2.5 text-xs font-semibold text-white bg-[#8B6347] hover:bg-[#9E7353] rounded-lg text-center"
                      >
                        Book Inspection
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
