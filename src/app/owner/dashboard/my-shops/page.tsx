"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Phone } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchOwnerShops } from "@/redux/features/ownerShopsSlice";

export default function MyShopsPage() {
  const dispatch = useAppDispatch();
  const { shops, loading, error } = useAppSelector((state) => state.ownerShops);
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchOwnerShops());
  }, [dispatch]);

  const handleCreateShop = () => {
    router.push("/owner/dashboard/my-shops/create");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Shops</h1>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">You don't have any shops yet</h2>
          <p className="text-muted-foreground mb-6">Complete the onboarding process to create your shop</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              {shop.bannerImage ? (
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={shop.bannerImage}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">No banner image</p>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {shop.logoUrl ? (
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-background shadow-sm flex-shrink-0">
                      <img
                        src={shop.logoUrl}
                        alt={`${shop.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {shop.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg font-semibold truncate">{shop.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-muted-foreground truncate">{shop.address}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                {shop.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {shop.description}
                  </p>
                )}

                <div className="space-y-3">
                  {shop.openingHours && (
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                      <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Today's Hours</p>
                        <p className="text-sm font-medium">
                          {(() => {
                            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                            const today = dayNames[new Date().getDay()];
                            const todayHours = shop.openingHours ? shop.openingHours[today as keyof typeof shop.openingHours] : null;

                            if (!todayHours) return "Hours not set";
                            if (todayHours.isClosed) return "Closed today";

                            return `${todayHours.open.hour % 12 || 12}:${String(todayHours.open.minute).padStart(2, '0')} ${todayHours.open.hour >= 12 ? 'PM' : 'AM'} - ${todayHours.close.hour % 12 || 12}:${String(todayHours.close.minute).padStart(2, '0')} ${todayHours.close.hour >= 12 ? 'PM' : 'AM'}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  )}

                  {shop.contactPhone && (
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                      <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Contact</p>
                        <p className="text-sm font-medium">{shop.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {shop.shopTags && shop.shopTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {shop.shopTags.slice(0, 3).map((shopTag) => (
                      <Badge key={shopTag.tag.id} variant="secondary" className="text-xs">
                        {shopTag.tag.name}
                      </Badge>
                    ))}
                    {shop.shopTags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{shop.shopTags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0 pb-4 px-6">
                <div className="flex gap-2 w-full">
                  <Link href={`/owner/dashboard/my-shops/${shop.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/owner/dashboard/my-shops/${shop.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Shop
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}