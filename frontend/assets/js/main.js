/* Main JavaScript for JV VISA Clone */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Preloader Logic with Spinning Logo
    const preloader = document.getElementById("preloader");
    if (preloader) {
        setTimeout(function () {
            preloader.classList.add("fade-out");
            setTimeout(function () {
                preloader.style.display = "none";
            }, 600);
        }, 1200);
    }

    // 2. Scroll to Top Button
    const scrollTopBtn = document.getElementById("o_footer_scrolltop");
    if (scrollTopBtn) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 300) {
                scrollTopBtn.style.display = "flex";
            } else {
                scrollTopBtn.style.display = "none";
            }
        });

        scrollTopBtn.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // 4. Contact Form Submission
    const contactForm = document.getElementById("contactus_form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const submitBtn = contactForm.querySelector(".s_website_form_send");
            if (submitBtn) {
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Sending...`;
                submitBtn.classList.add("disabled");
            }

            setTimeout(function () {
                alert("Thank you! Your message has been sent successfully. JV Visa team will get back to you shortly.");
                contactForm.reset();
                if (submitBtn) {
                    submitBtn.innerHTML = `Submit`;
                    submitBtn.classList.remove("disabled");
                }
            }, 1000);
        });
    }
});
