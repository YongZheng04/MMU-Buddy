// ====================== FIREBASE SETUP ======================
const firebaseConfig = {
  apiKey: "AIzaSyAQVYCmkYvyjiztXWB3l9SWl9vre_zBHTE",
  authDomain: "mmu-buddy.firebaseapp.com",
  projectId: "mmu-buddy",
  storageBucket: "mmu-buddy.firebasestorage.app",
  messagingSenderId: "42214932730",
  appId: "1:42214932730:web:2f05a9ea112e38fdeec943",
  measurementId: "G-01HB8GT0WZ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase Connected Successfully!");

// ====================== ANTI-DEVTOOLS ======================
document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', function(e) {
  if (e.key === "F12" || 
     (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C")) ||
     (e.ctrlKey && e.key === "u")) {
    e.preventDefault();
    return false;
  }
});

// ====================== GLOBAL VARIABLES ======================
let currentUserRole = '';

// ====================== SELECT ROLE ======================
function selectRole(role) {
  currentUserRole = role;
  document.getElementById('loginPage').style.display = 'none';

  if (role === 'student') {
    document.getElementById('studentLogin').style.display = 'block';
  } else if (role === 'academic') {
    document.getElementById('academicLogin').style.display = 'block';
  } else if (role === 'nonacademic') {
    loginAs('nonacademic');
  }
}

// ====================== LOGIN FUNCTIONS (Firestore Version) ======================
async function loginAs(role) {
  let name = "";
  let id = "";

  if (role === 'student') {
    name = document.getElementById('studentName').value.trim();
    id = document.getElementById('studentID').value.trim();

    if (!name || !id) {
      alert("Please enter both Name and Student ID");
      return;
    }

    try {
      const querySnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .where('id', '==', id)
        .get();

      if (querySnapshot.empty) {
        alert("❌ Invalid Student ID.");
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      
      if (userDoc.name.toLowerCase() !== name.toLowerCase()) {
        alert("❌ Wrong Name for this Student ID.");
        return;
      }

      currentUserRole = 'student';
      document.getElementById('userWelcome').innerText = `Welcome, ${userDoc.name}`;

    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Connection error. Please check your internet and try again.");
      return;
    }

  } 
  else if (role === 'academic') {
    name = document.getElementById('academicName').value.trim();
    id = document.getElementById('academicID').value.trim();

    if (!name || !id) {
      alert("Please enter both Name and Staff ID");
      return;
    }

    try {
      const querySnapshot = await db.collection('users')
        .where('role', '==', 'academic')
        .where('id', '==', id)
        .get();

      if (querySnapshot.empty) {
        alert("❌ Invalid Staff ID.");
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      
      if (userDoc.name.toLowerCase() !== name.toLowerCase()) {
        alert("❌ Wrong Name for this Staff ID.");
        return;
      }

      currentUserRole = 'academic';
      document.getElementById('userWelcome').innerText = `Welcome, ${userDoc.name}`;

    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Connection error. Please try again.");
      return;
    }
  } 
  else if (role === 'nonacademic') {
    currentUserRole = 'nonacademic';
    document.getElementById('userWelcome').innerText = "Welcome, Visitor";
  }

  // Success - Show Dashboard
  document.getElementById('logoutBtn').style.display = 
    (role === 'student' || role === 'academic') ? 'block' : 'none';

  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';

  controlAccess(currentUserRole);
  document.getElementById('dashboard').style.display = 'block';
}

// ====================== LOGOUT FUNCTION ======================
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    // Clear all states
    currentUserRole = '';
    
    // Hide dashboard and all pages
    document.getElementById('dashboard').style.display = 'none';
    document.querySelectorAll('.page-content').forEach(el => {
      el.style.display = 'none';
    });

    // Show login page again
    document.getElementById('loginPage').style.display = 'block';
    
    // Clear input fields
    document.getElementById('studentName').value = '';
    document.getElementById('studentID').value = '';
    document.getElementById('academicName').value = '';
    document.getElementById('academicID').value = '';

    // Reset welcome text
    document.getElementById('userWelcome').innerText = "Welcome to MMU Buddy";
    document.getElementById('logoutBtn').style.display = 'none';

    console.log("✅ Logged out successfully");
  }
}

// ====================== ROLE ACCESS CONTROL ======================
function controlAccess(role) {
  const tiles = document.querySelectorAll('#dashboard .tile');

  // Show all tiles first
  tiles.forEach(tile => tile.parentElement.style.display = 'block');

  if (role === 'nonacademic') {
    // Visitors can only access: Academic Programmes, Maps, Food
    tiles.forEach(tile => {
      const text = tile.textContent.toLowerCase();
      const parentCol = tile.parentElement;

      if (!text.includes('academic') && 
          !text.includes('map') && 
          !text.includes('food')) {
        parentCol.style.display = 'none';
      }
    });
  }

  if (role === 'academic') {
    // Academic staff cannot access: Lost & Found, Feedback
    tiles.forEach(tile => {
      const text = tile.textContent.toLowerCase();
      const parentCol = tile.parentElement;

      if (text.includes('lost')) {
        parentCol.style.display = 'none';
      }
    });
  }
}

// ====================== PAGE NAVIGATION ======================
function showPage(pageId) {
  document.getElementById('dashboard').style.display = 'none';
  document.querySelectorAll('.page-content').forEach(el => {
    el.style.display = 'none';
  });

  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'block';
  }

if (pageId === 'event') {
    loadEvents();
    filterEvents();
  }
  if (pageId === 'food') {
    loadFoodMenus();
  }
  if (pageId === 'feedback') {
    initFeedback();
  }
}

function showDashboard() {
  document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
  document.getElementById('dashboard').style.display = 'block';
}

// ====================== EVENTS SYSTEM (With Detail Modal) ======================
let allEvents = [];
let currentSelectedEventId = null;

// Load Events
async function loadEvents() {
  try {
    const snapshot = await db.collection('events')
      .orderBy('date', 'asc')
      .get();

    allEvents = [];
    snapshot.forEach(doc => {
      allEvents.push({ id: doc.id, ...doc.data() });
    });

    filterEvents();
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

// Open Event Detail Modal
function showEventDetail(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;

  currentSelectedEventId = eventId;

  document.getElementById('modalEventTitle').textContent = event.title;
  document.getElementById('modalEventDesc').textContent = event.description || "No description available.";
  
  const info = `📅 ${event.date} | 🕒 ${event.time}<br>📍 ${event.venue}`;
  document.getElementById('modalEventInfo').innerHTML = info;

  const rsvpList = event.rsvpList || [];
  document.getElementById('modalRsvpCount').textContent = rsvpList.length;

  // Show registered list
  const listContainer = document.getElementById('modalRsvpList');
  if (rsvpList.length === 0) {
    listContainer.innerHTML = `<p class="text-muted">No one has registered yet.</p>`;
  } else {
    listContainer.innerHTML = `<ul class="list-group">${rsvpList.map(name => 
      `<li class="list-group-item">${name}</li>`).join('')}</ul>`;
  }

  // RSVP Button
  const userName = document.getElementById('userWelcome').innerText.replace('Welcome, ', '').trim();
  const isRegistered = rsvpList.includes(userName);
  const rsvpBtn = document.getElementById('modalRsvpBtn');

  if (new Date(event.date) < new Date()) {
    rsvpBtn.style.display = 'none'; // Past event
  } else {
    rsvpBtn.style.display = 'block';
    rsvpBtn.textContent = isRegistered ? 'Cancel Registration' : 'RSVP Now';
    rsvpBtn.className = `btn ${isRegistered ? 'btn-danger' : 'btn-primary'}`;
    rsvpBtn.onclick = () => toggleRSVP(eventId);
  }

  document.getElementById('eventDetailModal').style.display = 'block';
}

function closeEventModal() {
  document.getElementById('eventDetailModal').style.display = 'none';
}

// Toggle RSVP
async function toggleRSVP(eventId) {
  const userName = document.getElementById('userWelcome').innerText.replace('Welcome, ', '').trim();
  if (!userName || userName === "to MMU Buddy") {
    alert("Please login first.");
    return;
  }

  try {
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    let rsvpList = eventDoc.data().rsvpList || [];

    if (rsvpList.includes(userName)) {
      rsvpList = rsvpList.filter(name => name !== userName);
    } else {
      rsvpList.push(userName);
    }

    await eventRef.update({ rsvpList, rsvpCount: rsvpList.length });

    alert("Success!");
    closeEventModal();
    await loadEvents();   // Refresh main list

  } catch (error) {
    console.error(error);
    alert("Failed to update RSVP.");
  }
}

// Display Events (Clickable Cards)
function displayEvents(events) {
  const container = document.getElementById('eventsList');
  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = `<p class="text-center text-muted py-5">No events found.</p>`;
    return;
  }

  events.forEach(event => {
    const isPast = new Date(event.date) < new Date();
    const rsvpCount = event.rsvpCount || (event.rsvpList ? event.rsvpList.length : 0);

    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm" style="cursor: pointer;" onclick="showEventDetail('${event.id}')">
        <div class="card-body">
          <h5 class="card-title">${event.title}</h5>
          <p class="text-muted small">
            📅 ${event.date}<br>
            🕒 ${event.time}<br>
            📍 ${event.venue}
          </p>
          <p class="card-text">${event.description ? event.description.substring(0, 100) + '...' : ''}</p>
          
          <div class="mt-3">
            <span class="badge ${isPast ? 'bg-secondary' : 'bg-success'}">${isPast ? 'Past' : 'Upcoming'}</span>
            <small class="text-muted ms-2">${rsvpCount} registered</small>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterEvents() {
  const searchTerm = document.getElementById('eventSearch').value.toLowerCase().trim();
  const selectedDate = document.getElementById('eventDateFilter').value;

  let filtered = allEvents;

  if (searchTerm) {
    filtered = filtered.filter(e => 
      e.title?.toLowerCase().includes(searchTerm) || 
      e.description?.toLowerCase().includes(searchTerm) ||
      e.venue?.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedDate) {
    filtered = filtered.filter(e => e.date === selectedDate);
  }

  displayEvents(filtered);
}

function switchEventTab(tab) {
  document.querySelectorAll('#eventTabs .nav-link').forEach(link => link.classList.remove('active'));
  document.querySelectorAll('#eventTabs .nav-link')[tab].classList.add('active');
  filterEvents();
}

// ====================== CAMPUS MAPS ======================
function showCampusMap(campus) {
  const mapDisplay = document.getElementById('mapDisplay');
  const mapTitle = document.getElementById('mapTitle');
  const mapImage = document.getElementById('campusMapImage');

  if (campus === 'cyberjaya') {
    mapTitle.textContent = "Cyberjaya Campus Map";
    mapImage.src = "images/cyberjaya-map.jpg";
  } else if (campus === 'melaka') {
    mapTitle.textContent = "Melaka Campus Map";
    mapImage.src = "images/melaka-map.jpg";
  }

  mapDisplay.style.display = 'block';
  mapDisplay.scrollIntoView({ behavior: "smooth" });
}

// ====================== FOOD & CAFE (Modern App Design) ======================
let allFoodMenus = [];
let currentCampus = 'cyberjaya';

async function loadFoodMenus() {
  try {
    const snapshot = await db.collection('food_menus').get();
    allFoodMenus = [];
    snapshot.forEach(doc => {
      allFoodMenus.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Error loading food:", error);
  }
}

async function switchCampus(campus) {
  currentCampus = campus;
  
  // Update active button
  document.querySelectorAll('.btn-campus').forEach(btn => {
    btn.classList.toggle('active', btn.id === `btn-${campus}`);
  });

  await showCampusFood(campus);
}

async function showCampusFood(campus) {
  await loadFoodMenus();

  const container = document.getElementById('restaurantList');
  container.innerHTML = '';

  const filtered = allFoodMenus.filter(r => r.campus === campus);

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-center text-muted py-5">No restaurants found.</p>`;
    return;
  }

  filtered.forEach(restaurant => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card food-card h-100" onclick="showRestaurantMenu('${restaurant.id}')">
        <div class="card-body">
          <h5 class="card-title">${restaurant.name}</h5>
          <p class="text-muted small">${restaurant.category || 'Restaurant'}</p>
          <hr>
          <small class="text-success">${restaurant.items ? restaurant.items.length : 0} items</small>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function showRestaurantMenu(restaurantId) {
  const restaurant = allFoodMenus.find(r => r.id === restaurantId);
  if (!restaurant) return;

  document.getElementById('restaurantName').textContent = restaurant.name;

  const container = document.getElementById('menuItems');
  container.innerHTML = '';

  if (restaurant.items && restaurant.items.length > 0) {
    restaurant.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'col-12 col-sm-6';
      div.innerHTML = `
        <div class="card menu-item-card">
          <div class="card-body">
            <h6>${item.item}</h6>
            <p class="text-success fw-bold fs-5 mb-0">${item.price}</p>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  document.getElementById('restaurantList').style.display = 'none';
  document.getElementById('menuDisplay').style.display = 'block';
}

function backToRestaurants() {
  document.getElementById('menuDisplay').style.display = 'none';
  document.getElementById('restaurantList').style.display = 'flex';
}

function filterFood() {
  const keyword = document.getElementById('foodSearch').value.toLowerCase().trim();
  const container = document.getElementById('restaurantList');
  container.innerHTML = '';

  const filtered = allFoodMenus.filter(r => 
    r.campus === currentCampus && 
    (r.name.toLowerCase().includes(keyword) || 
     (r.items && r.items.some(item => item.item.toLowerCase().includes(keyword))))
  );

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-center text-muted py-5">No matching restaurants found.</p>`;
    return;
  }

  // Reuse the same card creation logic...
  filtered.forEach(restaurant => {
    // (same card code as in showCampusFood)
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card food-card h-100" onclick="showRestaurantMenu('${restaurant.id}')">
        <div class="card-body">
          <h5 class="card-title">${restaurant.name}</h5>
          <p class="text-muted small">${restaurant.category || 'Restaurant'}</p>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// ====================== HOTLINES ======================
const hotlineData = {
  cyberjaya: [
    { name: "MMU Security Hotline", number: "03-8312 5939" },
    { name: "MMU FMD Hotline", number: "013-613 5117" },
    { name: "Fire Department (Cyberjaya)", number: "03-8318 4142" },
    { name: "Police (Cyberjaya)", number: "03-8318 2222" },
    { name: "Hospital (Cyberjaya)", number: "03-8873 3500" },
    { name: "Hospital (Putrajaya)", number: "03-8312 4200" }
  ],
  melaka: [] // can fill later
};

// Show Hotlines
function showHotlines(campus) {
  const list = document.getElementById('hotlineList');
  const title = document.getElementById('campusTitle');
  const display = document.getElementById('hotlineDisplay');

  list.innerHTML = '';

  if (campus === 'cyberjaya') {
    title.textContent = "Cyberjaya Campus Emergency Numbers";
  } else if (campus === 'melaka') {
    title.textContent = "Melaka Campus Emergency Numbers";
  }

  const data = hotlineData[campus];

  if (!data || data.length === 0) {
    list.innerHTML = `<li class="list-group-item text-muted">No data available yet.</li>`;
  } else {
    data.forEach(item => {
      const li = document.createElement('li');
      li.className = "list-group-item d-flex justify-content-between";
      li.innerHTML = `
        <span>${item.name}</span>
        <strong>${item.number}</strong>
      `;
      list.appendChild(li);
    });
  }

  display.style.display = 'block';
}

// ====================== TRANSPORT ======================
const transportData = {
  cyberjaya: [
    {
      name: "Rapid KL Bus T404",
      desc: "Connects Cyberjaya areas to nearby MRT/LRT stations",
      frequency: "Every 20–30 minutes",
      image: "images/T504bus.jpg", // you can add your own image
      link: "https://maps.app.goo.gl/cs3Hhj7rs7uXUAPY8"
    },
    {
      name: "Rapid KL Bus T405",
      desc: "Serves Cyberjaya residential & commercial zones",
      frequency: "Every 20–30 minutes",
      image: "images/T505bus.jpg",
      link: "https://maps.app.goo.gl/kuynBFsRmW4Psdbq6"
    }
  ],
  melaka: []
};

// Show Transport
function showTransport(campus) {
  const container = document.getElementById('transportDisplay');
  container.innerHTML = '';
  container.style.display = 'flex';

  const data = transportData[campus];

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="text-muted">No data available yet.</p>`;
    return;
  }

  data.forEach(bus => {
    const col = document.createElement('div');
    col.className = 'col-md-6';

    col.innerHTML = `
      <div class="card h-100 shadow">
        <img src="${bus.image}" class="card-img-top" alt="Bus Image">
        <div class="card-body">
          <h5 class="card-title">${bus.name}</h5>
          <p>${bus.desc}</p>
          <p><strong>Frequency:</strong> ${bus.frequency}</p>

          <a href="${bus.link}" target="_blank" class="btn btn-success">
            Check Live Timing (Google Maps)
          </a>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}


// ====================== LOST & FOUND ======================
let lostItemsData = [];

function openForm() {
  document.getElementById('lostFormModal').style.display = 'block';
}

function closeForm() {
  document.getElementById('lostFormModal').style.display = 'none';
}

function addItem() {
  const date = document.getElementById('lfDate').value;
  const time = document.getElementById('lfTime').value;
  const venue = document.getElementById('lfVenue').value.trim();
  const item = document.getElementById('lfItem').value.trim();
  const desc = document.getElementById('lfDesc').value.trim();

  if (!date || !time || !venue || !item || !desc) {
    alert("Please fill all fields!");
    return;
  }

  lostItemsData.push({ date, time, venue, item, desc });

  closeForm();
  loadItems();
}

function loadItems(data = lostItemsData) {
  const container = document.getElementById('lostItems');
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = `<p class="text-muted">No items posted yet.</p>`;
    return;
  }

  data.forEach(entry => {
    const col = document.createElement('div');
    col.className = "col-md-6";
    col.innerHTML = `
      <div class="card shadow">
        <div class="card-body">
          <h5>${entry.item}</h5>
          <p>${entry.desc}</p>
          <p><strong>Venue:</strong> ${entry.venue}</p>
          <p><strong>Date:</strong> ${entry.date} | ${entry.time}</p>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function filterLostItems() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const filtered = lostItemsData.filter(item =>
    item.item.toLowerCase().includes(keyword) ||
    item.desc.toLowerCase().includes(keyword) ||
    item.venue.toLowerCase().includes(keyword)
  );
  loadItems(filtered);
}

function filterByDate(type) {
  const today = new Date();
  const filtered = lostItemsData.filter(entry => {
    const itemDate = new Date(entry.date);
    const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);

    if (type === 'today') return diffDays < 1;
    if (type === 'yesterday') return diffDays >= 1 && diffDays < 2;
    if (type === 'week') return diffDays <= 7;
    return true;
  });
  loadItems(filtered);
}

// ====================== FEEDBACK SYSTEM ======================
let userFeedbacks = [];
let feedbackFormInitialized = false;

function loadUserFeedbacks() {
  const saved = localStorage.getItem('mmuFeedbacks');
  if (saved) userFeedbacks = JSON.parse(saved);
}

function saveFeedbacks() {
  localStorage.setItem('mmuFeedbacks', JSON.stringify(userFeedbacks));
}

function deleteFeedback(id) {
  if (confirm("Delete this feedback?")) {
    userFeedbacks = userFeedbacks.filter(fb => fb.id !== id);
    saveFeedbacks();
    displayFeedbacks();
  }
}

function filterFeedbacks() {
  const keyword = document.getElementById('feedbackSearch').value.toLowerCase().trim();
  displayFeedbacks(keyword);
}

function displayFeedbacks(searchTerm = '') {
  const container = document.getElementById('feedbackList');
  container.innerHTML = '';

  let filteredFeedbacks = userFeedbacks;

  if (searchTerm) {
    filteredFeedbacks = userFeedbacks.filter(fb =>
      fb.subject.toLowerCase().includes(searchTerm) ||
      fb.message.toLowerCase().includes(searchTerm) ||
      fb.category.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredFeedbacks.length === 0) {
    container.innerHTML = `<div class="col-12"><p class="text-muted text-center py-5">No feedbacks found.</p></div>`;
    return;
  }

  const isAdmin = currentUserRole === 'academic';

  filteredFeedbacks.forEach(fb => {
    const card = document.createElement('div');
    card.className = 'col-md-6';
    card.innerHTML = `
      <div class="card h-100 shadow-sm position-relative">
        ${isAdmin ? `
        <button onclick="deleteFeedback(${fb.id})" 
                class="btn btn-outline-danger btn-sm position-absolute bottom-0 end-0 m-3"
                style="z-index: 10;">
          <i class="bi bi-trash"></i> Delete
        </button>` : ''}

        <div class="card-body ${isAdmin ? 'pb-5' : ''}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="card-title mb-0">${fb.subject}</h6>
            <span class="badge bg-${fb.anonymous ? 'secondary' : 'primary'}">
              ${fb.anonymous ? 'Anonymous' : 'Signed'}
            </span>
          </div>
          
          <p class="text-warning mb-1 fs-5">${'★'.repeat(fb.rating)}</p>
          <p class="text-muted small mb-2">${fb.category} • ${fb.date}</p>
          <p class="card-text">${fb.message}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Star Rating Setup
function setupStarRating() {
  const stars = document.querySelectorAll('#starRating span');
  const ratingInput = document.getElementById('fbRating');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      ratingInput.value = value;
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= value));
    });
  });
}

// Submit Handler
function handleFeedbackSubmit(e) {
  e.preventDefault();
  // ... (same as before - no change needed) ...
  const category = document.getElementById('fbCategory').value;
  const rating = parseInt(document.getElementById('fbRating').value);
  const subject = document.getElementById('fbSubject').value.trim();
  const message = document.getElementById('fbMessage').value.trim();
  const anonymous = document.getElementById('fbAnonymous').checked;

  if (!category || rating === 0 || !subject || !message) {
    alert("Please fill all required fields and give a rating.");
    return;
  }

  const newFeedback = {
    id: Date.now(),
    category,
    rating,
    subject,
    message,
    anonymous,
    date: new Date().toLocaleDateString('en-MY')
  };

  userFeedbacks.unshift(newFeedback);
  saveFeedbacks();

  const form = document.getElementById('feedbackForm');
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success mt-3';
  successDiv.textContent = "Thank you! Your feedback has been submitted.";
  form.appendChild(successDiv);

  setTimeout(() => { 
    form.reset(); 
    document.getElementById('fbRating').value = '0';
    document.querySelectorAll('#starRating span').forEach(s => s.classList.remove('active'));
    successDiv.remove();
    displayFeedbacks(); 
  }, 1800);
}

function setupFeedbackForm() {
  if (feedbackFormInitialized) return;
  const form = document.getElementById('feedbackForm');
  if (form) {
    form.addEventListener('submit', handleFeedbackSubmit);
    feedbackFormInitialized = true;
  }
}

function initFeedback() {
  loadUserFeedbacks();
  setupStarRating();
  setupFeedbackForm();

  // Set title based on role
  const titleEl = document.getElementById('feedbackListTitle');
  if (currentUserRole === 'academic') {
    titleEl.textContent = "All Student Feedbacks (Admin View)";
  } else {
    titleEl.textContent = "My Previous Feedbacks";
  }

  displayFeedbacks();
}
