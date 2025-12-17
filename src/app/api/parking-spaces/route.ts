import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const spaces = await prisma.parkingSpace.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(spaces);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 });
  }
}
