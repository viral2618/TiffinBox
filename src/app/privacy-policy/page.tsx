import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | WhenFresh',
  description: 'Learn about how WhenFresh collects, uses, and protects your personal information.',
};

// Rich text renderer component
function RichTextContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none" 
         dangerouslySetInnerHTML={{ __html: content }} />
  );
}

async function getPrivacyPolicy() {
  const prisma = new PrismaClient();
  
  try {
    const policy = await prisma.privacyPolicy.findFirst({
      where: { isActive: true },
      orderBy: { effectiveDate: 'desc' }
    });
    
    return policy;
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();
  
  if (!policy) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p>Our privacy policy is currently being updated. Please check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{policy.title}</h1>
        <p className="text-sm text-gray-500 mt-2">
          Version {policy.version} • Effective: {new Date(policy.effectiveDate).toLocaleDateString()}
        </p>
      </div>
      
      <RichTextContent content={policy.content} />
    </div>
  );
}