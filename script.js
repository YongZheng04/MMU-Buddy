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

  if (role === 'student') {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentID').value.trim();
    
    if (!name || !id) {
      alert("Please fill in both Name and Student ID.");
      return;
    }
    document.getElementById('userWelcome').innerText = `Welcome, ${name}`;
  } 
  else if (role === 'academic') {
    const name = document.getElementById('academicName').value.trim();
    const id = document.getElementById('academicID').value.trim();
    
    if (!name || !id) {
      alert("Please fill in both Name and Staff ID.");
      return;
    }
    document.getElementById('userWelcome').innerText = `Welcome, ${name}`;
  } 
  else if (role === 'nonacademic') {
    document.getElementById('userWelcome').innerText = "Welcome, Visitor";
  }

  document.getElementById('logoutBtn').style.display = (role === 'student' || role === 'academic') ? 'block' : 'none';
  
  // Hide all login pages
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('studentLogin').style.display = 'none';
  document.getElementById('academicLogin').style.display = 'none';
  
  // Show homepage
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