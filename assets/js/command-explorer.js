(() => {
"use strict";
const $ = id => document.getElementById(id);
const list=$("command-list"), search=$("command-search");
const platformChips=$("platform-chips"), categoryChips=$("category-chips");
let commands=[], activePlatform="", activeCategory="";
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function makeCode(value){
 const wrap=el("div","command-code-wrap"),pre=el("pre"),code=el("code","",value),copy=el("button","copy-command","Kopieren");
 copy.type="button";copy.setAttribute("aria-label","Befehl kopieren");
 copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(value);copy.textContent="Kopiert ✓";copy.classList.add("copied");window.setTimeout(()=>{copy.textContent="Kopieren";copy.classList.remove("copied");},1500);}catch{copy.textContent="Kopieren nicht verfügbar";}});
 pre.appendChild(code);wrap.append(pre,copy);return wrap;
}
function renderCard(item){
 const card=el("article","command-card"),head=el("div","command-card-head"),left=el("div","command-card-title");
 left.append(el("span","command-platform",item.platform),el("h3","",item.name));
 const badge=el("span","risk-badge risk-"+item.risk,({low:"STANDARD",medium:"ÄNDERND",high:"KRITISCH"})[item.risk]||"INFO");
 head.append(left,badge);card.append(head);
 card.append(el("p","command-purpose",item.purpose));
 const explanation=el("div","command-explanation");explanation.append(el("strong","","Was macht dieser Befehl?"),el("p","",item.comment||item.purpose));card.append(explanation);
 const syntax=el("div","command-block");syntax.append(el("h4","","Syntax"),makeCode(item.syntax));card.append(syntax);
 if(item.params&&item.params.length){
  const section=el("section","command-params");section.append(el("h4","","Parameter und Optionen"));
  const table=el("div","command-parameter-list");
  item.params.forEach(([key,desc])=>{const row=el("div","command-parameter");row.append(el("code","",key),el("span","",desc));table.append(row);});
  section.append(table);card.append(section);
 }
 const example=el("div","command-block");example.append(el("h4","","Praxisbeispiel"),makeCode(item.example));card.append(example);
 const verify=el("div","command-extra");verify.append(el("h4","","Ergebnis kontrollieren"),el("p","",item.verify||"Ausgabe prüfen und mit dem erwarteten Zustand vergleichen."));card.append(verify);
 if(item.notes){const note=el("div","command-note");note.append(el("strong","","Administrator-Hinweis: "),el("span","",item.notes));card.append(note);}
 const foot=el("div","command-card-footer");foot.append(el("span","",item.category),el("span","",({low:"Lesen / Diagnose",medium:"Änderung",high:"Kritische Änderung"})[item.risk]||"Referenz"));card.append(foot);
 return card;
}
function chip(label,value,active,onClick){
 const b=el("button","command-chip"+(active?" active":""),label);b.type="button";b.setAttribute("aria-pressed",active?"true":"false");b.addEventListener("click",onClick);return b;
}
function drawChips(){
 platformChips.replaceChildren(chip("Alle Plattformen","",!activePlatform,()=>{activePlatform="";drawChips();filter();}));
 [...new Set(commands.map(x=>x.platform))].sort((a,b)=>a.localeCompare(b,"de")).forEach(v=>platformChips.append(chip(v,v,activePlatform===v,()=>{activePlatform=activePlatform===v?"":v;drawChips();filter();})));
 categoryChips.replaceChildren(chip("Alle Aufgaben","",!activeCategory,()=>{activeCategory="";drawChips();filter();}));
 [...new Set(commands.map(x=>x.category))].sort((a,b)=>a.localeCompare(b,"de")).forEach(v=>categoryChips.append(chip(v,v,activeCategory===v,()=>{activeCategory=activeCategory===v?"":v;drawChips();filter();})));
}
function filter(){
 const q=search.value.trim().toLocaleLowerCase("de");
 const filtered=commands.filter(item=>{
  const hay=[item.name,item.platform,item.category,item.purpose,item.comment,item.syntax,item.example,item.verify,item.notes,...(item.params||[]).flat()].join(" ").toLocaleLowerCase("de");
  return (!q||hay.includes(q))&&(!activePlatform||item.platform===activePlatform)&&(!activeCategory||item.category===activeCategory);
 });
 list.replaceChildren();
 if(!filtered.length)list.append(el("div","command-empty","Keine passenden Befehle gefunden. Suche ändern oder Filter löschen."));
 else{
  const groups=new Map();filtered.forEach(item=>{if(!groups.has(item.platform))groups.set(item.platform,[]);groups.get(item.platform).push(item);});
  for(const [name,items] of groups){
   const group=el("section","command-platform-group");const heading=el("div","command-group-heading");heading.append(el("h2","",name),el("span","",items.length+" Befehle"));
   const grid=el("div","command-list-grid");items.forEach(item=>grid.append(renderCard(item)));group.append(heading,grid);list.append(group);
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
 }catch(error){list.replaceChildren(el("div","command-empty","Command-Datenbank konnte nicht geladen werden. Bitte später erneut versuchen."));$("result-count").textContent="Datenbank nicht verfügbar";}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();