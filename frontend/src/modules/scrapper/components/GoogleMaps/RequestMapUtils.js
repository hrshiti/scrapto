import { useLoadScript } from '@react-google-maps/api';

const LIBRARIES = ['places', 'geometry'];

export const useGoogleMaps = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
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
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};
