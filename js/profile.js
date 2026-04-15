// שליפת פרטי המשתמש המחובר + בדיקת RFID
setTimeout(() => {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    document.getElementById("p_name").innerText = user.displayName || "לא מוגדר";
    document.getElementById("p_email").innerText = user.email;
    document.getElementById("p_uid").innerText = user.uid;
    document.getElementById("p_lastLogin").innerText = new Date(user.metadata.lastSignInTime).toLocaleString("he-IL");
    document.getElementById("p_created").innerText = new Date(user.metadata.creationTime).toLocaleString("he-IL");

    // בדיקה אם יש כרטיס RFID משויך
    const badge = document.getElementById("rfid-badge");
    const statusEl = document.getElementById("current-rfid-status");

    firebase.database().ref(`users/${user.uid}/rfid`).once('value').then((snap) => {
      if (snap.exists()) {
        if (badge) {
          badge.classList.remove('bg-warning', 'text-dark');
          badge.classList.add('bg-success');
          badge.innerText = 'מקושר';
        }
        if (statusEl) statusEl.innerText = 'כרטיס מקושר: ' + snap.val();
      } else {
        if (badge) {
          badge.classList.remove('bg-success');
          badge.classList.add('bg-warning', 'text-dark');
          badge.innerText = 'לא מקושר';
        }
        if (statusEl) statusEl.innerText = 'ממתין לסריקה';
      }
    });
  });
}, 1000);

// חיבור כפתורים
document.addEventListener('DOMContentLoaded', () => {
  const rfidBtn = document.getElementById('link-rfid-btn');
  if (rfidBtn) rfidBtn.addEventListener('click', () => linkRfidToUser());

  const logoutBtn = document.getElementById('profile-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => logoutUser());
});
