"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Locate } from "lucide-react";

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  initialCoords?: { lat: number; lng: number };
}

export default function MapPicker({ isOpen, onClose, onSelect, initialCoords }: MapPickerProps) {
  const [coords, setCoords] = useState(initialCoords || { lat: 20, lng: 0 });
  const [loading, setLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState<string>("");
  const [initialLoad, setInitialLoad] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const fetchLocationInfo = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "WhenFresh/1.0",
          },
        }
      );
      const data = await response.json();
      const address = data.address || {};
      const parts = [];
      
      if (address.suburb || address.neighbourhood) {
        parts.push(address.suburb || address.neighbourhood);
      }
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      if (address.state) {
        parts.push(address.state);
      }
      if (address.country) {
        parts.push(address.country);
      }
      
      setLocationInfo(parts.join(", ") || "Location selected");
    } catch (error) {
      console.error("Error fetching location info:", error);
      setLocationInfo("Location selected");
    }
  };

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapRef.current) {
        // Get current location if no initial coords and first load
        if (!initialCoords && initialLoad && navigator.geolocation) {
          setLoading(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCoords(newCoords);
              setInitialLoad(false);
              setLoading(false);
            },
            () => {
              setInitialLoad(false);
              setLoading(false);
            }
          );
          return;
        }
        
        const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 13);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
        
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          setCoords({ lat: position.lat, lng: position.lng });
          fetchLocationInfo(position.lat, position.lng);
        });

        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCoords({ lat, lng });
          fetchLocationInfo(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        
        // Fetch initial location info
        fetchLocationInfo(coords.lat, coords.lng);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      mapInstanceRef.current.setView([coords.lat, coords.lng]);
      fetchLocationInfo(coords.lat, coords.lng);
    }
  }, [coords]);

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    }
  };

  const handleConfirm = () => {
    onSelect(coords.lat, coords.lng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Select Location on Map</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div ref={mapRef} className="flex-1 min-h-[500px]" />
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">{locationInfo || "Select a location on the map"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click on map or drag marker to select location
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentLocation}
              disabled={loading}
              className="gap-2 ml-4"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
              Current Location
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleConfirm} className="flex-1">
              Confirm Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
