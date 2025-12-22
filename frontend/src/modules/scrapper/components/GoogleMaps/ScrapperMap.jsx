import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps, mapContainerStyle, defaultCenter, mapOptions } from './RequestMapUtils';
import { useState, useEffect, useCallback } from 'react';

const ScrapperMap = ({
    userLocation,
    scrapperLocation,
    stage, // 'request' | 'pickup' | 'arrived'
    userName
}) => {
    const { isLoaded, loadError } = useGoogleMaps();
    const [directions, setDirections] = useState(null);
    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Calculate Route when in pickup stage
    useEffect(() => {
        if (stage === 'pickup' && isLoaded && scrapperLocation && userLocation) {
            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: scrapperLocation,
                    destination: userLocation,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error(`Error fetching directions ${result}`);
                    }
                }
            );
        }
    }, [stage, isLoaded, scrapperLocation, userLocation]);

    // Adjust bounds to fit markers
    useEffect(() => {
        if (map && isLoaded) {
            const bounds = new window.google.maps.LatLngBounds();

            if (userLocation) {
                bounds.extend(userLocation);
            }

            if (scrapperLocation) {
                bounds.extend(scrapperLocation);
            }

            // Only fit bounds if we have at least one valid location
            if (userLocation || scrapperLocation) {
                map.fitBounds(bounds);
            }
        }
    }, [map, isLoaded, userLocation, scrapperLocation]);

    if (loadError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-red-500">Error loading map</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-gray-500">Loading Map...</p>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={userLocation || scrapperLocation || defaultCenter}
            options={mapOptions}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {/* Request Stage: Show User Marker only (or Scrapper too if we want relative position) */}
            {stage === 'request' && userLocation && (
                <Marker
                    position={userLocation}
                    title={userName || "User"}
                // You can add custom icon here
                // icon={{ url: '...' }}
                />
            )}

            {/* Pickup Stage: Show both + Route */}
            {stage === 'pickup' && (
                <>
                    {/* Scrapper Marker */}
                    {scrapperLocation && (
                        <Marker
                            position={scrapperLocation}
                            title="You"
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 7,
                                fillColor: "#10b981",
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: "white",
                            }}
                        />
                    )}

                    {/* User Marker */}
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            title={userName || "User"}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 7,
                                fillColor: "#ef4444",
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: "white",
                            }}
                        />
                    )}

                    {/* Route Line */}
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{
                                suppressMarkers: true, // We use our own markers
                                polylineOptions: {
                                    strokeColor: "#64946e",
                                    strokeOpacity: 0.8,
                                    strokeWeight: 6,
                                },
                            }}
                        />
                    )}
                </>
            )}
        </GoogleMap>
    );
};

export default ScrapperMap;
