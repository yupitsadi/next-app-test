"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Loading from "./components/Loading";
import { WorkshopDocument } from "@/models/Workshop";
import { useBooking } from "@/contexts/BookingContext";
import { isSameDay, parseISO, isAfter, startOfDay } from "date-fns";
import BookingClosedMessage from "./components/BookingClosedMessage";

// Dynamic imports with loading fallbacks
const BackButton = dynamic(() => import("./components/BackButton"), {
  loading: () => <div className="h-10 w-10 animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const StepIndicator = dynamic(() => import("./components/StepIndicator"), {
  loading: () => <div className="h-6 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const TimeSlotButton = dynamic(() => import("./components/TimeSlotButton"), {
  loading: () => <div className="h-12 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const WorkshopPage = dynamic(() => import("./components/WorkshopDetails"), {
  loading: () => <div className="h-40 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const WorkshopDetailsSection = dynamic(() => import("./components/WorkshopDetailsSection"), {
  loading: () => <div className="h-40 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const Testimonials = dynamic(() => import("./components/feedbackCarousel"), {
  loading: () => <div className="h-40 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const SkillCard = dynamic(() => import("./components/SkillCard"), {
  loading: () => <div className="h-20 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const LocationCard = dynamic(() => import("./components/LocationCard"), {
  loading: () => <div className="h-40 w-full animate-pulse bg-gray-200 rounded" />,
  ssr: false,
});

const skills = [
  "Creativity",
  "Critical Thinking",
  "Collaboration",
  "Leadership",
  "Problem Solving",
  "Adaptability",
];

const locationImages = [
  "/workshop-photos/workshop-photo-1.webp",
  "/workshop-photos/workshop-photo-2.webp",
];

interface ClientPageProps {
  initialData: WorkshopDocument | null;
  params: {
    id: string;
  };
}

export default function ClientPage({ initialData}: ClientPageProps) {
  const { setWorkshopDetails } = useBooking();
  const router = useRouter();

  const [workshopData] = useState<WorkshopDocument | null>(initialData);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClosedMessage, setShowClosedMessage] = useState(false);

  useEffect(() => {
    if (workshopData?.date?.time_slots) {
      const uniqueTimeSlots = Array.from(new Set(workshopData.date.time_slots));
      setTimeSlots(uniqueTimeSlots);
      setSelectedTime(uniqueTimeSlots[0] || null);
    }
  }, [workshopData]);

  const handleBookNow = () => {
    if (!selectedTime || !workshopData) {
      setError("Please select a time slot to continue");
      return;
    }

    const workshopDate = parseISO(workshopData.date_of_workshop);
    const currentDate = new Date();
    const isWorkshopToday = isSameDay(workshopDate, currentDate);
    const hasWorkshopPassed = isAfter(startOfDay(currentDate), startOfDay(workshopDate));

    if (hasWorkshopPassed || isWorkshopToday) {
      setShowClosedMessage(true);
      return;
    }

    try {
      const workshopDetails = {
        id: workshopData._id.toString(),
        name: workshopData.theme,
        date: workshopData.date_of_workshop,
        time: selectedTime,
        location: `${workshopData.location.address}, ${workshopData.location.city}`,
        price: workshopData.rate,
      };
      setWorkshopDetails(workshopDetails);
      router.push("/booking");
    } catch (error) {
      console.error("Error handling booking:", error);
      setError("Failed to process booking. Please try again.");
    }
  };

  if (!workshopData) return <BookingClosedMessage message="Workshop not found" />;
  if (error) return <BookingClosedMessage message={error} />;
  if (showClosedMessage) {
    return (
      <BookingClosedMessage message="Same day bookings are not available. Please contact us at 9468074074 for assistance." />
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <main className="max-w-md mx-auto bg-gray-50 min-h-screen pb-5">
        <div className="relative h-[50vh] rounded-b-[2rem] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube-nocookie.com/embed/5blxdvK5vjU?autoplay=1&loop=1&playlist=5blxdvK5vjU&controls=0&mute=1&enablejsapi=0&modestbranding=1&rel=0&playsinline=1&speed=0.25"
              title="Workshop Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ transform: "scale(1.05)", transformOrigin: "center" }}
            />
          </div>
          <BackButton />
          <div className="absolute bottom-7 left-0 right-0 transform translate-y-[10%] px-4">
            <WorkshopPage
              title={workshopData.theme}
              date_of_workshop={workshopData.date_of_workshop}
              location={workshopData.location}
              price={`${workshopData.rate} INR`}
              rating={workshopData.rating}
              duration={workshopData.duration}
              imageUrl="/placeholder.svg"
              shareImage="/images/share-image.jpg"
            />
          </div>
        </div>

        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-1 p-5">
            <StepIndicator step={2} title="Pick your workshop slot" />
            <div className="grid grid-cols-2 gap-2 mb-4">
              {timeSlots.map((time) => (
                <TimeSlotButton
                  key={`${workshopData._id}-${time}`}
                  time={time}
                  selectedTime={selectedTime || ""}
                  onClick={(time) => setSelectedTime(time)}
                />
              ))}
            </div>
            <WorkshopDetailsSection
              description={Array.isArray(workshopData.description) ? workshopData.description : []}
            />
            <Testimonials />
            <SkillCard skills={skills} />
            <LocationCard locationImages={locationImages} />
          </main>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t mx-auto max-w-md">
            <Button
              className="w-full bg-[#09A5E8] text-white hover:bg-[#0787be]"
              onClick={handleBookNow}
              disabled={!selectedTime}
            >
              Book Now
            </Button>
          </div>
        </div>
      </main>
    </Suspense>
  );
} 