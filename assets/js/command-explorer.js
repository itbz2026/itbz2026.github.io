(() => {
"use strict";
const $ = id => document.getElementById(id);
const list=$("command-list"), search=$("command-search");
const platformChips=$("platform-chips"), categoryChips=$("category-chips");
let commands=[], activePlatform="", activeCategory="";
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function makeCode(value){
 const wrap=el("div","command-code-wrap"),pre=el("pre"),code=el("code","",value),copy=el("button","copy-command","Kopieren");
 copy.type="button";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(value);copy.textContent="Kopiert ✓";copy.classList.add("copied");window.setTimeout(()=>{copy.textContent="Kopieren";copy.classList.remove("copied");},1400);}catch{copy.textContent="Nicht verfügbar";}});
 pre.append(code);wrap.append(pre,copy);return wrap;
}
function renderCard(item){
 const card=el("article","command-card command-card-compact");
 const head=el("div","command-card-head"),title=el("div","command-card-title");
 title.append(el("span","command-platform",item.platform),el("h3","",item.name));
 head.append(title);
 const desc=item.purpose||item.comment||"Kurzbeschreibung nicht verfügbar.";
 card.append(head,el("p","command-short-description",desc),makeCode(item.example||item.syntax||item.name));
 return card;
}
function chip(label,active,onClick){
 const b=el("button","command-chip"+(active?" active":""),label);b.type="button";b.setAttribute("aria-pressed",active?"true":"false");b.addEventListener("click",onClick);return b;
}
function drawChips(){
 platformChips.replaceChildren(chip("Alle Plattformen",!activePlatform,()=>{activePlatform="";drawChips();filter();}));
 [...new Set(commands.map(x=>x.platform))].sort((a,b)=>a.localeCompare(b,"de")).forEach(v=>platformChips.append(chip(v,activePlatform===v,()=>{activePlatform=activePlatform===v?"":v;drawChips();filter();})));
 categoryChips.replaceChildren(chip("Alle Aufgaben",!activeCategory,()=>{activeCategory="";drawChips();filter();}));
 [...new Set(commands.map(x=>x.category))].sort((a,b)=>a.localeCompare(b,"de")).forEach(v=>categoryChips.append(chip(v,activeCategory===v,()=>{activeCategory=activeCategory===v?"":v;drawChips();filter();})));
}
function filter(){
 const q=search.value.trim().toLocaleLowerCase("de");
 const filtered=commands.filter(item=>{
  const hay=[item.name,item.platform,item.category,item.purpose,item.comment,item.syntax,item.example,...(item.params||[]).flat()].join(" ").toLocaleLowerCase("de");
  return (!q||hay.includes(q))&&(!activePlatform||item.platform===activePlatform)&&(!activeCategory||item.category===activeCategory);
 });
 list.replaceChildren();
 if(!filtered.length)list.append(el("div","command-empty","Keine passenden Befehle gefunden. Suche ändern oder Filter zurücksetzen."));
 else{
  const groups=new Map();filtered.forEach(item=>{if(!groups.has(item.platform))groups.set(item.platform,[]);groups.get(item.platform).push(item);});
  for(const [name,items] of groups){
   const group=el("section","command-platform-group"),heading=el("div","command-group-heading");
   heading.append(el("h2","",name),el("span","",items.length+" Befehle"));
   const grid=el("div","command-list-grid");items.forEach(item=>grid.append(renderCard(item)));
   group.append(heading,grid);list.append(group);
  }
 }
 $("result-count").textContent=filtered.length+" von "+commands.length+" Befehlen";
}
async function init(){
 try{
  const response=await fetch("/data/commands.json",{cache:"no-cache"});if(!response.ok)throw new Error("HTTP "+response.status);
  commands=await response.json();
  $("stat-total").textContent=commands.length;
  $("stat-platforms").textContent=new Set(commands.map(x=>x.platform)).size;
  $("stat-categories").textContent=new Set(commands.map(x=>x.category)).size;
  drawChips();search.addEventListener("input",filter);
  $("reset-filters").addEventListener("click",()=>{search.value="";activePlatform="";activeCategory="";drawChips();filter();search.focus();});
  filter();
 }catch(error){list.replaceChildren(el("div","command-empty","Command-Datenbank konnte nicht geladen werden."));$("result-count").textContent="Datenbank nicht verfügbar";}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();