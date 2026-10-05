// Run manually after successful migration, or schedule externally if needed.
import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const cutoff=new Date(Date.now()-86400000).toISOString();
while(true){const {data,error}=await db.from('photo_objects').select('id,path').is('report_id',null).lt('created_at',cutoff).limit(100);if(error)throw error;if(!data.length)break;const removed=await db.storage.from('flood-photos').remove(data.map(x=>x.path));if(removed.error)throw removed.error;const deleted=await db.from('photo_objects').delete().in('id',data.map(x=>x.id)).is('report_id',null);if(deleted.error)throw deleted.error;console.log('Removed',data.length,'pending objects older than 24 hours');}
