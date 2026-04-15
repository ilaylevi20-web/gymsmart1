// --- 1. הגדרות Firebase מעודכנות ---
const firebaseConfig = {
  apiKey: "AIzaSyB9828WAtk1LESCr0vAL64gR1c7GmFHBXg",
  authDomain: "smart-gym-80755.firebaseapp.com",
  databaseURL: "https://smart-gym-80755-default-rtdb.firebaseio.com",
  projectId: "smart-gym-80755",
  storageBucket: "smart-gym-80755.firebasestorage.app",
  messagingSenderId: "883040693948",
  appId: "1:883040693948:web:a1a316f9674dd6ab036ab9"
};


function showNotification(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '9999', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      pointerEvents: 'none'
    });
    document.body.appendChild(container);
  }

  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.textContent = `${icons[type] || icons.info} ${message}`;
  Object.assign(toast.style, {
    background: '#1e1e2e', color: '#f0f0f0', padding: '14px 28px',
    borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'inherit',
    boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${colors[type] || colors.info}40`,
    borderRight: `4px solid ${colors[type] || colors.info}`,
    opacity: '0', transform: 'translateY(-20px)', transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
    pointerEvents: 'auto', maxWidth: '90vw', textAlign: 'center', direction: 'rtl'
  });

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// משתנים גלובליים
var auth = null;
var database = null;
var firebaseReady = false;

// אתחול Firebase מאובטח עם הגנות
function initializeFirebase() {
  console.log("🚀 מתחיל אתחול Firebase");
  
  // בדיקה ש-Firebase SDK נטען
  if (typeof firebase === 'undefined') {
    console.error("❌ Firebase SDK לא נטען");
    return false;
  }

  try {
    console.log("🔧 מאתחל Firebase...");

    // אתחול רק אם עוד לא אותחל
    if (!firebase.apps.length) {
      try {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase אותחל בהצלחה");
      } catch (initError) {
        console.error("❌ שגיאת אתחול Firebase:", initError);
        if (initError.message && initError.message.includes("api-key-not-valid")) {
          console.log("🚫 חסימת הצגת שגיאת API key למשתמש");
          throw new Error("API_KEY_BLOCKED");
        }
        throw initError;
      }
    } else {
      console.log("✅ Firebase כבר מאותחל");
    }
    
    // הגדרת שירותים
    try {
      auth = firebase.auth();
      database = firebase.database();
    } catch (serviceError) {
      console.error("❌ שגיאה בהגדרת שירותים:", serviceError);
      throw new Error("SERVICES_BLOCKED");
    }
    
    // בדיקת תקינות
    if (!auth || !database) {
      throw new Error("שירותי Firebase לא זמינים");
    }
    
    console.log("✅ כל שירותי Firebase פועלים");
    firebaseReady = true;
    
    // בדיקה מיידית של סטטוס המשתמש הנוכחי
    setTimeout(() => {
      const currentUser = auth.currentUser;
      console.log("👤 משתמש נוכחי בטעינה:", currentUser?.email || "אין");
    }, 500);
    
    return true;
    
  } catch (error) {
    console.error("❌ שגיאה באתחול Firebase:", error);
    
    // איפוס משתנים במקרה של שגיאה
    auth = null;
    database = null;
    firebaseReady = false;
    
    // הצגת הודעה ידידותית למשתמש
    setTimeout(() => {
      if (typeof showMessage === 'function') {
        if (error.message === "API_KEY_BLOCKED" || error.message === "SERVICES_BLOCKED") {
          showMessage("בעיה בהגדרות המערכת. אנא צור קשר עם התמיכה", false);
        } else {
          showMessage("שגיאה באתחול המערכת. אנא רענן את הדף", false);
        }
      }
    }, 500);
    
    return false;
  }
}

// קריאה לאתחול עם הגנות
console.log("🎬 מתחיל תהליך האתחול...");
try {
  initializeFirebase();
} catch (globalError) {
  console.error("❌ שגיאה גלובלית באתחול:", globalError);
  
  setTimeout(() => {
    const errorMsg = globalError.message && globalError.message.includes("api-key") 
      ? "בעיה בהגדרות המערכת. צור קשר עם התמיכה טכנית"
      : "שגיאה קריטית במערכת. אנא רענן את הדף";
    
    if (typeof showMessage === 'function') {
      showMessage(errorMsg, false);
    } else {
      showNotification(errorMsg, 'error');
    }
  }, 500);
}

// תפיסה גלובלית לשגיאות JavaScript לא מטופלות
window.addEventListener('error', (event) => {
  console.error('❌ שגיאה JavaScript לא מטופלת:', event.error);
  
  if (event.error && event.error.message && 
      (event.error.message.includes('api-key-not-valid') || 
       event.error.message.includes('invalid-api-key'))) {
    
    event.preventDefault();
    
    setTimeout(() => {
      if (typeof showMessage === 'function') {
        showMessage("בעיה בהגדרות המערכת. המערכת אינה זמינה כרגע", false);
      } else {
        showNotification("בעיה בהגדרות המערכת. המערכת אינה זמינה כרגע", 'error');
      }
    }, 100);
  }
});

// תפיסה גלובלית ל-Promise שנדחו
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise נדחה:', event.reason);
  
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('api-key-not-valid') || 
       event.reason.message.includes('invalid-api-key'))) {
    
    event.preventDefault();
    
    setTimeout(() => {
      if (typeof showMessage === 'function') {
        showMessage("בעיה בהגדרות המערכת. צור קשר עם המנהל", false);
      } else {
        showNotification("בעיה בהגדרות המערכת. צור קשר עם המנהל", 'error');
      }
    }, 100);
  }
});

// --- 2. פונקציות עזר מעודכנות ---
function showMessage(message, isSuccess) {
  // בדיקה ברמה האחרונה - האם מישהו מנסה להציג שגיאה טכנית?
  if (message && typeof message === 'string' && 
      (message.includes('api-key-not-valid') || 
       message.includes('invalid-api-key') || 
       message.includes('api-key') || 
       message.includes('Firebase: Error (auth/'))) {
    console.warn("🚫 חסימת הצגת שגיאה טכנית:", message);
    message = "בעיה בהגדרות המערכת. צור קשר עם המנהל";
    isSuccess = false;
  }
  
  console.log(isSuccess ? "✅" : "❌", message);
  
  var messageDiv = document.getElementById("feedback-message");
  if (!messageDiv) {
    showNotification(message, isSuccess ? 'success' : 'error');
    return;
  }
  
  // ניקוי הודעות קודמות
  messageDiv.classList.remove("success-msg", "error-msg");
  messageDiv.innerHTML = `<div class="alert ${isSuccess ? 'alert-success' : 'alert-danger'} mb-3">${message}</div>`;
  messageDiv.style.display = "block";
  
  // הסתרה אוטומטית אחרי 4 שניות
  setTimeout(() => {
    if (messageDiv) {
      messageDiv.style.display = "none";
      messageDiv.innerHTML = "";
    }
  }, 4000);
}

// פונקציית יציאה
async function logoutUser() {
  console.log("🚪 מתנתק מהמערכת");
  
  if (!auth || !firebaseReady) {
    showMessage("שגיאה במערכת", false);
    return;
  }
  
  showNotification('מתנתק מן המערכת...', 'info');
  
  try {
    await auth.signOut();
    console.log("✅ יציאה הצליחה");
    showNotification('התנתקת בהצלחה', 'success');
    
    // מעבר לעמוד הבית עם עיכוב קצר
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
    
  } catch (error) {
    console.error("❌ שגיאה ביציאה:", error);
    showMessage("שגיאה ביציאה מהמערכת", false);
    
    // גם אם נכשל - מעבר לדף הבית (לשמירה על חוויית משתמש)
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  }
}

// --- 4. מעקב סטטוס משתמש ---
function setupAuthStateListener() {
  if (!auth || !firebaseReady) {
    console.log("⚠️ Firebase לא מוכן עדיין למעקב סטטוס");
    return;
  }
  
  console.log("👂 מגדיר מאזין לשינויי סטטוס משתמש");
  
  auth.onAuthStateChanged((user) => {
    console.log(user ? "👤 משתמש מחובר:" : "👤 אין משתמש מחובר", user?.email || user?.uid);
    
    const loginLink = document.getElementById("loginLinkWrapper");
    const userInfo = document.getElementById("userInfo");
    const logoutWrap = document.getElementById("logoutWrapper");
    const userName = document.getElementById("userNameDisplay");
    
    if (!loginLink) {
      console.log("📄 אין אלמנטי ניווט בדף זה");
      return; // אם אין אלמנטי ניווט, לא נעשה כלום
    }
    
    if (user) {
      // משתמש מחובר - מעדכן UI
      console.log("🔄 מעדכן UI למשתמש מחובר");
      loginLink.classList.add("d-none");
      userInfo?.classList.remove("d-none");
      logoutWrap?.classList.remove("d-none");
      
      if (userName) {
        const displayName = user.displayName || user.email?.split('@')[0] || "משתמש";
        userName.textContent = `שלום, ${displayName}`;
        console.log("✅ שם משתמש עודכן:", displayName);
      }
      
    } else {
      // משתמש לא מחובר - מעדכן UI
      console.log("🔄 מעדכן UI למשתמש לא מחובר");
      loginLink.classList.remove("d-none");
      userInfo?.classList.add("d-none");
      logoutWrap?.classList.add("d-none");
      
      if (userName) {
        userName.textContent = "";
      }
    }
  });
}

// --- 5. אתחול המערכת ---

// חיבור כפתורי אירועים
function setupButtonEvents() {
  console.log("🔘 מגדיר אירועי כפתורים");
  
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    // הסרת מאזינים קיימים למניעת כפילות
    logoutBtn.replaceWith(logoutBtn.cloneNode(true));
    const newLogoutBtn = document.getElementById("logoutBtn");
    
    newLogoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🚪 לחיצה על כפתור יציאה");
      logoutUser();
    });
    
    console.log("✅ כפתור יציאה חובר");
  } else {
    console.log("ℹ️ כפתור יציאה לא נמצא (נורמלי בדפי התחברות)");
  }
}

// פונקציה להצגת הודעות RFID
function showRfidMessage(message, type) {
  console.log(type === "success" ? "✅" : "❌", "RFID:", message);

  const container = document.getElementById("rfid-feedback-container");
  if (!container) {
    // fallback לשימוש בהודעה רגילה
    showMessage(message, type === "success");
    return;
  }

  const alertClass = type === "success" ? "alert-success" : type === "info" ? "alert-info" : "alert-danger";
  container.innerHTML = `<div class="alert ${alertClass} mb-0">${message}</div>`;
  container.style.display = "block";

  // הסתרה אוטומטית אחרי 5 שניות
  setTimeout(() => {
    if (container) {
      container.style.display = "none";
      container.innerHTML = "";
    }
  }, 5000);
}

// משתנה גלובלי לביטול האזנה ל-RFID
var rfidListenerRef = null;
var rfidTimeout = null;

// פונקציה לביטול ההמתנה ל-RFID
function cancelRfidWait() {
  if (rfidListenerRef) {
    rfidListenerRef.off();
    rfidListenerRef = null;
    console.log("🛑 האזנה ל-RFID בוטלה");
  }
  if (rfidTimeout) {
    clearTimeout(rfidTimeout);
    rfidTimeout = null;
  }
}

// פונקציה לקישור כרטיס RFID לחשבון המשתמש
async function linkRfidToUser() {
  console.log("🔗 מתחיל תהליך קישור כרטיס RFID");

  // ביטול האזנה קודמת אם קיימת
  cancelRfidWait();

  const currentUser = firebase.auth().currentUser;

  if (!currentUser) {
    showRfidMessage("שגיאה: עליך להיות מחובר כדי לקשר כרטיס RFID", "error");
    console.error("❌ אין משתמש מחובר");
    return;
  }

  const userId = currentUser.uid;
  console.log("👤 משתמש מחובר:", userId);

  // 🔍 בדיקה מוקדמת - אם למשתמש כבר יש כרטיס
  try {
    const userRfidSnapshot = await firebase.database().ref(`users/${userId}/rfid`).once('value');
    if (userRfidSnapshot.exists()) {
      showRfidMessage("❌ לחשבון שלך כבר מקושר כרטיס RFID.", "error");
      return;
    }
  } catch (err) {
    console.error("❌ שגיאה בבדיקת משתמש:", err);
    showRfidMessage("❌ שגיאה בבדיקת הנתונים. נסה שוב.", "error");
    return;
  }

  const statusElement = document.getElementById("current-rfid-status");
  const linkButton = document.getElementById("link-rfid-btn");

  if (statusElement) {
    statusElement.innerText = "ממתין לסריקת כרטיס... הנח כרטיס RFID על הקורא";
  }

  if (linkButton) {
    linkButton.disabled = true;
    linkButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>ממתין לכרטיס...';
  }

  showRfidMessage("⏳ הנח את כרטיס ה-RFID על הקורא. ממתין עד 30 שניות...", "info");

  try {
    // 📡 שלב 1: איפוס שדה ה-RFID כדי שנזהה שינוי חדש
    console.log("🧹 מאפס שדה RFID לפני האזנה...");
    await firebase.database().ref('/rfid').set(null);

    // 📡 שלב 2: המתנה לשינוי - מאזינים לערך חדש
    const rfidValue = await new Promise((resolve, reject) => {
      const rfidRef = firebase.database().ref('/rfid');
      rfidListenerRef = rfidRef;

      // timeout של 30 שניות
      rfidTimeout = setTimeout(() => {
        rfidRef.off();
        rfidListenerRef = null;
        reject(new Error("TIMEOUT"));
      }, 30000);

      // countdown בUI
      let secondsLeft = 30;
      const countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0 || !rfidListenerRef) {
          clearInterval(countdownInterval);
          return;
        }
        if (statusElement) {
          statusElement.innerText = `ממתין לסריקת כרטיס... (${secondsLeft} שניות)`;
        }
      }, 1000);

      console.log("👂 מאזין לשינוי ב-RFID...");
      rfidRef.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          // כרטיס נסרק! עצור הכל ולקט את הערך
          console.log("🔔 זוהה כרטיס RFID חדש:", val);
          clearTimeout(rfidTimeout);
          clearInterval(countdownInterval);
          rfidTimeout = null;
          rfidRef.off();
          rfidListenerRef = null;
          resolve(val);
        }
      });
    });

    console.log("🔍 ערך RFID שנקרא:", rfidValue);

    if (statusElement) {
      statusElement.innerText = "כרטיס זוהה! מעבד...";
    }

    // 🔍 שלב 3: בדיקה אם RFID כבר משויך למשתמש אחר
    console.log("🔍 בודק אם הכרטיס כבר משויך...");
    
    // בדיקה ראשונה: טבלת rfids (אינדקס מהיר)
    const existingRfidSnapshot = await firebase.database().ref(`rfids/${rfidValue}`).once('value');

    if (existingRfidSnapshot.exists()) {
      const existingUid = existingRfidSnapshot.val();
      if (existingUid !== userId) {
        throw new Error("RFID_ALREADY_ASSIGNED");
      }
    }

    // בדיקה שנייה: סריקת כל המשתמשים לוודא שאף אחד אחר לא משתמש באותו RFID
    console.log("🔍 בודק בכל המשתמשים אם הכרטיס כבר בשימוש...");
    const usersWithSameRfid = await firebase.database()
      .ref('users')
      .orderByChild('rfid')
      .equalTo(rfidValue)
      .once('value');

    if (usersWithSameRfid.exists()) {
      let assignedToOther = false;
      usersWithSameRfid.forEach((child) => {
        if (child.key !== userId) {
          assignedToOther = true;
          console.warn("⚠️ כרטיס RFID כבר משויך למשתמש:", child.key);
        }
      });
      if (assignedToOther) {
        throw new Error("RFID_ALREADY_ASSIGNED");
      }
    }

    // 💾 שלב 4: שמירה אטומית (multi-path update)
    console.log("💾 שומר RFID למשתמש ולמערכת...");

    // קריאת שם המשתמש מה-Database (נשמר בהרשמה)
    const userDataSnap = await firebase.database().ref(`users/${userId}`).once('value');
    const existingData = userDataSnap.val() || {};
    
    // אם אין שם ב-DB, ננסה מ-Auth ונשמור
    let firstName = existingData.firstName || '';
    let lastName = existingData.lastName || '';
    
    if (!firstName) {
      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'לא ידוע';
      const nameParts = displayName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const updates = {};
    updates[`users/${userId}/rfid`] = rfidValue;
    updates[`users/${userId}/rfidLinkedAt`] = firebase.database.ServerValue.TIMESTAMP;
    updates[`users/${userId}/firstName`] = firstName;
    updates[`users/${userId}/lastName`] = lastName;
    updates[`users/${userId}/email`] = currentUser.email || '';
    updates[`rfids/${rfidValue}`] = userId;

    await firebase.database().ref().update(updates);

    // 🧹 שלב 5: ניקוי שדה RFID
    await firebase.database().ref('/rfid').set(null);

    console.log("✅ כרטיס RFID קושר בהצלחה:", rfidValue);

    // 🎨 עדכון UI
    if (statusElement) {
      statusElement.innerText = `כרטיס ${rfidValue} מקושר בהצלחה!`;
    }

    showRfidMessage(`✅ כרטיס RFID קושר בהצלחה! מספר כרטיס: <strong>${rfidValue}</strong>`, "success");

    const badge = document.querySelector('.rfid-link-section .badge');
    if (badge) {
      badge.classList.remove('bg-warning', 'text-dark');
      badge.classList.add('bg-success');
      badge.innerText = 'מקושר';
    }

  } catch (error) {
    console.error("❌ שגיאה בקישור כרטיס RFID:", error);

    let errorMessage = "שגיאה בקישור הכרטיס";

    if (error.message === "TIMEOUT") {
      errorMessage = "לא זוהה כרטיס RFID תוך 30 שניות. אנא נסה שוב.";

    } else if (error.message === "RFID_ALREADY_ASSIGNED") {
      errorMessage = "כרטיס RFID זה כבר משויך למשתמש אחר.";

    } else if (error.code === "PERMISSION_DENIED") {
      errorMessage = "אין הרשאה לעדכן נתונים.";

    } else if (error.message && error.message.includes('network')) {
      errorMessage = "בעיית אינטרנט. נסה שוב.";
    }

    showRfidMessage(`❌ ${errorMessage}`, "error");

    if (statusElement) {
      statusElement.innerText = "נכשל - נסה שוב";
    }

  } finally {
    cancelRfidWait();
    if (linkButton) {
      linkButton.disabled = false;
      linkButton.innerHTML = '<i class="bi bi-link-45deg me-1"></i>קשר כרטיס לחשבוני';
    }
  }
}

// הפיכת פונקציות לגלובליות לשימוש ב-HTML
window.logoutUser = logoutUser;
window.linkRfidToUser = linkRfidToUser;
window.cancelRfidWait = cancelRfidWait;
window.showRfidMessage = showRfidMessage;

// אתחול כשהדף נטען
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 הדף נטען, מאתחל מערכת...");
  
  // מתן זמן ל-Firebase להתאתחל
  setTimeout(() => {
    if (!firebaseReady) {
      console.log("⏳ Firebase עדיין נטען, מחכה...");
      setTimeout(() => {
        if (!firebaseReady) {
          showMessage("בעיה באתחול המערכת. אנא רענן את הדף", false);
        }
      }, 3000);
    } else {
      console.log("✅ Firebase מוכן ופועל");
    }
    
    // הגדרת מאזינים (תמיד)
    setupButtonEvents();
    
    // ניסיון הגדרת מאזין סטטוס עם retry
    const setupAuthWithRetry = () => {
      if (auth && firebaseReady) {
        setupAuthStateListener();
        console.log("✅ מאזין סטטוס הוגדר בהצלחה");
      } else {
        console.log("⚠️ מחכה ל-Firebase לפני הגדרת מאזין סטטוס...");
        setTimeout(setupAuthWithRetry, 1000);
      }
    };
    setupAuthWithRetry();
    
  }, 500);
  
  console.log("🎉 תהליך האתחול החל");
});