import Image from "next/image"

export default function HeroBlockPreview({ config }) {
  return (
    <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden">
      {config.image ? (
        <Image
          src={config.image}
          alt={config.imageAlt || ''}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Nincs kép kiválasztva
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-white text-3xl font-bold mb-2">
          {config.title || 'Főcím'}
        </h2>
        <p className="text-white/90 mb-4">
          {config.text || 'Szöveg'}
        </p>
        {config.ctaText && (
          <button className="px-6 py-2 bg-[var(--pink)] text-white rounded-lg">
            {config.ctaText}
          </button>
        )}
      </div>
    </div>
  )
}
