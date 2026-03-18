import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';
import { HelpCircle, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | WhenFresh',
  description: 'Find answers to common questions about using WhenFresh.',
};

function RichTextContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-700" 
         dangerouslySetInnerHTML={{ __html: content }} />
  );
}

function FaqCategory({ 
  name, 
  description, 
  faqs,
  icon 
}: { 
  name: string; 
  description?: string | null; 
  faqs: any[];
  icon?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.id} className="group bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-all">
            <summary className="flex justify-between items-center cursor-pointer px-6 py-4 list-none">
              <span className="text-base font-semibold text-gray-900 pr-4">{faq.question}</span>
              <span className="transition-transform group-open:rotate-180 flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-4 pt-2 border-t border-gray-100">
              <RichTextContent content={faq.answer} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

async function getFaqCategories() {
  const prisma = new PrismaClient();
  
  try {
    const categories = await prisma.faqCategory.findMany({
      where: { isActive: true },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

const categoryIcons: Record<string, string> = {
  'General': '🌟',
  'Orders': '🛒',
  'Payment': '💳',
  'Delivery': '🚚',
  'Account': '👤',
  'Technical': '⚙️',
  'Safety': '🛡️'
};

const mockFaqData = [
  {
    id: 1,
    name: 'General',
    description: 'Learn about WhenFresh basics',
    order: 1,
    faqs: [
      { id: 1, question: 'What is WhenFresh?', answer: '<p>WhenFresh is a fresh food delivery service that connects you with local farmers and suppliers to bring the freshest produce directly to your door.</p>' },
      { id: 2, question: 'How does WhenFresh work?', answer: '<p>Simply browse our selection, add items to your cart, and choose a delivery time. We source fresh products and deliver them to your doorstep.</p>' },
      { id: 3, question: 'What areas do you serve?', answer: '<p>We currently serve major metropolitan areas. Enter your zip code at checkout to see if we deliver to your location.</p>' }
    ]
  },
  {
    id: 2,
    name: 'Orders',
    description: 'Everything about placing and managing orders',
    order: 2,
    faqs: [
      { id: 4, question: 'How do I place an order?', answer: '<p>Browse our products, add items to your cart, and proceed to checkout. You\'ll need to create an account or sign in to complete your order.</p>' },
      { id: 5, question: 'Can I modify my order after placing it?', answer: '<p>You can modify your order up to 2 hours before the scheduled delivery time. Go to your order history and select "Edit Order".</p>' },
      { id: 6, question: 'What is the minimum order amount?', answer: '<p>Our minimum order amount is $25 to ensure efficient delivery and maintain product freshness.</p>' }
    ]
  },
  {
    id: 3,
    name: 'Delivery',
    description: 'Delivery times, fees, and tracking',
    order: 3,
    faqs: [
      { id: 7, question: 'What are your delivery hours?', answer: '<p>We deliver Monday through Saturday, 8 AM to 8 PM. Sunday delivery is available in select areas.</p>' },
      { id: 8, question: 'How much does delivery cost?', answer: '<p>Delivery is $4.99 for orders over $50, and $7.99 for orders under $50. Free delivery on orders over $100.</p>' },
      { id: 9, question: 'Can I track my delivery?', answer: '<p>Yes! Once your order is out for delivery, you\'ll receive a tracking link via SMS and email to monitor your delivery in real-time.</p>' }
    ]
  },
  {
    id: 4,
    name: 'Payment',
    description: 'Payment methods and billing',
    order: 4,
    faqs: [
      { id: 10, question: 'What payment methods do you accept?', answer: '<p>We accept all major credit cards, debit cards, PayPal, and digital wallets like Apple Pay and Google Pay.</p>' },
      { id: 11, question: 'Is my payment information secure?', answer: '<p>Absolutely. We use industry-standard encryption and never store your full payment details on our servers.</p>' }
    ]
  }
];

export default async function FaqsPage() {
  const categories = await getFaqCategories();
  const displayCategories = categories.length > 0 ? categories : mockFaqData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 text-lg">Find answers to common questions about WhenFresh</p>
        </div>
        
        {categories.map((category) => (
          <FaqCategory
            key={category.id}
            name={category.name}
            description={category.description}
            faqs={category.faqs}
            icon={categoryIcons[category.name]}
          />
        ))}

        <div className="mt-12 bg-orange-100 border border-orange-200 rounded-xl p-6 text-center">
          <p className="text-gray-800 font-medium mb-2">Still have questions?</p>
          <p className="text-gray-600 text-sm">Contact our support team for personalized assistance</p>
        </div>
      </div>
    </div>
  );
}