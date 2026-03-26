import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUserIdFromSession } from "@/lib/finance/session";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Price constant — single source of truth
export const DANIR_PRO_PRICE = 119000;
export const DANIR_PRO_CURRENCY = "IDR";

/**
 * POST /api/user/payments
 * Submit a payment confirmation request.
 * Accepts multipart/form-data with:
 *   - paymentMethod: "QRIS" | "BCA_TRANSFER"
 *   - payerName: string
 *   - notes?: string
 *   - proof: File (image, max 5MB)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check user is not already Pro
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });

    if (user?.planType === "PRO") {
      return NextResponse.json(
        { success: false, error: "You are already on the Pro plan." },
        { status: 400 }
      );
    }

    // Check no pending payment already exists for this user
    const existingPending = await prisma.paymentRequest.findFirst({
      where: { userId, status: "PENDING" },
      select: { id: true },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a pending payment request. Please wait for admin review.",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const payerName = formData.get("payerName") as string | null;
    const notes = formData.get("notes") as string | null;
    const proofFile = formData.get("proof");

    // Validate required fields
    if (!paymentMethod || !["QRIS", "BCA_TRANSFER"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "paymentMethod must be QRIS or BCA_TRANSFER" },
        { status: 400 }
      );
    }

    if (!payerName || payerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "payerName is required" },
        { status: 400 }
      );
    }

    // Handle proof image upload
    let proofImageUrl: string | null = null;

    if (proofFile instanceof File) {
      if (!proofFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Proof must be an image file" },
          { status: 400 }
        );
      }

      const bytes = await proofFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Proof image must be smaller than 5MB" },
          { status: 400 }
        );
      }

      const ext = proofFile.name.split(".").pop() ?? "jpg";
      const fileName = `proof-${userId}-${randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      proofImageUrl = `/uploads/payment-proofs/${fileName}`;
    }

    // Create payment request
    const payment = await prisma.paymentRequest.create({
      data: {
        userId,
        planTarget: "PRO",
        amount: DANIR_PRO_PRICE,
        currency: DANIR_PRO_CURRENCY,
        paymentMethod,
        proofImageUrl,
        status: "PENDING",
        notes: [
          payerName ? `Payer: ${payerName.trim()}` : null,
          notes?.trim() ? `Note: ${notes.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" | ") || null,
      },
      select: {
        id: true,
        invoiceCode: true,
        status: true,
        paymentMethod: true,
        submittedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("user payments POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/payments
 * Get the current user's payment requests.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payments = await prisma.paymentRequest.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      take: 20,
      select: {
        id: true,
        invoiceCode: true,
        planTarget: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        proofImageUrl: true,
        status: true,
        notes: true,
        reviewedAt: true,
        submittedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("user payments GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
