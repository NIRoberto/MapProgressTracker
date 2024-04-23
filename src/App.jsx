import { useEffect, useLayoutEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useForm } from "react-hook-form";

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const handleRoute = async (data) => {
    if (isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: data.origin,
        destination: data.destination,
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
      alert("Google Maps not loaded");
    }
  };

  const center = {
    lat: 6.5244,
    lng: 3.3792,
  };

  useLayoutEffect(() => {
    if (!isLoaded) {
      return;
    }
  }, [isLoaded]);

  useEffect(() => {}, [directionResponse, map]);

  return (
    <main className="flex justify-center items-center flex-col">
      <header className="text-center py-8">
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
              <div className="flex-col flex">
                <input
                  type="text"
                  className="border-2 p-2 rounded-md border-gray-300 mb-4 md:mb-0 md:mr-4"
                  placeholder="Enter Origin"
                  {...register("origin", { required: "This is required" })}
                />
                <span>
                  {errors.origin && (
                    <p className="text-red-500 text-sm">
                      {errors.origin.message}
                    </p>
                  )}
                </span>
              </div>
            </Autocomplete>

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
            width: "70%",
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
