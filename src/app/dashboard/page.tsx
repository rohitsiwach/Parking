"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, LogOut, Car } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ParkingSpace {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  parkingSpaceId: string;
  userId: string;
  date: string;
  user: {
    name: string;
    email: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  const fetchSpaces = async () => {
    const res = await fetch("/api/parking-spaces");
    const data = await res.json();
    setSpaces(data);
  };

  const fetchReservations = async (date: Date) => {
    setLoading(true);
    const res = await fetch(`/api/reservations?date=${date.toISOString()}`);
    const data = await res.json();
    setReservations(data);
    setLoading(false);
  };

  const handleReserve = async (spaceId: string) => {
    setMessage({ text: "", type: "" });
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parkingSpaceId: spaceId,
        date: selectedDate.toISOString(),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ text: "Reservation successful!", type: "success" });
      fetchReservations(selectedDate);
    } else {
      setMessage({ text: data.error || "Failed to reserve", type: "error" });
    }
  };

  if (status === "loading") return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!session) return null;

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Parking Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome, {session.user?.name}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="font-medium text-gray-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Padding for start of month */}
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(startOfDay(day))}
                className={cn(
                  "h-10 flex items-center justify-center rounded-lg transition",
                  isSameDay(day, selectedDate)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50 dark:hover:bg-gray-700"
                )}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </div>

        {/* Parking Spaces Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Spaces for {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            {message.text && (
              <p className={cn("text-sm px-3 py-1 rounded", message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {message.text}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">Loading spaces...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {spaces.map((space) => {
                const reservation = reservations.find((r) => r.parkingSpaceId === space.id);
                const isReserved = !!reservation;
                const isMine = reservation?.userId === (session.user as any).id;

                return (
                  <div
                    key={space.id}
                    className={cn(
                      "p-4 border-2 rounded-xl flex flex-col items-center gap-3 transition",
                      isReserved
                        ? isMine
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50 dark:bg-red-900/10 opacity-75"
                        : "border-gray-100 hover:border-blue-300 cursor-pointer"
                    )}
                  >
                    <div className={cn("p-3 rounded-full", isReserved ? (isMine ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600") : "bg-blue-100 text-blue-600")}>
                      <Car size={24} />
                    </div>
                    <span className="font-bold">{space.name}</span>
                    {isReserved ? (
                      <div className="text-center">
                        <span className="text-xs font-medium block uppercase tracking-wider">
                          {isMine ? "Your Spot" : "Reserved"}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px] block">
                          {reservation.user.name}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReserve(space.id)}
                        className="mt-2 w-full py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
