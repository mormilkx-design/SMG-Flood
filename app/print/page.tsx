import {today} from '@/lib/flood';
import PrintView from './print-view';

export default async function PrintPage({searchParams}:{searchParams:Promise<{date?:string}>}){
 const params=await searchParams;
 const selected=/^\d{4}-\d{2}-\d{2}$/.test(params.date??'')?params.date!:today();
 return <PrintView date={selected}/>;
}
