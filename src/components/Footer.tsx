import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto w-full">
      <div className="px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="col-span-2 md:col-span-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">When Fresh</h3>
            <p className="text-gray-600 text-xs md:text-sm break-words">
              Discover fresh baked goods from local bakeries in your area.
            </p>
          </div>
          
          <div className="min-w-0">
            <h4 className="font-medium text-sm md:text-base mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><Link href="/shops" className="text-gray-600 hover:text-primary">Bakeries</Link></li>
              <li><Link href="/dishes" className="text-gray-600 hover:text-primary">Dishes</Link></li>
              <li><Link href="/categories" className="text-gray-600 hover:text-primary">Categories</Link></li>
              <li><Link href="/favorites" className="text-gray-600 hover:text-primary">Favorites</Link></li>
            </ul>
          </div>
          
          <div className="min-w-0">
            <h4 className="font-medium text-sm md:text-base mb-3 md:mb-4">Support</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-primary">About</Link></li>
              <li><Link href="/faqs" className="text-gray-600 hover:text-primary">FAQs</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-600 hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-gray-600 hover:text-primary">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div className="min-w-0">
            <h4 className="font-medium text-sm md:text-base mb-3 md:mb-4">Contact</h4>
            <p className="text-gray-600 text-xs md:text-sm break-words">
              Get in touch with us for any queries or support.
            </p>
          </div>
        </div>
        
        <div className="border-t mt-6 md:mt-8 pt-6 md:pt-8 text-xs md:text-sm text-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-center md:text-left">&copy; 2026 When Fresh. All rights reserved.</p>
            <a href="https://zeeshanali.org" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
              ZeeshanAli.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}