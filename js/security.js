const firebaseConfig = {
  apiKey: "AIzaSyB9828WAtk1LESCr0vAL64gR1c7GmFHBXg",
  authDomain: "smart-gym-80755.firebaseapp.com",
  databaseURL: "https://smart-gym-80755-default-rtdb.firebaseio.com",
  projectId: "smart-gym-80755",
  storageBucket: "smart-gym-80755.firebasestorage.app",
  messagingSenderId: "883040693948",
  appId: "1:883040693948:web:a1a316f9674dd6ab036ab9"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const statusCard     = document.getElementById('status-card');
const statusIcon     = document.getElementById('status-icon');
const statusIconI    = document.getElementById('status-icon-i');
const statusLabel    = document.getElementById('status-label');
const statusSublabel = document.getElementById('status-sublabel');
const valFname       = document.getElementById('val-fname');
const valLname       = document.getElementById('val-lname');
const valRfid        = document.getElementById('val-rfid');
const boxFname       = document.getElementById('box-fname');
const boxLname       = document.getElementById('box-lname');
const boxRfid        = document.getElementById('box-rfid');
const logContainer   = document.getElementById('log-container');

let firstLoad = true;
let scanHistory = [];
let toAlteraResetTimer = null;

async function setToAlteraValue(isAllowed) {
  try {
    if (toAlteraResetTimer) {
      clearTimeout(toAlteraResetTimer);
      toAlteraResetTimer = null;
    }

    if (isAllowed) {
      await db.ref('toAltera').set(35);
      toAlteraResetTimer = setTimeout(async () => {
        try {
          await db.ref('toAltera').set(0);
        } catch (error) {
          console.error('toAltera reset error:', error);
        }
      }, 3000);
      return;
    }

    await db.ref('toAltera').set(0);
  } catch (error) {
    console.error('toAltera update error:', error);
  }
}

// שעון חי בתחתית המסך
const updateClock = () => {
  const el = document.getElementById('clock');
  if (el) {
    el.textContent = new Date().toLocaleString('he-IL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
};
setInterval(updateClock, 1000);
updateClock();

// מצבי תצוגה של הכרטיס הראשי - המתנה / רשום / לא רשום
function setWaiting() {
  if (!statusCard) return;
  statusCard.className = 'status-card';
  statusIcon.className = 'status-icon waiting';
  statusIconI.className = 'bi bi-broadcast';
  statusLabel.className = 'status-label waiting';
  statusLabel.textContent = 'ממתין לסריקה';
  statusSublabel.textContent = 'הנח כרטיס RFID על הקורא';

  [valFname, valLname, valRfid].forEach(el => {
    el.textContent = '—';
    el.classList.add('placeholder');
  });
  [boxFname, boxLname, boxRfid].forEach(el => el.classList.remove('active'));
}

function setRegistered(firstName, lastName, rfidId) {
  if (!statusCard) return;
  statusCard.className = 'status-card status-registered';
  statusIcon.className = 'status-icon registered';
  statusIconI.className = 'bi bi-check-circle-fill';
  statusLabel.className = 'status-label registered';
  statusLabel.textContent = 'רשום ✓';
  statusSublabel.textContent = 'הכניסה מאושרת';

  valFname.textContent = firstName || 'לא ידוע';
  valLname.textContent = lastName || '—';
  valRfid.textContent = rfidId;
  [valFname, valLname, valRfid].forEach(el => el.classList.remove('placeholder'));
  [boxFname, boxLname, boxRfid].forEach(el => el.classList.add('active'));
}

function setUnregistered(rfidId) {
  if (!statusCard) return;
  statusCard.className = 'status-card status-unregistered';
  statusIcon.className = 'status-icon unregistered';
  statusIconI.className = 'bi bi-x-circle-fill';
  statusLabel.className = 'status-label unregistered';
  statusLabel.textContent = 'לא רשום ✗';
  statusSublabel.textContent = 'כרטיס לא משויך - כניסה נדחתה';

  valFname.textContent = '—';
  valFname.classList.add('placeholder');
  valLname.textContent = '—';
  valLname.classList.add('placeholder');
  valRfid.textContent = rfidId;
  valRfid.classList.remove('placeholder');
  [boxFname, boxLname].forEach(el => el.classList.remove('active'));
  boxRfid.classList.add('active');
}

function addLog(rfidId, isRegistered, name) {
  const time = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  scanHistory.unshift({ time, rfidId, isRegistered, name });
  if (scanHistory.length > 20) scanHistory.pop();
  renderLog();
}

function renderLog() {
  if (!logContainer) return;
  if (scanHistory.length === 0) {
    logContainer.innerHTML = '<div class="log-entry" style="color:#3a4060; justify-content:center;">אין סריקות עדיין</div>';
    return;
  }
  logContainer.innerHTML = scanHistory.map(e => {
    const cls = e.isRegistered ? 'log-ok' : 'log-fail';
    const icon = e.isRegistered ? 'bi-check-circle' : 'bi-x-circle';
    const txt = e.isRegistered ? `מאושר — ${e.name}` : 'לא רשום';
    return `<div class="log-entry ${cls}">
      <i class="bi ${icon}"></i>
      <span>${txt}</span>
      <span class="rfid-value" style="font-size:0.75rem">${e.rfidId}</span>
      <span class="log-time ms-auto">${e.time}</span>
    </div>`;
  }).join('');
}

// חזרה למצב המתנה 8 שניות אחרי סריקה
let resetTimer = null;
const scheduleReset = () => {
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(setWaiting, 8000);
};

// מאזין לסריקות RFID בזמן אמת מה-ESP
db.ref('/rfid').on('value', async (snapshot) => {
  const rfidValue = snapshot.val();

  if (!rfidValue) {
    if (firstLoad) firstLoad = false;
    await setToAlteraValue(false);
    return;
  }
  firstLoad = false;

  try {
    const rfidSnap = await db.ref(`rfids/${rfidValue}`).once('value');

    if (rfidSnap.exists()) {
      const userSnap = await db.ref(`users/${rfidSnap.val()}`).once('value');
      const data = userSnap.val() || {};
      const firstName = data.firstName || 'לא ידוע';
      const lastName  = data.lastName  || '';

      setRegistered(firstName, lastName, rfidValue);
      await setToAlteraValue(true);
      addLog(rfidValue, true, `${firstName} ${lastName}`.trim());
    } else {
      setUnregistered(rfidValue);
      await setToAlteraValue(false);
      addLog(rfidValue, false, '');
    }
  } catch (err) {
    console.error('RFID lookup error:', err);
    setUnregistered(rfidValue);
    await setToAlteraValue(false);
    addLog(rfidValue, false, '');
  }

  scheduleReset();
});
