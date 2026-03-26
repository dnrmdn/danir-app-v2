import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { requireSharedFeaturePlan } from "@/lib/partner-access";

export const dynamic = "force-dynamic";

const VALID_FEATURES = ["TASKS", "MONEY", "MEAL", "LINKS"];

// GET: Fetch all feature access settings for the active connection
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const connection = await prisma.partnerConnection.findFirst({
            where: {
                status: "ACCEPTED",
                OR: [
                    { userAId: userId },
                    { userBId: userId }
                ]
            }
        });

        if (!connection) {
            return NextResponse.json({ success: true, data: [] });
        }

        const featureAccess = await prisma.partnerFeatureAccess.findMany({
            where: { connectionId: connection.id }
        });

        return NextResponse.json({ success: true, data: featureAccess });
    } catch (error) {
        console.error("Error fetching feature access:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Toggle a feature on/off for the current user
export async function PUT(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { feature, isEnabled } = body;

        if (!feature || !VALID_FEATURES.includes(feature)) {
            return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
        }

        const userId = session.user.id;
        const sharedPlan = await requireSharedFeaturePlan(userId, feature);

        if (sharedPlan && "payload" in sharedPlan) {
            return NextResponse.json(sharedPlan.payload, { status: sharedPlan.status });
        }

        const connection = await prisma.partnerConnection.findFirst({
            where: {
                status: "ACCEPTED",
                OR: [
                    { userAId: userId },
                    { userBId: userId }
                ]
            }
        });

        if (!connection) {
            return NextResponse.json({ error: "No active partner connection" }, { status: 400 });
        }

        const updated = await prisma.partnerFeatureAccess.upsert({
            where: {
                connectionId_userId_feature: {
                    connectionId: connection.id,
                    userId: userId,
                    feature: feature,
                }
            },
            create: {
                connectionId: connection.id,
                userId: userId,
                feature: feature,
                isEnabled: !!isEnabled,
            },
            update: {
                isEnabled: !!isEnabled,
            }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error toggling feature access:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
