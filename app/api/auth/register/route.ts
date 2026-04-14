import { generateToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/types";
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
    const { name, email, password, teamcode } = body;
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "fill all required field correctly",
        },
        {
          status: 400,
        },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "emailId already exist our system try to login ",
        },
        {
          status: 409,
        },
      );
    }

    let teamId: string | undefined;

    if (teamcode) {
      const team = await prisma.team.findUnique({
        where: {
          code: teamcode,
        },
      });

      if (!team) {
        return NextResponse.json(
          {
            error: "Please enter a valid team code",
          },
          {
            status: 400,
          },
        );
      }

      teamId = team.id;
    }

    const hashedPass = await hashPassword(password);

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        role,
        teamId,
      },

      include: {
        Team: true,
      },
    });

    const token = generateToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        team: user.Team,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error(`Registration failed${err}`);
    return NextResponse.json(
      {
        error: "Registration failed",
      },
      {
        status: 500,
      },
    );
  }
}
