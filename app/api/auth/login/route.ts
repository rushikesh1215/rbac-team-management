import { generateToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(requeest: NextRequest) {
  try {
    let body;
    try {
      body = await requeest.json(); // CLIENT error if fails
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
        status: 400,
      });
    }
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "fill all required fields",
        },
        {
          status: 400,
        },
      );
    }

    const userFromdb = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Team: true,
      },
    });

    if (!userFromdb) {
      return NextResponse.json(
        {
          error: "User not found with emailId",
        },
        {
          status: 401,
        },
      );
    }

    const isValidPass = await verifyPassword(password, userFromdb.password);
    if (!isValidPass) {
      return NextResponse.json(
        {
          error: "Invalid password ",
        },
        {
          status: 401,
        },
      );
    }

    const token = generateToken(userFromdb.id);

    const response = NextResponse.json({
      user: {
        id: userFromdb.id,
        email: userFromdb.email,
        name: userFromdb.name,
        role: userFromdb.role,
        teamId: userFromdb.teamId,
        team: userFromdb.Team,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error(`login failed${err}`);
    return NextResponse.json(
      {
        error: "login failed",
      },
      {
        status: 500,
      },
    );
  }
}
