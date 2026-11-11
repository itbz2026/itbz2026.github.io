(() => {
"use strict";
const $ = id => document.getElementById(id);
const list = $("command-list");
const search = $("command-search");
const platform = $("platform-filter");
const category = $("category-filter");
const risk = $("risk-filter");
let commands = [];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function makeCode(value) {
  const wrap = el("div","command-code-wrap");
  const pre = el("pre");
  const code = el("code", "", value);
  const copy = el("button","copy-command","Copy");
  copy.type = "button";
  copy.setAttribute("aria-label","Befehl kopieren");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(value);
      copy.textContent = "Copied";
      copy.classList.add("copied");
      window.setTimeout(() => {copy.textContent="Copy";copy.classList.remove("copied");},1400);
    } catch {
      copy.textContent = "Copy nicht verfügbar";
    }
  });
  pre.appendChild(code);
  wrap.append(pre,copy);
  return wrap;
}
function addMeta(card, label, value) {
  const row=el("div","command-meta-row");
  row.append(el("strong","",label),el("span","",value));
  card.appendChild(row);
}
function renderCard(item) {
  const card=el("article","command-card");
  card.dataset.platform=item.platform;
  const head=el("div","command-card-head");
  const left=el("div","command-card-title");
  left.append(el("span","command-platform",item.platform),el("h3","",item.name));
  const riskBadge=el("span","risk-badge risk-"+item.risk,({low:"STANDARD",medium:"ÄNDERND",high:"KRITISCH"})[item.risk]||"INFO");
  head.append(left,riskBadge);
  card.appendChild(head);
  card.appendChild(el("p","command-purpose",item.purpose));
  const syntax=el("div","command-block");
  syntax.append(el("h4","","Syntax"),makeCode(item.syntax));
  card.appendChild(syntax);
  if(item.params && item.params.length){
    const details=el("details","command-details");
    details.appendChild(el("summary","","Parameter und Optionen"));
    const table=el("div","command-parameter-list");
    item.params.forEach(([key,desc])=>{const r=el("div","command-parameter");r.append(el("code","",key),el("span","",desc));table.appendChild(r);});
    details.appendChild(table);
    card.appendChild(details);
  }
  const example=el("div","command-block");
  example.append(el("h4","","Praxisbeispiel"),makeCode(item.example));
  card.appendChild(example);
  const verify=el("div","command-extra");
  verify.append(el("h4","","Verification"),el("p","",item.verify));
  card.appendChild(verify);
  if(item.notes){
    const note=el("div","command-note");
    note.append(el("strong","","Hinweis: "),el("span","",item.notes));
    card.appendChild(note);
  }
  const footer=el("div","command-card-footer");
  footer.append(el("span","",item.category),el("span","",({low:"Read / Diagnose",medium:"Änderung",high:"Kritische Änderung"})[item.risk]));
  card.appendChild(footer);
  return card;
}
function populate(select, values) {
  [...new Set(values)].sort((a,b)=>a.localeCompare(b,"de")).forEach(value=>{
    const option=document.createElement("option");option.value=value;option.textContent=value;select.appendChild(option);
  });
}
function filter() {
  const q=search.value.trim().toLocaleLowerCase("de");
  const p=platform.value,c=category.value,r=risk.value;
  const filtered=commands.filter(item=>{
    const text=[item.name,item.platform,item.category,item.purpose,item.syntax,item.example,item.verify,item.notes,...(item.params||[]).flat()].join(" ").toLocaleLowerCase("de");
    return (!q||text.includes(q))&&(!p||item.platform===p)&&(!c||item.category===c)&&(!r||item.risk===r);
  });
  list.replaceChildren();
  if(!filtered.length) list.appendChild(el("div","command-empty","Keine passenden Befehle gefunden. Filter zurücksetzen oder Suchbegriff ändern."));
  else filtered.forEach(item=>list.appendChild(renderCard(item)));
  $("result-count").textContent=filtered.length+" von "+commands.length+" Befehlen";
}
async function init(){
  try{
    const response=await fetch("/data/commands.json",{cache:"no-cache"});
    if(!response.ok) throw new Error("HTTP "+response.status);
    commands=await response.json();
    populate(platform,commands.map(x=>x.platform));
    populate(category,commands.map(x=>x.category));
    $("stat-total").textContent=commands.length;
    $("stat-platforms").textContent=new Set(commands.map(x=>x.platform)).size;
    $("stat-categories").textContent=new Set(commands.map(x=>x.category)).size;
    [search,platform,category,risk].forEach(node=>node.addEventListener(node===search?"input":"change",filter));
    $("reset-filters").addEventListener("click",()=>{search.value="";platform.value="";category.value="";risk.value="";filter();});
    filter();
  }catch(error){
    list.replaceChildren(el("div","command-empty","Command-Datenbank konnte nicht geladen werden. Bitte später erneut versuchen."));
    $("result-count").textContent="Datenbank nicht verfügbar";
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();