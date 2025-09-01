document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // ทำเหมือนตรวจสอบจริง
    if (username.length > 0 && password.length > 0) {
      // เข้าสู่ dashboard เสมอ
      window.location.href = "dashboard.html";
    } else {
      errorMsg.textContent = "Invalid credentials, please try again.";
    }
  });
});
