import {companies,statuses,Report,Status,dateLabel,timeLabel,latestFor,situationPriority,productionLabel,transportLabel,attendanceLabel,waterLevelFor} from '../lib/flood';
import {companyLogos} from '../lib/company-logos';
import {photoPointLabel} from '../lib/report-photos';
export default function PrintReport({rows,date}:{rows:Report[];date:string}){
 const records=companies.map(([code,name])=>({code,name,r:latestFor(rows,code,date)})).sort((a,b)=>situationPriority(b.r?.status??'missing')-situationPriority(a.r?.status??'missing'));
 // Compact three-column cards, keeping each row together on A4.
 const companiesPerPage=9;
 const groups=Array.from({length:Math.ceil(records.length/companiesPerPage)},(_,page)=>records.slice(page*companiesPerPage,(page+1)*companiesPerPage));
 const count=(status:Status)=>records.filter(x=>(x.r?.status??'missing')===status).length;
 const latest=records.flatMap(x=>x.r?[x.r.submitted]:[]).sort().at(-1);
 return <div className="pdf-report">{groups.map((group,page)=><section className="pdf-sheet" key={page}>
 <header className="pdf-heading"><div className="pdf-brand-block"><img src="/logos/smg.png" alt="โลโก้ SMG Manufacturing Club"/><div><p>SMG MANUFACTURING CLUB</p><h1>สถานการณ์น้ำท่วม</h1><h2>ภาพรวม {companies.length} บริษัท</h2></div></div><div className="pdf-date"><b>{dateLabel(date)}</b><span>{latest?`รายงานล่าสุด ${timeLabel(latest)} น.`:'ยังไม่มีรายงานในวันที่เลือก'}</span><small>หน้า {page+1} / {groups.length}</small></div></header>
 <div className={`pdf-alert ${count('critical')?'critical':''}`}><b>{count('critical')?`วิกฤต ${count('critical')} บริษัท · ต้องติดตามเร่งด่วน`:'สรุปสถานการณ์จากรายงานประจำวัน'}</b><span>ส่งรายงานแล้ว {companies.length-count('missing')} / {companies.length} บริษัท · รอรายงาน {count('missing')} บริษัท</span></div>
 <div className="pdf-section-title">ภาพรวมสถานการณ์ · บริษัทลำดับ {page*companiesPerPage+1}–{page*companiesPerPage+group.length}</div><div className="pdf-status-grid">{(['critical','watch','normal','warning','missing'] as Status[]).map(status=><div key={status} className={`pdf-status ${status}`}><span>{statuses[status].label}</span><b>{count(status)} <small>บริษัท</small></b></div>)}</div>
 <div className="pdf-company-grid two-page">{Array.from({length:Math.ceil(group.length/3)},(_,row)=><div className="pdf-company-row" key={row}>{group.slice(row*3,row*3+3).map(({code,name,r},column)=>{const i=row*3+column;return <article key={code} className={`pdf-company ${r?.status??'missing'}`}>
 <div className="pdf-company-title"><div className="pdf-title-row"><span className="pdf-index">{page*companiesPerPage+i+1}</span><b>{code}</b>{companyLogos[code]&&<img src={companyLogos[code].src} alt={`โลโก้ ${code}`} loading="eager"/>}</div><p>{name}</p></div>
 <div className={`pdf-photos ${!r?.photos.length?'empty':''} ${r?.photos.length===1?'single':''} ${r&&r.photos.length>2?'many':''}`}>{r?.photos.length?r.photos.map((id,j)=><figure key={id} style={{width:`${100/r.photos.length}%`}}><img src={`/api/photos/${id}`} alt={`${code} ${photoPointLabel(r.photoPoints?.[j])}`} loading="eager"/><figcaption>{r.photoPoints?.[j]==='exterior'?'หน้าบริษัท / ภายนอก':r.photoPoints?.[j]==='entrance'?'ออฟฟิศ / ประตูโรงงาน':'ภาพเดิม / ไม่ระบุจุด'}</figcaption></figure>):<div className="pdf-no-photo">{r?'ยังไม่มีภาพหลักฐาน':'รอภาพรายงานจากบริษัท'}</div>}</div>
 <div className="pdf-risk-row"><div className="pdf-company-status">สถานการณ์: {statuses[r?.status??'missing'].label}</div><div className="pdf-risk-score">RISK SCORE <b>{r?.riskScore==null?'—':`${r.riskScore}/10`}</b></div></div>
 <div className="pdf-company-facts"><p><span>ทางเข้า–ออก</span><b>{r?.road??'ยังไม่มีข้อมูล'}</b></p><p><span>พนักงาน</span><b>{attendanceLabel(r?.attendance,'—')}</b></p><p><span>การผลิต</span><b>{productionLabel(r?.production,'—')}</b></p><p><span>การจัดส่ง (ลูกค้า)</span><b>{transportLabel(r?.transport,'—')}</b></p><p><span>จุดวัด</span><b>{r?.point??'—'}</b></p><p><span>เวลาสำรวจ</span><b>{r?timeLabel(r.observed)+' น.':'—'}</b></p></div>
 <div className="pdf-water"><span>ระดับน้ำ</span><strong className="pdf-water-band">{waterLevelFor(r?.level)?.label??'—'} <small>{waterLevelFor(r?.level)?.range??''}</small></strong></div>
 </article>;})}</div>)}</div>
 <footer className="pdf-footer"><b>SMG MANUFACTURING CLUB · รายงานวันที่ {dateLabel(date)} · หน้า {page+1} / {groups.length}</b><span>ระดับน้ำแสดงตามช่วงที่บริษัทเลือก · — = ยังไม่มีรายงาน · เวลาประเทศไทย</span></footer>
 </section>)}</div>;
}
