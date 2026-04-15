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
     const {userid}= await context.params;
    const user =await getCurrentUser();

    if(!user || !checkPermission(user,Role.ADMIN) ){
        return NextResponse.json({
            error:"you are not authorized to assign team"
        },
    {
        status:401
    });
    }

    const {teamId}= await request.json();
    if(teamId){
        const team=await prisma.team.findUnique({
            where:{id:teamId}
        });

    
     if (!team) {
            return NextResponse.json(
              {
                error: "Team not found",
              },
              {
                status: 404,
              },
            );
          }     
        }


        const updatedUser= await prisma.user.update({
            where:{
                id:userid
            },data:{
                teamId:teamId
            },include:{
                Team:true,
           }
        });
        return NextResponse.json({
            user:updatedUser,
            message:teamId?"user added to team":"user removed from team"
        });
    } catch (error) {
        return NextResponse.json({
            error:` error occured ${(error as Error).message}`
        },{
            status: 400
        })

}
   


}
