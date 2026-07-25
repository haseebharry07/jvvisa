const RECORDS_API = "/api/records";

// ---------- Guard: redirect to login if no token ----------
(function checkAuth() {
  const token = localStorage.getItem("jvvisa_token");
  if (!token) {
    window.location.href = "login.html";
  }
})();

document.getElementById("logout-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("jvvisa_token");
  localStorage.removeItem("jvvisa_user");
  window.location.href = "login.html";
});

function getAuthToken() {
  return localStorage.getItem("jvvisa_token");
}

function showPanelAlert(message, type = "danger") {
  const el = document.getElementById("panel-alert");
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.classList.remove("d-none");
}

// ---------- Load & render all records ----------
async function loadRecords() {
  const tbody = document.getElementById("records-table-body");
  try {
    const res = await fetch(RECORDS_API, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    const records = await res.json();

    if (!res.ok) {
      showPanelAlert(records.message || "Failed to load records");
      return;
    }

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No records yet</td></tr>`;
      return;
    }

    tbody.innerHTML = records
      .map(
        (rec) => `
        <tr>
          <td class="fw-semibold">${rec.visaNo}</td>
          <td>${rec.passportNo}</td>
          <td>${rec.images.length} photo(s)</td>
          <td>${new Date(rec.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${rec._id}">
              View Details
            </button>
            <button class="btn btn-sm btn-outline-danger delete-record-btn" data-id="${rec._id}">
              Delete
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    attachRowListeners();
  } catch (error) {
    console.error(error);
    showPanelAlert("Something went wrong loading records");
  }
}

function attachRowListeners() {
  document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", () => showDetails(btn.dataset.id));
  });
  document.querySelectorAll(".delete-record-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteRecord(btn.dataset.id));
  });
}

// ---------- View details modal ----------
async function showDetails(id) {
  try {
    const res = await fetch(`${RECORDS_API}/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    const record = await res.json();

    if (!res.ok) {
      showPanelAlert(record.message || "Failed to load record");
      return;
    }

    const imagesHtml = record.images
      .map(
        (img) => `
        <div class="col-md-4 mb-3">
          <img src="${img.url}" class="img-fluid rounded border" alt="Visa document"/>
        </div>
      `
      )
      .join("");

    document.getElementById("details-modal-body").innerHTML = `
      <p><strong>Visa No:</strong> ${record.visaNo}</p>
      <p><strong>Passport No:</strong> ${record.passportNo}</p>
      <hr/>
      <div class="row">${imagesHtml}</div>
    `;

    const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
    modal.show();
  } catch (error) {
    console.error(error);
    showPanelAlert("Something went wrong loading details");
  }
}

// ---------- Delete a record ----------
async function deleteRecord(id) {
  if (!confirm("Are you sure you want to delete this record?")) return;

  try {
    const res = await fetch(`${RECORDS_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    const data = await res.json();

    if (!res.ok) {
      showPanelAlert(data.message || "Failed to delete record");
      return;
    }

    loadRecords();
  } catch (error) {
    console.error(error);
    showPanelAlert("Something went wrong deleting the record");
  }
}

// ---------- Add new record ----------
const addForm = document.getElementById("add-record-form");
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const visaNo = document.getElementById("visaNo").value.trim();
    const passportNo = document.getElementById("passportNo").value.trim();
    const imageFiles = document.getElementById("images").files;
    const submitBtn = document.getElementById("add-record-btn");

    if (imageFiles.length === 0) {
      showPanelAlert("Please select at least one image");
      return;
    }

    const formData = new FormData();
    formData.append("visaNo", visaNo);
    formData.append("passportNo", passportNo);
    for (const file of imageFiles) {
      formData.append("images", file); // must match upload.array('images', 10)
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
      const res = await fetch(RECORDS_API, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` }, // no Content-Type — browser sets it for FormData
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        showPanelAlert(data.message || "Failed to add record");
        return;
      }

      showPanelAlert("Record added successfully!", "success");
      addForm.reset();
      loadRecords();
    } catch (error) {
      console.error(error);
      showPanelAlert("Something went wrong adding the record");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Add Record";
    }
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", loadRecords);