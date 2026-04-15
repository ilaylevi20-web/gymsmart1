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
      alert(errorMsg);
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
        alert("בעיה בהגדרות המערכת. המערכת אינה זמינה כרגע");
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
        alert("בעיה בהגדרות המערכת. צור קשר עם המנהל");
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
    // אם אין דיב הודעות, נציג alert
    alert(message);
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

// --- 3. מערכת התחברות והרשמה מחודשת ---

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
      // שגיאות התחברות
      case 'auth/user-not-found':
        message = "משתמש לא נמצא. אולי צריך להירשם תחילה?";
        break;
      case 'auth/wrong-password':
        message = "סיסמה שגויה. נסה שוב";
        break;
      case 'auth/invalid-email':
        message = "כתובת אימייל לא תקינה";
        break;
        
      // שגיאות הרשמה
      case 'auth/email-already-in-use':
        message = "כתובת האימייל כבר קיימת במערכת";
        break;
      case 'auth/weak-password':
        message = "הסיסמה חלשה מדי. נסה סיסמה חזקה יותר";
        break;
        
      // שגיאות מערכת
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
        // שגיאה לא מוכרת - נציג הודעה כללית
        console.warn("⚠️ שגיאה לא מוכרת:", error);
        message = "שגיאה במערכת. נסה שוב מאוחר יותר";
    }
  }
  
  showMessage(message, false);
}

// פונקציית יציאה
async function logoutUser() {
  console.log("🚪 מתנתק מהמערכת");
  
  if (!auth || !firebaseReady) {
    showMessage("שגיאה במערכת", false);
    return;
  }
  
  showMessage("מתנתק...", true);
  
  try {
    await auth.signOut();
    console.log("✅ יציאה הצליחה");
    showMessage("התנתקת בהצלחה", true);
    
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

// --- 4. לוגיקת החיישנים והמכשירים ---

// משתנים גלובליים למכונת שכיבות סמיכה
var pushupTarget = 0;
var pushupCurrent = 0;
var pushupWorkoutActive = false;
var lastPushupBitState = false;

// בדיקה שאנחנו בעמוד המכשירים
function startSensorMonitoring() {
  console.log("מתחיל מעקב חיישנים...");
  
  if (!database) {
    console.error("שגיאה: Firebase database לא מחובר");
    return;
  }
  
  var currentPage = window.location.pathname;
  var isServicePage = currentPage.includes("service.html");
  var hasMachinesGrid = document.getElementById("machines-grid");
  var hasMachine1 = document.getElementById("machine-1");
  
  console.log("בדיקת עמוד:", currentPage, isServicePage, !!hasMachine1);
  
  if (isServicePage || hasMachinesGrid || hasMachine1) {
    console.log("מתחיל האזנה לנתיב: fromAltera...");
    
    // הגדרת הנתיב לחיישנים
    var sensorsRef = database.ref('fromAltera');
    
    // בדיקה חד-פעמית לפני האזנה
    sensorsRef.once('value')
      .then(function(snapshot) {
        var initialData = snapshot.val();
        console.log("בדיקה ראשונית:", initialData);
        
        if (initialData) {
          console.log("יש נתונים! מתחיל האזנה...");
        } else {
          console.warn("אין נתונים בנתיב fromAltera");
        }
      })
      .catch(function(error) {
        console.error("שגיאה בבדיקת הנתונים:", error);
      });
    
    // האזנה לשינויים בנתונים
    sensorsRef.on('value', function(snapshot) {
        var data = snapshot.val();
        console.log("עדכון מ-Firebase:", data);
        
        if (data) {
            console.log("נתונים התקבלו:", data);

            // המרת הנתונים למספרים
            var valA = Number(data.A); // חיישן מרחק
            var valB = Number(data.B); // ספירת אנשים  
            var valC = Number(data.C); // חיישן כוח (bitwise)

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

            // ********************************************
            // עדכון מצב מכשירים 2, 3, 4 - עם לוגיקה Bitwise
            // ********************************************
            var valCInt = parseInt(valC);
            
            // Machine 2 - Bit 0 (value 1)
            var isMachine2Occupied = (valCInt & 1) !== 0;
            updateStatus("machine-2", isMachine2Occupied);
            
            // Machine 3 - Bit 1 (value 2)
            var isMachine3Occupied = (valCInt & 2) !== 0;
            updateStatus("machine-3", isMachine3Occupied);
            
            // Machine 4 - Microswitch - Bit 2 (value 4)
            // בידוד ביט השכיבות סמיכה מיתר המכשירים
            var currentPushupBitState = (valCInt & 4) !== 0;
            
            // Rising Edge Detection - ספירה רק כאשר הביט עבר מ-False ל-True
            if (pushupWorkoutActive && currentPushupBitState && !lastPushupBitState) {
                // Rising edge detected!
                pushupCurrent--;
                console.log("🔥 Pushup detected! Remaining:", pushupCurrent);
                
                // עדכון התצוגה
                var countDisplay = document.getElementById("pushup-count");
                if (countDisplay) {
                    countDisplay.innerText = pushupCurrent;
                }
                
                // בדיקה אם סיימנו
                if (pushupCurrent <= 0) {
                    completePushupWorkout();
                }
            }
            
            // עדכון מצב הביט לסבב הבא
            lastPushupBitState = currentPushupBitState;
            
            console.log("VAL_C Bitwise:", {
                raw: valCInt,
                machine2: isMachine2Occupied,
                machine3: isMachine3Occupied,
                pushupBit: currentPushupBitState
            });
        }
    }, function(error) {
        console.error("שגיאה בקריאת נתונים:", error);
    });
    
    // האזנה נפרדת למוני אנשים בזמן אמת - fromAltera/B
    console.log("מתחיל האזנה נפרדת לנתיב: fromAltera/B למוני אנשים...");
    
    var peopleCountRef = database.ref('fromAltera/B');
    
    peopleCountRef.on('value', function(snapshot) {
        var peopleCount = snapshot.val();
        console.log("עדכון מונה אנשים מ-Firebase/B:", peopleCount);
        
        if (peopleCount !== null && peopleCount !== undefined) {
            // עדכון מונה אנשים בחדר הכושר
            var counterElement = document.getElementById("count_display");
            if (counterElement) {
                counterElement.innerText = peopleCount;
                console.log("מונה אנשים עודכן ל:", peopleCount);
            }
        } else {
            console.warn("VAL_B הוא null או undefined");
        }
    }, function(error) {
        console.error("שגיאה בקריאת נתונים מ-fromAltera/B:", error);
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

// --- פונקציות אימון שכיבות סמיכה ---

// התחלת אימון שכיבות סמיכה
function startPushupWorkout() {
    var input = document.getElementById("pushup-target");
    var target = parseInt(input.value);
    
    // בדיקת תקינות
    if (!target || target < 1 || target > 999) {
        alert("אנא הכנס מספר בין 1 ל-999");
        return;
    }
    
    // הגדרת המשתנים הגלובליים
    pushupTarget = target;
    pushupCurrent = target;
    pushupWorkoutActive = true;
    lastPushupBitState = false;
    
    // מעבר למצב אימון
    document.getElementById("pushup-setup").style.display = "none";
    document.getElementById("pushup-workout").style.display = "block";
    document.getElementById("pushup-count").innerText = pushupCurrent;
    
    // שינוי צבע הכרטיס לאדום
    var machineCard = document.getElementById("machine-4");
    machineCard.classList.add("workout-active");
    machineCard.classList.remove("workout-completed");
    
    console.log("🔥 אימון שכיבות סמיכה התחיל! יעד:", pushupTarget);
}

// סיום אימון שכיבות סמיכה
function completePushupWorkout() {
    console.log("✅ אימון הושלם!");
    
    // שינוי צבע הכרטיס לירוק
    var machineCard = document.getElementById("machine-4");
    machineCard.classList.remove("workout-active");
    machineCard.classList.add("workout-completed");
    
    // הצגת הודעת סיום
    var statusElement = document.getElementById("pushup-status");
    if (statusElement) {
        statusElement.innerText = "🎉 כל הכבוד! השלמת את האימון!";
    }
    
    pushupWorkoutActive = false;
}

// איפוס אימון שכיבות סמיכה
function resetPushupWorkout() {
    console.log("🔄 איפוס אימון שכיבות סמיכה");
    
    // איפוס משתנים
    pushupTarget = 0;
    pushupCurrent = 0;
    pushupWorkoutActive = false;
    lastPushupBitState = false;
    
    // חזרה למצב התחלתי
    document.getElementById("pushup-setup").style.display = "block";
    document.getElementById("pushup-workout").style.display = "none";
    document.getElementById("pushup-target").value = "";
    document.getElementById("pushup-status").innerText = "";
    
    // הסרת צבעים
    var machineCard = document.getElementById("machine-4");
    machineCard.classList.remove("workout-active");
    machineCard.classList.remove("workout-completed");
}

// --- 5. אתחול המערכת ---

// אירועי מקלדת להתחברות מהירה
function setupKeyboardEvents() {
  const loginEmail = document.getElementById("loginEmail");
  const loginPass = document.getElementById("loginPass");
  const regEmail = document.getElementById("regEmail");
  const regPass = document.getElementById("regPass");
  const regName = document.getElementById("regName");
  
  // Enter בשדות התחברות
  [loginEmail, loginPass].forEach(field => {
    if (field) {
      field.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          loginUser();
        }
      });
    }
  });
  
  // Enter בשדות הרשמה
  [regEmail, regPass, regName].forEach(field => {
    if (field) {
      field.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          registerUser();
        }
      });
    }
  });
}

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

// --- 6. קישור כרטיס RFID למשתמש ---

// פונקציית עזר להצגת הודעות RFID בתוך הדף (במקום alert)
function showRfidMessage(message, type) {
  // שלב 1: מציאת מיקום התצוגה של ההודעות
  const feedbackContainer = document.getElementById("rfid-feedback-container");
  
  if (!feedbackContainer) {
    console.warn("⚠️ לא נמצא מיכל הודעות RFID");
    return;
  }
  
  // שלב 2: ניקוי הודעות קודמות
  feedbackContainer.innerHTML = "";
  
  // שלב 3: קביעת סוג ההתראה (הצלחה או שגיאה)
  const alertClass = type === "success" ? "alert-success" : "alert-danger";
  const iconClass = type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
  
  // שלב 4: יצירת אלמנט ההודעה באמצעות DOM
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
  alertDiv.setAttribute("role", "alert");
  
  // שלב 5: בניית תוכן ההודעה עם אייקון
  alertDiv.innerHTML = `
    <i class="bi ${iconClass} me-2"></i>
    <span>${message}</span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // שלב 6: הוספת ההודעה לדף
  feedbackContainer.appendChild(alertDiv);
  
  // שלב 7: הסרה אוטומטית אחרי 5 שניות
  setTimeout(() => {
    // שימוש ב-Bootstrap API לסגירה חלקה
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
    if (bsAlert) {
      bsAlert.close();
    }
  }, 5000);
  
  console.log(`📢 הודעת RFID: [${type}] ${message}`);
}

// פונקציה לקישור כרטיס RFID לחשבון המשתמש
async function linkRfidToUser() {
  console.log("🔗 מתחיל תהליך קישור כרטיס RFID");
  
  // שלב 1: בדיקה שהמשתמש מחובר
  const currentUser = firebase.auth().currentUser;
  
  if (!currentUser) {
    showRfidMessage("שגיאה: עליך להיות מחובר כדי לקשר כרטיס RFID", "error");
    console.error("❌ אין משתמש מחובר");
    return;
  }
  
  const userId = currentUser.uid;
  console.log("👤 משתמש מחובר:", userId);
  
  // עדכון סטטוס למשתמש
  const statusElement = document.getElementById("current-rfid-status");
  const linkButton = document.getElementById("link-rfid-btn");
  
  if (statusElement) {
    statusElement.innerText = "סורק כרטיס...";
  }
  
  if (linkButton) {
    linkButton.disabled = true;
    linkButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>מעבד...';
  }
  
  try {
    // שלב 2: קריאה חד-פעמית של ערך ה-RFID מ-Firebase
    console.log("📡 קורא ערך RFID מ-Firebase...");
    const rfidSnapshot = await firebase.database().ref('/rfid').once('value');
    const rfidValue = rfidSnapshot.val();
    
    console.log("🔍 ערך RFID שנקרא:", rfidValue);
    
    // בדיקה שיש ערך תקין
    if (!rfidValue || rfidValue === null || rfidValue === undefined || rfidValue === "") {
      throw new Error("NO_CARD_DETECTED");
    }
    
    // שלב 3: שמירת ערך ה-RFID תחת המשתמש במסד הנתונים
    console.log("💾 שומר RFID למשתמש...");
    await firebase.database().ref(`users/${userId}`).update({
      rfid: rfidValue,
      rfidLinkedAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    console.log("✅ כרטיס RFID קושר בהצלחה:", rfidValue);
    
    // שלב 4: עדכון ממשק המשתמש
    if (statusElement) {
      statusElement.innerText = `כרטיס ${rfidValue} מקושר בהצלחה!`;
    }
    
    showRfidMessage(`✅ כרטיס RFID קושר בהצלחה! מספר כרטיס: <strong>${rfidValue}</strong>`, "success");
    
    // שינוי צבע התג
    const badge = document.querySelector('.rfid-link-section .badge');
    if (badge) {
      badge.classList.remove('bg-warning', 'text-dark');
      badge.classList.add('bg-success');
      badge.innerText = 'מקושר';
    }
    
  } catch (error) {
    console.error("❌ שגיאה בקישור כרטיס RFID:", error);
    
    // טיפול בשגיאות ספציפיות
    let errorMessage = "שגיאה בקישור הכרטיס";
    
    if (error.message === "NO_CARD_DETECTED") {
      errorMessage = "לא זוהה כרטיס RFID. אנא הנח כרטיס על הקורא ונסה שוב.";
    } else if (error.code === "PERMISSION_DENIED") {
      errorMessage = "שגיאת הרשאות. אין לך גישה לעדכון הנתונים.";
    } else if (error.message && error.message.includes('network')) {
      errorMessage = "בעיית חיבור לאינטרנט. בדוק את החיבור ונסה שוב.";
    }
    
    showRfidMessage(`❌ ${errorMessage}`, "error");
    
    if (statusElement) {
      statusElement.innerText = "נכשל - נסה שוב";
    }
    
  } finally {
    // איפוס כפתור
    if (linkButton) {
      linkButton.disabled = false;
      linkButton.innerHTML = '<i class="bi bi-link-45deg me-1"></i>קשר כרטיס לחשבוני';
    }
  }
}

// הפיכת פונקציות לגלובליות לשימוש ב-HTML
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.startPushupWorkout = startPushupWorkout;
window.resetPushupWorkout = resetPushupWorkout;
window.linkRfidToUser = linkRfidToUser;
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
    
    // אם אנחנו בעמוד התחברות
    if (window.location.pathname.includes("login.html")) {
      console.log("📝 בעמוד התחברות - מגדיר אירועי מקלדת");
      setupKeyboardEvents();
    } else {
      // התחלת מעקב חיישנים בעמודים אחרים
      console.log("📡 מתחיל מעקב חיישנים");
      setTimeout(() => {
        if (firebaseReady && database) {
          startSensorMonitoring();
        }
      }, 1000);
    }
    
  }, 500);
  
  console.log("🎉 תהליך האתחול החל");
});