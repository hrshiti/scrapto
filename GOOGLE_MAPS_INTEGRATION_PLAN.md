# Google Maps Integration Plan for Scrapper Module

## 1. Overview
This plan outlines the integration of Google Maps API to provide real-time location tracking and navigation for Scrappers. The goal is to allow scrappers to see the user's live location upon receiving a request and to have route navigation after accepting a request.

**Scope:**
- **User Side:** Broadcast live location when a request is active.
- **Backend:** Relay location data via Socket.io.
- **Scrapper Side:** Display Google Map with User Marker (Pre-Acceptance) and Navigation Route (Post-Acceptance).

---

## 2. Architecture & Data Flow

### Live Location Flow
1.  **User Device** retrieves GPS coordinates via `navigator.geolocation`.
2.  **User Frontend** emits `update_location` event via Socket.io with `{ orderId, latitude, longitude }`.
3.  **Backend** receives the event, verifies the user/order, and broadcasts it to the specific `order_room`.
4.  **Scrapper Frontend** (listening in `order_room`) receives the coordinates and updates the map marker.

### Static Data (Fallback)
- The `Order` model in MongoDB already stores `pickupAddress.coordinates` ({ lat, lng }). This will be used as the initial reference point before live updates are received.

---

## 3. Frontend Implementation (User Module)

*Goal: Broadcast user location.*

### New Component: `UserLocationBroadcaster`
- **Location:** `src/modules/user/components/`
- **Functionality:**
    - Mounts when an active request exists.
    - Uses `navigator.geolocation.watchPosition` to track changes.
    - Emits `location_update` to Socket.io.
    - **Optimization:** Throttle updates to every 5-10 seconds to save battery and bandwidth.

```javascript
// Pseudo-code concept
useEffect(() => {
  if (isRequestActive) {
    socket.emit('join_order', { orderId });
    const watchId = navigator.geolocation.watchPosition(
      (pos) => socket.emit('location_update', { 
         orderId, 
         lat: pos.coords.latitude, 
         lng: pos.coords.longitude 
      }), 
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }
}, [isRequestActive]);
```

---

## 4. Backend Implementation

*Goal: Relay location messages securely.*

### Database & Models
- **No Schema Changes Required.** Live location is transient and doesn't need to be stored in MongoDB permanently (except potentially the final pickup location for audit).

### Socket.io Service (`backend/services/socketService.js`)
- **New Events to Handle:**
    - `join_order`: key for both User and Scrapper to join a room specific to that order (`order_${orderId}`).
    - `location_update`: Receive from User, broadcast to `order_${orderId}`.

```javascript
// Pseudo-code for Socket Handler
socket.on('join_order', ({ orderId }) => {
  // Verify user is part of order (User or Assigned Scrapper)
  socket.join(`order_${orderId}`);
});

socket.on('location_update', ({ orderId, lat, lng }) => {
  // Broadcast to everyone in the room EXCEPT sender
  socket.to(`order_${orderId}`).emit('live_location_updated', { lat, lng });
});
```

---

## 5. Frontend Implementation (Scrapper Module)

*Goal: Display Map and Route.*

### Google Maps Setup
- **Library:** `@react-google-maps/api` (standard for React).
- **API Key:** Needs to be added to `.env` (`VITE_GOOGLE_MAPS_API_KEY`).

### Component 1: `RequestMapUtils.js` (Shared Utility)
- Helper functions to load the Google Maps script and handle marker icons.

### Component 2: `ScrapperMap` (Reusable Component)
- **Props:** `userLocation` (lat/lng), `scrapperLocation` (lat/lng), `stage` ('request' | 'pickup').
- **Logic:**
    - **Stage: Request Received**
        - Show Map centered on `userLocation`.
        - Marker: User Icon.
        - No Route line.
    - **Stage: Pickup / In-Progress**
        - Show Map fitting bounds of both locations.
        - Marker A: Scrapper (Current Device Location).
        - Marker B: User (Live Socket Location).
        - **DirectionService:** Draw route from Scrapper -> User.

### Integration Points
1.  **`ActiveRequestDetailsPage.jsx`**:
    - Embed `ScrapperMap`.
    - Subscribe to `live_location_updated` socket event.
    - Pass live coords to `ScrapperMap`.

---

## 6. Security & Best Practices

1.  **API Key Protection:**
    - Restrict Google Maps API Key usage to specific HTTP referrers (domains) in Google Cloud Console.
2.  **Socket Authorization:**
    - Ensure only the assigned scrapper can join the `order_room`.
    - Validate tokens on socket connection (already implemented).
3.  **Privacy:**
    - Only broadcast user location when the request is **Accepted** or **On the Way**.
    - Scrapper location is **NOT** broadcasted to the user (per requirements).

---

## 7. Future Scalability
- **Multiple Requests:** The `order_${orderId}` room strategy scales perfectly. Each order has its own isolated data stream.
- **Admin Tracking:** Admin can simply join any `order_${orderId}` room to view the live tracking on a dashboard.
