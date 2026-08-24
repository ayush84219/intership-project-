import { NextResponse } from "next/server";
import { getAIChatReply } from "@/services/aiService";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const { reply, source } = await getAIChatReply(message);

    return NextResponse.json({
      success: true,
      reply,
      source
    });
  } catch (error: any) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process chat message." },
      { status: 500 }
    );
  }
}
