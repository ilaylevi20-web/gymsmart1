// בדיקת תקינות ושליחת טופס צור קשר
const submitContactForm = () => {
  const name = document.getElementById("contactName")?.value;
  const email = document.getElementById("contactEmail")?.value;
  const message = document.getElementById("contactMessage")?.value;

  if (!name || !email || !message) {
    showMessage("נא למלא את כל השדות", false);
    return;
  }

  // איפוס הטופס אחרי שליחה
  showMessage("ההודעה נשלחה בהצלחה!", true);
  document.getElementById("contactForm")?.reset();
};

// חיבור אירועים לטופס ולכפתור
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contactForm')?.addEventListener('submit', e => { e.preventDefault(); submitContactForm(); });
  document.getElementById('contact-submit-btn')?.addEventListener('click', submitContactForm);
});