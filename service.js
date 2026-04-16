// service.js - חיישנים + מכשירים + שכיבות סמיכה

var pushupTarget = 0;
var pushupCurrent = 0;
var pushupWorkoutActive = false;
var lastBitState = false;

// מאזין לנתונים שמגיעים מהבקר דרך Firebase
function startSensorMonitoring() {
  if (!database) return;

  var page = window.location.pathname;
  if (!page.includes("service.html") && !document.getElementById("machines-grid")) return;

  var sensorsRef = database.ref('fromAltera');

  sensorsRef.once('value').then(function(snap) {
    if (!snap.val()) console.warn("אין נתונים ב-fromAltera");
  });

  // מקבל נתונים מהבקר בזמן אמת
  sensorsRef.on('value', function(snapshot) {
    var data = snapshot.val();
    if (!data) return;

    var valA = Number(data.A);
    var valB = Number(data.B);
    var valC = Number(data.C);

    // מעדכן מונה אנשים
    var counter = document.getElementById("count_display");
    if (counter) counter.innerText = valB;

    // מכשיר 1 - חיישן מרחק
    updateStatus("machine-1", valA >= 2 && valA <= 7);

    // מכשירים 2,3,4 - bitwise מהבקר FPGA
    var bits = parseInt(valC);
    updateStatus("machine-2", (bits & 1) !== 0);
    updateStatus("machine-3", (bits & 2) !== 0);

    // rising edge detection לשכיבות סמיכה (bit 2)
    var pushBit = (bits & 4) !== 0;
    if (pushupWorkoutActive && pushBit && !lastBitState) {
      pushupCurrent--;
      var countEl = document.getElementById("pushup-count");
      if (countEl) countEl.innerText = pushupCurrent;
      if (pushupCurrent <= 0) completePushupWorkout();
    }
    lastBitState = pushBit;

  }, function(err) {
    console.error("שגיאה בקריאת חיישנים:", err);
  });

  // האזנה נפרדת למונה אנשים
  database.ref('fromAltera/B').on('value', function(snapshot) {
    var count = snapshot.val();
    if (count != null) {
      var el = document.getElementById("count_display");
      if (el) el.innerText = count;
    }
  });
}

// צובע מכשיר אדום/ירוק לפי סטטוס
function updateStatus(id, occupied) {
  var el = document.getElementById(id);
  if (!el) return;

  var txt = el.querySelector(".status-text");

  if (occupied) {
    el.classList.remove("available", "status-free");
    el.classList.add("occupied", "status-occupied");
    if (txt) txt.innerText = "🔴 תפוס";
  } else {
    el.classList.remove("occupied", "status-occupied");
    el.classList.add("available", "status-free");
    if (txt) txt.innerText = "🟢 פנוי";
  }
}

// התחלת אימון שכיבות סמיכה
function startPushupWorkout() {
  var target = parseInt(document.getElementById("pushup-target").value);
  if (!target || target < 1 || target > 999) {
    showNotification("אנא הכנס מספר בין 1 ל-999", 'warning');
    return;
  }

  pushupTarget = target;
  pushupCurrent = target;
  pushupWorkoutActive = true;
  lastBitState = false;

  document.getElementById("pushup-setup").style.display = "none";
  document.getElementById("pushup-workout").style.display = "block";
  document.getElementById("pushup-count").innerText = pushupCurrent;

  var card = document.getElementById("machine-4");
  card.classList.add("workout-active");
  card.classList.remove("workout-completed");
}

function completePushupWorkout() {
  var card = document.getElementById("machine-4");
  card.classList.remove("workout-active");
  card.classList.add("workout-completed");

  var status = document.getElementById("pushup-status");
  if (status) status.innerText = "🎉 כל הכבוד! השלמת את האימון!";
  pushupWorkoutActive = false;
}

function resetPushupWorkout() {
  pushupTarget = 0;
  pushupCurrent = 0;
  pushupWorkoutActive = false;
  lastBitState = false;

  document.getElementById("pushup-setup").style.display = "block";
  document.getElementById("pushup-workout").style.display = "none";
  document.getElementById("pushup-target").value = "";
  document.getElementById("pushup-status").innerText = "";

  var card = document.getElementById("machine-4");
  card.classList.remove("workout-active");
  card.classList.remove("workout-completed");
}

function toggleStatus(btn) {
  var buttons = btn.parentElement.querySelectorAll('.status-btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.opacity = '0.3';
    buttons[i].style.transform = 'scale(1)';
  }
  btn.style.opacity = '1';
  btn.style.transform = 'scale(1.2)';
}

window.startPushupWorkout = startPushupWorkout;
window.resetPushupWorkout = resetPushupWorkout;

document.addEventListener('DOMContentLoaded', function() {
  // חיבור כפתורי שכיבות סמיכה
  var startBtn = document.getElementById('btn-start-pushup');
  if (startBtn) startBtn.addEventListener('click', startPushupWorkout);

  var resetBtn = document.getElementById('btn-reset-pushup');
  if (resetBtn) resetBtn.addEventListener('click', resetPushupWorkout);

  // נותן ל-Firebase רגע להתאתחל ואז מפעיל חיישנים
  setTimeout(function() {
    if (firebaseReady && database) startSensorMonitoring();
  }, 1500);

  var available = document.querySelectorAll('.status-btn.available');
  for (var i = 0; i < available.length; i++) {
    available[i].style.opacity = '1';
    available[i].style.transform = 'scale(1.2)';
  }

  var occupied = document.querySelectorAll('.status-btn.occupied');
  for (var i = 0; i < occupied.length; i++) {
    occupied[i].style.opacity = '0.3';
  }
});
