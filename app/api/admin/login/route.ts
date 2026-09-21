import {NextResponse } from "next/server";
import {cookies} from "next/headers";
import {createAdminSession,cookieName} from "@/lib/admin-auth";
export async function POST(req:Request){
 try{
  const {username,password}=await req.json();
  if(username!==process.env.ADMIN_USERNAME||password!==process.env.ADMIN_PASSWORD)return NextResponse.json({error:"Invalid admin credentials"},{status:401});
  const jar=await cookies();
  jar.set(cookieName,createAdminSession(),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*8});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Login failed"},{status:500})}
}