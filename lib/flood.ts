export const companies = [
 ['BKC','บริษัท บางกอกโคมัตสุ จำกัด'],['EXT','บริษัท เอ็กเซดี้ (ประเทศไทย) จำกัด'],['GYSI','บริษัท ยีเอส ยัวซ่า สยาม อินดัสตรีส์ จำกัด'],['KYBT','บริษัท เควายบี (ประเทศไทย) จำกัด'],['MSFT','บริษัท มาห์เล สยาม ฟิลเตอร์ ซิสเต็มส์ จำกัด'],['NBMT','บริษัท เอ็น เอส เค แบริ่งส์แมนูแฟคเจอริ่ง (ประเทศไทย) จำกัด'],['NT','บริษัท นิตตั้น (ประเทศไทย) จำกัด'],['SGS','บริษัท สยามยีเอสแบตเตอรี่ จำกัด'],['SHE','บริษัท สยาม ฮิตาชิ เอลลิเวเตอร์ จำกัด'],['SNSS','บริษัท สยาม เอ็น เอส เค สเตียริ่ง ซิสเต็มส์ จำกัด'],['SRI','บริษัท สยามริคเก้นอินดัสเตรี้ยล จำกัด'],
 ['SML','บริษัท มอเตอร์ โลจิสติก จำกัด'],
 ['SSS','บริษัท สยาม สมาร์ท โซลูชั่นส์ จำกัด'],
 ['MSED','บริษัท มาห์เล สยาม อิเล็คทริค ไดร์ฟ จำกัด'],
 ['BOSCH','บริษัท บ๊อช ออโตโมทีฟ จำกัด'],
 ['CHITA','บริษัท สยาม ชิตะ จำกัด'],
 ['VALEO','บริษัท วาเลโอ สยาม จำกัด'],
 ['ASTEMO','บริษัท แอสเตโม พาวเวอร์เทรน จำกัด'],
 ['CASONIC','บริษัท สยาม คาลโซนิค จำกัด'],
] as const;
export const statuses = {
 normal:{label:'ปกติ',en:'NORMAL',color:'#168565'},watch:{label:'เฝ้าระวัง',en:'WATCH',color:'#b77b08'},warning:{label:'มีผลกระทบ',en:'WARNING',color:'#d36922'},critical:{label:'วิกฤต',en:'CRITICAL',color:'#cf3f51'},missing:{label:'ยังไม่รายงาน',en:'NO REPORT',color:'#78889b'},
};
export type Status=keyof typeof statuses;
export type Report={id:string;company:string;date:string;observed:string;submitted:string;level:number|null;status:Status;declaredStatus?:Status;riskScore?:number|null;riskReasons?:string[];waterTrend?:'up'|'steady'|'down'|'unknown';road:string;attendance:string;production:string;transport:string;point:string;note:string;help:string;reporter:string;photos:string[];photoPoints?:string[]};
export const waterLevels=[
 {value:'0',label:'แห้ง / ต่ำกว่าข้อเท้า',range:'< 10 ซม.',tone:'dry'},
 {value:'30',label:'ข้อเท้า–เข่า',range:'10–50 ซม.',tone:'ankle'},
 {value:'75',label:'เข่า–เอว',range:'50–100 ซม.',tone:'waist'},
 {value:'115',label:'เอว–อก',range:'100–130 ซม.',tone:'chest'},
 {value:'155',label:'อกขึ้นไป',range:'130–180 ซม.',tone:'high'},
 {value:'181',label:'มิดหัว / ท่วมหลังคา',range:'> 180 ซม.',tone:'roof'},
] as const;
export function waterLevelFor(level:number|null|undefined){if(level===null||level===undefined)return undefined;if(level<10)return waterLevels[0];if(level<=50)return waterLevels[1];if(level<=100)return waterLevels[2];if(level<=130)return waterLevels[3];if(level<=180)return waterLevels[4];return waterLevels[5];}
export function waterLevelLabel(level:number|null|undefined,fallback='—'){const band=waterLevelFor(level);return band?`${band.label} (${band.range})`:fallback;}
export function situationPriority(status:Status){return status==='critical'?4:status==='watch'?3:status==='missing'?1:2;}
export function productionLabel(value:string|undefined,fallback='—'){
 if(!value||value==='ยังไม่ทราบ')return fallback;
 if(['ปกติ','ทำการผลิตได้ปกติ'].includes(value))return 'ไม่กระทบต่อกระบวนการผลิต';
 if(value==='กระทบบางส่วน')return 'กระทบกระบวนการผลิต';
 if(value==='หยุดการผลิต')return 'หยุดกระบวนการผลิต';
 return value;
}
export function transportLabel(value:string|undefined,fallback='—'){return !value||value==='ยังไม่ทราบ'?fallback:value;}
export function attendanceLabel(value:string|undefined,fallback='—'){return value||fallback;}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function dateLabel(date:string){const [year,month,day]=date.split('-');return year&&month&&day?`${day}/${month}/${year}`:date;}
export function timeLabel(iso:string){return new Date(iso).toLocaleTimeString('th-TH',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit'});}
export function latestFor(rows:Report[],code:string,date:string){return rows.filter(r=>r.company===code&&r.date===date).sort((a,b)=>b.observed.localeCompare(a.observed)||b.submitted.localeCompare(a.submitted))[0];}
export function attentionFor(rows:Report[],currentDay:string){
 const rank:Record<Status,number>={critical:4,warning:3,watch:2,normal:1,missing:0};
 return companies.map(([code,name])=>{
  const r=rows.filter(x=>x.company===code&&x.date<=currentDay).sort((a,b)=>b.observed.localeCompare(a.observed)||b.submitted.localeCompare(a.submitted))[0];
  const stale=!r||r.date!==currentDay;
  const impact=!!r&&(['ผ่านได้บางประเภท','ผ่านไม่ได้'].includes(r.road)||['มาทำงานไม่ได้','มาทำงานได้แต่ต้องใช้แผนฉุกเฉิน (รถรับส่ง)'].includes(r.attendance)||['กระทบบางส่วน','กระทบการผลิตบางส่วน','หยุดการผลิต','กระทบกระบวนการผลิต','หยุดกระบวนการผลิต'].includes(r.production)||['ล่าช้า','เข้า–ออกไม่ได้'].includes(r.transport));
  const risk=!!r&&['watch','warning','critical'].includes(r.status);
  return {code,name,r,stale,impact,risk};
 }).filter(x=>x.stale||x.risk||x.impact).sort((a,b)=>Number(a.stale)-Number(b.stale)||(rank[b.r?.status??'missing']-rank[a.r?.status??'missing'])||Number(b.impact)-Number(a.impact)||((b.r?.level??-1)-(a.r?.level??-1))||a.code.localeCompare(b.code));
}
export function trendFor(rows:Report[],r:Report|undefined){if(!r||r.level===null)return null;const prev=rows.filter(p=>p.company===r.company&&p.point===r.point&&p.level!==null&&p.observed<r.observed).sort((a,b)=>b.observed.localeCompare(a.observed))[0];return prev?{diff:r.level-prev.level!,date:prev.date}:null;}
