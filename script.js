let currentUserRole = '';

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

function loginAs(role) {
  currentUserRole = role;
  let welcomeText = "Welcome to MMU Buddy";

  if (role === 'student') {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();
    if (!name || !id) {
      alert("Please fill in both Name and Student ID.");
      return;
    }
    welcomeText = `Welcome, ${name}`;
  } 
  else if (role === 'academic') {
    const name = document.getElementById('academicName').value.trim();
    const id = document.getElementById('academicID').value.trim();
    if (!name || !id) {
      alert("Please fill in both Name and Staff ID.");
      return;
    }
    welcomeText = `Welcome, ${name}`;
  } 
  else if (role === 'nonacademic') {
    welcomeText = "Welcome, Visitor";
  }

  document.getElementById('userWelcome').innerText = welcomeText;
  document.getElementById('logoutBtn').style.display = (role === 'student' || role === 'academic') ? 'block' : 'none';

  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
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

function showPage(pageId) {
  if (currentUserRole === 'nonacademic') {
    if (!['academic', 'maps', 'food'].includes(pageId)) {
      alert("YOU ARE NOT ALLOWED TO LOOK AT THIS SECTION. THANK YOU.");
      return;
    }
  }
  if (currentUserRole === 'academic') {
    if (['lostfound', 'feedback'].includes(pageId)) {
      alert("YOU ARE NOT ALLOWED TO LOOK AT THIS SECTION. THANK YOU.");
      return;
    }
  }

  document.getElementById('dashboard').style.display = 'none';
  document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
}

function showDashboard() {
  document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
  document.getElementById('dashboard').style.display = 'block';
}

// Event function
const eventsData = [
  {
    id: 1,
    title: "MMU Tech Carnival 2026",
    date: "2026-05-15",
    time: "09:00 AM - 05:00 PM",
    venue: "Grand Hall, Cyberjaya Campus",
    fees: "Free",
    description: "Join us for exciting workshops, coding competitions, tech talks, and networking with industry leaders."
  },
  {
    id: 2,
    title: "Career Talk: Future of Artificial Intelligence",
    date: "2026-04-22",
    time: "02:30 PM - 04:00 PM",
    venue: "FCM Lecture Hall A",
    fees: "Free",
    description: "Guest speaker from Google sharing insights on AI trends and career opportunities."
  },
  {
    id: 3,
    title: "Sports Day 2026",
    date: "2026-06-10",
    time: "08:00 AM onwards",
    venue: "MMU Sports Complex",
    fees: "RM 10",
    description: "Inter-faculty sports competition with fun games and prizes for winners."
  },
  {
    id: 4,
    title: "Blood Donation Drive",
    date: "2026-04-30",
    time: "10:00 AM - 04:00 PM",
    venue: "Student Centre Lobby",
    fees: "Free",
    description: "Support a noble cause. All students and staff are encouraged to participate."
  }
];

// Function to display events
function displayEvents(events) {
  const container = document.getElementById('eventsList');
  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No events found.</p>';
    return;
  }

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${event.title}</h5>
        <p class="card-text">
          <strong>Date:</strong> ${event.date} &nbsp;&nbsp; 
          <strong>Time:</strong> ${event.time}<br>
          <strong>Venue:</strong> ${event.venue}<br>
          <strong>Fees:</strong> ${event.fees}
        </p>
        <p class="card-text">${event.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Filter events based on search and date
function filterEvents() {
  const searchTerm = document.getElementById('eventSearch').value.toLowerCase().trim();
  const selectedDate = document.getElementById('eventDateFilter').value;

  let filteredEvents = eventsData;

  // Filter by search term
  if (searchTerm) {
    filteredEvents = filteredEvents.filter(event => 
      event.title.toLowerCase().includes(searchTerm) || 
      event.description.toLowerCase().includes(searchTerm) ||
      event.venue.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by date
  if (selectedDate) {
    filteredEvents = filteredEvents.filter(event => event.date === selectedDate);
  }

  displayEvents(filteredEvents);
}

// Show Event page and load events
function showPage(pageId) {
  if (currentUserRole === 'nonacademic') {
    if (!['academic', 'maps', 'food'].includes(pageId)) {
      alert("YOU ARE NOT ALLOWED TO LOOK AT THIS SECTION. THANK YOU.");
      return;
    }
  }
  if (currentUserRole === 'academic') {
    if (['lostfound', 'feedback'].includes(pageId)) {
      alert("YOU ARE NOT ALLOWED TO LOOK AT THIS SECTION. THANK YOU.");
      return;
    }
  }

  document.getElementById('dashboard').style.display = 'none';
  document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
  
  const page = document.getElementById(pageId);
  page.style.display = 'block';

  // If it's the event page, load events
  if (pageId === 'event') {
    filterEvents();   // Show all events initially
  }
}

// Campus Map Function
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

// ---> Food Menu Function <---
// Food Data
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

// Show restaurants for selected campus
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

  // Hide menu display when switching campus
  document.getElementById('menuDisplay').style.display = 'none';
}

// Show menu for selected restaurant
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

// Go back to restaurant list
function backToRestaurants() {
  document.getElementById('menuDisplay').style.display = 'none';
  document.getElementById('restaurantList').style.display = 'flex';
}
