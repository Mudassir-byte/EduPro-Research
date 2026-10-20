const researchData = {
  months: [
    ["Jan", 833], ["Feb", 766], ["Mar", 857], ["Apr", 831],
    ["May", 825], ["Jun", 899], ["Jul", 826], ["Aug", 844],
    ["Sep", 870], ["Oct", 762], ["Nov", 869], ["Dec", 818],
  ],
  cohorts: [
    { name: "Under 18", count: 1469, color: "cohort-third" },
    { name: "18–25", count: 3732, color: "cohort-second" },
    { name: "26–35", count: 4799, color: "" },
    { name: "36–44", count: 0, color: "zero" },
    { name: "45+", count: 0, color: "zero" },
  ],
  categories: [
    { name: "Data Science", enrollments: 916, courses: 5, cpi: 1.10, gpi: 1.06, female: 479, male: 437 },
    { name: "Finance", enrollments: 864, courses: 5, cpi: 1.04, gpi: 1.06, female: 451, male: 413 },
    { name: "Web Development", enrollments: 844, courses: 5, cpi: 1.01, gpi: 0.93, female: 413, male: 431 },
    { name: "Business", enrollments: 833, courses: 5, cpi: 1.00, gpi: 0.98, female: 418, male: 415 },
    { name: "Artificial Intelligence", enrollments: 829, courses: 5, cpi: 0.99, gpi: 0.96, female: 413, male: 416 },
    { name: "Project Management", enrollments: 829, courses: 5, cpi: 0.99, gpi: 1.02, female: 425, male: 404 },
    { name: "Design", enrollments: 827, courses: 5, cpi: 0.99, gpi: 1.02, female: 424, male: 403 },
    { name: "Cybersecurity", enrollments: 819, courses: 5, cpi: 0.98, gpi: 1.07, female: 430, male: 389 },
    { name: "Machine Learning", enrollments: 819, courses: 5, cpi: 0.98, gpi: 0.94, female: 403, male: 416 },
    { name: "Digital Marketing", enrollments: 808, courses: 5, cpi: 0.97, gpi: 1.03, female: 417, male: 391 },
    { name: "Marketing", enrollments: 806, courses: 5, cpi: 0.97, gpi: 0.89, female: 385, male: 421 },
    { name: "Programming", enrollments: 806, courses: 5, cpi: 0.97, gpi: 1.05, female: 420, male: 386 },
  ],
  total: 10000,
};

const tooltip = document.querySelector("#chart-tooltip");
const numberFormat = new Intl.NumberFormat("en-US");
let trendMode = "count";
let cohortMode = "share";
let selectedCategory = "";

function showDetail(element, text) {
  element.textContent = text;
}

function renderTrend() {
  const target = document.querySelector("#trend-chart");
  const values = researchData.months.map(([, count]) => trendMode === "count" ? count : count / (researchData.total / 100));
  const width = 600;
  const height = 188;
  const pad = { top: 14, right: 12, bottom: 28, left: 35 };
  const min = trendMode === "count" ? 700 : 70;
  const max = trendMode === "count" ? 920 : 92;
  const x = index => pad.left + index * (width - pad.left - pad.right) / (values.length - 1);
  const y = value => pad.top + (max - value) * (height - pad.top - pad.bottom) / (max - min);
  const points = values.map((value, index) => [x(index), y(value)]);
  const line = points.map(([px, py], index) => `${index ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${points.at(-1)[0]},${height - pad.bottom} L${points[0][0]},${height - pad.bottom} Z`;
  const grid = [0, 1, 2, 3].map(index => {
    const gy = pad.top + index * (height - pad.top - pad.bottom) / 3;
    const value = max - index * (max - min) / 3;
    const label = trendMode === "count" ? numberFormat.format(Math.round(value)) : `${value.toFixed(0)}%`;
    return `<g><line x1="${pad.left}" y1="${gy}" x2="${width - pad.right}" y2="${gy}" stroke="#e7dfd0" stroke-width="1"/><text x="${pad.left - 7}" y="${gy + 3}" text-anchor="end" fill="#8b8392" font-size="9">${label}</text></g>`;
  }).join("");
  const circles = points.map(([cx, cy], index) => {
    const [month, count] = researchData.months[index];
    const label = `${month}: ${numberFormat.format(count)} enrollments`;
    return `<circle class="trend-point" tabindex="0" role="button" aria-label="${label}" data-index="${index}" cx="${cx}" cy="${cy}" r="4" fill="#5a3e8e" stroke="#fff" stroke-width="2"><title>${label}</title></circle>`;
  }).join("");
  const labels = researchData.months.map(([month], index) => `<text x="${x(index)}" y="${height - 6}" text-anchor="middle" fill="#8b8392" font-size="8">${month}</text>`).join("");
  target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly enrollment counts in 2025">${grid}<path d="${area}" fill="rgba(90,62,142,.10)"/><path d="${line}" fill="none" stroke="#5a3e8e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${circles}${labels}</svg>`;
  target.querySelectorAll(".trend-point").forEach(point => {
    const inspect = () => {
      const index = Number(point.dataset.index);
      const [month, count] = researchData.months[index];
      showDetail(document.querySelector("#trend-detail"), `${month} 2025 · ${numberFormat.format(count)} enrollments · ${(count / researchData.total * 100).toFixed(2)}% of annual activity.`);
      target.querySelectorAll(".trend-point").forEach(node => node.setAttribute("r", node === point ? "6" : "4"));
    };
    point.addEventListener("click", inspect);
    point.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspect(); }
    });
    point.addEventListener("pointerenter", () => {
      const [month, count] = researchData.months[Number(point.dataset.index)];
      tooltip.textContent = `${month}: ${numberFormat.format(count)} enrollments`;
      tooltip.style.display = "block";
    });
    point.addEventListener("pointermove", event => {
      tooltip.style.left = `${event.clientX + 12}px`;
      tooltip.style.top = `${event.clientY + 12}px`;
    });
    point.addEventListener("pointerleave", () => { tooltip.style.display = "none"; });
  });
}

function renderCohorts() {
  const target = document.querySelector("#cohort-chart");
  const max = Math.max(...researchData.cohorts.map(item => item.count));
  target.innerHTML = researchData.cohorts.map(item => {
    const value = cohortMode === "share" ? `${(item.count / researchData.total * 100).toFixed(2)}%` : numberFormat.format(item.count);
    const width = item.count ? Math.max(1, item.count / max * 100) : 0;
    const shareLabel = `${item.name}: ${numberFormat.format(item.count)} enrollments, ${(item.count / researchData.total * 100).toFixed(2)} percent`;
    return `<div class="cohort-row" role="img" aria-label="${shareLabel}"><span class="cohort-label">${item.name}</span><span class="cohort-track"><i class="cohort-fill ${item.color}" style="width:${width}%"></i></span><span class="cohort-value">${value}</span></div>`;
  }).join("");
}

function renderCategories() {
  const target = document.querySelector("#category-chart");
  const mode = document.querySelector("#category-sort").value;
  const rows = [...researchData.categories].sort((a, b) => mode === "cpi" ? b.cpi - a.cpi : b.enrollments - a.enrollments);
  const max = mode === "cpi" ? 1.2 : Math.max(...rows.map(item => item.enrollments));
  target.innerHTML = rows.map(item => {
    const width = mode === "cpi" ? item.cpi / max * 100 : item.enrollments / max * 100;
    const selected = item.name === selectedCategory ? " selected" : "";
    const value = mode === "cpi" ? item.cpi.toFixed(2) : numberFormat.format(item.enrollments);
    const unit = mode === "cpi" ? "CPI" : "enrollments";
    return `<button class="category-row${selected}" type="button" data-category="${item.name}" aria-label="${item.name}: ${numberFormat.format(item.enrollments)} enrollments, CPI ${item.cpi.toFixed(2)}"><span class="category-name">${item.name}</span><span class="category-track"><i class="category-fill" style="width:${width}%"></i></span><span class="category-value">${value}</span></button>`;
  }).join("");
  target.querySelectorAll(".category-row").forEach(button => {
    button.addEventListener("click", () => {
      const item = researchData.categories.find(category => category.name === button.dataset.category);
      selectedCategory = item.name;
      renderCategories();
      const enrollmentShare = item.enrollments / researchData.total * 100;
      const catalogShare = item.courses / 60 * 100;
      showDetail(document.querySelector("#category-detail"), `${item.name} · ${numberFormat.format(item.enrollments)} / ${numberFormat.format(researchData.total)} enrollments (${enrollmentShare.toFixed(2)}%) · ${item.courses} / 60 courses (${catalogShare.toFixed(2)}%) · CPI ${item.cpi.toFixed(2)} (${item.cpi >= .85 && item.cpi <= 1.15 ? "within the project’s balanced range" : "outside the project’s balanced range"}).`);
    });
    button.addEventListener("pointerenter", () => {
      const item = researchData.categories.find(category => category.name === button.dataset.category);
      tooltip.textContent = `${item.name} · CPI ${item.cpi.toFixed(2)} · ${numberFormat.format(item.enrollments)} enrollments`;
      tooltip.style.display = "block";
    });
    button.addEventListener("pointermove", event => {
      tooltip.style.left = `${event.clientX + 12}px`;
      tooltip.style.top = `${event.clientY + 12}px`;
    });
    button.addEventListener("pointerleave", () => { tooltip.style.display = "none"; });
  });
}

function renderParity() {
  const target = document.querySelector("#parity-chart");
  const min = .8;
  const max = 1.2;
  const pos = value => Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
  const rows = [...researchData.categories].sort((a, b) => a.gpi - b.gpi);
  const axis = `<div class="parity-axis"><span></span><span class="parity-axis-labels"><i>0.80</i><i>0.90</i><i>1.00</i><i>1.10</i><i>1.20</i></span><span></span></div>`;
  target.innerHTML = axis + rows.map(item => {
    const type = item.gpi > 1.03 ? "female" : item.gpi < .97 ? "male" : "";
    const description = `${item.name}: adjusted index ${item.gpi.toFixed(2)}, ${numberFormat.format(item.female)} female-coded and ${numberFormat.format(item.male)} male-coded enrollments`;
    return `<div class="parity-row" tabindex="0" role="button" aria-label="${description}" data-category="${item.name}"><span class="parity-name">${item.name}</span><span class="parity-track"><i class="parity-dot ${type}" style="left:${pos(item.gpi)}%"></i></span><span class="parity-value">${item.gpi.toFixed(2)}</span></div>`;
  }).join("");
  target.querySelectorAll(".parity-row").forEach(row => {
    const inspect = () => {
      const item = researchData.categories.find(category => category.name === row.dataset.category);
      const status = item.gpi >= .97 && item.gpi <= 1.03 ? "within the project reference band" : item.gpi > 1.03 ? "above the reference band" : "below the reference band";
      showDetail(document.querySelector("#parity-detail"), `${item.name} · adjusted index ${item.gpi.toFixed(2)} (${status}) · ${numberFormat.format(item.female)} female-coded and ${numberFormat.format(item.male)} male-coded enrollment records.`);
    };
    row.addEventListener("click", inspect);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspect(); }
    });
  });
}

document.querySelectorAll("[data-trend-mode]").forEach(button => button.addEventListener("click", () => {
  trendMode = button.dataset.trendMode;
  document.querySelectorAll("[data-trend-mode]").forEach(item => item.classList.toggle("active", item === button));
  renderTrend();
}));
document.querySelectorAll("[data-cohort-mode]").forEach(button => button.addEventListener("click", () => {
  cohortMode = button.dataset.cohortMode;
  document.querySelectorAll("[data-cohort-mode]").forEach(item => item.classList.toggle("active", item === button));
  renderCohorts();
}));
document.querySelector("#category-sort").addEventListener("change", renderCategories);
document.querySelector("#print-paper").addEventListener("click", () => window.print());
document.querySelector("#copy-citation").addEventListener("click", async event => {
  const citation = "EduPro Analytics. (2026). From catalog to learner activity: A descriptive study of enrollment patterns in the EduPro Online Platform (2025 snapshot).";
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(citation);
    button.textContent = "Citation copied";
    window.setTimeout(() => { button.textContent = "Copy citation"; }, 1800);
  } catch (error) {
    button.textContent = "Clipboard unavailable";
    window.setTimeout(() => { button.textContent = "Copy citation"; }, 2200);
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      const link = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
      if (link) {
        document.querySelectorAll(".toc-link").forEach(item => item.classList.remove("active"));
        link.classList.add("active");
      }
    }
  });
}, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });

document.querySelectorAll(".paper-section").forEach(section => {
  section.classList.add("reveal");
  observer.observe(section);
});
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector("#progress-bar").style.width = `${scrollable > 0 ? window.scrollY / scrollable * 100 : 0}%`;
}, { passive: true });

renderTrend();
renderCohorts();
renderCategories();
renderParity();
