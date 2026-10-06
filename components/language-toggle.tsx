"use client";

import {Languages} from "lucide-react";
import {useEffect,useState} from "react";

type Language="th"|"en";

const translations:Record<string,string>={
 "เปิดรับรายงานทั่วไป":"Public reporting enabled","เข้าสู่ระบบแล้ว":"Signed in","บัญชี":"Account","ยืนยันอีเมล / เข้าสู่ระบบ":"Verify email / Sign in",
 "ภาพรวมสถานการณ์":"Situation overview","สถานะรายงาน":"Report status","ข้อมูลย้อนหลัง":"History","CCTV ดอนหัวฬ่อ":"Don Hua Lo CCTV","เวลาไทย (UTC+7)":"Thailand time (UTC+7)",
 "ภาพรวมสถานการณ์น้ำท่วม":"Flood Situation Overview","พิมพ์ / PDF":"Print / PDF","ส่งรายงานประจำวัน":"Create Daily Report","วันที่รายงาน":"Report date","รายงานล่าสุด":"Latest report","ยังไม่มีรายงานในวันที่เลือก":"No reports for the selected date","กำลังโหลดข้อมูล":"Loading data","กรองบริษัท":"Filter company","บริษัททั้งหมด (ไม่กรอง)":"All companies","เลือกบริษัทที่ต้องการส่งรายงาน":"Select a company","บริษัทที่เลือกไว้":"Selected company","อัตโนมัติ":"Automatic",
 "บริษัททั้งหมด":"All companies","รายงานแล้ว":"Reported","ปกติ":"Normal","เฝ้าระวัง":"Monitoring","มีผลกระทบ":"Affected","วิกฤต":"Critical","ยังไม่รายงาน":"Not reported","บริษัท":"companies",
 "รอภาพรายงาน":"Waiting for report photos","รอภาพจากบริษัท":"Waiting for company photos","ภาพหน้าบริษัทประจำวัน":"Daily company photos","ยังไม่มีภาพหลักฐาน":"No evidence photos","ยังไม่มีข้อมูล":"No data","ทางเข้า":"Access","ทางเข้า–ออก":"Traffic Accessibility","พนักงาน":"Employees","การผลิต":"Production","การจัดส่ง":"Delivery","การจัดส่ง (ลูกค้า)":"Delivery (customer)","ระดับน้ำ":"Water level","จุดวัด":"Measurement point","เวลาสำรวจ":"Survey time","รายละเอียด":"Details","ดูข้อมูล":"View details",
 "บริษัทที่ต้องติดตาม":"Companies requiring attention","รอรายงาน":"Awaiting reports","ส่งรายงานครบแล้ว":"All reports submitted","เปรียบเทียบแนวโน้มระดับน้ำ":"Compare water-level trends","ย้อนหลัง 7 วัน ณ วันที่เลือก":"Previous 7 days from selected date","สถานะการส่งรายงาน":"Reporting status","ทุกสถานะ":"All statuses","ประวัติระดับน้ำและรายงาน":"Water-level and report history","เก็บทุกรอบที่ส่ง โดยไม่เขียนทับรายงานเดิม":"Every submission is retained; previous reports are not overwritten","ประวัติการรายงาน":"Report history","ดูรูป":"View photos",
 "รายละเอียดบริษัท":"Company details","สถานะวิกฤต · ต้องติดตามเร่งด่วน":"Critical · Urgent attention required","รายละเอียดสถานการณ์":"Situation details","ไม่มีรายละเอียดเพิ่มเติม":"No additional details","ความช่วยเหลือที่ต้องการ":"What kind of assistance do you need?","แนวโน้มระดับน้ำ 7 วัน":"7-day water-level trend","บริษัทนี้ยังไม่ได้ส่งรายงานในวันที่เลือก":"This company has not submitted a report for the selected date","ส่งรายงาน":"Create Report",
 "ตรวจสอบก่อนส่งรายงาน":"Review before submission","รายงานสถานการณ์ประจำวัน":"Create Daily Report","บันทึกข้อมูลจริงพร้อมภาพหลักฐาน • อัปเดตเพิ่มเติมได้โดยเก็บรายงานเดิมไว้":"Record actual data with evidence photos • New submissions retain previous reports","1 ข้อมูลและรูปภาพ":"1 Data and photos","2 ตรวจสอบและส่ง":"2 Review and submit","ส่งรายงานได้โดยไม่ต้องเข้าสู่ระบบ":"Reports can be submitted without signing in","วันที่รายงาน (วัน/เดือน/ปี)":"Report date (day/month/year)","เวลาสำรวจ (เวลาไทย)":"Survey time (Thailand)","จุดวัดน้ำ":"Water measurement point","ทางเข้าหลัก":"Main Entrance","เช่น ทางเข้าหลัก":"e.g. Main Entrance","สถานการณ์ที่บริษัทประเมิน (ระบบคำนวณผลสุดท้าย)":"Company Assessment (Final status is calculated automatically)",
 "1. ข้อมูลบริษัทและรายงาน":"1. Company and Report Information","2. การประเมินสถานการณ์และผลกระทบต่อการดำเนินงาน":"2. Company Assessment and Operational Impact","3. ระดับน้ำและรายละเอียดสถานการณ์":"3. Water Level and Situation Details","4. ภาพหลักฐาน":"4. Photos","การมาทำงานของพนักงาน":"Employee Attendance / Work Availability","ผลกระทบต่อการผลิต":"Production Impact","การจัดส่ง (ผลกระทบลูกค้า)":"Delivery (customer impact)","รายละเอียดสถานการณ์ / เส้นทาง":"Situation / route details","ระบุจุดน้ำขัง ถนน และประเภทรถที่ตรวจสอบได้":"Specify flooded areas, roads, and vehicle types checked","ระบุหากต้องการความช่วยเหลือ":"Specify any assistance required","ข้อมูลจะบันทึกหลังยืนยันส่ง":"Data is saved after confirmation","ตรวจสอบรายงาน":"Review report","วันที่ / เวลาสำรวจ":"Date / survey time","สถานการณ์":"Situation","ความช่วยเหลือ":"Assistance","กลับไปแก้ไข":"Back to edit","กำลังบันทึก…":"Saving…","ยืนยันส่งรายงาน":"Create Daily Report","ผู้ส่งรายงานทั่วไป":"Public reporter",
 "ด้านหน้าบริษัท (ภายนอก ดูการสัญจร)":"Front of company (outside / traffic conditions)","ด้านออฟฟิศ / ด้านหน้าประตูโรงงาน":"Office / factory entrance","ภาพเดิม (ไม่ระบุจุด)":"Previous photo (location unspecified)","หน้าบริษัท / ภายนอก":"Company front / outside","ออฟฟิศ / ประตูโรงงาน":"Office / factory entrance","ภาพเดิม / ไม่ระบุจุด":"Previous photo / unspecified location","ต้องแนบจุดละ 1–3 ภาพ • JPEG, PNG, WebP • ไม่เกินภาพละ 5 MB":"Attach 1–3 photos per location • JPEG, PNG, WebP • Max. 5 MB each",
 "แห้ง / ต่ำกว่าข้อเท้า":"Dry / below ankle","ข้อเท้า–เข่า":"Ankle–knee","เข่า–เอว":"Knee–waist","เอว–อก":"Waist–chest","อกขึ้นไป":"Above chest","มิดหัว / ท่วมหลังคา":"Over head / roof level","ซม.":"cm","หน่วย: เซนติเมตร":"Unit: centimetres",
 "ผ่านได้":"Passable","ผ่านได้บางประเภท":"Passable for Certain Vehicle Types Only","ผ่านไม่ได้":"Impassable","ยังไม่ตรวจสอบ":"Not checked","มาทำงานได้ปกติ":"Available for Work","มาทำงานไม่ได้":"Unavailable for Work","มาทำงานได้แต่ต้องใช้แผนฉุกเฉิน (รถรับส่ง)":"Available for Work via Emergency Transportation Plan","ไม่กระทบต่อกระบวนการผลิต":"No Production Impact","กระทบการผลิตบางส่วน":"Some Production Impact","กระทบกระบวนการผลิต":"Production affected","หยุดกระบวนการผลิต":"Stop line production","ไม่มีผลกระทบ":"No impact","ล่าช้า":"Delivery Delayed","เข้า–ออกไม่ได้":"Can Not Delivery",
 "ยังเปรียบเทียบไม่ได้":"Insufficient data","คงที่":"Steady","เพิ่ม":"Up","ลด":"Down","น้ำกำลังขึ้น":"Rising","ทรงตัว":"Steady","กำลังลด":"Falling","สรุปสถานการณ์จากรายงานประจำวัน":"Daily report summary","ต้องติดตามเร่งด่วน":"Urgent attention required","รอภาพรายงานจากบริษัท":"Waiting for company report photos",
 "กำลังตรวจสอบสิทธิ์…":"Checking access…","กรุณาเลือกบริษัท":"Please select a company","กรุณาแนบภาพทั้ง 2 จุด จุดละ 1–3 ภาพ":"Please attach 1–3 photos for each of the two locations","บันทึกรายงานเรียบร้อย":"Report saved successfully","ส่งรายงานไม่สำเร็จ":"Report submission failed","ไม่สามารถโหลดข้อมูลได้":"Unable to load data","ลองใหม่":"Try again","ปิด":"Close"
};

const originalText=new WeakMap<Text,string>();
const originalAttributes=new WeakMap<Element,Map<string,string>>();

function translated(value:string){
 const leading=value.match(/^\s*/)?.[0]??"";
 const trailing=value.match(/\s*$/)?.[0]??"";
 const core=value.slice(leading.length,value.length-trailing.length);
 if(!core)return value;
 let output=translations[core]??core;
 if(output===core){
  output=output
   .replace(/^ภาพรวม (\d+) บริษัท$/,(_,n)=>`Overview of ${n} companies`)
   .replace(/^หน้า (\d+) \/ (\d+)$/,(_,a,b)=>`Page ${a} / ${b}`)
   .replace(/^ภาพที่ (\d+)$/,(_,n)=>`Photo ${n}`)
   .replace(/^รายงานล่าสุด (.+) น\.$/,(_,time)=>`Latest report ${time}`)
   .replace(/^ส่งรายงานแล้ว (\d+) \/ (\d+) บริษัท · รอรายงาน (\d+) บริษัท$/,(_,a,b,c)=>`${a} / ${b} companies reported · ${c} awaiting reports`)
   .replace(/^วิกฤต (\d+) บริษัท · ต้องติดตามเร่งด่วน$/,(_,n)=>`${n} critical ${Number(n)===1?'company':'companies'} · urgent attention required`)
   .replace(/^ภาพรวมสถานการณ์ · บริษัทลำดับ (.+)$/,(_,range)=>`Situation overview · Companies ${range}`)
   .replace(/^รายงานวันที่ (.+)$/,(_,date)=>`Report date ${date}`)
   .replace(/^เทียบกับ (.+) ณ จุดวัดเดียวกัน$/,(_,date)=>`Compared with ${date} at the same point`)
   .replace(/^เพิ่ม (\d+(?:\.\d+)?) ซม\.$/,(_,n)=>`Up ${n} cm`)
   .replace(/^ลด (\d+(?:\.\d+)?) ซม\.$/,(_,n)=>`Down ${n} cm`);
 }
 return leading+output+trailing;
}

function applyLanguage(language:Language,root:ParentNode=document.body){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node=walker.nextNode() as Text|null;
 while(node){
  const parent=node.parentElement;
  if(parent&&!['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName)){
   if(!originalText.has(node))originalText.set(node,node.data);
   const source=originalText.get(node)??node.data;
   node.data=language==='en'?translated(source):source;
  }
  node=walker.nextNode() as Text|null;
 }
 const elements=(root instanceof Element?[root,...Array.from(root.querySelectorAll('*'))]:Array.from(root.querySelectorAll('*')));
 for(const element of elements){
  for(const attribute of ['placeholder','aria-label','title']){
   if(!element.hasAttribute(attribute))continue;
   let values=originalAttributes.get(element);
   if(!values){values=new Map();originalAttributes.set(element,values);}
   if(!values.has(attribute))values.set(attribute,element.getAttribute(attribute)??'');
   const source=values.get(attribute)??'';
   element.setAttribute(attribute,language==='en'?translated(source):source);
  }
 }
}

export default function LanguageToggle(){
 const [language,setLanguage]=useState<Language>('en');
 useEffect(()=>{
  const saved=window.localStorage.getItem('smg-language-v2');
  if(saved==='th'||saved==='en')setLanguage(saved);
 },[]);
 useEffect(()=>{
  document.documentElement.lang=language;
  window.localStorage.setItem('smg-language-v2',language);
  applyLanguage(language);
  if(language!=='en')return;
  let translating=false;
  const observer=new MutationObserver(records=>{
   if(translating)return;
   translating=true;observer.disconnect();
   for(const record of records){
    if(record.type==='characterData'&&record.target.parentNode)applyLanguage(language,record.target.parentNode);
    for(const node of Array.from(record.addedNodes))if(node.nodeType===Node.ELEMENT_NODE)applyLanguage(language,node as Element);else if(node.nodeType===Node.TEXT_NODE&&node.parentNode)applyLanguage(language,node.parentNode);
   }
   observer.observe(document.body,{subtree:true,childList:true,characterData:true});translating=false;
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  return()=>observer.disconnect();
 },[language]);
 return <div className="language-switch" role="group" aria-label="เลือกภาษา / Choose language"><Languages size={16} aria-hidden="true"/><button type="button" className={language==='th'?'active':''} aria-pressed={language==='th'} onClick={()=>setLanguage('th')}>TH</button><span aria-hidden="true">/</span><button type="button" className={language==='en'?'active':''} aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>EN</button></div>;
}
