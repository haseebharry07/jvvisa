const VERIFY_API = "/api/records/verify";
document.addEventListener("DOMContentLoaded", () => {
  const visaForm = document.getElementById("visaVerificationForm");
  const resultBox = document.getElementById("verificationResultBox");
  const verifyHeading = document.getElementById("verifyHeading");

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
    // Hide heading, form, and button once a match is found
    if (verifyHeading) verifyHeading.style.display = "none";
    visaForm.style.display = "none";

    const imagesHtml = record.images
      .map(
        (url) => `
        <div class="visa-image-wrapper mb-4">
          <img src="${url}" alt="Visa document" class="img-fluid"/>
        </div>
      `
      )
      .join("");

    resultBox.innerHTML = `
      <div class="text-center my-3">
        ${imagesHtml}
        <button type="button" id="verifyAnotherBtn" class="btn btn-outline-secondary mt-2">
          <i class="fa fa-rotate-left me-2"></i> Verify Another
        </button>
      </div>
    `;

    // Let the user come back to the form
    document.getElementById("verifyAnotherBtn").addEventListener("click", () => {
      visaForm.reset();
      if (verifyHeading) verifyHeading.style.display = "";
      visaForm.style.display = "";
      resultBox.innerHTML = "";
      resultBox.style.display = "none";
    });
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