export const photoPointLabels={exterior:'ด้านหน้าบริษัท (ภายนอก ดูการสัญจร)',entrance:'ด้านออฟฟิศ / ด้านหน้าประตูโรงงาน'} as const;
export type PhotoPoint=keyof typeof photoPointLabels;
export function photoPointLabel(point:string|undefined){return point&&Object.prototype.hasOwnProperty.call(photoPointLabels,point)?photoPointLabels[point as PhotoPoint]:'ภาพเดิม (ไม่ระบุจุด)';}
export function validatePhotoCounts(exterior:number,entrance:number){return exterior>=1&&exterior<=3&&entrance>=1&&entrance<=3;}
