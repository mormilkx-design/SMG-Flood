"use client";
import {createClient, type SupabaseClient} from '@supabase/supabase-js';
let client:SupabaseClient|undefined;
export function browserClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error('กรุณาตั้งค่า Supabase URL และ Publishable Key');
 return client??=createClient(url,key,{auth:{flowType:'pkce',detectSessionInUrl:false}});
}
export async function authFetch(url:string,init:RequestInit={}){
 const {data,error}=await browserClient().auth.getSession();if(error)throw error;
 const headers=new Headers(init.headers);if(data.session)headers.set('Authorization',`Bearer ${data.session.access_token}`);
 return fetch(url,{...init,headers});
}
export async function fetchReports(){
 let page=0;const reports:unknown[]=[];let authenticated=false;
 while(true){const res=await authFetch(`/api/reports?page=${page}`,{cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.error??'โหลดรายงานไม่ได้');reports.push(...data.reports);authenticated=data.authenticated;if(!data.hasMore)break;page++;}
 return {reports,authenticated};
}
export async function uploadPhoto(file:File,point:'exterior'|'entrance',company:string){
 const res=await authFetch('/api/uploads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({company,type:file.type,size:file.size,point})});
 const data=await res.json();if(!res.ok)throw Error(data.error??'เตรียมอัปโหลดไม่สำเร็จ');
 const {error}=await browserClient().storage.from('flood-photos').uploadToSignedUrl(data.path,data.token,file,{contentType:file.type});if(error)throw error;
 return {id:data.id,point};
}
