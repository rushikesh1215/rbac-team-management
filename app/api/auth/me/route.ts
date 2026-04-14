import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
    try {
        
        const user= await getCurrentUser();
        if(!user){
            return NextResponse.json({
                error:"You are not authenticated"
            },{
                status:401
            });
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({
            error:"INternal server Error"
        },{
            status:500
        })
    }
}