// Scholarship dashboard logic.
// Flow: change data -> call renderAll() -> the page is redrawn from the data.

let selectedState = "All";   // All, Bihar, Haryana or Jharkhand
let selectedStatus = "";     // empty means all statuses
let editingId = null;        // null means the form is adding a new scholarship
let nextId = 10;

const states = ["Bihar", "Haryana", "Jharkhand"];
const statuses = ["Published", "Draft", "Expired"];

// form field names, same as the ids in index.html (f_name, f_state ...)
const fieldNames = ["name", "state", "provider", "applicableClass",
                    "eligibility", "benefit", "deadline", "link", "status"];

// ---------- small helpers ----------

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;");
}

function formatDate(dateString) {
  if (dateString === "") {
    return "Not stated";
  }
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function showMessage(text) {
  const box = document.getElementById("toast");
  box.textContent = text;
  box.classList.add("show");
  setTimeout(function () {
    box.classList.remove("show");
  }, 2200);
}

function findScholarship(id) {
  return scholarships.find(function (item) {
    return item.id === id;
  });
}

// scholarships for the selected state (used by the cards and the table)
function getStateScholarships() {
  if (selectedState === "All") {
    return scholarships;
  }
  return scholarships.filter(function (item) {
    return item.state === selectedState;
  });
}

// ---------- drawing the page ----------

function renderCards() {
  const list = getStateScholarships();
  const published = list.filter(function (s) { return s.status === "Published"; }).length;
  const draft = list.filter(function (s) { return s.status === "Draft"; }).length;
  const expired = list.filter(function (s) { return s.status === "Expired"; }).length;

  document.getElementById("cards").innerHTML =
    '<div class="card c-total"><span>Total scholarships</span><strong>' + list.length + "</strong></div>" +
    '<div class="card c-pub"><span>Published</span><strong>' + published + "</strong></div>" +
    '<div class="card c-draft"><span>Draft</span><strong>' + draft + "</strong></div>" +
    '<div class="card c-exp"><span>Expired</span><strong>' + expired + "</strong></div>";
}

function renderTabs() {
  const names = ["All"].concat(states);
  let html = "";
  for (const name of names) {
    const label = name === "All" ? "All states" : name;
    html += '<button class="tab" data-state="' + name + '" aria-pressed="' +
            (name === selectedState) + '">' + label + "</button>";
  }
  document.getElementById("tabs").innerHTML = html;
}

function statusOptions(current) {
  let html = "";
  for (const status of statuses) {
    const selected = status === current ? " selected" : "";
    html += "<option" + selected + ">" + status + "</option>";
  }
  return html;
}

function renderTable() {
  // first the state filter, then the status filter
  const rows = getStateScholarships().filter(function (item) {
    return selectedStatus === "" || item.status === selectedStatus;
  });

  const listBox = document.getElementById("list");

  if (rows.length === 0) {
    listBox.innerHTML = '<div class="empty">No scholarships match these filters.</div>';
    return;
  }

  let html = "<table><thead><tr>" +
    "<th>Scholarship</th><th>State</th><th>Class</th><th>Deadline</th><th>Status</th><th>Actions</th>" +
    "</tr></thead><tbody>";

  for (const item of rows) {
    html += "<tr>" +
      '<td data-label="Scholarship"><div class="name">' + escapeHtml(item.name) + "</div>" +
        '<div class="prov">' + escapeHtml(item.provider) + "</div></td>" +
      '<td data-label="State">' + item.state + "</td>" +
      '<td data-label="Class">' + escapeHtml(item.applicableClass) + "</td>" +
      '<td data-label="Deadline">' + formatDate(item.deadline) + "</td>" +
      '<td data-label="Status"><select data-status-id="' + item.id + '" aria-label="Change status">' +
        statusOptions(item.status) + "</select></td>" +
      '<td data-label="Actions"><div class="actions">' +
        '<button class="btn ghost sm" data-edit-id="' + item.id + '">Edit</button>' +
        '<button class="btn ghost sm" data-preview-id="' + item.id + '">Preview</button>' +
      "</div></td></tr>";
  }

  html += "</tbody></table>";
  listBox.innerHTML = html;
}

function renderAll() {
  renderCards();
  renderTabs();
  renderTable();
}

// ---------- add / edit form ----------

function openForm(id) {
  editingId = id;

  // clear old error messages
  for (const name of fieldNames) {
    document.getElementById("e_" + name).textContent = "";
    document.getElementById("f_" + name).classList.remove("invalid");
  }

  if (id === null) {
    // empty form for a new scholarship
    document.getElementById("formTitle").textContent = "Add scholarship";
    for (const name of fieldNames) {
      document.getElementById("f_" + name).value = "";
    }
    document.getElementById("f_state").value = selectedState === "All" ? "Bihar" : selectedState;
    document.getElementById("f_status").value = "Draft";
  } else {
    // fill the form with the saved values
    const item = findScholarship(id);
    document.getElementById("formTitle").textContent = "Edit scholarship";
    for (const name of fieldNames) {
      document.getElementById("f_" + name).value = item[name];
    }
  }

  document.getElementById("formDlg").showModal();
}

function readForm() {
  const values = {};
  for (const name of fieldNames) {
    values[name] = document.getElementById("f_" + name).value.trim();
  }
  return values;
}

function validateForm(values) {
  const errors = {};

  if (values.name === "") errors.name = "Scholarship name is required.";
  if (values.provider === "") errors.provider = "Provider name is required.";
  if (values.applicableClass === "") errors.applicableClass = "Applicable class is required.";
  if (values.eligibility === "") errors.eligibility = "Eligibility criteria is required.";
  if (values.benefit === "") errors.benefit = "Amount or benefit is required.";

  if (values.link === "") {
    errors.link = "Official application link is required.";
  } else if (!values.link.startsWith("http://") && !values.link.startsWith("https://")) {
    errors.link = "Link must start with http:// or https://";
  }

  // show or clear the error under each field
  for (const name of fieldNames) {
    document.getElementById("e_" + name).textContent = errors[name] || "";
    document.getElementById("f_" + name).classList.toggle("invalid", Boolean(errors[name]));
  }

  return Object.keys(errors).length === 0;
}

function saveForm() {
  const values = readForm();

  if (!validateForm(values)) {
    return;   // stay on the form so the user can fix the errors
  }

  if (editingId === null) {
    values.id = nextId;
    nextId = nextId + 1;
    scholarships.push(values);
    showMessage("Scholarship added");
  } else {
    const item = findScholarship(editingId);
    Object.assign(item, values);
    showMessage("Changes saved");
  }

  document.getElementById("formDlg").close();
  renderAll();
}

// ---------- preview ----------

function openPreview(id) {
  const item = findScholarship(id);
  let notice = "";
  let badgeText = "Open";
  let applyButton = '<a class="btn" href="' + escapeHtml(item.link) +
                    '" target="_blank" rel="noopener noreferrer">Apply now</a>';

  if (item.status === "Draft") {
    notice = '<div class="warn">This is a draft. Students cannot see it until it is published.</div>';
    badgeText = "Not live";
  } else if (item.status === "Expired") {
    notice = '<div class="warn">This scholarship is expired and will show as closed.</div>';
    badgeText = "Closed";
    applyButton = '<button class="btn" disabled style="opacity:.5">Applications closed</button>';
  }

  document.getElementById("pvBody").innerHTML = notice +
    '<article class="pv">' +
      '<span class="badge b-' + item.status + '">' + badgeText + "</span>" +
      "<h3>" + escapeHtml(item.name) + "</h3>" +
      '<div class="prov">' + escapeHtml(item.provider) + " · " + item.state + "</div>" +
      "<dl>" +
        "<dt>Class</dt><dd>" + escapeHtml(item.applicableClass) + "</dd>" +
        "<dt>Benefit</dt><dd>" + escapeHtml(item.benefit) + "</dd>" +
        "<dt>Eligibility</dt><dd>" + escapeHtml(item.eligibility) + "</dd>" +
        "<dt>Last date</dt><dd>" + formatDate(item.deadline) + "</dd>" +
      "</dl>" + applyButton +
    "</article>";

  document.getElementById("pvDlg").showModal();
}

// ---------- events ----------

// state tabs
document.getElementById("tabs").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (button) {
    selectedState = button.dataset.state;
    renderAll();
  }
});

// status filter dropdown
document.getElementById("statusFilter").addEventListener("change", function (event) {
  selectedStatus = event.target.value;
  renderTable();
});

// Edit and Preview buttons in the table
document.getElementById("list").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.editId) {
    openForm(Number(button.dataset.editId));
  } else if (button.dataset.previewId) {
    openPreview(Number(button.dataset.previewId));
  }
});

// status dropdown inside a table row
document.getElementById("list").addEventListener("change", function (event) {
  const id = event.target.dataset.statusId;
  if (!id) return;

  const item = findScholarship(Number(id));
  item.status = event.target.value;
  showMessage("Status changed to " + item.status);
  renderAll();
});

document.getElementById("addBtn").addEventListener("click", function () {
  openForm(null);
});

document.getElementById("saveBtn").addEventListener("click", saveForm);

document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();
  saveForm();
});

// every close (x / Cancel / Close) button
for (const button of document.querySelectorAll("[data-close]")) {
  button.addEventListener("click", function () {
    button.closest("dialog").close();
  });
}

renderAll();