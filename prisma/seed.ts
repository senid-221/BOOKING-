import { PrismaClient } from "@prisma/client";
const prisma=new PrismaClient();
const services=["Food Ordering","Drinks Ordering","Beauty Services","Room Booking","Salon Booking","Physiotherapy","Studio Recording","Transport / Tickets","Shopping","Installation"];
async function main(){for(const name of services){await prisma.service.upsert({where:{name},update:{monthlyFee:25000,maxProviders:5},create:{name,monthlyFee:25000,maxProviders:5}})}}main().finally(()=>prisma.$disconnect());