import { PrismaClient } from '@prisma/client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | WhenFresh',
  description: 'Learn about WhenFresh, our mission, and how we connect food lovers with the freshest dishes.',
};

// Rich text renderer component
function RichTextContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none" 
         dangerouslySetInnerHTML={{ __html: content }} />
  );
}

async function getAboutContent() {
  const prisma = new PrismaClient();
  
  try {
    const about = await prisma.about.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    return about;
  } catch (error) {
    console.error('Error fetching about content:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function AboutPage() {
  const about = await getAboutContent();
  
  if (!about) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        <p>Information about WhenFresh is currently unavailable. Please check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <RichTextContent content={about.content} />
    </div>
  );
}