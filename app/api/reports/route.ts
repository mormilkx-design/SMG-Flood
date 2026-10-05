import {adminClient,reportUser,canReport,sameOrigin,reportAuthor} from '@/lib/supabase-server';
export const runtime='nodejs';
import {companies,statuses,today,waterLevels} from '@/lib/flood';
import type {Status} from '@/lib/flood';
import {calculateRisk} from '@/lib/risk';
import {validatePhotoCounts} from '@/lib/report-photos';


function parseJsonArray(value:unknown){try{const parsed=JSON.parse(String(value??'[]'));return Array.isArray(parsed)?parsed:[];}catch{return [];}}

export async function GET(req:Request){
 try{const url=new URL(req.url);const page=Number(url.searchParams.get('page')??0);if(!Number.isInteger(page)||page<0)return Response.json({error:'page ไม่ถูกต้อง'},{status:400});
 const columns='id,company,date,observed,submitted,level,status,declared_status,risk_score,risk_reasons,water_trend,road,attendance,production,transport,point,note,help,reporter,photos,photo_points';
 const {data,error}=await adminClient().from('reports').select(columns).order('observed',{ascending:false}).order('submitted',{ascending:false}).order('id',{ascending:false}).range(page*500,page*500+499);if(error)throw error;
 return Response.json({authenticated:!!await reportUser(req),hasMore:data.length===500,reports:data.map(r=>({...r,photoPoints:r.photo_points,declaredStatus:r.declared_status??r.status,riskScore:r.risk_score,riskReasons:r.risk_reasons,waterTrend:r.water_trend}))},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error(e);return Response.json({error:'ยังโหลดรายงานไม่ได้ กรุณาตรวจสอบ Supabase'},{status:503});}
}

export async function POST(req:Request){
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'ไม่สามารถส่งรายงานจากหน้านี้'},{status:403});
 
 try{
  const user=await reportUser(req);if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบก่อนส่งรายงาน'},{status:401});
  const form=await req.formData();const field=(name:string)=>String(form.get(name)??'').trim();
  const company=field('company'),date=field('date'),time=field('time'),point=field('point'),declaredStatus=field('status') as Status;
  const level=field('level')===''?null:Number(field('level'));const observed=`${date}T${time}:00+07:00`;
  if(!await canReport(user.email,company))return Response.json({error:'อีเมลนี้ยังไม่ได้รับสิทธิ์ส่งรายงานบริษัทที่เลือก'},{status:403});
  const uploads=parseJsonArray(field('photoUploads')) as {id:string;point:string}[];
  if(uploads.length>6||uploads.some(x=>!x||!(/^[a-f0-9-]{36}$/.test(x.id))||!['exterior','entrance'].includes(x.point))||new Set(uploads.map(x=>x.id)).size!==uploads.length)return Response.json({error:'ข้อมูลรูปภาพไม่ถูกต้อง'},{status:400});
  const exterior=uploads.filter(x=>x.point==='exterior'),entrance=uploads.filter(x=>x.point==='entrance'),photoPoints=uploads.map(x=>x.point);
  if(!companies.some(c=>c[0]===company)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)||Number.isNaN(Date.parse(observed))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||date>today()||Date.parse(observed)>Date.now()+60000||!point||point.length>100||!Object.prototype.hasOwnProperty.call(statuses,declaredStatus)||declaredStatus==='missing'||level===null||!waterLevels.some(x=>Number(x.value)===level)||field('note').length>2000||field('help').length>1000)return Response.json({error:'กรุณาตรวจสอบวันที่ เวลา ระดับน้ำ และจุดวัด'},{status:400});
  if(!['ผ่านได้','ผ่านได้บางประเภท','ผ่านไม่ได้','ยังไม่ตรวจสอบ'].includes(field('road'))||!['มาทำงานได้ปกติ','มาทำงานไม่ได้','มาทำงานได้แต่ต้องใช้แผนฉุกเฉิน (รถรับส่ง)'].includes(field('attendance'))||!['ไม่กระทบต่อกระบวนการผลิต','กระทบการผลิตบางส่วน','กระทบกระบวนการผลิต','หยุดกระบวนการผลิต'].includes(field('production'))||!['ไม่มีผลกระทบ','ล่าช้า','เข้า–ออกไม่ได้'].includes(field('transport')))return Response.json({error:'กรุณาเลือกสถานะให้ครบ'},{status:400});
  if(!validatePhotoCounts(exterior.length,entrance.length))return Response.json({error:'แนบภาพครบ 2 จุด จุดละ 1–3 ภาพ'},{status:400});
  const db=adminClient();const stored=uploads.map(x=>x.id),author=reportAuthor(user,company);
  const {data:objects,error:objectError}=await db.from('photo_objects').select('*').in('id',stored).eq('author',author).eq('company',company).is('report_id',null);if(objectError)throw objectError;
  if(!objects||objects.length!==uploads.length||objects.some(o=>uploads.find(x=>x.id===o.id)?.point!==o.point))return Response.json({error:'รูปภาพไม่ได้เป็นของผู้รายงาน หรือถูกใช้แล้ว'},{status:400});
  for(const obj of objects){const {data,error}=await db.storage.from('flood-photos').download(obj.path);if(error)throw error;if(data.size>5*1024*1024)return Response.json({error:'รูปเกิน 5 MB'},{status:400});const bytes=new Uint8Array(await data.arrayBuffer());const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10;const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!jpeg&&!png&&!webp)return Response.json({error:'รูปต้องเป็น JPEG, PNG หรือ WebP'},{status:400});}
  const {data:previous,error:previousError}=await db.from('reports').select('level').eq('company',company).eq('point',point).lt('observed',new Date(observed).toISOString()).not('level','is',null).order('observed',{ascending:false}).limit(1).maybeSingle();if(previousError)throw previousError;
  const risk=calculateRisk({company,level,declaredStatus,attendance:field('attendance'),production:field('production'),transport:field('transport'),previousLevel:previous?.level??null});
  const id=crypto.randomUUID(),submitted=new Date().toISOString();
  const {error:saveError}=await db.rpc('save_report',{p_report:{id,company,date,observed:new Date(observed).toISOString(),submitted,level,status:risk.status,declared_status:declaredStatus,risk_score:risk.score,risk_reasons:risk.reasons,water_trend:risk.trend,road:field('road'),attendance:field('attendance'),production:field('production'),transport:field('transport'),point,note:field('note'),help:field('help'),reporter:user.displayName,photos:stored,photo_points:photoPoints,author}});if(saveError)throw saveError;
  return Response.json({id,status:risk.status,riskScore:risk.score,riskReasons:risk.reasons,waterTrend:risk.trend},{status:201});
 }catch(e){console.error(e);return Response.json({error:'บันทึกไม่สำเร็จ ข้อมูลในแบบฟอร์มยังอยู่ กรุณาลองใหม่'},{status:503});}
}
