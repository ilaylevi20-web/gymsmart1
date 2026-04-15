// בדיקת תקינות אימייל
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// בדיקה שכל השדות מלאים
function validateFields(fields) {
  for (let fieldId of fields) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      return false;
    }
  }
  return true;
}

// פונקציית התחברות משופרת
async function loginUser() {
  console.log("🔐 מתחיל תהליך התחברות");
  
  // בדיקה שFirebase מוכן
  if (!auth || !firebaseReady) {
    showMessage("המערכת עדיין נטענת... נסה שוב בעוד רגע", false);
    return;
  }
  
  // קבלת נתונים מהטופס
  const email = document.getElementById("loginEmail")?.value?.trim();
  const password = document.getElementById("loginPass")?.value?.trim();
  
  // בדיקות וולידציה
  if (!validateFields(["loginEmail", "loginPass"])) {
    showMessage("אנא מלא את כל השדות", false);
    return;
  }
  
  if (!isValidEmail(email)) {
    showMessage("כתובת אימייל לא תקינה", false);
    return;
  }
  
  // התחלת תהליך ההתחברות
  showMessage("מתחבר למערכת...", true);
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log("✅ התחברות הצליחה:", user.uid);
    showMessage("התחברת בהצלחה! מעבר לעמוד הראשי...", true);
    
    // ניקוי שדות
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPass").value = "";
    
    // מעבר לעמוד השירות
    setTimeout(() => {
      window.location.href = "service.html";
    }, 1500);
    
  } catch (error) {
    console.error("❌ שגיאת התחברות:", error);
    
    // טיפול מיוחד בשגיאת API key
    if (error.code === 'auth/invalid-api-key' || 
        error.code === 'auth/api-key-not-valid' ||
        (error.message && error.message.includes('api-key'))) {
      console.log("🚫 חסימת שגיאת API key");
      showMessage("בעיה בהגדרות המערכת. צור קשר עם המנהל", false);
    } else {
      handleAuthError(error, "התחברות");
    }
  }
}

// פונקציית הרשמה משופרת
async function registerUser() {
  console.log("📝 מתחיל תהליך הרשמה");
  
  // בדיקה שFirebase מוכן
  if (!auth || !firebaseReady) {
    showMessage("המערכת עדיין נטענת... נסה שוב בעוד רגע", false);
    return;
  }
  
  // קבלת נתונים מהטופס
  const email = document.getElementById("regEmail")?.value?.trim();
  const password = document.getElementById("regPass")?.value?.trim();
  const name = document.getElementById("regName")?.value?.trim();
  
  // בדיקות וולידציה
  if (!validateFields(["regEmail", "regPass", "regName"])) {
    showMessage("אנא מלא את כל השדות", false);
    return;
  }
  
  if (!isValidEmail(email)) {
    showMessage("כתובת אימייל לא תקינה", false);
    return;
  }
  
  if (password.length < 6) {
    showMessage("הסיסמה חייבת להכיל לפחות 6 תווים", false);
    return;
  }
  
  // התחלת תהליך ההרשמה
  showMessage("יוצר חשבון חדש...", true);
  
  try {
    // יצירת החשבון
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // עדכון הפרופיל עם השם
    await user.updateProfile({
      displayName: name
    });

    // שמירת שם המשתמש גם ב-Realtime Database
    const regNameParts = name.split(" ");
    const regFirstName = regNameParts[0] || "";
    const regLastName = regNameParts.slice(1).join(" ") || "";
    await database.ref(`users/${user.uid}`).update({
      firstName: regFirstName,
      lastName: regLastName,
      email: email
    });
    
    console.log("✅ הרשמה הצליחה:", user.uid);
    showMessage("נרשמת בהצלחה! מעבר לעמוד הראשי...", true);
    
    // ניקוי שדות
    document.getElementById("regEmail").value = "";
    document.getElementById("regPass").value = "";
    document.getElementById("regName").value = "";
    
    // מעבר לעמוד השירות
    setTimeout(() => {
      window.location.href = "service.html";
    }, 1500);
    
  } catch (error) {
    console.error("❌ שגיאת הרשמה:", error);
    
    // טיפול מיוחד בשגיאת API key
    if (error.code === 'auth/invalid-api-key' || 
        error.code === 'auth/api-key-not-valid' ||
        (error.message && error.message.includes('api-key'))) {
      console.log("🚫 חסימת שגיאת API key");
      showMessage("בעיה בהגדרות המערכת. צור קשר עם המנהל", false);
    } else {
      handleAuthError(error, "הרשמה");
    }
  }
}

// טיפול מרכזי בשגיאות אימות  
function handleAuthError(error, action) {
  let message = `שגיאה ב${action}`;
  
  console.error(`❌ שגיאת ${action}:`, error.code, error.message);
  
  // בדיקה מוקדמת לשגיאת API key - לא להציג אותה
  if (error.code === 'auth/api-key-not-valid' || 
      error.code === 'auth/invalid-api-key' ||
      (error.message && error.message.includes('api-key'))) {
    console.log("🚫 מונע הצגת שגיאת API key למשתמש");
    message = "בעיה בהגדרות המערכת. צור קשר עם המנהל";
  } else {
    switch(error.code) {
      case 'auth/user-not-found':
        message = "משתמש לא נמצא. אולי צריך להירשם תחילה?";
        break;
      case 'auth/wrong-password':
        message = "סיסמה שגויה. נסה שוב";
        break;
      case 'auth/invalid-email':
        message = "כתובת אימייל לא תקינה";
        break;
      case 'auth/email-already-in-use':
        message = "כתובת האימייל כבר קיימת במערכת";
        break;
      case 'auth/weak-password':
        message = "הסיסמה חלשה מדי. נסה סיסמה חזקה יותר";
        break;
      case 'auth/network-request-failed':
        message = "בעיית חיבור לרשת. בדוק את החיבור ונסה שוב";
        break;
      case 'auth/too-many-requests':
        message = "יותר מדי ניסיונות. נסה שוב בעוד כמה דקות";
        break;
      case 'auth/user-disabled':
        message = "החשבון מושבת. צור קשר עם המנהל";
        break;
      default:
        console.warn("⚠️ שגיאה לא מוכרת:", error);
        message = "שגיאה במערכת. נסה שוב מאוחר יותר";
    }
  }
  
  showMessage(message, false);
}

// מעבר בין טאבים התחברות/הרשמה
const showLoginTab = () => {
  document.getElementById('loginTab').style.display = 'block';
  document.getElementById('registerTab').style.display = 'none';
  document.getElementById('loginTabBtn').classList.add('active');
  document.getElementById('registerTabBtn').classList.remove('active');
};

const showRegisterTab = () => {
  document.getElementById('loginTab').style.display = 'none';
  document.getElementById('registerTab').style.display = 'block';
  document.getElementById('loginTabBtn').classList.remove('active');
  document.getElementById('registerTabBtn').classList.add('active');
};

const showTab = (tab) => tab === 'login' ? showLoginTab() : showRegisterTab();

// Enter בשדות שולח את הטופס
const setupKeyboardEvents = () => {
  ["loginEmail", "loginPass"].forEach(id => {
    document.getElementById(id)?.addEventListener("keypress", e => {
      if (e.key === "Enter") { e.preventDefault(); loginUser(); }
    });
  });
  ["regEmail", "regPass", "regName"].forEach(id => {
    document.getElementById(id)?.addEventListener("keypress", e => {
      if (e.key === "Enter") { e.preventDefault(); registerUser(); }
    });
  });
};

// חיבור אירועים לכפתורים ולטפסים
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginTabBtn')?.addEventListener('click', showLoginTab);
  document.getElementById('registerTabBtn')?.addEventListener('click', showRegisterTab);

  document.getElementById('loginForm')?.addEventListener('submit', e => { e.preventDefault(); loginUser(); });
  document.getElementById('registerForm')?.addEventListener('submit', e => { e.preventDefault(); registerUser(); });

  document.getElementById('login-submit-btn')?.addEventListener('click', () => loginUser());
  document.getElementById('register-submit-btn')?.addEventListener('click', () => registerUser());

  document.getElementById('switch-to-register')?.addEventListener('click', e => { e.preventDefault(); showRegisterTab(); });
  document.getElementById('switch-to-login')?.addEventListener('click', e => { e.preventDefault(); showLoginTab(); });

  setupKeyboardEvents();
});