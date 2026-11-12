// Les leçons s'ouvrent une étape à la fois (ADR-014, M2). Les tests de contenu lisent la leçon entière : ce réglage
// enregistre « Toute la leçon » dans le profil dès que la page crée Klassia. Le parcours par étapes a son propre test,
// dans un contexte sans ce réglage (tests/browser.cjs, « lesson steps »).
module.exports=async ctx=>ctx.addInitScript(()=>{
 let value;
 Object.defineProperty(window,'Klassia',{configurable:true,get:()=>value,set(v){value=v;try{if(v&&typeof v.write==='function'&&typeof v.read==='function'&&v.read('klassia_lesson_view_v1',null)===null)v.write('klassia_lesson_view_v1','all');}catch{}}});
});
