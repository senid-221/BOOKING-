import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
const prisma=new PrismaClient();
export async function POST(req:Request){
  try{
    const {fullName,phone,serviceName}=await req.json();
    if(!fullName||!phone||!serviceName)return NextResponse.json({error:"Missing required fields"},{status:400});
    const service=await prisma.service.findUnique({where:{name:serviceName}});
    if(!service)return NextResponse.json({error:"Service not found"},{status:404});
    const provider=await prisma.provider.create({data:{fullName,phone,serviceId:service.id,status:"BLOCKED"}});
    return NextResponse.json({providerId:provider.id,status:provider.status});
  }catch(e){console.error(e);return NextResponse.json({error:"Could not create provider account"},{status:500})}
}