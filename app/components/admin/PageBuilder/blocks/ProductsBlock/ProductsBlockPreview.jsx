export default function ProductsBlockPreview({ config }) {
  return (
    <div className="p-6 bg-gray-50 rounded border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[var(--pink)] rounded flex items-center justify-center text-white font-bold">
          🛍️
        </div>
        <div>
          <h3 className="font-bold">{config.title || 'Termékek'}</h3>
          <p className="text-sm text-gray-600">
            {config.categoryPaths?.length || 0} kategória, {config.tagIds?.length || 0} címke
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[...Array(Math.min(config.limit || 8, 8))].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}
