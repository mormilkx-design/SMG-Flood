import 'server-only';
import {createClient} from '@supabase/supabase-js';
export function adminClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('Supabase server configuration missing');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function reportUser(req:Request){
 if(process.env.NEXT_PUBLIC_REPORT_AUTH_MODE==='public')return {userId:'public',email:'',displayName:'ผู้ส่งรายงานทั่วไป'};
 const token=req.headers.get('authorization')?.replace(/^Bearer /i,'');if(!token)return null;
 const {data,error}=await adminClient().auth.getUser(token);
 if(error||!data.user||!data.user.email?.toLowerCase().endsWith('@gmail.com')||!data.user.email_confirmed_at)return null;
 return {userId:data.user.id,email:data.user.email.toLowerCase(),displayName:String(data.user.user_metadata.full_name??'ผู้รายงาน')};
}
export async function canReport(email:string,company:string){
 if(process.env.NEXT_PUBLIC_REPORT_AUTH_MODE==='public')return true;
 const {data,error}=await adminClient().from('reporter_access').select('email').eq('email',email).eq('company',company).eq('enabled',true).maybeSingle();if(error)throw error;return !!data;
}
export function reportAuthor(user:{userId:string},company:string){return user.userId==='public'?`public:${company}`:user.userId;}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
