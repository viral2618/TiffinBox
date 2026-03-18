import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolution = searchParams.get('resolution') as 'mobile' | 'tablet' | 'desktop';
    const type = searchParams.get('type') as 'popup' | 'bottom_nav' | 'card';

    // Return default donation video card
    const defaultCard = {
      id: 'default-donation',
      buttonText: 'Support WhenFresh',
      buttonUrl: 'https://donate.whenfresh.com',
      visible: true,
      images: [{
        id: 'default-video',
        resolution: resolution || 'mobile',
        url: '/donation.mp4',
        aspectRatio: '16:9',
        type: type || 'card'
      }]
    };

    return NextResponse.json({ 
      status: 200, 
      message: "Default donation card returned", 
      cards: [defaultCard]
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ 
      status: 500, 
      message: "Failed to fetch cards" 
    }, { status: 500 });
  }
}