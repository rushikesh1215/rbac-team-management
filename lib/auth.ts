import { User as Prismauser } from "@prisma/client";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers";
import { prisma } from "./db";
import { Role, User } from "@/types";

const secret= process.env.JWT_SECRET!;
export const hashPassword= async (password:string):Promise<string> =>{
    return bcrypt.hash(password,10);
}
export const verifyhPassword= async (password:string,hashPassword:string):Promise<boolean> =>{
    return bcrypt.compare(password,hashPassword);
}
export const generateToken=  (userId:string):string=>{
    return jwt.sign({userId},secret,{
        expiresIn:"7d"
    });
}

export const verifyToken=  (token:string):{userId:string}=>{
    return jwt.verify(token,secret) as {userId : string};
}
export const getCurrentUser= async():Promise<User| null>=>{
    try{
        const cookieStore= await cookies();
        const token= cookieStore.get("token")?.value;
        if(!token) return null;

        const decode= verifyToken(token);

        const userfromdb:Prismauser |null= await prisma.user.findUnique({
            where:{
                id:decode.userId
            }
        });
        if(!userfromdb) return null;

        const {password, ...user}=userfromdb;
        return  user as User;

    } catch(err){
        console.error("error: ", err);
        return null;
    }
}

export const checkPermission=( user: User,requiredRole:Role):boolean=>{
    const roles={
        [Role.GUEST]:0,
        [Role.USER]:1,
        [Role.MANAGER]:2,
        [Role.ADMIN]:3
    } ;
    return roles[user.role]>= roles[requiredRole];
}