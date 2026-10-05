import {adminClient,reportUser,canReport,sameOrigin,reportAuthor} from '@/lib/supabase-server';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Origin ไม่ถูกต้อง'},{status:403});
 try{const user=await reportUser(req);if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบด้วย Gmail'},{status:401});const body=await req.json();
 if(!['image/jpeg','image/png','image/webp'].includes(body.type)||!Number.isInteger(body.size)||body.size<1||body.size>5*1024*1024||!['exterior','entrance'].includes(body.point))return Response.json({error:'รองรับ JPEG, PNG, WebP ไม่เกิน 5 MB'},{status:400});
 if(!await canReport(user.email,body.company))return Response.json({error:'อีเมลนี้ยังไม่ได้รับสิทธิ์รายงานบริษัทที่เลือก'},{status:403});
 const author=reportAuthor(user,body.company);
 const db=adminClient();const {count,error:quotaError}=await db.from('photo_objects').select('id',{count:'exact',head:true}).eq('author',author).gte('created_at',new Date(Date.now()-3600000).toISOString());if(quotaError)throw quotaError;
 if((count??0)>=60)return Response.json({error:'อัปโหลดเกิน 60 ภาพต่อชั่วโมง กรุณารอหรือแจ้งผู้ดูแล'},{status:429});
 const id=crypto.randomUUID(),path=`${author}/${id}`;const {error:insertError}=await db.from('photo_objects').insert({id,path,author,company:body.company,point:body.point});if(insertError)throw insertError;
 const {data,error}=await db.storage.from('flood-photos').createSignedUploadUrl(path);if(error)throw error;
 return Response.json({id,path,token:data.token});
 }catch(e){console.error(e);return Response.json({error:'เตรียมอัปโหลดไม่ได้ กรุณาตรวจสอบ Supabase'},{status:503});}
}
