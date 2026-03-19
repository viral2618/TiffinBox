"use client"

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocation } from '@/hooks/use-location';
import SearchInput from '@/components/search/SearchInput';
import { buildSearchParams, parseSearchParams } from '@/lib/utils/url-params';
import type { SearchResult } from '@/types/search';

export default function ClientDishSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = parseSearchParams(searchParams);
  const { location } = useLocation();
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);

  const geocodeLocation = async (locationName: string) => {
    try {
      setIsGeocodingLocation(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
        {
          headers: {
            'User-Agent': 'WhenFresh/1.0'
          }
        }
      );
      
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: {
            formattedAddress: data[0].display_name
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    const updatedParams = { 
      ...currentParams, 
      search: result.title.replace(/<[^>]*>/g, ''),
      page: undefined,
      ...(location && {
        lat: location.lat.toString(),
        lng: location.lng.toString()
      })
    };
    
    const searchParamsObj = buildSearchParams(updatedParams);
    const newURL = `/dishes?${searchParamsObj.toString()}`;
    router.push(newURL);
  };

  const handleClear = () => {
    const updatedParams = { ...currentParams };
    delete updatedParams.search;
    updatedParams.page = undefined;
    
    const searchParamsObj = buildSearchParams(updatedParams);
    const newURL = `/dishes?${searchParamsObj.toString()}`;
    router.push(newURL);
  };

  const handleInputChange = (value: string) => {
    if (value.trim().length === 0 && currentParams.search) {
      handleClear();
    }
  };

  const handleSearchSubmit = async (query: string) => {
    let searchLocation = location;
    let finalQuery = query;
    
    // Enhanced location detection
    const locationKeywords = [
      'goa', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad', 
      'ahmedabad', 'jaipur', 'surat', 'kanpur', 'nagpur', 'lucknow', 'indore', 'thane',
      'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ghaziabad', 'ludhiana',
      'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi',
      'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad',
      'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada', 'jodhpur',
      'madurai', 'raipur', 'kota', 'chandigarh', 'guwahati', 'solapur', 'hubli',
      'tiruchirappalli', 'bareilly', 'mysore', 'tiruppur', 'gurgaon', 'aligarh',
      'jalandhar', 'bhubaneswar', 'salem', 'warangal', 'guntur', 'bhiwandi', 'saharanpur',
      'gorakhpur', 'bikaner', 'amravati', 'noida', 'jamshedpur', 'bhilai', 'cuttack',
      'firozabad', 'kochi', 'nellore', 'bhavnagar', 'dehradun', 'durgapur', 'asansol',
      'rourkela', 'nanded', 'kolhapur', 'ajmer', 'akola', 'gulbarga', 'jamnagar',
      'ujjain', 'loni', 'siliguri', 'jhansi', 'ulhasnagar', 'jammu', 'sangli',
      'mangalore', 'erode', 'belgaum', 'ambattur', 'tirunelveli', 'malegaon', 'gaya',
      'jalgaon', 'udaipur', 'maheshtala', 'davanagere', 'kozhikode', 'kurnool',
      'rajpur sonarpur', 'rajahmundry', 'bokaro', 'south dumdum', 'bellary',
      'patiala', 'gopalpur', 'agartala', 'bhagalpur', 'muzaffarnagar', 'bhatpara',
      'panihati', 'latur', 'dhule', 'rohtak', 'korba', 'bhilwara', 'berhampur',
      'muzaffarpur', 'ahmednagar', 'mathura', 'kollam', 'avadi', 'kadapa',
      'kamarhati', 'sambalpur', 'bilaspur', 'shahjahanpur', 'satara', 'bijapur',
      'rampur', 'shivamogga', 'chandrapur', 'junagadh', 'thrissur', 'alwar',
      'bardhaman', 'kulti', 'kakinada', 'nizamabad', 'parbhani', 'tumkur',
      'khammam', 'ozhukarai', 'bihar sharif', 'panipat', 'darbhanga', 'bally',
      'aizawl', 'dewas', 'ichalkaranji', 'karnal', 'bathinda', 'jalna', 'eluru',
      'kirari suleman nagar', 'barabanki', 'purnia', 'satna', 'mau', 'sonipat',
      'farrukhabad', 'sagar', 'rourkela', 'durg', 'imphal', 'ratlam', 'hapur',
      'arrah', 'anantapur', 'karimnagar', 'etawah', 'ambarnath', 'north dumdum',
      'bharatpur', 'begusarai', 'new delhi', 'gandhinagar', 'baranagar', 'tiruvottiyur',
      'pondicherry', 'sikar', 'thoothukudi', 'rewa', 'mirzapur', 'raichur',
      'pali', 'ramagundam', 'silchar', 'orai', 'nandyal', 'morena', 'bhiwani',
      'sambalpur', 'bellary', 'hospet', 'naihati', 'firozabad', 'chhapra',
      'malda', 'dibrugarh', 'deoghar', 'kharagpur', 'surendranagar dudhrej',
      'hugli', 'kaithal', 'guna', 'budaun', 'fatehpur', 'rae bareli', 'navsari',
      'mahbubnagar', 'port blair', 'ganganagar', 'bharuch', 'udupi', 'alappuzha',
      'muktsar', 'rajnandgaon', 'chittoor', 'bhusawal', 'karaikudi', 'hospet',
      'clarkabad', 'nabadwip', 'kishangarh', 'suryapet', 'wardha', 'ranebennuru',
      'amreli', 'neemuch', 'haldwani', 'mahesana', 'bamber bridge', 'yamunanagar',
      'sri ganganagar', 'moga', 'abohar', 'adilabad', 'jind', 'sangrur',
      'bharatpur', 'hisar', 'fatehabad', 'gonda', 'bhiwani', 'sirsa', 'karnal',
      'batala', 'hoshiarpur', 'fazilka', 'palwal', 'bahadurgarh', 'jind',
      'rohtak', 'kaithal', 'rewari', 'narnaul', 'city', 'state', 'india'
    ];
    
    const isLocationQuery = locationKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isLocationQuery && query.length > 2) {
      const geocodedLocation = await geocodeLocation(query); 
      if (geocodedLocation) {
        searchLocation = geocodedLocation;
        // Keep the original query for dish search within the location
        finalQuery = '';
      }
    }
    
    const updatedParams = { 
      ...currentParams, 
      ...(finalQuery && { search: finalQuery }),
      page: undefined,
      ...(searchLocation && {
        lat: searchLocation.lat.toString(),
        lng: searchLocation.lng.toString(),
        radius: isLocationQuery ? '50' : (currentParams.radius || '5')
      })
    };
    
    // Remove search param if it's empty (for pure location searches)
    if (!finalQuery) {
      delete updatedParams.search;
    }
    
    const searchParamsObj = buildSearchParams(updatedParams);
    const newURL = `/dishes?${searchParamsObj.toString()}`;
    router.push(newURL);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Enhanced Search Input */}
      <div className="relative">
        <SearchInput
          placeholder="Search dishes, bakeries..."
          onResultSelect={handleResultSelect}
          onSubmit={handleSearchSubmit}
          onClear={handleClear}
          onChange={handleInputChange}
          initialValue={currentParams.search}
          showDropdown={true}
          className="w-full"
        />
        
        {/* Search Enhancement Text */}
        <div className="text-center mt-3">
          {isGeocodingLocation ? (
            <p className="text-sm" style={{ color: '#fc7c7c' }}>
              🔍 Finding location...
            </p>
          ) : location ? (
            <p className="text-sm" style={{ color: '#92400e' }}>
              Searching within {currentParams.radius || 5}km of your location
            </p>
          ) : (
            <p className="text-sm" style={{ color: '#92400e' }}>
              Try searching for dishes or locations (e.g., "Goa", "Mumbai")
            </p>
          )}
        </div>
      </div>
    </div>
  );
}