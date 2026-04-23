import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const department = searchParams.get('department');
    const role = searchParams.get('role');

    let where: any = {};

    // Logic:
    // If Admin, see all.
    // If Finance member and has allocation rights (handled by frontend filtering or we could do it here), see relevant ones.
    // If External user, see only their own.
    
    if (role === 'ADMIN') {
      // Admin sees everything
    } else if (department === 'Finance') {
      // Finance team can see all requests to allocate them
    } else if (email) {
      // External users only see their own requests
      where.requesterEmail = email;
    }

    const requests = await prisma.externalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching external requests:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestFrom, requesterEmail, natureOfRequest, departmentName, requestType } = body;

    if (!requestFrom || !requesterEmail || !natureOfRequest || !departmentName || !requestType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newRequest = await prisma.externalRequest.create({
      data: {
        requestFrom,
        requesterEmail,
        natureOfRequest,
        departmentName,
        requestType,
        status: 'Under Process'
      }
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating external request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
