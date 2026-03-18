import Image from "next/image"

interface PromoCardProps {
  discount: string
  title: string
  imageUrl?: string
  onClick?: () => void
  className?: string
}

export default function PromoCard({
  discount,
  title,
  imageUrl,
  onClick,
  className = ""
}: PromoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-200 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer ${className}`}
    >
      <div className="flex items-center justify-between p-8 h-48">
        {/* Content */}
        <div className="flex-1">
          <p className="text-4xl font-bold text-primary mb-2">{discount} <span className="text-gray-700">Sale Off</span></p>
          <h3 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{title}</h3>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            SHOP NOW
          </button>
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="w-40 h-32 relative ml-8 flex-shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="160px"
            />
          </div>
        )}
      </div>
    </div>
  )
}