import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function notifyProvider(providerId:string,title:string,message:string){
  await prisma.notification.create({
    data:{title,message,audience:"ALL_PROVIDERS",recipients:{create:[{providerId}]}}
  });
}