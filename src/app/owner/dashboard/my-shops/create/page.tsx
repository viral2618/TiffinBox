import { redirect } from 'next/navigation';

export default function CreateShopPage() {
  // Redirect to onboarding page for shop creation
  redirect('/owner/onboarding');
}