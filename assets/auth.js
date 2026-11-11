
(() => {
  const ACCESS_CODE = "HiHi";
  const SESSION_KEY = "itkb_access_granted";

  // Bereits freigeschaltet? Dann keine Abfrage anzeigen.
  if (sessionStorage.getItem(SESSION_KEY) === "yes") return;

  document.documentElement.style.visibility = "hidden";

  function showLogin() {
    document.documentElement.style.visibility = "visible";

    document.body.innerHTML = `
      <div id="login-screen">
        <div class="login-box">
          <div class="lock">🔒</div>
          <h1>Willkommen</h1>
          <p>Diese IT Knowledge Base ist geschützt.</p>
          <p>Bitte gib deinen Zugangscode ein.</p>

          <form id="login-form">
            <input
              id="access-code"
              type="password"
              placeholder="Zugangscode"
              autocomplete="off"
              required
            >
            <button type="submit">Freischalten</button>
            <p id="error"></p>
          </form>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      #login-screen {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: grid;
        place-items: center;
        padding: 20px;
        background: #f1f5fb;
        font-family: Arial, sans-serif;
        color: #172033;
      }
      .login-box {
        width: 100%;
        max-width: 380px;
        padding: 35px;
        text-align: center;
        background: white;
        border: 1px solid #dce3ee;
        border-radius: 16px;
        box-shadow: 0 15px 45px #17203318;
      }
      .lock { font-size: 35px; margin-bottom: 15px; }
      .login-box h1 { margin: 0 0 12px; }
      .login-box p { color: #64748b; line-height: 1.5; }
      #access-code {
        box-sizing: border-box;
        width: 100%;
        padding: 13px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 16px;
      }
      #login-form button {
        width: 100%;
        margin-top: 12px;
        padding: 13px;
        border: 0;
        border-radius: 8px;
        background: #2563c7;
        color: white;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
      }
      #error { color: #c0392b !important; font-size: 13px; }
    `;
    document.head.appendChild(style);

    document.getElementById("login-form")
      .addEventListener("submit", function(event) {
        event.preventDefault();

        const code = document.getElementById("access-code").value;

        if (code === ACCESS_CODE) {
          sessionStorage.setItem(SESSION_KEY, "yes");
          location.reload();
        } else {
          document.getElementById("error").textContent =
            "Falscher Zugangscode. Bitte erneut versuchen.";
        }
      });

    document.getElementById("access-code").focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showLogin);
  } else {
    showLogin();
  }
})();
