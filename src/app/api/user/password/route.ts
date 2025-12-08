import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/utils/rate-limit";

// Password verification helper (same as in auth route)
const isOldPasswordFormat = (storedPassword: string, plainPassword: string): boolean => {
  return (
    storedPassword === plainPassword ||
    storedPassword === Buffer.from(plainPassword).toString('base64')
  );
};

const verifyPassword = async (
  plainPassword: string,
  storedPassword: string,
  userId: number
): Promise<boolean> => {
  // Check old password format first
  if (isOldPasswordFormat(storedPassword, plainPassword)) {
    // Upgrade to bcrypt asynchronously (don't block)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    prisma.userProfile
      .update({
        where: { id: userId },
        data: { pWord: hashedPassword },
      })
      .catch((error) => console.error('Error upgrading password:', error));
    
    return true;
  }
  
  // Verify bcrypt hash
  return bcrypt.compare(plainPassword, storedPassword);
};

// Password validation
function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    };
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      error: 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลขอย่างน้อยอย่างละ 1 ตัว',
    };
  }

  return { isValid: true };
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      console.error("Invalid user ID:", session.user.id);
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Rate limiting: 5 requests per 60 seconds per user
    const rateLimitResult = await rateLimit({
      identifier: `user:${userId}`,
      maxRequests: 5,
      windowSeconds: 60,
      keyPrefix: 'ratelimit:password-change',
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `กรุณารอ ${rateLimitResult.resetIn} วินาทีก่อนลองอีกครั้ง`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.resetIn.toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": (Date.now() + rateLimitResult.resetIn * 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "รหัสผ่านปัจจุบันจำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "รหัสผ่านใหม่จำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    if (!confirmPassword || typeof confirmPassword !== "string") {
      return NextResponse.json(
        { error: "ยืนยันรหัสผ่านใหม่จำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน" },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน" },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { pWord: true },
    });

    if (!user || !user.pWord) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้หรือผู้ใช้ไม่มีรหัสผ่าน" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.pWord,
      userId
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        pWord: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    
    // In development, include more error details
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(isDev && {
          message: errorMessage,
          stack: errorStack,
        })
      },
      { status: 500 }
    );
  }
}

