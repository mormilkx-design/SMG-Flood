import type {Status} from './flood';

export type RiskThresholds={watch:number;warning:number;critical:number};
export type RiskInput={
 company:string;
 level:number;
 declaredStatus:Status;
 attendance:string;
 production:string;
 transport:string;
 previousLevel:number|null;
};
export type RiskResult={status:Exclude<Status,'missing'>;score:number;rawScore:number;reasons:string[];trend:'up'|'steady'|'down'|'unknown';thresholds:RiskThresholds};

const defaults:RiskThresholds={watch:10,warning:50,critical:100};

// Ready for company-specific overrides. All 19 companies start with the same
// thresholds that match the water-depth bands currently used by the form.
export const companyRiskThresholds:Record<string,RiskThresholds>={};

export function thresholdsFor(company:string):RiskThresholds{
 return companyRiskThresholds[company]??defaults;
}

export function calculateRisk(input:RiskInput):RiskResult{
 const thresholds=thresholdsFor(input.company);
 const trend=input.previousLevel===null?'unknown':input.level>input.previousLevel?'up':input.level<input.previousLevel?'down':'steady';
 let rawScore=0;
 const reasons:string[]=[];
 if(input.level>=thresholds.watch){rawScore+=2;reasons.push(`ระดับน้ำถึงเกณฑ์เฝ้าระวัง ${thresholds.watch} ซม. (+2)`);}
 if(trend==='up'){rawScore+=2;reasons.push('ระดับน้ำเพิ่มขึ้นจากรายงานก่อนหน้า (+2)');}
 if(input.attendance==='มาทำงานไม่ได้'){rawScore+=4;reasons.push('พนักงานมาทำงานไม่ได้ (+4)');}
 else if(input.attendance==='มาทำงานได้แต่ต้องใช้แผนฉุกเฉิน (รถรับส่ง)'){rawScore+=2;reasons.push('ต้องใช้แผนฉุกเฉินสำหรับพนักงาน (+2)');}
 if(['กระทบการผลิตบางส่วน','กระทบกระบวนการผลิต'].includes(input.production)){rawScore+=4;reasons.push('กระทบกระบวนการผลิต (+4)');}
 if(input.transport==='เข้า–ออกไม่ได้'){rawScore+=4;reasons.push('การจัดส่งเข้า–ออกไม่ได้ (+4)');}
 else if(input.transport==='ล่าช้า'){rawScore+=2;reasons.push('การจัดส่งล่าช้า (+2)');}

 const score=Math.min(10,rawScore);
 const stopped=['หยุดการผลิต','หยุดกระบวนการผลิต'].includes(input.production);
 if(input.level>=thresholds.critical||input.declaredStatus==='critical'||stopped){
  if(input.level>=thresholds.critical)reasons.unshift(`ระดับน้ำถึงเกณฑ์วิกฤต ${thresholds.critical} ซม.`);
  if(input.declaredStatus==='critical')reasons.unshift('ผู้รายงานประเมินว่าวิกฤต');
  if(stopped)reasons.unshift('หยุดกระบวนการผลิต');
  return {status:'critical',score,rawScore,reasons,trend,thresholds};
 }
 if(input.level>=thresholds.warning||input.declaredStatus==='warning'){
  if(input.level>=thresholds.warning)reasons.unshift(`ระดับน้ำถึงเกณฑ์มีผลกระทบ ${thresholds.warning} ซม.`);
  if(input.declaredStatus==='warning')reasons.unshift('ผู้รายงานประเมินว่ามีผลกระทบ');
  return {status:'warning',score,rawScore,reasons,trend,thresholds};
 }
 return {status:score>=6?'warning':score>=3?'watch':'normal',score,rawScore,reasons,trend,thresholds};
}
