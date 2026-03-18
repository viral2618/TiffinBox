"use client"

import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#e6fffa', borderTop: '1.5px solid #99f6e4' }} className="mt-auto w-full">
      <div className="px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                <img src="/icons/icon-96x96.svg" alt="TiffinLane" className="w-full h-full" />
              </div>
              <h3 className="font-bold text-base md:text-lg" style={{ color: '#134e4a' }}>TiffinLane</h3>
            </div>
            <p className="text-xs md:text-sm break-words" style={{ color: '#0f766e' }}>
              Home-cooked meals by local cooks — made for students missing mom's food.
            </p>
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h4 className="font-semibold text-sm md:text-base mb-3" style={{ color: '#134e4a' }}>Quick Links</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="/shops" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>Home Kitchens</Link></li>
              <li><Link href="/dishes" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>Dishes</Link></li>
              <li><Link href="/categories" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>Categories</Link></li>
              <li><Link href="/favorites" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>Favorites</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="min-w-0">
            <h4 className="font-semibold text-sm md:text-base mb-3" style={{ color: '#134e4a' }}>Support</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href="/about" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>About</Link></li>
              <li><Link href="/faqs" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>FAQs</Link></li>
              <li><Link href="/privacy-policy" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="transition-colors" style={{ color: '#0f766e' }} onMouseOver={e => (e.currentTarget.style.color='#0d9488')} onMouseOut={e => (e.currentTarget.style.color='#0f766e')}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="min-w-0">
            <h4 className="font-semibold text-sm md:text-base mb-3" style={{ color: '#134e4a' }}>Contact</h4>
            <p className="text-xs md:text-sm break-words" style={{ color: '#0f766e' }}>
              Get in touch with us for any queries or support.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #99f6e4' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs md:text-sm" style={{ color: '#0f766e' }}>
            <p>&copy; 2026 TiffinLane. All rights reserved.</p>
            <a
              href="https://zeeshanali.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0f766e' }}
              onMouseOver={e => (e.currentTarget.style.color='#0d9488')}
              onMouseOut={e => (e.currentTarget.style.color='#0f766e')}
              className="transition-colors"
            >
              ZeeshanAli.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
