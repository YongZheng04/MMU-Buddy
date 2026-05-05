// Disable right-click
document.addEventListener('contextmenu', e => e.preventDefault());

// Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
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

// ====================== LOGIN & ROLE MANAGEMENT ======================
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

// ====================== USER DATABASE ======================
const usersDatabase = {
  students: [
    { id: "1211108445", name: "YAP YONG ZHENG"},
  ],
  academic: [
    { id: "ST0001", name: "YAP YONG ZHENG"},
  ]
};

// ====================== LOGIN FUNCTIONS ======================
function loginAs(role) {
  let name = "";
  let id = "";
  let welcomeText = "";

  if (role === 'student') {
    name = document.getElementById('studentName').value.trim();
    id = document.getElementById('studentID').value.trim();

    const student = usersDatabase.students.find(s => 
      s.id === id && s.name.toLowerCase() === name.toLowerCase()
    );

    if (!student) {
      alert("❌ Invalid Student Name or ID. Please try again.");
      return;
    }

    welcomeText = `Welcome, ${student.name}`;
    currentUserRole = 'student';
    // You can save more user info if needed
    window.currentUser = student;

  } 
  else if (role === 'academic') {
    name = document.getElementById('academicName').value.trim();
    id = document.getElementById('academicID').value.trim();

    const staff = usersDatabase.academic.find(s => 
      s.id === id && s.name.toLowerCase() === name.toLowerCase()
    );

    if (!staff) {
      alert("❌ Invalid Staff Name or Staff ID.");
      return;
    }

    welcomeText = `Welcome, ${staff.name}`;
    currentUserRole = 'academic';
    window.currentUser = staff;
  } 
  else if (role === 'nonacademic') {
    welcomeText = "Welcome, Visitor";
    currentUserRole = 'nonacademic';
  }

  // Update UI
  document.getElementById('userWelcome').innerText = welcomeText;
  document.getElementById('logoutBtn').style.display = 
    (role === 'student' || role === 'academic') ? 'block' : 'none';

  // Hide login pages
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';

  controlAccess(currentUserRole);
  document.getElementById('dashboard').style.display = 'block';

  // Add this at the end of loginAs() function
  if (window.currentUser) {
  console.log("Logged in user:", window.currentUser);
}
}

function backToLogin() {
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';
  document.getElementById('loginPage').style.display = 'block';
}

function logout() {
  if (confirm("Are you sure you want to log out?")) {
    location.reload();
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
  if (pageId === 'feedback') {
    initFeedback();
  }
}

function showDashboard() {
  document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
  document.getElementById('dashboard').style.display = 'block';
}

// ====================== EVENTS SYSTEM ======================
let allEvents = [];

function loadEvents() {
  const saved = localStorage.getItem('mmuEvents');
  if (saved) {
    allEvents = JSON.parse(saved);
  } else {
    // Default events
    allEvents = [
      {
        id: 1,
        title: "MMU Tech Carnival 2026",
        date: "2026-05-15",
        time: "09:00 AM - 05:00 PM",
        venue: "Grand Hall, Cyberjaya Campus",
        fees: "Free",
        description: "Join us for exciting workshops, coding competitions, tech talks...",
        registered: false
      },
      // Add more default events if you want
    ];
    saveEvents();
  }
}

function saveEvents() {
  localStorage.setItem('mmuEvents', JSON.stringify(allEvents));
}

function showAddEventForm() {
  document.getElementById('addEventModal').style.display = 'block';
}

function closeAddEventForm() {
  document.getElementById('addEventModal').style.display = 'none';
  document.getElementById('addEventForm').reset();
}

function addNewEvent() {
  const title = document.getElementById('newEventTitle').value.trim();
  const date = document.getElementById('newEventDate').value;
  const time = document.getElementById('newEventTime').value.trim();
  const venue = document.getElementById('newEventVenue').value.trim();
  const fees = document.getElementById('newEventFees').value.trim();
  const desc = document.getElementById('newEventDesc').value.trim();

  if (!title || !date || !time || !venue || !desc) {
    alert("Please fill all required fields!");
    return;
  }

  allEvents.unshift({
    id: Date.now(),
    title,
    date,
    time,
    venue,
    fees: fees || "Free",
    description: desc,
    registered: false
  });

  saveEvents();
  closeAddEventForm();
  filterEvents();
  alert("Event created successfully!");
}

function toggleRegister(id) {
  const event = allEvents.find(e => e.id === id);
  if (event) {
    event.registered = !event.registered;
    saveEvents();
    filterEvents();
  }
}

function displayEvents(events) {
  const container = document.getElementById('eventsList');
  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = `<p class="text-center text-muted py-5">No events found.</p>`;
    return;
  }

  events.forEach(event => {
    const isPast = new Date(event.date) < new Date();
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${event.title}</h5>
          <p class="text-muted small">
            📅 ${event.date} | 🕒 ${event.time}<br>
            📍 ${event.venue}
          </p>
          <p class="card-text">${event.description.substring(0, 120)}...</p>
          
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="badge ${isPast ? 'bg-secondary' : 'bg-success'}">${isPast ? 'Past' : 'Upcoming'}</span>
            <button onclick="toggleRegister(${event.id})" class="btn ${event.registered ? 'btn-danger' : 'btn-primary'} btn-sm">
              ${event.registered ? '✓ Registered' : 'RSVP'}
            </button>
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
      e.title.toLowerCase().includes(searchTerm) || 
      e.description.toLowerCase().includes(searchTerm) ||
      e.venue.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedDate) {
    filtered = filtered.filter(e => e.date === selectedDate);
  }

  displayEvents(filtered);
}

function switchEventTab(tab) {
  // You can expand this later for "My Registrations" etc.
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

// ====================== FOOD & CAFE ======================
const foodData = {
  cyberjaya: [
    {
      name: "Old Town White Coffee",
      items: [
        { item: "Nasi Lemak Ayam", price: "RM 8.50" },
        { item: "Roti Canai Set", price: "RM 6.50" },
        { item: "Kopi Tarik", price: "RM 4.50" }
      ]
    },
    {
      name: "Starbucks",
      items: [
        { item: "Caramel Macchiato", price: "RM 14.90" },
        { item: "Blueberry Muffin", price: "RM 9.50" },
        { item: "Chicken Sandwich", price: "RM 12.90" }
      ]
    },
    {
      name: "Mamak Stall",
      items: [
        { item: "Roti Canai + Teh Tarik", price: "RM 5.00" },
        { item: "Maggi Goreng", price: "RM 6.50" },
        { item: "Roti Boom", price: "RM 4.50" }
      ]
    }
  ],
  melaka: [
    {
      name: "Kedai Kopi Chung Wah",
      items: [
        { item: "Chicken Rice", price: "RM 7.50" },
        { item: "Wantan Mee", price: "RM 6.80" },
        { item: "Kaya Butter Toast", price: "RM 3.50" }
      ]
    },
    {
      name: "Satay Celup Stall",
      items: [
        { item: "Satay Celup Set (10 sticks)", price: "RM 12.00" },
        { item: "Cendol", price: "RM 4.50" }
      ]
    },
    {
      name: "Pizza Hut",
      items: [
        { item: "Personal Pan Pizza", price: "RM 15.90" },
        { item: "Garlic Bread", price: "RM 6.90" }
      ]
    }
  ]
};

function showCampusFood(campus) {
  const restaurantList = document.getElementById('restaurantList');
  restaurantList.innerHTML = '';
  restaurantList.style.display = 'flex';

  foodData[campus].forEach(restaurant => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100 text-center" onclick="showRestaurantMenu('${campus}', '${restaurant.name}')" style="cursor: pointer;">
        <div class="card-body">
          <h5 class="card-title">${restaurant.name}</h5>
          <p class="card-text">Tap to view menu</p>
        </div>
      </div>
    `;
    restaurantList.appendChild(col);
  });

  document.getElementById('menuDisplay').style.display = 'none';
}

function showRestaurantMenu(campus, restaurantName) {
  const restaurant = foodData[campus].find(r => r.name === restaurantName);
  if (!restaurant) return;

  document.getElementById('restaurantName').textContent = restaurant.name;
  const menuContainer = document.getElementById('menuItems');
  menuContainer.innerHTML = '';

  restaurant.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'col-md-6 mb-3';
    div.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h6>${item.item}</h6>
          <p class="text-success fw-bold">${item.price}</p>
        </div>
      </div>
    `;
    menuContainer.appendChild(div);
  });

  document.getElementById('menuDisplay').style.display = 'block';
  document.getElementById('restaurantList').style.display = 'none';
}

function backToRestaurants() {
  document.getElementById('menuDisplay').style.display = 'none';
  document.getElementById('restaurantList').style.display = 'flex';
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
