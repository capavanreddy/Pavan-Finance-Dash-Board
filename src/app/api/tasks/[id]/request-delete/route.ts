import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { comment } = await req.json();
    const taskId = Number(resolvedParams.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const adminEmail = "pavanreddy@intellicar.in";
    const userName = (session.user as any).name || session.user.email;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ef4444; margin-top: 0;">Task Deletion Request</h2>
        <p>User <strong>${userName}</strong> has requested to delete the following task:</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 14px;">
          <tr><td style="background: #f8fafc; width: 30%; font-weight: bold;">Task ID</td><td>#${task.id}</td></tr>
          <tr><td style="background: #f8fafc; font-weight: bold;">Task Name</td><td>${task.taskName}</td></tr>
          <tr><td style="background: #f8fafc; font-weight: bold;">Owner</td><td>${task.ownerName}</td></tr>
          <tr><td style="background: #f8fafc; font-weight: bold;">Reviewer</td><td>${task.reviewerName || "N/A"}</td></tr>
        </table>

        <div style="background: #fef2f2; padding: 16px; border-radius: 6px; border-left: 4px solid #ef4444;">
          <h4 style="margin: 0 0 8px 0; color: #b91c1c;">Deletion Reason / Comment:</h4>
          <p style="margin: 0; color: #7f1d1d; white-space: pre-wrap;">${comment || "No comment provided."}</p>
        </div>

        <p style="margin-top: 24px; font-size: 13px; color: #64748b;">You can delete this task directly from the Master Admin Dashboard.</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Task Deletion Request: #${task.id} - ${task.taskName}`,
      html,
    });

    return NextResponse.json({ message: "Deletion request sent to admin." }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to request delete:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
