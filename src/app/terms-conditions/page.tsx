import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | WhenFresh',
  description: 'Read the terms and conditions for using the WhenFresh platform.',
};

// Rich text renderer component
function RichTextContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none" 
         dangerouslySetInnerHTML={{ __html: content }} />
  );
}

async function getTermsConditions() {
  const prisma = new PrismaClient();
  
  try {
    const terms = await prisma.termsConditions.findFirst({
      where: { isActive: true },
      orderBy: { effectiveDate: 'desc' }
    });
    
    return terms;
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function TermsConditionsPage() {
  const terms = await getTermsConditions();
  
  if (!terms) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <p>Our terms and conditions are currently being updated. Please check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{terms.title}</h1>
        <p className="text-sm text-gray-500 mt-2">
          Version {terms.version} • Effective: {new Date(terms.effectiveDate).toLocaleDateString()}
        </p>
      </div>
      
      <RichTextContent content={terms.content} />
    </div>
  );
}