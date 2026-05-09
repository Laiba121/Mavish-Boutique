import { useState } from 'react';
import { Ruler, X } from 'lucide-react';
import { SIZE_CHARTS } from '../data/sizeCharts';

/**
 * SizeChart component
 * Usage: <SizeChart type={product.sizeChartType} />
 * If type is null/undefined, renders nothing.
 */
export default function SizeChart({ type }) {
  const [open, setOpen] = useState(false);

  const chart = SIZE_CHARTS[type];
  if (!chart) return null;

  // Build row values dynamically from whatever keys the row has (excluding 'label')
  const dataKeys = Object.keys(chart.rows[0]).filter(k => k !== 'label');

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-[#2b3a7a] hover:underline mt-1"
      >
        <Ruler size={14} />
        Size Chart
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{chart.title}</h2>
                {chart.note && (
                  <p className="text-xs text-gray-400 mt-0.5">{chart.note}</p>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#2b3a7a] text-white">
                    {chart.columns.map((col, i) => (
                      <th
                        key={i}
                        className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${i === 0 ? 'text-left rounded-tl-md' : 'text-center'} ${i === chart.columns.length - 1 ? 'rounded-tr-md' : ''}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                        {row.label}
                      </td>
                      {dataKeys.map((key, j) => (
                        <td key={j} className="px-4 py-2.5 text-center text-gray-600 whitespace-nowrap">
                          {row[key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How to measure tip */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-800 leading-relaxed">
                <strong>How to measure:</strong> Use a soft measuring tape. For chest/bust, measure around the fullest part. For waist, measure around the narrowest part. For hips, measure around the fullest part. All sizes are in inches.
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}