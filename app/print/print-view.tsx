"use client";

import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Loader2,Printer,RefreshCw,Share2} from 'lucide-react';
import PrintReport from '../print-report';
import {fetchReports} from '@/lib/supabase-browser';
import {dateLabel,Report} from '@/lib/flood';

export default function PrintView({date}:{date:string}){
 const [rows,setRows]=useState<Report[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const previewRef=useRef<HTMLDivElement>(null);
 const reportRef=useRef<HTMLDivElement>(null);
 const [previewSize,setPreviewSize]=useState({scale:1,height:0});

 async function load(){
  setLoading(true);setError('');
  try{const data=await fetchReports();if(!Array.isArray(data.reports))throw Error('ข้อมูลรายงานไม่ถูกต้อง');setRows(data.reports as Report[]);}
  catch(e){setError(e instanceof Error?e.message:'โหลดข้อมูลสำหรับพิมพ์ไม่สำเร็จ');}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load();},[]);
 useEffect(()=>{
  const viewport=previewRef.current,report=reportRef.current;
  if(!viewport||!report)return;
  const resize=()=>{
   const scale=Math.min(1.5,viewport.clientWidth/report.offsetWidth);
   setPreviewSize({scale,height:report.offsetHeight*scale});
  };
  const observer=new ResizeObserver(resize);
  observer.observe(viewport);observer.observe(report);resize();
  return ()=>observer.disconnect();
 },[loading,error]);

 function print(){window.print();}
 async function share(){
  if(!navigator.share)return;
  try{await navigator.share({title:`SMG Flood Report ${dateLabel(date)}`,url:window.location.href});}catch{/* User cancelled the share sheet. */}
 }

 return <main className="print-preview-page">
  <header className="print-preview-toolbar">
   <button type="button" className="btn secondary" onClick={()=>history.back()}><ArrowLeft size={17}/>กลับ</button>
   <div><b>ตัวอย่างรายงาน PDF</b><span>วันที่ {dateLabel(date)}</span></div>
   <button type="button" className="btn secondary print-share-button" onClick={()=>void share()}><Share2 size={17}/>แชร์</button>
   <button type="button" className="btn primary" disabled={loading||!!error} onClick={print}><Printer size={17}/>พิมพ์ / บันทึก PDF</button>
  </header>
  <p className="print-mobile-help">หากกดพิมพ์แล้วไม่เปิดเมนู ให้เปิดหน้านี้ใน Safari หรือ Chrome จากนั้นเลือก Share → Print หรือ Save as PDF</p>
  {loading&&<div className="print-preview-state"><Loader2 className="spin"/>กำลังเตรียมรายงาน…</div>}
  {error&&<div className="print-preview-state error"><span>{error}</span><button type="button" className="btn secondary" onClick={()=>void load()}><RefreshCw size={16}/>ลองใหม่</button></div>}
  {!loading&&!error&&<div ref={previewRef} className="print-preview-document"><div className="print-preview-fit" style={{height:previewSize.height||undefined}}><div ref={reportRef} className="print-preview-scaled" style={{transform:`scale(${previewSize.scale})`}}><PrintReport rows={rows} date={date}/></div></div></div>}
 </main>;
}
