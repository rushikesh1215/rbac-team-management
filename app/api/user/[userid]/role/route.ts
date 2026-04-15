import { checkPermission, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/types";
import { get } from "http";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userid: string }> },
) {
  try {
    const { userid } = await context.params;
   console.log(await context.params);
    const user = await getCurrentUser();

    if (!user || !checkPermission(user, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: "you are not authorized to change role",
        },
        {
          status: 401,
        },
      );
    }

    if (userid === user.id) {
      return NextResponse.json(
        {
          error: "you are not authorized to change role",
        },
        {
          status: 401,
        },
      );
    }

    const { role } = await request.json();

    const validRoles = [Role.USER, Role.MANAGER];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid role",
        },
        {
          status: 401,
        },
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userid,
      },
      data: {
        role: role,
      },
      include: {
        Team: true,
      },
    });
    return NextResponse.json({
      user: updatedUser,
      message: "user role updated",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: ` error occured ${(error as Error).message}`,
      },
      {
        status: 400,
      },
    );
  }
}
