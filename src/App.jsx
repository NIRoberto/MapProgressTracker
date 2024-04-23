import { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { get, useForm } from "react-hook-form";
import useInterval from "use-interval";

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);

  const updateRouteHelper = async (currentLocation, destination) => {
    if (isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: currentLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      setDirectionResponse(result);

      if (directionResponse) {
        setDistance(result.routes[0].legs[0].distance.text);
        setDuration(result.routes[0].legs[0].duration.text);
      } else {
        console.log("No direction response");
      }
    } else {
      alert("Google Maps not loaded enabled or location  permission denied");
    }
  };

  const handleRoute = async (data) => {
    const destination = data.destination;
    localStorage.setItem("destination", destination);
    updateRouteHelper(currentLocation, destination);
  };

  const [notLocationEnabledNiceMessage, setNotLocationEnabledNiceMessage] =
    useState("");

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setNotLocationEnabledNiceMessage(
              "Location permission denied. Please enable location permission to use this app"
            );
          }
        }
      );
    }
  };

  const center = {
    lat: 6.5244,
    lng: 3.3792,
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useInterval(() => {
    getCurrentLocation();
    if (localStorage.getItem("destination")) {
      updateRouteHelper(currentLocation, localStorage.getItem("destination"));
    }
  }, 10000);

  return (
    <main className="flex justify-center items-center flex-col">
      {notLocationEnabledNiceMessage && (
        <div className="bg-red-500 text-white p-2 rounded-md m-4 fixed top-0 left-0  text-center">
          {notLocationEnabledNiceMessage}
        </div>
      )}
      <header className="text-center py-8 m-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Real-Time Route Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track your route in real-time with interactive maps
          </p>
        </div>
        {isLoaded && (
          <form
            className="flex flex-col md:flex-row items-center justify-center mt-8"
            onSubmit={handleSubmit(handleRoute)}
          >
            <Autocomplete>
              <div className="flex flex-col">
                <input
                  type="text"
                  className="border-2 p-2 rounded-md border-gray-300 mb-4 md:mb-0 md:mr-4"
                  placeholder="Enter Destination"
                  {...register("destination", { required: "This is required" })}
                />
                <span>
                  {errors.destination && (
                    <p className="text-red-500 text-sm">
                      {errors.destination.message}
                    </p>
                  )}
                </span>
              </div>
            </Autocomplete>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-800 text-white p-2 rounded-md mr-4"
              >
                Search
              </button>
              <button
                type="reset"
                onClick={() => {
                  setDirectionResponse(null);
                  setDistance(null);
                  setDuration(null);
                  localStorage.removeItem("destination");
                }}
                className="bg-red-500 text-white p-2 rounded-md"
              >
                Reset
              </button>
            </div>
          </form>
        )}

        {isLoaded && (
          <div className="flex justify-between items-end mt-8">
            <div className="flex gap-4 p-2 rounded-md">
              <p className="bg-blue-100 p-4 rounded-md">Distance: {distance}</p>
              <p className="bg-blue-100 p-4 rounded-md">Duration: {duration}</p>
            </div>
          </div>
        )}
      </header>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{
            height: "100vh",
            width: "80%",
          }}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          center={center}
          zoom={15}
          onLoad={(map) => {
            setMap(map);
          }}
        >
          <Marker position={center} />

          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/kml/paddle/ylw-blank.png",
                scaledSize: new window.google.maps.Size(64, 64),
              }}
            />
          )}
          {directionResponse && (
            <DirectionsRenderer directions={directionResponse} />
          )}
        </GoogleMap>
      ) : (
        <div className="animate-pulse flex justify-center items-center h-screen">
          <div className="bg-gray-200 rounded-full h-12 w-12 mr-2"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
