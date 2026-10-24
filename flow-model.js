// Local demonstration model. No LMS requests. Matching never relies on names or positions.
export const TODAY='2026-10-23';
export const TYPES=['Курс','Статья','Задача','Файл','Опрос','Ссылка'];
export const copy=v=>structuredClone(v);
export const SOURCE_DEFS=[
 {key:'t1/s1/e1',type:'Курс',name:'Охрана труда — 2025',id:501,stage:'a'},
 {key:'t1/s3/e8',type:'Курс',name:'Охрана труда — 2025',id:501,stage:'c'},
 {key:'t1/s1/e3',type:'Задача',name:'Познакомиться с командой',id:503,stage:'a',description:'Познакомьтесь с коллегами и обсудите план первой недели.'},
 {key:'t1/s2/e4',type:'Файл',name:'Инструкция по работе с оборудованием',id:504,stage:'b',format:'PDF',size:'240 КБ'},
 {key:'t1/s2/e5',type:'Опрос',name:'Первые впечатления',id:505,stage:'b'},
 {key:'t1/s1/e2',type:'Статья',name:'Безопасность на производстве',id:502,stage:'a'},
 {key:'t1/s1/link',type:'Ссылка',name:'Справочник нового сотрудника',id:507,stage:'a',url:'https://example.org/handbook',description:'Контакты и полезные материалы.'}
];
export const TASK_TEMPLATES=Object.freeze([
 Object.freeze({id:'template-101',type:'Задача',name:'Встреча с наставником',description:'Назначьте встречу с наставником. Обсудите цели и вопросы по адаптации.'}),
 Object.freeze({id:'template-102',type:'Задача',name:'Изучить рабочие процессы',description:'Изучите регламент команды и подготовьте вопросы для руководителя.'}),
 Object.freeze({id:'template-103',type:'Задача',name:'Обратная связь по первому месяцу',description:'Подготовьте обратную связь по итогам первого месяца.'})
]);
export const CATALOG={
 Курс:[{id:501,type:'Курс',name:'Охрана труда — 2025',description:'Текущий курс'},{id:900,type:'Курс',name:'Охрана труда — 2027',description:'Обновлённый курс · 45 минут'},{id:901,type:'Курс',name:'Охрана труда для руководителей',description:'Курс · 60 минут'}],
 Статья:[{id:502,type:'Статья',name:'Безопасность на производстве'},{id:920,type:'Статья',name:'Новые правила безопасности'}],
 Опрос:[{id:505,type:'Опрос',name:'Первые впечатления'},{id:940,type:'Опрос',name:'Обратная связь об адаптации'}],
 Файл:[{id:504,type:'Файл',name:'Инструкция по работе с оборудованием',format:'PDF',size:'240 КБ',description:'Инструкция для сотрудника.'},{id:930,type:'Файл',name:'Памятка нового сотрудника.pdf',format:'PDF',size:'180 КБ',description:'Тестовый файл. Контакты команды и порядок первого рабочего дня.'},{id:931,type:'Файл',name:'Чек-лист адаптации.xlsx',format:'XLSX',size:'48 КБ',description:'Тестовый файл. Чек-лист первого месяца.'}]
};
export function draftFor(type,op='draft'){return {id:`${op}-${type}`,type,name:'',description:'',url:'',...(type==='Задача'?{report_required:false}:{})};}
export function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
export function contentErrors(c){
 const e={};if(!c?.name?.trim())e.name=c?.type==='Задача'?'Введите название задачи':'Введите название';
 if(c?.type==='Ссылка'){try{const u=new URL(c.url);if(!['http:','https:'].includes(u.protocol)||!u.hostname||!/^https?:\/\//i.test(c.url))throw Error();}catch{e.url='Укажите корректную ссылку: https://example.org';}}
 if(c?.type==='Файл'&&!c.ready)e.file='Загрузите файл или выберите из загруженных';
 return e;
}
export function createFixtures(plans){return new Map(plans.map(p=>{
 const stage=(id,name,start,finish,sourceKey=id)=>({id:`p${p.id}/${id}`,sourceKey:sourceKey?`stage-${sourceKey}`:null,name,start,finish,owner:'adaptee',required:false});
 let stages=[stage('a','Первая неделя',p.start,'2026-10-20'),stage('b','Первый месяц','2026-10-21','2026-11-15'),stage('c','Повторный инструктаж','2026-11-16','2026-12-10'),stage('d','Завершение адаптации','2026-12-11',p.finish)];
 const k=(p.id-1)%20;
 if(k===1)stages[1]=stage('practice','Практика','2026-10-25','2026-11-15',null);
 if(k===2){stages[1].start='2026-10-20';stages[1].finish='2026-11-10';stages.push(stage('local-practice','Практика по безопасности','2026-10-28','2026-11-20',null));}
 if(k===3){stages[1].start='2026-11-05';stages[1].name='Обучение с наставником';}
 if(k===4)stages=stages.filter(s=>!s.id.endsWith('/b'));
 if(k===5)stages.forEach(s=>{s.start=null;s.finish=null;});
 if(k===6)stages[1].required=true;
 const fixture={plan:p,version:1,stages,occurrences:[],removedStage:k===4,canEdit:p.reason!=='closed'};
 if(p.templateId==='t1')for(const d of SOURCE_DEFS){
  if(k===18)continue;
  let target=stages.find(s=>s.sourceKey===`stage-${d.stage}`)||stages.find(s=>s.name==='Практика');
  if(!target)continue;
  if(k===2&&d.key==='t1/s1/e1')target=stages.find(s=>s.id.endsWith('/local-practice'));
  const content={...d,description:d.description||'',ready:true};delete content.stage;delete content.key;
  if(d.type==='Задача')content.report_required=false;
  if(d.type==='Задача'&&k===1)content.description='Локальная правка: познакомиться с командой смены и дежурным инженером.';
  const deadline=target.finish||'2026-11-05';
  const occ={id:`p${p.id}/occ-${d.key}`,sourceKey:d.key,type:d.type,stageId:target.id,position:fixture.occurrences.length+1,owner:'adaptee',required:p.required,deadline,content,status:k>=13&&k<=15?'started':k===16||k===17?'done':'created'};
  fixture.occurrences.push(occ);
  if(d.type==='Задача'&&k===7)occ.goalLinked=true;
  if(k===19&&d.key==='t1/s1/e1')fixture.occurrences.push({...copy(occ),id:occ.id+'-copy'});
 }
 if(k===3)fixture.occurrences.push({id:`p${p.id}/local-task`,sourceKey:null,type:'Задача',stageId:stages[0].id,position:30,owner:'adaptee',required:false,deadline:'2026-10-20',status:'created',content:{id:`local-task-${p.id}`,type:'Задача',name:'Познакомиться с командой',description:'Собственная задача этого плана.'}});
 if(p.id%20>0&&p.id%20<4)fixture.occurrences.push({id:`p${p.id}/existing-901`,sourceKey:null,type:'Курс',stageId:stages[0].id,position:40,owner:'adaptee',required:false,deadline:null,status:'created',content:copy(CATALOG.Курс[2])});
 return [p.id,fixture];
}));}
export function matching(f,source){return source?.localId?f.occurrences.filter(o=>o.id===source.localId):f.occurrences.filter(o=>o.sourceKey===source?.key);}
export function sourceChoices(fixtures,ids){
 const linked=SOURCE_DEFS.filter(d=>ids.some(id=>matching(fixtures.get(id),d).length)).map(d=>{const occurrences=ids.flatMap(id=>matching(fixtures.get(id),d));const names=[...new Set(occurrences.map(o=>o.content.name))],materialIds=[...new Set(occurrences.map(o=>o.content.id))];return {...d,name:names[0],namesDiffer:names.length>1,id:materialIds.length===1?materialIds[0]:null};});
 const local=ids.flatMap(id=>fixtures.get(id).occurrences.filter(o=>!o.sourceKey).map(o=>({key:'local:'+o.id,localId:o.id,type:o.type,name:o.content.name,id:o.content.id,localPlan:id,description:o.content.description})));
 return [...linked,...local];
}
export function duplicate(f,content,exceptId){return f.occurrences.some(o=>o.id!==exceptId&&(o.content.id===content?.id||(content?.type==='Ссылка'&&o.content.url===content.url)));}
export function stageAllowed(f,s,c){
 if(!s||s.owner!=='adaptee')return 'Этап недоступен в маршруте сотрудника';
 if(c.dateMode==='none')return '';
 if(!validDate(c.date))return 'Укажите календарную дату';
 if(c.date<f.plan.start||c.date>f.plan.finish)return 'Дата вне периода индивидуального плана';
 if(s.start&&c.date<s.start||s.finish&&c.date>s.finish)return 'Дата вне периода этапа';
 return '';
}
export function additionRows(fixtures,ids,c,excluded=new Set(),duplicateDecision=null){
 if(ids.length>100)throw Error('Лимит — 100 планов');
 return ids.map(id=>{
  const f=fixtures.get(id),row={plan:f.plan,version:f.version,deadline:c.dateMode==='none'?null:c.date,status:'ready',stage:null,reason:'',duplicate:duplicate(f,c.content),required:c.required,owner:'Сотрудник плана'};
  if(excluded.has(id))return {...row,status:'excluded',reason:'Исключено вами'};
  if(!f.canEdit)return {...row,status:'skip',reason:'План закрыт или недоступен для изменения'};
  if(c.dateMode==='none'||!validDate(c.date))return {...row,status:'skip',reason:'Не задана календарная дата для определения этапа'};
  if(c.date<f.plan.start||c.date>f.plan.finish)return {...row,status:'skip',reason:'Дата вне периода индивидуального плана'};
  const stages=f.stages.filter(s=>s.owner==='adaptee');
  const eligible=stages.filter(s=>!stageAllowed(f,s,c));
  if(stages.some(s=>!s.start||!s.finish))return {...row,status:'skip',reason:'У этапов не заданы календарные границы: этап не определён'};
  else if(eligible.length===1)row.stage=copy(eligible[0]);
  else if(eligible.length>1)return {...row,status:'skip',reason:'По дате подходят несколько этапов: этап не определён',candidates:eligible};
  else return {...row,status:'skip',reason:f.removedStage?'Нет подходящего этапа по дате. Один из этапов удалён':'Нет подходящего этапа по дате'};
  row.required=Boolean(c.required||row.stage.required);row.past=Boolean(row.deadline&&row.deadline<TODAY);
  if(row.duplicate&&duplicateDecision==='skip')return {...row,status:'skip',reason:'Материал уже есть в плане'};
  return row;
 });
}
export function editRows(fixtures,ids,source,config,excluded=new Set()){
 if(ids.length>100)throw Error('Лимит — 100 планов');
 return ids.map(id=>{
  const f=fixtures.get(id),matches=matching(f,source),o=matches[0],row={plan:f.plan,version:f.version,status:'ready',occurrences:matches.length,before:o?copy(o):null,stage:o?copy(f.stages.find(s=>s.id===o.stageId)):null,reason:''};
  if(excluded.has(id))return {...row,status:'excluded',reason:'Исключено вами'};
  if(!f.canEdit)return {...row,status:'skip',reason:'План закрыт или недоступен для изменения'};
  if(matches.length!==1)return {...row,status:'skip',reason:matches.length?'Связь неоднозначна: несколько вхождений':'Исходный элемент не найден по сохранённой связи'};
  if(config.op!=='fields'&&(o.status==='started'||o.status==='done'))return {...row,status:'skip',reason:o.status==='started'?'Выполнение элемента уже начато':'Элемент выполнен'};
  if(config.op==='replace'&&config.content?.type!==o.type)return {...row,status:'skip',reason:'Замена допускается только на элемент того же типа'};
  const after=copy(o);
  if(config.op==='replace')after.content=copy(config.content);
  if(config.op==='fields'){if(config.changeName)after.content.name=config.title.trim();if(config.changeDescription)after.content.description=config.clearDescription?'':config.description;}
  if(config.op==='required')after.required=config.required;
  if(config.op==='deadline'){after.deadline=config.dateMode==='none'?null:config.date;const error=stageAllowed(f,row.stage,config);if(error)return {...row,status:'skip',reason:error};}
  const same=config.op==='replace'&&o.content.id===config.content.id||JSON.stringify(o)===JSON.stringify(after),isDuplicate=config.op==='replace'&&duplicate(f,config.content,o.id);
  return {...row,status:same?'same':isDuplicate&&config.duplicateDecision==='skip'?'skip':'ready',reason:isDuplicate&&config.duplicateDecision==='skip'?'Материал уже есть в плане':'',after,duplicate:isDuplicate,localChanged:Boolean(source.description!==undefined&&o.content.description!==source.description),deadline:after.deadline,required:after.required,owner:'Сотрудник плана'};
 });
}
export function counts(rows){return Object.fromEntries(['ready','decision','skip','excluded','same'].map(s=>[s,rows.filter(r=>r.status===s).length]));}
export const EDITABLE_TYPES=['Задача','Ссылка'];
export function editableSources(fixtures,ids){return sourceChoices(fixtures,ids).filter(e=>EDITABLE_TYPES.includes(e.type));}
export function propertyDraft(fixtures,ids,source){
 const items=ids.flatMap(id=>matching(fixtures.get(id),source));
 const getters={title:o=>o.content.name||'',description:o=>o.content.description||'',url:o=>o.content.url||'',date:o=>o.deadline||'',required:o=>o.required,report_required:o=>Boolean(o.content.report_required)};
 const values={},mixed={};
 for(const [key,get] of Object.entries(getters)){const distinct=[...new Set(items.map(get))];mixed[key]=distinct.length>1;values[key]=mixed[key]?(key==='required'||key==='report_required'?null:''):distinct[0]??'';}
 return {values,mixed};
}
// The form tracks actual edits; untouched heterogeneous values are never broadcast.
export function propertyPatch(base,changes={}){
 const c={...base.values,...changes,op:'properties'},flags={title:'changeName',description:'changeDescription',url:'changeUrl',date:'changeDeadline',required:'changeRequired',report_required:'changeReport'};
 for(const [key,flag] of Object.entries(flags))c[flag]=Object.hasOwn(changes,key)&&!(base.mixed[key]&&changes[key]===null)&&(base.mixed[key]||changes[key]!==base.values[key]);
 c.clearDescription=c.changeDescription&&!c.description?.trim();return c;
}
export function propertyErrors(c,type){
 const e={},flags=['changeName','changeDescription','changeReport','changeUrl','changeRequired','changeDeadline'];
 if(!EDITABLE_TYPES.includes(type))e.type='Редактировать можно только задачи и ссылки';
 if(!flags.some(k=>c[k]))e.fields='Измените данные задачи или ссылки';
 if(c.changeName&&(!['Задача','Ссылка'].includes(type)||!c.title?.trim()))e.title='Введите название';
 if(c.changeDescription&&!['Задача','Ссылка'].includes(type))e.description='Описание материала в каталоге здесь не меняется';
 if(c.changeDescription&&!c.clearDescription&&!c.description?.trim())e.description='Введите описание или явно выберите очистку';
 if(c.changeDeadline&&!validDate(c.date))e.date='Укажите календарную дату';
 if(c.changeRequired&&typeof c.required!=='boolean')e.required='Выберите обязательность';
 if(c.changeReport&&(type!=='Задача'||typeof c.report_required!=='boolean'))e.report='Выберите настройку отчёта';
 if(c.changeUrl){if(type!=='Ссылка')e.url='URL можно менять только у ссылки';else if(contentErrors({type:'Ссылка',name:'Ссылка',url:c.url}).url)e.url='Укажите корректную ссылку: https://example.org';}
 return e;
}
export function propertyRows(fixtures,ids,source,c,excluded=new Set()){
 // Keep stable occurrence matching and per-plan rights; completed items are read-only in the proposed bulk editor.
 return editRows(fixtures,ids,source,{op:'fields'},excluded).map(row=>{
  if(row.status!=='ready'&&row.status!=='same')return row;
  const o=row.before,f=fixtures.get(row.plan.id);
  if(o.status==='done')return {...row,status:'skip',reason:'Элемент выполнен: доступен только просмотр'};
  if(Object.keys(propertyErrors(c,o.type)).length)return {...row,status:'skip',reason:'Проверьте данные задачи или ссылки'};
  const after=copy(o);
  if(c.changeName)after.content.name=c.title.trim();
  if(c.changeDescription)after.content.description=c.clearDescription?'':c.description;
  if(c.changeUrl)after.content.url=c.url.trim();
  if(c.changeReport)after.content.report_required=c.report_required;
  if(c.changeRequired)after.required=c.required;
  if(c.changeDeadline){const error=stageAllowed(f,row.stage,{dateMode:'date',date:c.date});if(error)return {...row,status:'skip',reason:error};after.deadline=c.date;}
  return {...row,status:JSON.stringify(after)===JSON.stringify(o)?'same':'ready',after,deadline:after.deadline,required:after.required};
 });
}
export function deletionRows(fixtures,ids,source,excluded=new Set()){
 return editRows(fixtures,ids,source,{op:'fields'},excluded).map(row=>{
  if(row.status!=='ready'&&row.status!=='same')return row;
  const o=row.before;
  if(o.status==='done')return {...row,status:'skip',reason:'Выполненный элемент нельзя удалить'};
  if(o.status==='started')return {...row,status:'skip',reason:'Выполнение начато: массовое удаление пропускает элемент'};
  if(o.goalLinked)return {...row,status:'skip',reason:'Элемент связан с целью: требуется отдельная проверка связей'};
  return {...row,status:'ready',after:null,deadline:o.deadline,required:o.required};
 });
}
export function unresolvedDuplicates(rows,decision){return !decision&&rows.some(r=>r.status==='ready'&&r.duplicate);}
export function snapshotChanged(fixtures,rows){return rows.filter(r=>r.status==='ready'&&fixtures.get(r.plan.id).version!==r.version);}
export function executePrepared(fixtures,rows,{mode,content,operationId,ledger,failIds=new Set()}){
 return rows.map(row=>{
  if(row.status!=='ready')return {...row,result:row.status==='excluded'?'excluded':'skip',reason:row.status==='same'?'Значения уже совпадают':row.reason};
  const f=fixtures.get(row.plan.id),key=`${operationId}/${f.plan.id}/${mode==='add'?'new':row.before.id}`;
  if(ledger.has(key))return {...row,result:'success',alreadyApplied:true};
  if(failIds.has(f.plan.id))return {...row,result:'error',reason:'Не удалось сохранить. Можно повторить только ошибочные строки'};
  if(f.version!==row.version)return {...row,result:'stale',reason:'План изменился после проверки'};
  if(mode==='delete')f.occurrences=f.occurrences.filter(o=>o.id!==row.before.id);
  else if(mode==='edit'){
   const old=f.occurrences.find(o=>o.id===row.before.id);
   Object.assign(old,copy(row.after));
  }else f.occurrences.push({id:key,sourceKey:null,type:content.type,stageId:row.stage.id,position:Math.max(0,...f.occurrences.filter(o=>o.stageId===row.stage.id).map(o=>o.position))+1,owner:'adaptee',required:row.required,deadline:row.deadline,status:'created',content:copy(content)});
  f.version++;ledger.add(key);return {...row,result:'success'};
 });
}
