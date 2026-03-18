import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "127.0.0.1";
    
    if (ip === "127.0.0.1" || ip === "::1") {
      return NextResponse.json({
        ip,
        location: {
          lat: 19.046906,
          lng: 72.8404587,
          city: "Mumbai",
          region: "Maharashtra",
          country: "India"
        }
      });
    }

    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    if (data.status === "success") {
      return NextResponse.json({
        ip,
        location: {
          lat: data.lat,
          lng: data.lon,
          city: data.city,
          country: data.country,
          region: data.regionName
        }
      });
    }
    
    throw new Error("IP location failed");
  } catch (error) {
    return NextResponse.json({
      ip: "unknown",
      location: {
        lat: 19.046906,
        lng: 72.8404587,
        city: "Mumbai",
        region: "Maharashtra",
        country: "India"
      }
    });
  }
}