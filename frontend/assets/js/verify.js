const VERIFY_API = "/api/records/verify";
document.addEventListener("DOMContentLoaded", () => {
  const visaForm = document.getElementById("visaVerificationForm");
  const resultBox = document.getElementById("verificationResultBox");

  if (!visaForm || !resultBox) return;

  visaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const visaNo = document.getElementById("visaRefInput").value.trim();
    const passportNo = document.getElementById("passportInput").value.trim();

    if (!visaNo || !passportNo) {
      alert("Please enter both Visa No and Passport Number to verify.");
      return;
    }

    // Loading state
    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status" style="width: 3.5rem; height: 3.5rem;">
          <span class="visually-hidden">Searching...</span>
        </div>
        <p class="mt-3 text-dark fw-bold fs-5">Checking records...</p>
      </div>
    `;

    try {
      const res = await fetch(VERIFY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visaNo, passportNo }),
      });

      const data = await res.json();

      if (!res.ok) {
        displayNotFound(visaNo, passportNo);
        return;
      }

      displayFound(data);
    } catch (error) {
      console.error(error);
      resultBox.innerHTML = `
        <div class="alert alert-danger mt-3">
          Something went wrong while checking your record. Please try again later.
        </div>
      `;
    }
  });

  function displayFound(record) {
    const imagesHtml = record.images
      .map(
        (url) => `
        <div class="col-12 mb-3">
          <img src="${url}" alt="Visa document" class="img-fluid rounded border shadow-sm w-100" style="object-fit: contain; background: #fff;"/>
        </div>
      `
      )
      .join("");

    resultBox.innerHTML = `
      <div class="card border-0 shadow-lg overflow-hidden my-3">
        <div class="card-body p-4 bg-white">
          <div class="table-responsive mb-4">
            <table class="table table-bordered align-middle">
              <tbody>
                <tr>
                  <th class="bg-light w-35 text-secondary">VISA NO</th>
                  <td class="fw-bold fs-5 text-primary">${record.visaNo}</td>
                </tr>
                <tr>
                  <th class="bg-light text-secondary">PASSPORT NUMBER</th>
                  <td class="fw-bold fs-5 text-dark">${record.passportNo}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="row">${imagesHtml}</div>
        </div>
      </div>
    `;
  }

  function displayNotFound(visaNo, passportNo) {
    resultBox.innerHTML = `
      <div class="card border-danger shadow-sm my-3">
        <div class="card-body text-center p-4">
          <h5 class="fw-bold text-danger">Record Not Found</h5>
          <p class="text-muted mb-0">No record matching Visa No <strong>${visaNo}</strong> and Passport Number <strong>${passportNo}</strong> was found.</p>
          <p class="small text-secondary mt-2">Please double-check your details or contact us at <strong>jvvisa596@gmail.com</strong>.</p>
        </div>
      </div>
    `;
  }
});