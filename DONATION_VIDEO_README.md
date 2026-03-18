# Donation Video Implementation

This implementation provides a comprehensive donation system using the `donation.mp4` video from the public folder.

## Components Created

### 1. API Route (`/api/cards/route.ts`)
- Returns donation video as default card data
- Supports different resolutions and types
- Fallback to donation.mp4 when no database cards exist

### 2. Enhanced Donation Card (`donation-card.tsx`)
- Floating donation button with video modal
- Video controls (play/pause, mute/unmute)
- Auto-play functionality
- Responsive design

### 3. Hero Banner (`donation-hero-banner.tsx`)
- Full-width banner with video and content
- Dismissible with close button
- Call-to-action buttons
- Gradient background

### 4. Bottom Navigation (`donation-bottom-nav.tsx`)
- Compact video preview in bottom bar
- Expandable for more details
- Sticky positioning
- Mobile-optimized

### 5. Video Section (`donation-video-section.tsx`)
- Reusable section component
- Side-by-side video and content layout
- Customizable props
- Impact messaging

### 6. Custom Hook (`use-donation-video.ts`)
- Centralized video state management
- Video control functions
- Event handlers
- Reusable across components

### 7. Donation Page (`/donate/page.tsx`)
- Dedicated donation landing page
- Impact showcase
- Donation tier options
- Video integration

## Features

- **Multi-format Support**: Handles MP4, WebM, OGG videos
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Video Controls**: Play/pause, mute/unmute, seek
- **Auto-play**: Configurable auto-play functionality
- **Fallback Content**: Default video when no API data
- **Performance**: Optimized loading and playback
- **Accessibility**: ARIA labels and keyboard support

## Usage

### Homepage Integration
The homepage now includes:
- Hero banner at the top
- Video section in the middle
- Bottom navigation bar
- Floating donation button (via CardProvider)

### Custom Implementation
```tsx
import { DonationVideoSection } from '@/components/cards';

<DonationVideoSection 
  autoPlay={true}
  title="Custom Title"
  description="Custom description"
  buttonText="Custom Button"
  donationUrl="https://custom-url.com"
/>
```

### Using the Hook
```tsx
import { useDonationVideo } from '@/hooks/use-donation-video';

const { isPlaying, togglePlay, videoProps } = useDonationVideo({
  autoPlay: true,
  autoMute: false
});

<video {...videoProps} className="w-full h-full" />
```

## File Structure
```
src/
├── app/
│   ├── api/cards/route.ts
│   ├── donate/page.tsx
│   └── page.tsx (updated)
├── components/cards/
│   ├── donation-card.tsx (updated)
│   ├── donation-hero-banner.tsx
│   ├── donation-bottom-nav.tsx
│   ├── donation-video-section.tsx
│   ├── card-provider.tsx (updated)
│   └── index.ts
└── hooks/
    └── use-donation-video.ts
```

## Video File
- Location: `public/donation.mp4`
- Accessible at: `/donation.mp4`
- Used across all donation components

## Customization

### Donation URL
Update the donation URL in components:
```tsx
const donationUrl = "https://your-donation-platform.com";
```

### Video Source
To use a different video, update the hook:
```tsx
const videoProps = {
  src: '/your-video.mp4', // Change this
  // ... other props
};
```

### Styling
All components use Tailwind CSS and shadcn/ui components for consistent styling.

## Performance Considerations

- Videos are loaded on-demand
- Auto-play is muted by default for browser compliance
- Responsive video loading based on screen size
- Optimized for mobile devices

## Browser Support

- Modern browsers with HTML5 video support
- Fallback handling for unsupported formats
- Mobile-optimized playback controls