// --- 1. הגדרות Firebase מעודכנות (פרויקט 80755) ---
// בדיקה שהדף פועל בהקשר נכון
if (location.protocol === 'file:') {
    console.warn('זהירות: הדף פועל בפרוטוקול file://. Firebase עשוי לא לפעול כראוי. יש להפעיל מתוך שרת HTTP.');
}

// הגדרת התצורה של Firebase
var firebaseConfig = {
  apiKey: "AIzaSyB9828WAtk1LESQr0VaL64gR1c7GmFHBXg",
  authDomain: "smart-gym-80755.firebaseapp.com",
  databaseURL: "https://smart-gym-80755-default-rtb.firebaseio.com",
  projectId: "smart-gym-80755",
  storageBucket: "smart-gym-80755.firebasestorage.app",
  messagingSenderId: "883040693948",
  appId: "1:883040693948:web:a1a316f9674dd6ab036ab9"
};

// אתחול Firebase - עם בדיקת שגיאות מפורטת
console.log("Starting Firebase initialization...");

try {
    if (!firebase.apps.length) {
        console.log("Initializing Firebase...");
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase already initialized");
    }

    // משתנים גלובליים לפיירבייס
    var auth = firebase.auth();
    var database = firebase.database();

    console.log("Firebase Auth object:", auth);
    console.log("Firebase Database object:", database);
    
    // בדיקת חיבור לAuthentication
    auth.onAuthStateChanged(function(user) {
        console.log("Auth state changed. User:", user);
    });
    
} catch (error) {
    console.error("Error initializing Firebase:", error);
    alert("שגיאה באתחול Firebase: " + error.message);
}

// --- 2. פונקציות עזר (הודעות למשתמש) ---
// פונקציה להצגת הודעות למשתמש
function showMessage(message, isSuccess) {
  var messageDiv = document.getElementById("feedback-message");
  if (!messageDiv) {
    // אם אין דיב להודעות בדף הזה, נדפיס לקונסול
    console.log("Message:" + message);
    return;
  }
  
  // מנקה הודעות קודמות
  messageDiv.innerText = message;
  messageDiv.classList.remove("success-msg", "error-msg", "hidden");
  
  if (isSuccess) {
    // הודעת הצלחה - ירוק
    messageDiv.classList.add("success-msg");
    messageDiv.style.color = "green";
  } else {
    // הודעת שגיאה - אדום
    messageDiv.classList.add("error-msg");
    messageDiv.style.color = "red";
  }
  
  // מציג את ההודעה
  messageDiv.style.display = "block";
  
  // מחביא את ההודעה אחרי 4 שניות
  setTimeout(function() {
    messageDiv.style.display = "none";
    messageDiv.innerText = "";
  }, 4000);
}

// --- 3. פונקציות משתמשים (התחברות/הרשמה/יציאה) ---

// פונקציה להתחברות משתמש
function loginUser() {
  console.log("loginUser function called");
  
  var email = document.getElementById("loginEmail").value;
  var pass = document.getElementById("loginPass").value;
  
  console.log("Email:", email);
  console.log("Firebase auth object:", auth);
  
  // בדיקה שהשדות לא ריקים
  if (!email || !pass) {
    showMessage("נא למלא את כל השדות", false);
    return;
  }
  
  // וידוא שFirebase אותחל
  if (!auth) {
    showMessage("שגיאה בתצורת Firebase", false);
    return;
  }
  
  showMessage("מתחבר...", true);
  
  // התחברות דרך Firebase
  auth.signInWithEmailAndPassword(email, pass)
    .then(function() {
      console.log("Login successful");
      showMessage("התחברת בהצלחה! מעביר למפת חדר הכושר...", true);
      setTimeout(function() {
        window.location.href = "service.html";
      }, 2000);
    })
    .catch(function(err) {
      console.error("Login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      var errorMessage = "שגיאה בהתחברות: ";
      switch(err.code) {
        case 'auth/user-not-found':
          errorMessage += "האימייל לא נמצא במערכת";
          break;
        case 'auth/wrong-password':
          errorMessage += "סיסמה שגויה";
          break;
        case 'auth/invalid-email':
          errorMessage += "כתובת אימייל לא תקינה";
          break;
        case 'auth/too-many-requests':
          errorMessage += "יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר";
          break;
        default:
          errorMessage += err.message;
      }
      showMessage(errorMessage, false);
    });
}

// פונקציה להרשמת משתמש חדש
function registerUser() {
  console.log("registerUser function called");
  
  var email = document.getElementById("regEmail").value;
  var pass = document.getElementById("regPass").value;
  var name = document.getElementById("regName").value;
  
  console.log("Registration details - Email:", email, "Name:", name);
  
  // בדיקה שהשדות לא ריקים
  if (!email || !pass || !name) {
    showMessage("נא למלא את כל השדות", false);
    return;
  }
  
  // בדיקה שהסיסמה חזקה מספיק
  if (pass.length < 6) {
    showMessage("הסיסמה חייבת להכיל לפחות 6 תווים", false);
    return;
  }
  
  // וידוא שFirebase אותחל
  if (!auth) {
    showMessage("שגיאה בתצורת ", false);
    return;
  }
  
  showMessage("נרשם...", true);
  
  // יצירת חשבון חדש
  auth.createUserWithEmailAndPassword(email, pass)
    .then(function(result) {
      console.log("Registration successful, updating profile");
      // עדכון פרטי המשתמש
      return result.user.updateProfile({
        displayName: name
      });
    })
    .then(function() {
      console.log("Profile updated successfully");
      showMessage("נרשמת בהצלחה! מעביר למפת חדר הכושר...", true);
      setTimeout(function() {
        window.location.href = "service.html";
      }, 2000);
    })
    .catch(function(err) {
      console.error("Registration error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      var errorMessage = "שגיאה בהרשמה: ";
      switch(err.code) {
        case 'auth/email-already-in-use':
          errorMessage += "האימייל כבר קיים במערכת";
          break;
        case 'auth/invalid-email':
          errorMessage += "כתובת אימייל לא תקינה";
          break;
        case 'auth/weak-password':
          errorMessage += "הסיסמה חלשה מדי";
          break;
        default:
          errorMessage += err.message;
      }
      showMessage(errorMessage, false);
    });
}

// פונקציה ליציאה מהמערכת
function logoutUser() {
  auth.signOut().then(function() {
    window.location.href = "index.html";
  });
}

// בדיקה אם המשתמש מחובר ועדכון התפריט
auth.onAuthStateChanged(function(user) {
  var loginLink = document.getElementById("loginLinkWrapper");
  var userInfo = document.getElementById("userInfo");
  var logoutWrap = document.getElementById("logoutWrapper");
  var userName = document.getElementById("userNameDisplay");
  
  // אם האלמנטים לא קיימים בדף הנוכחי, נצא
  if (!loginLink) {
    return;
  }

  if (user) {
    // המשתמש מחובר - מציג את הפרטים שלו
    loginLink.classList.add("d-none");
    if (userInfo) {
      userInfo.classList.remove("d-none");
    }
    if (logoutWrap) {
      logoutWrap.classList.remove("d-none");
    }
    if (userName) {
      if (user.displayName) {
        userName.innerText = "שלום, " + user.displayName;
      } else {
        userName.innerText = "שלום, " + user.email;
      }
    }
  } else {
    // המשתמש לא מחובר - מציג קישור התחברות
    loginLink.classList.remove("d-none");
    if (userInfo) {
      userInfo.classList.add("d-none");
    }
    if (logoutWrap) {
      logoutWrap.classList.add("d-none");
    }
  }
});

// --- 4. לוגיקת החיישנים והמכשירים ---

// בדיקה שאנחנו בעמוד המכשירים
function startSensorMonitoring() {
  var currentPage = window.location.pathname;
  var isServicePage = currentPage.includes("service.html");
  var hasMachinesGrid = document.getElementById("machines-grid");
  var hasMachine1 = document.getElementById("machine-1");
  
  if (isServicePage || hasMachinesGrid || hasMachine1) {
    console.log("מתחיל האזנה לנתיב: fromAltera...");
    
    // הגדרת הנתיב לחיישנים
    var sensorsRef = database.ref('fromAltera');
    
    // האזנה לשינויים בנתונים
    sensorsRef.on('value', function(snapshot) {
        var data = snapshot.val();
        
        if (data) {
            console.log("נתונים התקבלו:", data);

            // המרת הנתונים למספרים
            var valA = Number(data.A); // חיישן מרחק
            var valB = Number(data.B); // ספירת אנשים  
            var valC = Number(data.C); // חיישן כוח

            // עדכון מונה אנשים בחדר הכושר
            var counterElement = document.getElementById("count_display");
            if (counterElement) {
                counterElement.innerText = valB;
            }

            // עדכון מצב מכשיר 1 - על פי חיישן A
            if (valA >= 10 && valA <= 100) {
                updateStatus("machine-1", true); // תפוס
            } else {
                updateStatus("machine-1", false); // פנוי
            }

            // עדכון מצב מכשיר 2 - על פי חיישן C
            if (valC > 0) {
                updateStatus("machine-2", true); // תפוס
            } else {
                updateStatus("machine-2", false); // פנוי
            }

            // מכשיר 3 - תמיד פנוי (לדוגמה)
            updateStatus("machine-3", false);
        }
    }, function(error) {
        console.error("שגיאה בקריאת נתונים:", error);
    });
  }
}

// פונקציה לעדכון מצב מכשיר (תפוס/פנוי)
function updateStatus(elementId, isOccupied) {
    var element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    var statusText = element.querySelector(".status-text");

    if (isOccupied) {
        // המכשיר תפוס - צביעה באדום
        element.classList.remove("available", "status-free");
        element.classList.add("occupied", "status-occupied");
        if (statusText) {
            statusText.innerText = "🔴 תפוס";
        } 
    } else {
        // המכשיר פנוי - צביעה בירוק
        element.classList.remove("occupied", "status-occupied");
        element.classList.add("available", "status-free");
        if (statusText) {
            statusText.innerText = "🟢 פנוי";
        }
    }
}

// --- 5. אירועים ותחילת העבודה ---

// וידוא שהפונקציות זמינות גלובלית
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.showLoginTab = showLoginTab;
window.showRegisterTab = showRegisterTab;

// פונקציות טאבים למעבר בין התחברות להרשמה
function showLoginTab() {
  console.log("showLoginTab called");
  document.getElementById('loginTab').style.display = 'block';
  document.getElementById('registerTab').style.display = 'none';
  document.getElementById('loginTabBtn').classList.add('active');
  document.getElementById('registerTabBtn').classList.remove('active');
}

function showRegisterTab() {
  console.log("showRegisterTab called");
  document.getElementById('loginTab').style.display = 'none';
  document.getElementById('registerTab').style.display = 'block';
  document.getElementById('loginTabBtn').classList.remove('active');
  document.getElementById('registerTabBtn').classList.add('active');
}

// כשהדף נטען, מתחיל את כל הפונקציות
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM Content Loaded");
  console.log("loginUser function available:", typeof window.loginUser);
  console.log("registerUser function available:", typeof window.registerUser);
  console.log("Firebase available:", typeof firebase);
  
  // חיבור כפתור היציאה
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }
  
  // התחלת מעקב אחר חיישנים
  startSensorMonitoring();
  
  // בדיקה שהכפתורים מחוברים
  var loginForm = document.querySelector('form[onsubmit*="loginUser"]');
  var registerForm = document.querySelector('form[onsubmit*="registerUser"]');
  
  console.log("Login form found:", !!loginForm);
  console.log("Register form found:", !!registerForm);
});