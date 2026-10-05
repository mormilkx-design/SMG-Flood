// Offline migration. Input: JSON array of ALL D1 rows, plus photos/<uuid> bytes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createClient} from '@supabase/supabase-js';
const folder=process.argv[2];
if(!folder)throw Error('Usage: node --env-file=.env.local scripts/import-legacy.mjs data-export');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw Error('Missing Supabase environment variables');
const db=createClient(url,key,{auth:{persistSession:false}});
const input=JSON.parse(await fs.readFile(path.join(folder,'reports.json'),'utf8'));
const rows=Array.isArray(input)?input:input.reports;
if(!Array.isArray(rows))throw Error('reports.json must contain an array or {reports:[]}');
const array=v=>Array.isArray(v)?v:JSON.parse(v||'[]');
const uuid=v=>typeof v==='string'&&/^[a-f0-9-]{36}$/.test(v);
const assert=result=>{if(result.error)throw result.error;return result.data;};
// Preflight every image before writing any records.
for(const r of rows){if(!uuid(r.id))throw Error('Invalid report UUID');for(const id of array(r.photos)){if(!uuid(id))throw Error('Invalid photo UUID');await fs.access(path.join(folder,'photos',id));}}
let done=0;
for(const r of rows){
 const photos=array(r.photos),points=array(r.photo_points??r.photoPoints);
 const author='legacy:'+String(r.author??'unknown');
 const objects=[];
 for(let i=0;i<photos.length;i++){
  const id=photos[i],bytes=await fs.readFile(path.join(folder,'photos',id));
  const type=bytes[0]===255?'image/jpeg':bytes[0]===137?'image/png':bytes.toString('ascii',0,4)==='RIFF'?'image/webp':null;
  if(!type)throw Error('Unsupported image '+id);
  const objectPath='legacy/'+id;
  assert(await db.storage.from('flood-photos').upload(objectPath,bytes,{contentType:type,upsert:true}));
  objects.push({id,path:objectPath,author,company:r.company,point:points[i]==='entrance'?'entrance':'exterior',report_id:r.id});
 }
 const record={id:r.id,company:r.company,date:r.date,observed:r.observed,submitted:r.submitted,level:r.level,status:r.status,declared_status:r.declared_status??r.declaredStatus??r.status,risk_score:r.risk_score??r.riskScore??null,risk_reasons:array(r.risk_reasons??r.riskReasons),water_trend:r.water_trend??r.waterTrend??'unknown',road:r.road??'',attendance:r.attendance??'',production:r.production??'',transport:r.transport??'',point:r.point??'',note:r.note??'',help:r.help??'',reporter:r.reporter??'รายงานเดิม',author,photos,photo_points:objects.map(x=>x.point)};
 assert(await db.from('reports').upsert(record));
 if(objects.length)assert(await db.from('photo_objects').upsert(objects));
 console.log(`Imported ${++done}/${rows.length}: ${r.id}`);
}
console.log('Finished. Check counts and images in the new Dashboard before switching users.');
