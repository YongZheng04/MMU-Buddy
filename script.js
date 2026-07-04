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
const storage = firebase.storage();

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

// ====================== LOGIN FUNCTIONS (ID + Password + Inline Error) ======================
async function loginAs(role) {
  // Clear previous errors
  clearErrors();

  let id = "";
  let password = "";

  if (role === 'student') {
    id = document.getElementById('studentID').value.trim();
    password = document.getElementById('studentPassword').value.trim();

    if (!id) {
      document.getElementById('studentIDError').textContent = "Student ID is required";
      return;
    }
    if (!password) {
      document.getElementById('studentPassError').textContent = "Password is required";
      return;
    }

    try {
      const querySnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .where('id', '==', id)
        .get();

      if (querySnapshot.empty) {
        document.getElementById('studentIDError').textContent = "Invalid Student ID";
        return;
      }

      const userDoc = querySnapshot.docs[0].data();

      if (userDoc.password !== password) {
        document.getElementById('studentPassError').textContent = "Incorrect Password";
        return;
      }

      currentUserRole = 'student';
      document.getElementById('userWelcome').innerText = `Welcome, ${userDoc.name}`;

    } catch (error) {
      console.error("Login Error:", error);
      alert("Connection error. Please check your internet.");
      return;
    }

  } 
  else if (role === 'academic') {
    id = document.getElementById('academicID').value.trim();
    password = document.getElementById('academicPassword').value.trim();

    if (!id) {
      document.getElementById('academicIDError').textContent = "Staff ID is required";
      return;
    }
    if (!password) {
      document.getElementById('academicPassError').textContent = "Password is required";
      return;
    }

    try {
      const querySnapshot = await db.collection('users')
        .where('role', '==', 'academic')
        .where('id', '==', id)
        .get();

      if (querySnapshot.empty) {
        document.getElementById('academicIDError').textContent = "Invalid Staff ID";
        return;
      }

      const userDoc = querySnapshot.docs[0].data();

      if (userDoc.password !== password) {
        document.getElementById('academicPassError').textContent = "Incorrect Password";
        return;
      }

      currentUserRole = 'academic';
      document.getElementById('userWelcome').innerText = `Welcome, ${userDoc.name}`;

    } catch (error) {
      console.error("Login Error:", error);
      alert("Connection error. Please check your internet.");
      return;
    }
  } 
  else if (role === 'nonacademic') {
    currentUserRole = 'nonacademic';
    document.getElementById('userWelcome').innerText = "Welcome, Visitor";
  }

  // Success Login
  document.getElementById('logoutBtn').style.display = 'block';
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';

  controlAccess(currentUserRole);
  document.getElementById('dashboard').style.display = 'block';
  setTimeout(loadAnnouncements, 300);
}

// Clear all error messages
function clearErrors() {
  document.getElementById('studentIDError').textContent = '';
  document.getElementById('studentPassError').textContent = '';
  document.getElementById('academicIDError').textContent = '';
  document.getElementById('academicPassError').textContent = '';
}

// Toggle Password Visibility
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === "password" ? "text" : "password";
}

// ====================== LOGOUT FUNCTION (No Confirmation) ======================
function logout() {
  currentUserRole = '';
  
  document.getElementById('dashboard').style.display = 'none';
  document.querySelectorAll('.page-content').forEach(el => {
    el.style.display = 'none';
  });

  document.getElementById('loginPage').style.display = 'block';
  
  // Clear inputs
  document.getElementById('studentID').value = '';
  document.getElementById('studentPassword').value = '';
  document.getElementById('academicID').value = '';
  document.getElementById('academicPassword').value = '';

  document.getElementById('userWelcome').innerText = "Welcome to MMU Buddy";
  document.getElementById('logoutBtn').style.display = 'none';
}

// ====================== BACK TO LOGIN ======================
function backToLogin() {
  // Hide login forms
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';
  
  // Show main role selection page
  document.getElementById('loginPage').style.display = 'block';
  
  // Optional: Clear input fields when going back
  document.getElementById('studentID').value = '';
  document.getElementById('studentPassword').value = '';
  document.getElementById('academicID').value = '';
  document.getElementById('academicPassword').value = '';
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

// ====================== ANNOUNCEMENT CAROUSEL ======================
let currentSlide = 0;
let slideInterval = null;

const announcements = [
  {
    image: "images/announcement1.jpg",
    title: "MMU Ranked Top 1001-1200 in 2026 Malaysia",
    subtitle: "Congratulations to all MMU staff and students!"
  },
  {
    image: "images/announcement2.jpg",
    title: "A Globally Ranked Faculty FCI",
    subtitle: "Congratulations to FCI faculty and students for their outstanding achievements!"
  },
  {
    image: "images/announcement3.jpg",
    title: "New Semester Begins",
    subtitle: "Get ready for an exciting new academic journey!"
  }
];

function loadAnnouncements() {
  const slidesContainer = document.getElementById('announcementSlides');
  const dotsContainer = document.getElementById('announcementDots');

  if (!slidesContainer || !dotsContainer) {
    console.warn("Announcement elements not found yet");
    return;
  }

  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  announcements.forEach((ann, index) => {
    const slide = document.createElement('div');
    slide.className = `slide ${index === 0 ? 'active' : ''}`;
    slide.style.backgroundImage = `url('${ann.image}')`;
    slide.innerHTML = `
      <div class="slide-content">
        <h4>${ann.title}</h4>
        <p>${ann.subtitle}</p>
      </div>
    `;
    slidesContainer.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
  });

  currentSlide = 0;
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % announcements.length;
  showSlide(currentSlide);
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  if (slides[index]) slides[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
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
  if (pageId === 'lostfound') {
  loadLostItems();
}
}

function showDashboard() {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
  
  // Show dashboard
  document.getElementById('dashboard').style.display = 'block';

  // Load announcements with a small delay to ensure DOM is ready
  setTimeout(() => {
    loadAnnouncements();
  }, 150);
}

// ====================== EVENTS SYSTEM ======================
let allEvents = [];
let currentSelectedEventId = null;
let currentPage = 1;
const eventsPerPage = 6;

// Load Events (Newest first)
async function loadEvents() {
  try {
    const snapshot = await db.collection('events')
      .orderBy('date', 'desc')        // Newest events first
      .get();

    allEvents = [];
    snapshot.forEach(doc => {
      allEvents.push({ id: doc.id, ...doc.data() });
    });

    currentPage = 1;
    filterEvents();
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

// Filter Events + Pagination
function filterEvents() {
  const searchTerm = document.getElementById('eventSearch').value.toLowerCase().trim();
  const selectedDate = document.getElementById('eventDateFilter').value;

  let filtered = allEvents;

  if (searchTerm) {
    filtered = filtered.filter(e => 
      (e.title && e.title.toLowerCase().includes(searchTerm)) || 
      (e.description && e.description.toLowerCase().includes(searchTerm)) ||
      (e.venue && e.venue.toLowerCase().includes(searchTerm))
    );
  }

  if (selectedDate) {
    filtered = filtered.filter(e => e.date === selectedDate);
  }

  currentPage = 1;
  displayEventsWithPagination(filtered);
}

// Display Events with Pagination
function displayEventsWithPagination(events) {
  const container = document.getElementById('eventsList');
  container.innerHTML = '';

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const start = (currentPage - 1) * eventsPerPage;
  const end = start + eventsPerPage;
  const paginatedEvents = events.slice(start, end);

  if (paginatedEvents.length === 0) {
    container.innerHTML = `<p class="text-center text-muted py-5">No events found.</p>`;
    document.getElementById('pagination').style.display = 'none';
    return;
  }

  paginatedEvents.forEach(event => {
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

  // Update Pagination UI
  document.getElementById('pagination').style.display = 'flex';
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
}

// Pagination Functions
function nextPage() {
  const totalPages = Math.ceil(allEvents.length / eventsPerPage); // Use filtered length in real version
  if (currentPage < totalPages) {
    currentPage++;
    filterEvents();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    filterEvents();
  }
}

// Show Event Detail Modal
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

  const listContainer = document.getElementById('modalRsvpList');
  if (rsvpList.length === 0) {
    listContainer.innerHTML = `<p class="text-muted">No one has registered yet.</p>`;
  } else {
    listContainer.innerHTML = `<ul class="list-group">${rsvpList.map(name => 
      `<li class="list-group-item">${name}</li>`).join('')}</ul>`;
  }

  const userName = document.getElementById('userWelcome').innerText.replace('Welcome, ', '').trim();
  const isRegistered = rsvpList.includes(userName);
  const rsvpBtn = document.getElementById('modalRsvpBtn');

  if (new Date(event.date) < new Date()) {
    rsvpBtn.style.display = 'none';
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

// Toggle RSVP with Inline Message
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

    const wasRegistered = rsvpList.includes(userName);

    if (wasRegistered) {
      rsvpList = rsvpList.filter(name => name !== userName);
      showInlineMessage("Registration cancelled.", "danger");
    } else {
      rsvpList.push(userName);
      showInlineMessage("Registered successfully!", "success");
    }

    await eventRef.update({ 
      rsvpList, 
      rsvpCount: rsvpList.length 
    });

    closeEventModal();
    await loadEvents();   // Refresh the list

  } catch (error) {
    console.error(error);
    showInlineMessage("Failed to update registration.", "danger");
  }
}

// Show Inline Message (like feedback)
function showInlineMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `alert alert-${type} mt-3 success-message`;
  msg.textContent = text;
  
  const eventsContainer = document.getElementById('eventsList');
  eventsContainer.parentElement.insertBefore(msg, eventsContainer);

  setTimeout(() => msg.remove(), 3000);
}

// ====================== CAMPUS MAPS ======================
function showCampusMap(campus) {
  // Update active button
  document.querySelectorAll('.btn-campus').forEach(btn => {
    btn.classList.toggle('active', btn.id === `map-btn-${campus}`);
  });

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

// ====================== HOTLINES (Firestore + Modern Design) ======================
async function showHotlines(campus) {
  // Update active button style
  document.querySelectorAll('.btn-campus').forEach(btn => {
    btn.classList.toggle('active', btn.id === `hotline-btn-${campus}`);
  });

  const list = document.getElementById('hotlineList');
  const title = document.getElementById('campusTitle');
  const display = document.getElementById('hotlineDisplay');

  list.innerHTML = '';
  display.style.display = 'block';

  try {
    const doc = await db.collection('hotlines').doc(campus).get();

    if (!doc.exists) {
      title.textContent = campus === 'cyberjaya' ? 
        "Cyberjaya Campus Emergency Numbers" : "Melaka Campus Emergency Numbers";
      list.innerHTML = `<li class="list-group-item text-muted">No data available yet.</li>`;
      return;
    }

    const data = doc.data();
    title.textContent = data.title || 
      (campus === 'cyberjaya' ? "Cyberjaya Campus Emergency Numbers" : "Melaka Campus Emergency Numbers");

    const numbers = data.numbers || [];

    if (numbers.length === 0) {
      list.innerHTML = `<li class="list-group-item text-muted">No emergency numbers available.</li>`;
    } else {
      numbers.forEach(item => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
          <span>${item.name}</span>
          <strong>${item.number}</strong>
        `;
        list.appendChild(li);
      });
    }

  } catch (error) {
    console.error("Error loading hotlines:", error);
    list.innerHTML = `<li class="list-group-item text-muted">Failed to load data.</li>`;
  }
}

// ====================== TRANSPORT ======================
const transportData = {
  cyberjaya: [
    {
      name: "Rapid KL Bus T504",
      desc: "Connects Cyberjaya areas to MRT stations",
      frequency: "Every 20–30 minutes",
      image: "images/T504bus.jpg", // you can add your own image
      link: "https://maps.app.goo.gl/cs3Hhj7rs7uXUAPY8"
    },
    {
      name: "Rapid KL Bus T505",
      desc: "Connects Cyberjaya areas to MMU University",
      frequency: "Every 20–30 minutes",
      image: "images/T505bus.jpg",
      link: "https://maps.app.goo.gl/kuynBFsRmW4Psdbq6"
    }
  ],
  melaka: []
};

// Show Transport
function showTransport(campus) {
  // Update active button
  document.querySelectorAll('.btn-campus').forEach(btn => {
    btn.classList.toggle('active', btn.id === `transport-btn-${campus}`);
  });

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

// ====================== LOST & FOUND (Basic Version) ======================
let lostItemsData = [];

function openPostModal() {
  document.getElementById('lostPostModal').style.display = 'block';
  setType('lost');
}

function closePostModal() {
  document.getElementById('lostPostModal').style.display = 'none';
}

function setType(type) {
  document.getElementById('type-lost').classList.toggle('active', type === 'lost');
  document.getElementById('type-found').classList.toggle('active', type === 'found');
}

// Post New Item
async function postLostItem() {
  // Clear previous errors
  clearLostErrors();

  const type = document.getElementById('type-lost').classList.contains('active') ? 'lost' : 'found';
  const date = document.getElementById('lfDate').value;
  const time = document.getElementById('lfTime').value;
  const venue = document.getElementById('lfVenue').value.trim();
  const itemName = document.getElementById('lfItem').value.trim();
  const desc = document.getElementById('lfDesc').value.trim();

  let hasError = false;

  if (!date) {
    document.getElementById('lfDateError').textContent = "Date is required";
    hasError = true;
  }
  if (!time) {
    document.getElementById('lfTimeError').textContent = "Time is required";
    hasError = true;
  }
  if (!venue) {
    document.getElementById('lfVenueError').textContent = "Venue is required";
    hasError = true;
  }
  if (!itemName) {
    document.getElementById('lfItemError').textContent = "Item name is required";
    hasError = true;
  }
  if (!desc) {
    document.getElementById('lfDescError').textContent = "Description is required";
    hasError = true;
  }

  if (hasError) return;

  try {
    await db.collection('lostfound').add({
      type: type,
      date: date,
      time: time,
      venue: venue,
      item: itemName,
      description: desc,
      postedBy: document.getElementById('userWelcome').innerText.replace('Welcome, ', ''),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Success - No alert, just refresh
    closePostModal();
    await loadLostItems();

    // Optional: Show green success message at top of Lost & Found page
    showSuccessMessage();

  } catch (error) {
    console.error(error);
    alert("Failed to post item. Please try again.");   // Only keep error alert
  }
}

// Show temporary success message
function showSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success text-center mb-3';
  successDiv.textContent = "✅ Item posted successfully!";
  const lostPage = document.getElementById('lostfound');
  lostPage.insertBefore(successDiv, lostPage.children[1]);

  setTimeout(() => {
    successDiv.remove();
  }, 2500);
}

// Clear Error Messages
function clearLostErrors() {
  document.getElementById('lfDateError').textContent = '';
  document.getElementById('lfTimeError').textContent = '';
  document.getElementById('lfVenueError').textContent = '';
  document.getElementById('lfItemError').textContent = '';
  document.getElementById('lfDescError').textContent = '';
}

// Load Items
async function loadLostItems() {
  try {
    const snapshot = await db.collection('lostfound')
      .orderBy('createdAt', 'desc')
      .get();

    lostItemsData = [];
    snapshot.forEach(doc => {
      lostItemsData.push({ id: doc.id, ...doc.data() });
    });

    displayLostItems(lostItemsData);
  } catch (error) {
    console.error(error);
  }
}

// Display Items
function displayLostItems(items) {
  const container = document.getElementById('lostItems');
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `<p class="text-center text-muted py-5">No items posted yet.</p>`;
    return;
  }

  items.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <span class="badge ${item.type === 'lost' ? 'bg-danger' : 'bg-success'} mb-2">${item.type.toUpperCase()}</span>
          <h5 class="card-title">${item.item}</h5>
          <p class="text-muted small">${item.date} | ${item.time}</p>
          <p class="text-muted small">📍 ${item.venue}</p>
          <p class="card-text">${item.description}</p>
          ${item.postedBy ? `<small class="text-muted">By: ${item.postedBy}</small>` : ''}
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function filterLostItems() {
  const keyword = document.getElementById('lostSearch').value.toLowerCase().trim();
  const status = document.getElementById('statusFilter').value;

  let filtered = lostItemsData;

  if (keyword) {
    filtered = filtered.filter(item =>
      item.item.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.venue.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    filtered = filtered.filter(item => item.type === status);
  }

  displayLostItems(filtered);
}

// ====================== FEEDBACK SYSTEM (Firestore + Show Name/ID) ======================
let allFeedbacks = [];

// Load Feedbacks
async function loadFeedbacks() {
  try {
    const snapshot = await db.collection('feedbacks')
      .orderBy('createdAt', 'desc')
      .get();

    allFeedbacks = [];
    snapshot.forEach(doc => {
      allFeedbacks.push({ id: doc.id, ...doc.data() });
    });

    displayFeedbacks();
  } catch (error) {
    console.error("Error loading feedbacks:", error);
  }
}

// Submit Feedback
function handleFeedbackSubmit(e) {
  e.preventDefault();

  const category = document.getElementById('fbCategory').value;
  const rating = parseInt(document.getElementById('fbRating').value);
  const subject = document.getElementById('fbSubject').value.trim();
  const message = document.getElementById('fbMessage').value.trim();
  const anonymous = document.getElementById('fbAnonymous').checked;

  if (!category || rating === 0 || !subject || !message) {
    alert("Please fill all required fields and give a rating.");
    return;
  }

  const userWelcome = document.getElementById('userWelcome').innerText;
  const userName = userWelcome.replace('Welcome, ', '');

  try {
    db.collection('feedbacks').add({
      category: category,
      rating: rating,
      subject: subject,
      message: message,
      anonymous: anonymous,
      name: anonymous ? null : userName,
      postedBy: userName,
      date: new Date().toLocaleDateString('en-MY'),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

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
      loadFeedbacks();
    }, 1800);

  } catch (error) {
    console.error(error);
    alert("Failed to submit feedback.");
  }
}

// Display Feedbacks
function displayFeedbacks(searchTerm = '') {
  const container = document.getElementById('feedbackList');
  container.innerHTML = '';

  let filtered = allFeedbacks;

  if (searchTerm) {
    filtered = filtered.filter(fb =>
      (fb.subject && fb.subject.toLowerCase().includes(searchTerm)) ||
      (fb.message && fb.message.toLowerCase().includes(searchTerm)) ||
      (fb.category && fb.category.toLowerCase().includes(searchTerm))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12"><p class="text-muted text-center py-5">No feedbacks yet.</p></div>`;
    return;
  }

  filtered.forEach(fb => {
    const card = document.createElement('div');
    card.className = 'col-md-6';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h6 class="card-title">${fb.subject}</h6>
            <span class="badge bg-${fb.anonymous ? 'secondary' : 'primary'}">
              ${fb.anonymous ? 'Anonymous' : fb.name || 'Signed'}
            </span>
          </div>
          
          <p class="text-warning mb-1">${'★'.repeat(fb.rating)}</p>
          <p class="text-muted small">${fb.category} • ${fb.date}</p>
          <p class="card-text">${fb.message}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterFeedbacks() {
  const keyword = document.getElementById('feedbackSearch').value.toLowerCase().trim();
  displayFeedbacks(keyword);
}

// Star Rating
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

function setupFeedbackForm() {
  const form = document.getElementById('feedbackForm');
  if (form) form.addEventListener('submit', handleFeedbackSubmit);
}

function initFeedback() {
  loadFeedbacks();
  setupStarRating();
  setupFeedbackForm();
}
