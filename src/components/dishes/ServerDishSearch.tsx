import { Suspense } from 'react';
import ClientDishSearch from './ClientDishSearch';

export default function ServerDishSearch() {
  return (
    <Suspense fallback={
      <div className="w-full h-12 bg-gray-100 rounded-lg animate-pulse" />
    }>
      <ClientDishSearch />
    </Suspense>
  );
}