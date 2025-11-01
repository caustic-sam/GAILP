import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.FRESHRSS_API_URL,
    hasUsername: !!process.env.FRESHRSS_API_USERNAME,
    hasPassword: !!process.env.FRESHRSS_API_PASSWORD,
    url: process.env.FRESHRSS_API_URL?.substring(0, 30) + '...',
  });
}
