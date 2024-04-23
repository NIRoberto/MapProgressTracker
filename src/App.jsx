// disable eslint for whole file

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

function App() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type google.maps.Maps */ (null));

  const [directionResponse, setDirectionResponse] = useState(null);

  const [distance, setDistance] = useState(null);

  const [duration, setDuration] = useState(null);

  const handleRoute = async (data) => {
    console.log(data);

    if (google && map) {
      const directionsService = new google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: data.origin,
        destination: data.destination,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionResponse(result);

      if (result) {
        setDistance(result.routes[0].legs[0].distance.text);
        setDuration(result.routes[0].legs[0].duration.text);
        console.log(directionResponse);
      } else {
        alert("No route found");
      }
    }
    // console.log(result.routes[0].legs[0].distance.text);
    // console.log(result.routes[0].legs[0].duration.text);
  };

  const center = {
    lat: 6.5244,
    lng: 3.3792,
  };

  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, directionResponse]);

  return (
    <div className="flex  justify-center items-center flex-col">
      <h1 className="text-blue-800 text-3xl">Google Maps API</h1>

      <div className="flex flex-col">
        <form className="flex gap-4 m-4" onSubmit={handleSubmit(handleRoute)}>
          <div className="flex flex-col">
            <Autocomplete>
              <input
                type="text"
                className="border-2 p-2 rounded-md border-gray-300"
                placeholder="Enter Origin"
                {...register("origin", {
                  required: "This is required",
                })}
              />
            </Autocomplete>
            <span className="text-red-500">
              {errors.origin && <p>{errors.origin.message}</p>}
            </span>
          </div>
          <div className="flex flex-col">
            <Autocomplete>
              <input
                type="text"
                className="border-2 p-2 rounded-md border-gray-300"
                placeholder="Enter Destination"
                {...register("destination", {
                  required: "This is required",
                })}
              />
            </Autocomplete>
            <span className="text-red-500">
              {errors.destination && <p>{errors.destination.message}</p>}
            </span>
          </div>
          <div
            className="flex  gap-4 justify-center items-center"
            style={{ textAlign: "center" }}
          >
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md"
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

        <div className="flex justify-between items-end">
          <div
            className=" flex gap-4  p-2 rounded-md"
            style={{ textAlign: "center" }}
          >
            <p className="bg-blue-100 p-4 rounded-md">Distance: {distance}</p>
            <p className="bg-blue-100 p-4 rounded-md">Duration: {duration}</p>
          </div>
        </div>
      </div>
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
          {/*  DIFFERENT COORDINATE FOR MARKER */}
          {directionResponse && (
            <DirectionsRenderer directions={directionResponse} />
          )}
        </GoogleMap>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
