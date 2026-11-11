(() => {
  "use strict";
  const classify = (code, pre) => {
    const hint = [code.className, pre.className, code.getAttribute("data-language"), pre.getAttribute("data-language")].join(" ").toLowerCase();
    if (/powershell|pwsh/.test(hint)) return "PowerShell";
    if (/bash|shell|sh\b/.test(hint)) return "Bash";
    if (/json/.test(hint)) return "JSON";
    if (/ya?ml/.test(hint)) return "YAML";
    if (/html/.test(hint)) return "HTML";
    if (/sql/.test(hint)) return "SQL";
    const text = code.textContent;
    if (/^\s*(configure terminal|enable\s*$|interface\s+\S+|show\s+(running-config|interfaces|vlan)|switchport\s+)/mi.test(text)) return "Cisco CLI";
    if (/\b(Get-|Set-|New-|Remove-|Install-|Test-)[A-Z]/.test(text)) return "PowerShell";
    if (/^\s*(sudo |apt |systemctl |ip addr|ip route|journalctl|docker |podman |pveversion)/m.test(text)) return "Shell";
    if (/^\s*[\[{]/.test(text) && /[\]}]\s*$/.test(text)) return "Configuration";
    return "COMMAND";
  };
  function enhance(pre) {
    if (pre.closest(".kb-codebox")) return;
    const code = pre.querySelector("code") || pre;
    const box = document.createElement("section");
    box.className = "kb-codebox";
    const bar = document.createElement("div");
    bar.className = "kb-codebar";
    const lang = document.createElement("span");
    lang.className = "kb-codelang";
    lang.textContent = classify(code, pre);
    const actions = document.createElement("div");
    actions.className = "kb-code-actions";
    const wrap = document.createElement("button");
    wrap.type = "button"; wrap.className = "kb-code-action";
    wrap.textContent = "Umbruch";
    wrap.setAttribute("aria-pressed", "false");
    wrap.addEventListener("click", () => {
      const enabled = box.classList.toggle("is-wrapped");
      wrap.setAttribute("aria-pressed", String(enabled));
    });
    const copy = document.createElement("button");
    copy.type = "button"; copy.className = "kb-code-action kb-copy";
    copy.textContent = "Kopieren";
    copy.addEventListener("click", async () => {
      const value = code.innerText.replace(/\n$/, "");
      try {
        await navigator.clipboard.writeText(value);
        copy.textContent = "Kopiert!";
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges(); selection.addRange(range);
        copy.textContent = "Markiert";
      }
      window.setTimeout(() => { copy.textContent = "Kopieren"; }, 1600);
    });
    actions.append(wrap, copy);
    bar.append(lang, actions);
    const parent = pre.parentNode;
    parent.insertBefore(box, pre);
    box.append(bar, pre);
    if (pre.textContent.split("\n").length > 18) {
      box.classList.add("is-long");
      const more = document.createElement("button");
      more.type = "button"; more.className = "kb-code-more";
      more.textContent = "Code erweitern";
      more.setAttribute("aria-expanded", "false");
      more.addEventListener("click", () => {
        const open = box.classList.toggle("is-expanded");
        more.textContent = open ? "Weniger anzeigen" : "Code erweitern";
        more.setAttribute("aria-expanded", String(open));
      });
      box.append(more);
    }
  }
  function init() { document.querySelectorAll("main pre").forEach(enhance); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();