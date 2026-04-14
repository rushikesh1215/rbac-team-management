import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "You are not authorized to access information",
        },
        {
          status: 401,
        },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get("teamId");
    const roleParam = searchParams.get("role");

    const role: Role | undefined =
      roleParam && Object.values(Role).includes(roleParam.toUpperCase() as Role)
        ? (roleParam as Role)
        : undefined;

    const where: Prisma.UserWhereInput = {};
    if (user.role === Role.ADMIN) {
    } else if (user.role === Role.MANAGER) {
      where.OR = [{ teamId: user.teamId }, { role: Role.USER }];
    } else {
      where.teamId = user.teamId;
      where.role = { not: Role.ADMIN };
    }

    if (teamId) {
      where.teamId = teamId;
    }
    if (role) {
      where.role = role;
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        Team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      {
        error: "Internal server Error",
      },
      {
        status: 500,
      },
    );
  }
}
