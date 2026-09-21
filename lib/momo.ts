import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const baseUrl=process.env.MOMO_BASE_URL||"https://sandbox.momodeveloper.mtn.co.rw";
const subscriptionKey=process.env.MOMO_COLLECTION_PRIMARY_KEY;
const apiUser=process.env.MOMO_API_USER;
const apiKey=process.env.MOMO_API_KEY;
const targetEnvironment=process.env.MOMO_TARGET_ENVIRONMENT||"sandbox";

function required(name:string,value:string|undefined){if(!value) throw new Error(name+" is not configured"); return value}

export async function getMomoToken(){
 const user=required("MOMO_API_USER",apiUser), key=required("MOMO_API_KEY",apiKey), sub=required("MOMO_COLLECTION_PRIMARY_KEY",subscriptionKey);
 const auth=Buffer.from(user+":"+key).toString("base64");
 const res=await axios.post(baseUrl+"/collection/token/",{}, {headers:{"Authorization":"Basic "+auth,"Ocp-Apim-Subscription-Key":sub,"Content-Type":"application/json"}});
 return res.data.access_token as string;
}

export async function requestPayment(input:{amount:number;phone:string;externalId:string;currency?:string;description:string;callbackUrl:string}){
 const token=await getMomoToken(); const referenceId=uuidv4(); const sub=required("MOMO_COLLECTION_PRIMARY_KEY",subscriptionKey);
 const phone=input.phone.replace(/\\D/g,"");
 await axios.post(baseUrl+"/collection/v1_0/requesttopay", {amount:String(input.amount),currency:input.currency||"RWF",externalId:input.externalId,payer:{partyIdType:"MSISDN",partyId:phone},payerMessage:input.description,payeeNote:input.description}, {headers:{"Authorization":"Bearer "+token,"X-Reference-Id":referenceId,"X-Target-Environment":targetEnvironment,"Ocp-Apim-Subscription-Key":sub,"Content-Type":"application/json","X-Callback-Url":input.callbackUrl}});
 return referenceId;
}

export async function getPaymentStatus(referenceId:string){
 const token=await getMomoToken(); const sub=required("MOMO_COLLECTION_PRIMARY_KEY",subscriptionKey);
 const res=await axios.get(baseUrl+"/collection/v1_0/requesttopay/"+referenceId,{headers:{"Authorization":"Bearer "+token,"X-Target-Environment":targetEnvironment,"Ocp-Apim-Subscription-Key":sub}});
 return res.data;
}