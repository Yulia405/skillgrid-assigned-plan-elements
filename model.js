export const LIMIT=100, PAGE_SIZE=20;
import {TEMPLATES,STATUS_LABELS,addDays} from './list-model.js';
export const TEMPLATE='Адаптация сотрудника производства';
export const elements=[
 {id:'t1/s1/e1',type:'Курс',name:'Охрана труда — 2025',stage:'Первая неделя',material:501},
 {id:'t1/s3/e8',type:'Курс',name:'Охрана труда — 2025',stage:'Повторный инструктаж',material:501},
 {id:'t1/s1/e2',type:'Статья',name:'Безопасность на производстве',stage:'Первая неделя',material:502},
 {id:'t1/s1/e3',type:'Задача',name:'Познакомиться с командой',stage:'Первая неделя',material:503},
 {id:'t1/s2/e4',type:'Файл',name:'Инструкция по работе с оборудованием',stage:'Первый месяц',material:504},
 {id:'t1/s2/e5',type:'Опрос',name:'Первые впечатления',stage:'Первый месяц',material:505},
 {id:'t1/s4/e6',type:'Курс',name:'Архивный вводный инструктаж',stage:'Завершение адаптации',material:506,unavailable:true}
];
const names=['Александр','Анна','Дмитрий','Елена','Иван','Мария','Михаил','Ольга','Павел','Светлана','Сергей','Татьяна','Андрей','Виктория','Роман','Наталья','Максим','Юлия','Артём','Екатерина'];
const surnames=['Соколов','Кузнецов','Волков','Морозов','Новиков','Белов','Орлов','Лебедев','Ковалёв','Смирнов','Фролов','Павлов'];
const mainReasons=[...Array(13).fill('ready'),...Array(3).fill('started'),...Array(2).fill('done'),'missing','ambiguous'];
export const plans=Array.from({length:240},(_,i)=>{const k=i%20;const n=names[k];const s=surnames[(i*7+Math.floor(i/20))%12]+(k%2?'а':'');return {id:i+1,name:n+' '+s,initials:n[0]+s[0],position:k%2?'Оператор производственной линии':'Специалист производства',department:k%3?'Производственный департамент':'Служба охраны труда',reason:i>=220&&k<10?'closed':mainReasons[k],status:i>=220&&k<10?'Завершён':k%6===0?'Не начат':'В работе',start:'2026-10-'+String(1+i%20).padStart(2,'0'),finish:'2027-01-20',oldDeadline:'2026-11-05',required:k%4!==0};});
for(const p of plans){const t=TEMPLATES[p.id<=160?0:p.id<=220?1:2];p.template=t.name;p.templateId=t.id;p.statusCode=p.reason==='closed'?['finished','failed','cancelled'][p.id%3]:p.id>20&&p.id%13===0?'on_review':p.id>20&&p.id%17===0?'returned':p.id%20%6===1?'created':'started';p.status=STATUS_LABELS[p.statusCode];p.finish=p.templateId==='t1'?'2027-01-20':p.templateId==='t2'?'2026-12-31':'2027-02-28';p.oldDeadline=addDays(p.start,5);p.existingMaterials=p.id%20<4&&p.id%20>0?[501,901]:['missing','ambiguous'].includes(p.reason)?[]:[501];}
for(const p of plans)p.seedMaterials=[...p.existingMaterials];
export const STAGES=[{id:'t1/s1',templateId:'t1',name:'Первая неделя',from:0,to:14},{id:'t1/s2',templateId:'t1',name:'Первый месяц',from:15,to:30},{id:'t1/s3',templateId:'t1',name:'Повторный инструктаж',from:30,to:45},{id:'t1/s4',templateId:'t1',name:'Завершение адаптации',from:60,to:90},{id:'t2/s1',templateId:'t2',name:'Знакомство с компанией',from:0,to:14},{id:'t3/s1',templateId:'t3',name:'Вступление в должность',from:0,to:30}];
export function stageDates(p,stage){return {start:addDays(p.start,stage.from),finish:[addDays(p.start,stage.to),p.finish].sort()[0]};}
export const stageForElement=el=>STAGES.find(s=>el.id.startsWith(s.id+'/'))||STAGES.find(s=>s.templateId==='t1');
export function initialAddConfig(){return {type:'Курс',material:null,title:'',description:'',required:false,dateMode:'days',days:7,date:'2026-10-25',duplicateDecision:null};}
export function validateAdd(c){if(c.type==='Задача'&&!c.title.trim())return 'Введите название задачи';if(c.type!=='Задача'&&!c.material)return 'Выберите материал';if(c.dateMode==='date'&&!c.date)return 'Укажите срок элемента';if(c.dateMode==='days'&&(!Number.isInteger(Number(c.days))||Number(c.days)<0))return 'Укажите целое количество дней от 0';return '';}
export function addRows(ids,stage,c,excluded=new Set()){if(ids.length>LIMIT)throw Error('Можно выбрать не более 100 планов');return ids.map(id=>{const p=plans.find(p=>p.id===id),dates=stageDates(p,stage),deadline=c.dateMode==='none'?null:dateFor(p,c);let reason=p.reason==='closed'?'closed':p.templateId!==stage.templateId?'stageMissing':deadline&&deadline>p.finish?'planDate':deadline&&deadline>dates.finish?'date':deadline&&deadline<dates.start?'beforeStage':null;const duplicate=c.material&&p.existingMaterials.includes(c.material.id);if(!reason&&duplicate&&c.duplicateDecision!=='allow')reason='duplicate';return {plan:p,status:reason?'skip':excluded.has(id)?'excluded':'change',reason:reason||undefined,duplicate:Boolean(duplicate),deadline,stageDates:dates};});}
export const reasonLabels={started:'Прохождение элемента уже начато',done:'Элемент выполнен',closed:'План закрыт',missing:'Элемент не найден',ambiguous:'Не удалось однозначно определить элемент',newCourse:'Новый курс уже пройден — требуется отдельная проверка',denied:'Недостаточно прав',stale:'Данные изменились после проверки',date:'Срок элемента позже окончания этапа',excluded:'Исключено вами'};
export function availableOps(el){return el.type==='Задача'?['task','required','deadline']:['replace','required','deadline'];}
export function dateFor(plan,config){if(config.dateMode==='none')return 'Без срока';if(config.dateMode==='date')return config.date;const d=new Date(plan.start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+Number(config.days));return d.toISOString().slice(0,10);}
export function validate(config,el){if(!el)return 'Выберите элемент';if(config.op==='replace'&&(!config.replacement||config.replacement.id===el.material))return 'Выберите другой материал';if(config.op==='required'&&config.required===null)return 'Выберите обязательность';if(config.op==='deadline'){if(config.dateMode==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(config.date))return 'Укажите дату';if(config.dateMode==='days'&&(!Number.isInteger(Number(config.days))||Number(config.days)<0))return 'Укажите целое число дней от 0';}if(config.op==='task'){if(!config.changeName&&!config.changeDescription)return 'Выберите хотя бы одно поле';if(config.changeName&&!config.title.trim())return 'Название не может быть пустым';if(config.changeDescription&&!config.description.trim()&&!config.clearDescription)return 'Введите описание или явно выберите очистку';}return '';}
export function classify(ids,el,config,excluded=new Set(),special=''){
 if(ids.length>LIMIT)throw new Error('Можно выбрать не более 100 планов');
 return ids.map(id=>{const p=plans.find(p=>p.id===id);let reason=p.reason; if(el.unavailable)reason='done';else if(el.id!=='t1/s1/e1'&&reason==='ambiguous')reason='missing';
 if(special==='zero'&&reason==='ready')reason='started';if(special==='stale'&&id===ids[0])reason='stale';if(special==='newCourse'&&id===ids[0])reason='newCourse';
 if(reason!=='ready')return {plan:p,status:'skip',reason};
 if(excluded.has(id))return {plan:p,status:'excluded',reason:'excluded'};
 if(config.op==='required'&&p.required===config.required)return {plan:p,status:'same'};
 if(p.templateId!==stageForElement(el).templateId)return {plan:p,status:'skip',reason:'missing'};
 if(config.op==='deadline'&&config.dateMode!=='none'){const d=dateFor(p,config),s=stageDates(p,stageForElement(el));if(d>p.finish)return {plan:p,status:'skip',reason:'planDate'};if(d>s.finish)return {plan:p,status:'skip',reason:'date'};if(d<s.start)return {plan:p,status:'skip',reason:'beforeStage'};}
 return {plan:p,status:'change'};});
}
export function totals(rows){return Object.fromEntries(['change','same','skip','excluded'].map(s=>[s,rows.filter(r=>r.status===s).length]));}
export const initialConfig=()=>({op:'replace',replacement:null,required:null,dateMode:'date',date:'2026-11-10',days:14,changeName:false,title:'Познакомиться с командой',changeDescription:false,description:'',clearDescription:false});
export function execute(rows,partial=false){let eligible=rows.filter(r=>r.status==='change'),n=eligible.length;return rows.map(r=>{if(r.status!=='change')return {...r,result:'unchanged'};const at=eligible.indexOf(r);if(partial&&n>=4&&at>=n-2)return {...r,result:'error',message:'Не удалось сохранить изменение'};if(partial&&n>=4&&at>=n-4)return {...r,result:'unchanged',reason:'stale'};return {...r,result:'success'};});}
