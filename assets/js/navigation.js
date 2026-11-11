(() => {
  "use strict";

  const normalize = value => value.split("\\").join("/").replace(/\/+$/, "") || "/";
  const current = normalize(location.pathname || "/");
  const isActive = href => normalize(href) === current;
  const isInBranch = item => isActive(item.href) || (item.children || []).some(isInBranch);

  const makeLink = item => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    if (isActive(item.href)) link.setAttribute("aria-current", "page");
    else if (isInBranch(item)) link.classList.add("branch-active");
    return link;
  };

  async function addGlobalSearch(aside) {
    const wrap = document.createElement("div");
    wrap.className = "kb-search";
    const input = document.createElement("input");
    input.type = "search";
    input.id = "kb-global-search";
    input.placeholder = "Knowledge Base durchsuchen …";
    input.setAttribute("aria-label", "Gesamte Knowledge Base durchsuchen");
    input.autocomplete = "off";
    const results = document.createElement("div");
    results.className = "kb-search-results";
    results.setAttribute("role", "listbox");
    results.hidden = true;
    wrap.append(input, results);
    const toggle = aside.querySelector(".sidebar-toggle");
    aside.insertBefore(wrap, toggle || null);

    let index = [];
    try {
      const response = await fetch("/data/search-index.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("Search index unavailable");
      index = await response.json();
    } catch (error) {
      input.placeholder = "Suche derzeit nicht verfügbar";
      input.disabled = true;
      return;
    }

    const clean = value => value.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const render = query => {
      results.replaceChildren();
      const terms = clean(query).trim().split(/\s+/).filter(Boolean);
      if (!terms.length) {
        results.hidden = true;
        return;
      }
      const matches = index.map(item => {
        const title = clean(item.title || "");
        const body = clean((item.description || "") + " " + (item.text || ""));
        const path = clean(item.href || "");
        if (!terms.every(term => title.includes(term) || path.includes(term) || body.includes(term))) return null;
        let score = 0;
        terms.forEach(term => {
          if (title.includes(term)) score += 8;
          if (path.includes(term)) score += 3;
          if (body.includes(term)) score += 1;
        });
        return {item, score};
      }).filter(Boolean).sort((a,b) => b.score-a.score).slice(0,12);

      if (!matches.length) {
        const empty = document.createElement("p");
        empty.className = "kb-search-empty";
        empty.textContent = "Keine passenden Artikel gefunden.";
        results.appendChild(empty);
      } else {
        matches.forEach(({item}) => {
          const link = document.createElement("a");
          link.className = "kb-search-result";
          link.href = item.href;
          const title = document.createElement("strong");
          title.textContent = item.title;
          const detail = document.createElement("small");
          detail.textContent = item.category || item.href;
          link.append(title, detail);
          results.appendChild(link);
        });
      }
      results.hidden = false;
    };

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        input.value = "";
        results.hidden = true;
      }
      if (event.key === "Enter") {
        const first = results.querySelector("a");
        if (first) location.href = first.href;
      }
    });
    document.addEventListener("click", event => {
      if (!wrap.contains(event.target)) results.hidden = true;
    });
    input.addEventListener("focus", () => {
      if (input.value.trim()) render(input.value);
    });
  }

  async function build() {
    const aside = document.querySelector(".layout > aside");
    if (!aside) return;

    let config;
    try {
      const response = await fetch("/data/navigation.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("Navigation unavailable");
      config = await response.json();
    } catch (error) {
      aside.classList.add("navigation-fallback");
      return;
    }

    aside.replaceChildren();
    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = "/index.html";
    const name = document.createElement("span");
    name.textContent = config.brand || "IT Knowledge Base";
    const subtitle = document.createElement("small");
    subtitle.textContent = config.subtitle || "";
    brand.append(name, subtitle);
    aside.appendChild(brand);

    const toggle = document.createElement("button");
    toggle.className = "sidebar-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "kb-navigation");
    toggle.textContent = "☰ Menu";

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
    aside.append(toggle, nav);

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      aside.classList.toggle("sidebar-open", !expanded);
    });

    addGlobalSearch(aside);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build, {once:true});
  } else {
    build();
  }
})();
