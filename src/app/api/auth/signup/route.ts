import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth-utils";
import { generateVerificationToken } from "@/lib/jwt-utils";
import { sendVerificationEmail } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fcmToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { name, email, password, fcmToken } = result.data;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    
    // Check if email is used by an owner
    const existingOwner = await prisma.owner.findUnique({
      where: { email },
    });
    
    if (existingOwner) {
      return NextResponse.json(
        { error: "This email is already registered as an owner account. Please use a different email or sign in as an owner." },
        { status: 409 }
      );
    }
    
    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Resend verification email
        const token = generateVerificationToken({
          email,
          type: 'email_verification',
          role: 'user',
          userId: existingUser.id
        });
        
        await sendVerificationEmail(email, token, name);
        
        return NextResponse.json(
          { message: "Account exists but not verified. Verification email sent." },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await createUser(name, email, password, fcmToken);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to user
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationOtp: otp }
    });
    
    // Send OTP to Discord webhook
    await fetch('https://discord.com/api/webhooks/1464137448048033867/tazHBMMSTI0Y0xGOL02MaiZPlv9j-CeRQqMTF7Y7OQfBudDun7eVCvZK9lF4Z009BQqx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**OTP for ${email}**: \`${otp}\``
      })
    }).catch(err => console.error('Discord webhook failed:', err));
    
    // Try to send verification email
    try {
      const token = generateVerificationToken({
        email,
        type: 'email_verification',
        role: 'user',
        userId: user.id
      });
      await sendVerificationEmail(email, token, name);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Ignore email error and proceed to OTP verification
    }
    
    return NextResponse.json(
      { 
        message: "Account created successfully. Please verify your email with OTP.",
        userId: user.id,
        email: user.email,
        redirectToOtp: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}