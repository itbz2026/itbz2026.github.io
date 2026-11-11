(() => {
  "use strict";
  const ROOT = "/";
  const current = (location.pathname || "/").replace(/\\/g, "/");
  const normalize = value => value.replace(/\\/g, "/").replace(/\\/$/, "") || "/";
  const isActive = href => normalize(href) === normalize(current);
  const isInBranch = item => isActive(item.href) || (item.children || []).some(isInBranch);
  const makeLink = item => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    if (isActive(item.href)) link.setAttribute("aria-current", "page");
    if (isInBranch(item) && !isActive(item.href)) link.classList.add("branch-active");
    return link;
  };
  const build = async () => {
    const aside = document.querySelector(".layout > aside");
    if (!aside) return;
    let config;
    try {
      const response = await fetch(ROOT + "data/navigation.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("Navigation konnte nicht geladen werden");
      config = await response.json();
    } catch (error) {
      aside.classList.add("navigation-fallback");
      return;
    }
    aside.replaceChildren();
    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = "/index.html";
    brand.innerHTML = "<span></span><small></small>";
    brand.querySelector("span").textContent = config.brand || "IT Knowledge Base";
    brand.querySelector("small").textContent = config.subtitle || "";
    aside.appendChild(brand);

    const toggle = document.createElement("button");
    toggle.className = "sidebar-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "kb-navigation");
    toggle.innerHTML = '<span class="toggle-icon" aria-hidden="true">☰</span><span>Menu</span>';
    aside.appendChild(toggle);

    const nav = document.createElement("nav");
    nav.id = "kb-navigation";
    nav.setAttribute("aria-label", "Main navigation");
    (config.sections || []).forEach(section => {
      const heading = document.createElement("div");
      heading.className = "navtitle";
      heading.textContent = section.label;
      nav.appendChild(heading);
      (section.items || []).forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "nav-item";
        wrapper.appendChild(makeLink(item));
        if (item.children && item.children.length) {
          const group = document.createElement("div");
          group.className = "nav-children";
          item.children.forEach(child => group.appendChild(makeLink(child)));
          if (isInBranch(item)) group.classList.add("is-current-branch");
          wrapper.appendChild(group);
        }
        nav.appendChild(wrapper);
      });
    });
    aside.appendChild(nav);
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      aside.classList.toggle("sidebar-open", !expanded);
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build, {once:true});
  else build();
})();