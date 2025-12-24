import { useLoadScript } from '@react-google-maps/api';

// Include additional libraries for 3D features and advanced functionality
const LIBRARIES = ['places', 'geometry', 'drawing', 'visualization'];

export const useGoogleMaps = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
        // Enable 3D features
        version: 'weekly',
    });

    return { isLoaded, loadError };
};

// Map default styles and config
export const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

export const defaultCenter = {
    lat: 19.0760, // Mumbai
    lng: 72.8777,
};

export const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    clickableIcons: false,
    // Custom Scrapto green theme
    styles: [
        {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
        },
        {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }]
        },
        {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#f5f5f5" }]
        },
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#d1fae5" }] // Light green for parks
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#64946e" }] // Project green
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#dadada" }]
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }]
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9e9f6" }] // Light blue
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }]
        }
    ],
};
