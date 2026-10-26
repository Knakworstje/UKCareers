(async () => {
"use strict";

const response = await fetch('./careers-data.json');
const data = await response.json();

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let activeJob = null;

data.departments.forEach(value => $("department").insertAdjacentHTML("beforeend", `<option value="${esc(value)}">${esc(value)}</option>`));

data.types.forEach(value => $("type").insertAdjacentHTML("beforeend", `<option value="${esc(value)}">${esc(value)}</option>`));

$("quickFilters").innerHTML = `<button class="pill active" data-dept="">All roles</button>` +
  data.departments.map(value => `<button class="pill" data-dept="${esc(value)}">${esc(value)}</button>`).join("");

function filteredJobs() {
  const query = $("search").value.trim().toLowerCase();
  const department = $("department").value;
  const type = $("type").value;
  return data.jobs.filter(job =>
    (!query || [job.title, job.department, job.summary, job.location].join(" ").toLowerCase().includes(query)) &&
    (!department || job.department === department) &&
    (!type || job.type === type)
  );
}

function renderJobs() {
  const jobs = filteredJobs();
  $("count").textContent = `${jobs.length} ${jobs.length === 1 ? "vacancy" : "vacancies"} found`;
  $("jobGrid").innerHTML = jobs.map(job => `
    <article class="jobcard">
      <div class="jobmeta"><span class="eyebrow">${esc(job.department)}</span><span class="tag">${esc(job.type)}</span></div>
      <h3>${esc(job.title)}</h3><p>${esc(job.summary)}</p>
      <div class="jobfoot"><span>${esc(job.location)}</span><strong>${esc(job.salary)}</strong></div>
      <button class="textbtn" data-open="${esc(job.id)}">View vacancy details →</button>
    </article>`).join("");
  $("empty").style.display = jobs.length ? "none" : "block";
  $("jobGrid").style.display = jobs.length ? "grid" : "none";
  document.querySelectorAll("[data-dept]").forEach(button => button.classList.toggle("active", button.dataset.dept === $("department").value));
}

function showJob(id) {
  const job = data.jobs.find(item => item.id === id);
  if (!job) return;
  activeJob = job;
  $("detailContent").innerHTML = `
    <div class="eyebrow">${esc(job.department)} / ${esc(job.type)}</div>
    <h1>${esc(job.title)}</h1>
    <p class="detailintro">${esc(job.summary)}</p>
    <div class="stats">
      <div class="stat"><small>SALARY</small><strong>${esc(job.salary)}</strong></div>
      <div class="stat"><small>LOCATION</small><strong>${esc(job.location)}</strong></div>
      <div class="stat"><small>EXPERIENCE</small><strong>${esc(job.level)}</strong></div>
    </div>
    <div class="detailgrid">
      <div>
        <section class="detailsection"><h2>About this role</h2><p>${esc(job.description)}</p></section>
        <section class="detailsection"><h2>Key responsibilities</h2><ul>${job.responsibilities.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
        <section class="detailsection"><h2>Requirements</h2><ul>${job.requirements.map(item => `<li>${esc(item)}</li>`).join("")}</ul></section>
      </div>
      <aside>
        <section class="detailsection"><h2>Benefits</h2><div class="benefits">${job.benefits.map(item => `<div class="benefit">${esc(item)}</div>`).join("")}</div></section>
        <div class="applybox"><h3>Ready to join the United Kingdom?</h3><p>Take the next step and apply for this position.</p><button class="btn primary" id="applyBtn">Apply Now ↗</button><p class="fineprint">Application opens in a new tab.</p></div>
      </aside>
    </div>`;
  $("detail").style.display = "block";
  document.body.style.overflow = "hidden";
  $("detail").scrollTop = 0;
}

function closeDetail() {
  $("detail").style.display = "none";
  document.body.style.overflow = "";
}

$("search").addEventListener("input", renderJobs);
$("department").addEventListener("change", renderJobs);
$("type").addEventListener("change", renderJobs);

$("quickFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-dept]");
  if (!button) return;
  $("department").value = button.dataset.dept;
  renderJobs();
});

$("jobGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-open]");
  if (button) showJob(button.dataset.open);
});

$("closeDetail").addEventListener("click", closeDetail);
$("clear").addEventListener("click", () => {
  $("search").value = ""; $("department").value = ""; $("type").value = ""; renderJobs();
});

$("detailContent").addEventListener("click", event => {
  if (event.target.id !== "applyBtn" || !activeJob) return;

  const url = activeJob.applyUrl;
  if (!url || url.includes("YOUR-APPLICATION-LINK-HERE")) {
    alert("No URL set.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
});

renderJobs();

})();