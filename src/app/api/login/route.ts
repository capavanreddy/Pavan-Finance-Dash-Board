import { NextRequest, NextResponse } from "next/server";
import { authenticate, createToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const result = await authenticate(email, password);
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Authentication failed" },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = await createToken(result.user);
    
    // Create response with token in body (for environments where cookies don't work)
    const response = NextResponse.json({
      success: true,
      token, // Include token in response for client-side storage
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      }
    });
    
    // Set session cookie
    response.cookies.set("session-token", token, {
      httpOnly: true,
      secure: false, // Allow in development and preview environments
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return response;
  } catch (error: any) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
