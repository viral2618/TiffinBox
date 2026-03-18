import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from "@/lib/jwt-utils";
import { sendVerificationEmail } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";

const ownerSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fcmToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = ownerSignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, password, fcmToken } = result.data;
    
    // Check if owner already exists
    const existingOwner = await prisma.owner.findUnique({
      where: { email },
    });
    
    // Check if email is used by a user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered as a customer account. Please use a different email or sign in as a customer." },
        { status: 409 }
      );
    }
    
    if (existingOwner) {
      if (!existingOwner.emailVerified) {
        // Resend verification email
        const token = generateVerificationToken({
          email,
          type: 'email_verification',
          role: 'owner',
          userId: existingOwner.id
        });
        
        await sendVerificationEmail(email, token, name);
        
        return NextResponse.json(
          { message: "Account exists but not verified. Verification email sent." },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Owner with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new owner with notification preferences
    const owner = await prisma.owner.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isOnboarded: false,
        emailVerified: false,
      },
    });
    
    console.log('✅ Created owner with ID:', owner.id);
    
    // Create notification preferences
    try {
      const notificationPref = await prisma.ownerNotificationPreference.create({
        data: {
          general: true,
          emailAlerts: false,
          notificationAlert: true,
          ownerId: owner.id,
        },
      });
      console.log('✅ Created notification preference for owner:', owner.id);
    } catch (error: any) {
      console.error('❌ Failed to create notification preference:', error.message);
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to owner
    await prisma.owner.update({
      where: { id: owner.id },
      data: { emailVerificationOtp: otp }
    });
    
    // Send OTP to Discord webhook
    await fetch('https://discord.com/api/webhooks/1464137448048033867/tazHBMMSTI0Y0xGOL02MaiZPlv9j-CeRQqMTF7Y7OQfBudDun7eVCvZK9lF4Z009BQqx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**Owner OTP for ${email}**: \`${otp}\``
      })
    }).catch(err => console.error('Discord webhook failed:', err));
    
    // Try to send verification email
    try {
      const token = generateVerificationToken({
        email,
        type: 'email_verification',
        role: 'owner',
        userId: owner.id
      });
      await sendVerificationEmail(email, token, name);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Ignore email error and proceed to OTP verification
    }
    
    return NextResponse.json(
      { 
        message: "Owner account created successfully. Please verify your email with OTP.",
        userId: owner.id,
        email: owner.email,
        redirectToOtp: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Owner signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}