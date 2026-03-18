import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';

interface ShopPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the shop page
export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const prisma = new PrismaClient();
    const shop = await prisma.shop.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        bannerImage: true,
        address: true,
        shopTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    if (!shop) {
      return {
        title: 'Shop Not Found',
        description: 'The requested shop could not be found.'
      };
    }
    
    // Extract tags for keywords
    const keywords = shop.shopTags.map(shopTag => shopTag.tag.name).join(', ');
    
    return {
      title: shop.name,
      description: shop.description || `Explore ${shop.name} menu and dishes`,
      keywords: keywords,
      openGraph: {
        title: shop.name,
        description: shop.description || `Explore ${shop.name} menu and dishes`,
        images: shop.bannerImage ? [shop.bannerImage] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: shop.name,
        description: shop.description || `Explore ${shop.name} menu and dishes`,
        images: shop.bannerImage ? [shop.bannerImage] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Shop',
      description: 'Explore shop details and menu'
    };
  }
}

export default function ShopLayout({ children, params }: LayoutProps) {
  return <>{children}</>;
}