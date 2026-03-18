import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.forgotPasswordToken || user.forgotPasswordToken !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Code verified successfully' })
  } catch (error) {
    console.error('Error verifying reset code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}