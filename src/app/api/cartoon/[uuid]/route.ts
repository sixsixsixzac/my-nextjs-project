import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "manga" | "novel" | null;

    if (!type || (type !== "manga" && type !== "novel")) {
      return NextResponse.json(
        { error: "Invalid or missing type parameter" },
        { status: 400 }
      );
    }

    const cartoon = await prisma.cartoon.findFirst({
      where: {
        uuid,
        type,
        status: "active",
        publishStatus: 1,
      },
      select: {
        title: true,
        uuid: true,
      },
    });

    if (!cartoon) {
      return NextResponse.json(
        { error: "Cartoon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: cartoon.title,
      uuid: cartoon.uuid,
    });
  } catch (error) {
    console.error("Error fetching cartoon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

