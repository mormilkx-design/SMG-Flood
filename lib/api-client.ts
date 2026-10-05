export class ApiError extends Error {
  constructor(message:string, public code:string='request_failed'){super(message);}
}
export async function readApiResponse<T>(response:Response):Promise<T>{
 const contentType=response.headers.get('content-type')??'';
 if(response.redirected||response.status===401||response.status===403){
   if(!contentType.includes('application/json'))throw new ApiError('การเข้าสู่ระบบอาจหมดอายุ กรุณาเปิด Dashboard ในแท็บใหม่และเข้าสู่ระบบอีกครั้ง ข้อมูลในแบบฟอร์มยังอยู่','sign_in_required');
 }
 if(!contentType.includes('application/json')){
   throw new ApiError(response.status===413?'ภาพมีขนาดใหญ่เกินกว่าระบบรับได้ กรุณาลดขนาดภาพและลองใหม่':`ระบบส่งคำตอบที่ไม่ใช่ข้อมูลรายงานกลับมา (HTTP ${response.status}) กรุณาลองใหม่ หรือเปิด Dashboard ในแท็บใหม่ ข้อมูลในแบบฟอร์มยังอยู่`,'non_json_response');
 }
 let data:unknown;
 try{data=JSON.parse(await response.text());}catch{throw new ApiError('ระบบตอบกลับข้อมูลไม่สมบูรณ์ กรุณาลองใหม่','invalid_json');}
 if(!data||typeof data!=='object')throw new ApiError('รูปแบบข้อมูลที่ได้รับไม่ถูกต้อง','invalid_response');
 if(!response.ok){const message=(data as {error?:unknown}).error;throw new ApiError(typeof message==='string'?message:'ไม่สามารถดำเนินการได้ กรุณาลองใหม่',response.status===401?'sign_in_required':'request_failed');}
 return data as T;
}
