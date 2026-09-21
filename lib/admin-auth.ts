import crypto from "crypto";
const cookieName="booking_admin";
function secret(){return process.env.ADMIN_SESSION_SECRET||process.env.NEXTAUTH_SECRET||"change-this-secret-in-production"}
function hash(v:string){return crypto.createHash("sha256").update(v+secret()).digest("hex")}
export function createAdminSession(){return "1."+hash("admin")}
export function isValidAdminSession(v:string|undefined){return !!v&&v===createAdminSession()}
export {cookieName};