// import { auth } from "@/lib/auth";
// import prisma from "@/lib/db";
// import { Session } from "better-auth";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//     try {
//         // 🔹 Ambil session yang sedang aktif dari header
//         const sessionResponse = await auth.api.getSession({ headers: req.headers });

//         // 🔹 Gunakan type assertion supaya aman
//         const session = sessionResponse?.session as Session | null;

//         if (!session?.userId) {
//             return NextResponse.json(
//                 { success: false, error: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         // 🔹 Ambil todos milik user yang login
//         const todos = await prisma.task.findMany({
//             where: { userId: session.userId },
//             orderBy: { createdAt: "desc" },
//         });

//         return NextResponse.json(
//             { success: true, data: todos },
//             { status: 200 }
//         );




//     } catch (error) {
//         console.error("❌ Error fetching todos:", error);
//         return NextResponse.json(
//             { success: false, error: "Failed to fetch data" },
//             { status: 500 }
//         );
//     }
// }