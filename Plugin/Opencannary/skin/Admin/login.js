document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // ทำเหมือนตรวจสอบจริง
    if (username.length > 0 && password.length > 0) {
      const firstChar = username.charAt(0).toLowerCase(); // เอาตัวแรกแล้วทำเป็น lowercase
      if (["a", "r"].includes(firstChar)) {
        window.location.href = "dashboard.html";
      }else{
        window.location.href = "user/hero.html";
      }
    } else {
      errorMsg.textContent = "Invalid credentials, please try again.";
    }
  });
});
