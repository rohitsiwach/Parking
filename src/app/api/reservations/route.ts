import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const date = new Date(dateStr);
  const start = startOfDay(date);

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        date: start,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { parkingSpaceId, date: dateStr } = await req.json();
    const date = startOfDay(new Date(dateStr));

    // Check if already reserved
    const existing = await prisma.reservation.findUnique({
      where: {
        parkingSpaceId_date: {
          parkingSpaceId,
          date,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Space already reserved for this date" }, { status: 400 });
    }

    // Check if user already has a reservation for this date
    const userExisting = await prisma.reservation.findFirst({
      where: {
        userId: (session.user as any).id,
        date,
      },
    });

    if (userExisting) {
      return NextResponse.json({ error: "You already have a reservation for this date" }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: (session.user as any).id,
        parkingSpaceId,
        date,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Reservation error:", error);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
