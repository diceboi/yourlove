import Image from "next/image"
import Link from "next/link"

export default function HeroBlockPublic({ config }) {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
      {config.image && (
        <Image
          src={config.image}
          alt={config.imageAlt || config.title || ''}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
        <div className="max-w-7xl mx-auto">
          {config.title && (
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              {config.title}
            </h1>
          )}
          {config.text && (
            <p className="text-white/90 text-lg md:text-xl mb-6 max-w-2xl drop-shadow">
              {config.text}
            </p>
          )}
          {config.ctaText && config.ctaLink && (
            <Link
              href={config.ctaLink}
              className="inline-block px-8 py-3 bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white rounded-lg font-medium transition-colors"
            >
              {config.ctaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
