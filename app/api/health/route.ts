import { checkDbConn } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

    const isConnected=await checkDbConn();
    if(!isConnected){
        return NextResponse.json({
            status:"error",
            message:"db connection failed"
        },
    {status:503})
    }

     return NextResponse.json({
            status:"ok",
            message:"db connection success"
        },
    {status:200})
}