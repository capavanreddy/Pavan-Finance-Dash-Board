import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      const newSettings = await prisma.systemSettings.create({
        data: body
      });
      return NextResponse.json(newSettings);
    }

    const updatedSettings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: body
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
