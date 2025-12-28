import {
  CreditCard,
  MapPinMinus,
  MapPinPlus,
  PhoneCall,
  SendHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import Button from "./Button";

function RideDetails({
  pickupLocation,
  destinationLocation,
  selectedVehicle,
  fare,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  createRide,
  cancelRide,
  loading,
  rideCreated,
  confirmedRideData,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auto-collapse when ride is accepted or ongoing
  const isRideActive = confirmedRideData?.status === "accepted" || confirmedRideData?.status === "ongoing";
  const shouldCollapse = isRideActive && !isExpanded;
  return (
    <>
      <div
        className={`${
          showPanel ? "bottom-0" : "-bottom-full"
        } transition-all duration-300 ease-out absolute bg-white w-full rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50`}
        style={{
          height: shouldCollapse ? "140px" : "auto",
          maxHeight: shouldCollapse ? "140px" : "90vh",
          overflowY: shouldCollapse ? "hidden" : "auto"
        }}
      >
        {/* Drag Handle - shown when ride is active */}
        {isRideActive && (
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex justify-center pt-3 pb-2 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
              {shouldCollapse ? (
                <ChevronUp size={18} className="text-gray-500 animate-bounce" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </div>
          </div>
        )}
        
        {/* Collapsed Quick View */}
        {shouldCollapse && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedVehicle == "car"
                      ? "/car.png"
                      : `/${selectedVehicle}.webp`
                  }
                  className="h-16"
                />
                {confirmedRideData?._id && (
                  <div className="leading-tight">
                    <h1 className="text-base font-bold">
                      {confirmedRideData?.captain?.fullname?.firstname}{" "}
                      {confirmedRideData?.captain?.fullname?.lastname}
                    </h1>
                    <p className="text-xs text-gray-600 font-medium">
                      {confirmedRideData?.captain?.vehicle?.number}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {confirmedRideData?.status === "accepted" && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Captain Arriving
                        </span>
                      )}
                      {confirmedRideData?.status === "ongoing" && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₹{fare[selectedVehicle]}</p>
                <p className="text-xs text-gray-500">Tap to expand</p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`px-4 ${shouldCollapse ? 'hidden' : 'block'}`}>
          {rideCreated && !confirmedRideData && (
            <>
              <h1 className="text-center">Looking for nearby drivers</h1>
              <div className="overflow-y-hidden py-2 pb-2">
                <div className="h-1 rounded-full bg-blue-500 animate-ping"></div>
              </div>
            </>
          )}
          
          {confirmedRideData?.status === "accepted" && (
            <>
              <h1 className="text-center text-green-600 font-semibold">
                Captain Arriving - Share OTP to Start Ride
              </h1>
              <div className="overflow-y-hidden py-2 pb-2">
                <div className="h-1 rounded-full bg-green-500"></div>
              </div>
            </>
          )}
          
          {confirmedRideData?.status === "ongoing" && (
            <>
              <h1 className="text-center text-blue-600 font-semibold flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Ride In Progress - Live Tracking
              </h1>
              <div className="overflow-y-hidden py-2 pb-2">
                <div className="h-1 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
            </>
          )}
          
          <div
            className={`flex ${
              confirmedRideData ? " justify-between " : " justify-center "
            } pt-2 pb-4`}
          >
            <div>
              <img
                src={
                  selectedVehicle == "car"
                    ? "/car.png"
                    : `/${selectedVehicle}.webp`
                }
                className={`${confirmedRideData ? " h-20" : " h-12 "}`}
              />
            </div>

            {confirmedRideData?._id && (
              <div className="leading-4 text-right">
                <h1 className="text-sm ">
                  {confirmedRideData?.captain?.fullname?.firstname}{" "}
                  {confirmedRideData?.captain?.fullname?.lastname}
                </h1>
                <h1 className="font-semibold">
                  {confirmedRideData?.captain?.vehicle?.number}
                </h1>
                <h1 className="capitalize text-xs text-zinc-400">
                  {" "}
                  {confirmedRideData?.captain?.vehicle?.color}{" "}
                  {confirmedRideData?.captain?.vehicle?.type}
                </h1>
                <span className="mt-1 inline-block bg-black text-white px-3 py-1 rounded font-semibold">
                  OTP: {confirmedRideData?.otp}
                </span>
              </div>
            )}
          </div>
          {confirmedRideData?._id && (
            <div className="flex gap-2 mb-2">
              <Button
                type={"link"}
                path={`/user/chat/${confirmedRideData?._id}`}
                title={"Send a message..."}
                icon={<SendHorizontal strokeWidth={1.5} size={18} />}
                classes={"bg-zinc-100 font-medium text-sm text-zinc-950"}
              />
              <div className="flex items-center justify-center w-14 rounded-md bg-zinc-100">
                <a href={"tel:" + confirmedRideData?.captain?.phone}>
                  <PhoneCall size={18} strokeWidth={2} color="black" />
                </a>
              </div>
            </div>
          )}
          <div className="mb-2">
            {/* Pickup Location */}
            <div className="flex items-center gap-3 border-t-2 py-2 px-2">
              <MapPinMinus size={18} />
              <div>
                <h1 className="text-lg font-semibold leading-5">
                  {pickupLocation.split(", ")[0]}
                </h1>
                <div className="flex">
                  <p className="text-xs text-gray-800 inline">
                    {pickupLocation.split(", ").map((location, index) => {
                      if (index > 0) {
                        return (
                          <span key={index}>
                            {location}
                            {index < pickupLocation.split(", ").length - 1 &&
                              ", "}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Destination Location */}
            <div className="flex items-center gap-3 border-t-2 py-2 px-2">
              <MapPinPlus size={18} />
              <div>
                <h1 className="text-lg font-semibold leading-5">
                  {destinationLocation.split(", ")[0]}
                </h1>
                <div className="flex">
                  <p className="text-xs text-gray-800 inline">
                    {destinationLocation.split(", ").map((location, index) => {
                      if (index > 0) {
                        return (
                          <span key={index}>
                            {location}
                            {index <
                              destinationLocation.split(", ").length - 1 &&
                              ", "}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Fare */}
            <div className="flex items-center gap-3 border-t-2 py-2 px-2">
              <CreditCard size={18} />
              <div>
                <h1 className="text-lg font-semibold leading-6">
                  ₹ {fare[selectedVehicle]}
                </h1>
                <p className="text-xs text-gray-800 ">Cash</p>
              </div>
            </div>
          </div>
          {rideCreated || confirmedRideData ? (
            <Button
              title={"Cancel Ride"}
              loading={loading}
              classes={"bg-red-600 "}
              fun={cancelRide}
            />
          ) : (
            <Button title={"Confirm Ride"} fun={createRide} loading={loading} />
          )}
        </div>
      </div>
    </>
  );
}

export default RideDetails;
