import { TbStar, TbStarFilled, TbStarHalfFilled } from 'react-icons/tb'

/**
 * StarRating Component
 * Újrafelhasználható csillag értékelés komponens
 * 
 * @param {number} rating - Értékelés 0-5 között
 * @param {number} maxStars - Maximum csillagok száma (default: 5)
 * @param {boolean} interactive - Kattintható-e (default: false)
 * @param {function} onChange - Callback amikor változik az érték
 * @param {string} size - Méret: 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} showHalf - Fél csillag megjelenítés (default: true)
 */
export default function StarRating({
    rating = 0,
    maxStars = 5,
    interactive = false,
    onChange = null,
    size = 'md',
    showHalf = true,
    className = ''
}) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    }

    const iconSize = sizes[size] || sizes.md

    const handleStarClick = (starIndex) => {
        if (interactive && onChange) {
            onChange(starIndex + 1)
        }
    }

    const renderStar = (index) => {
        const starValue = index + 1
        const difference = rating - index

        let StarIcon
        let fillClass

        if (difference >= 1) {
            // Teljes csillag
            StarIcon = TbStarFilled
            fillClass = 'text-yellow-400'
        } else if (showHalf && difference >= 0.5) {
            // Fél csillag
            StarIcon = TbStarHalfFilled
            fillClass = 'text-yellow-400'
        } else {
            // Üres csillag
            StarIcon = TbStar
            fillClass = 'text-gray-300'
        }

        const starContent = (
            <StarIcon className="w-full h-full" />
        )

        const starClasses = `
          ${iconSize}
          ${fillClass}
          ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          focus:outline-none
        `

        // Use span for non-interactive to avoid nested buttons
        if (!interactive) {
            return (
                <span
                    key={index}
                    className={starClasses}
                    aria-label={`${starValue} csillag`}
                >
                    {starContent}
                </span>
            )
        }

        return (
            <button
                key={index}
                type="button"
                onClick={() => handleStarClick(index)}
                className={starClasses}
                aria-label={`${starValue} csillag`}
            >
                {starContent}
            </button>
        )
    }

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
            {!interactive && (
                <span className="ml-2 text-sm text-gray-600">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    )
}
