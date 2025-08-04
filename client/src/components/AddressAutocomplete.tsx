import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Edit, Search } from "lucide-react";

interface AddressComponents {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  initialAddress?: AddressComponents;
  placeholder?: string;
  label?: string;
}

export function AddressAutocomplete({
  onAddressSelect,
  initialAddress,
  placeholder = "Start typing your address...",
  label = "Address"
}: AddressAutocompleteProps) {
  const [isManualMode, setIsManualMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState<AddressComponents>(
    initialAddress || {
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "South Africa"
    }
  );

  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Initialize Google Maps services
  useEffect(() => {
    if ((window as any).google?.maps?.places) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      placesService.current = new (window as any).google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  // Load Google Maps script if not already loaded
  useEffect(() => {
    if (!(window as any).google?.maps?.places && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.onload = () => {
        // Check if the API loaded successfully
        if ((window as any).google?.maps?.places) {
          autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
          const dummyDiv = document.createElement('div');
          placesService.current = new (window as any).google.maps.places.PlacesService(dummyDiv);
        }
      };
      script.onerror = () => {
        console.warn('Google Maps API failed to load, falling back to manual entry');
        setIsManualMode(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (!value.trim() || !autocompleteService.current) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'za' }, // Restrict to South Africa
        types: ['address']
      },
      (predictions: any, status: any) => {
        setIsLoading(false);
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions.slice(0, 5)); // Limit to 5 results
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const handlePlaceSelect = (placeId: string, description: string) => {
    if (!placesService.current) return;

    setIsLoading(true);
    placesService.current.getDetails(
      { placeId, fields: ['address_components', 'formatted_address', 'geometry'] },
      (place: any, status: any) => {
        setIsLoading(false);
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = extractAddressComponents(place.address_components || []);
          onAddressSelect(addressComponents);
          setSearchValue(description);
          setPredictions([]);
        }
      }
    );
  };

  const extractAddressComponents = (components: any[]): AddressComponents => {
    const result = {
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "South Africa"
    };

    for (const component of components) {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        result.address += (result.address ? ' ' : '') + component.long_name;
      }
      
      if (types.includes('locality') || types.includes('sublocality')) {
        result.city = component.long_name;
      }
      
      if (types.includes('administrative_area_level_1')) {
        result.province = component.long_name;
      }
      
      if (types.includes('postal_code')) {
        result.postalCode = component.long_name;
      }
      
      if (types.includes('country')) {
        result.country = component.long_name;
      }
    }

    return result;
  };

  const handleManualAddressChange = (field: keyof AddressComponents, value: string) => {
    const updated = { ...manualAddress, [field]: value };
    setManualAddress(updated);
    onAddressSelect(updated);
  };

  // Check if Google Maps is available
  const isGoogleMapsAvailable = !!(window as any).google?.maps?.places && !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (isManualMode || !isGoogleMapsAvailable) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">{label}</Label>
            {isGoogleMapsAvailable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsManualMode(false)}
                className="text-xs"
              >
                <Search className="w-3 h-3 mr-1" />
                Use Address Search
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="manual-address" className="text-sm">Street Address</Label>
              <Input
                id="manual-address"
                value={manualAddress.address}
                onChange={(e) => handleManualAddressChange('address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manual-city" className="text-sm">City</Label>
                <Input
                  id="manual-city"
                  value={manualAddress.city}
                  onChange={(e) => handleManualAddressChange('city', e.target.value)}
                  placeholder="Cape Town"
                />
              </div>
              <div>
                <Label htmlFor="manual-province" className="text-sm">Province</Label>
                <Input
                  id="manual-province"
                  value={manualAddress.province}
                  onChange={(e) => handleManualAddressChange('province', e.target.value)}
                  placeholder="Western Cape"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manual-postal" className="text-sm">Postal Code</Label>
                <Input
                  id="manual-postal"
                  value={manualAddress.postalCode}
                  onChange={(e) => handleManualAddressChange('postalCode', e.target.value)}
                  placeholder="8001"
                />
              </div>
              <div>
                <Label htmlFor="manual-country" className="text-sm">Country</Label>
                <Input
                  id="manual-country"
                  value={manualAddress.country}
                  onChange={(e) => handleManualAddressChange('country', e.target.value)}
                  placeholder="South Africa"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-medium">{label}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsManualMode(true)}
            className="text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Enter Manually
          </Button>
        </div>

        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              className="pl-10"
            />
          </div>

          {isLoading && (
            <div className="absolute top-12 left-0 right-0 p-2 bg-white border rounded-md shadow-lg z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-churpay-purple"></div>
                <span className="text-sm text-gray-600">Searching addresses...</span>
              </div>
            </div>
          )}

          {predictions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{prediction.structured_formatting.main_text}</div>
                      <div className="text-xs text-gray-600">{prediction.structured_formatting.secondary_text}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {searchValue && predictions.length === 0 && !isLoading && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              No addresses found. You can{" "}
              <button
                type="button"
                onClick={() => setIsManualMode(true)}
                className="underline hover:no-underline font-medium"
              >
                enter your address manually
              </button>
              .
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}