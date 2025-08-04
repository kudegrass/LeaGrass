// script.js

// Data: Review Areas
const areas = [
  {
    id: 'crop-science',
    name: '🌾 Crop Science',
    desc: 'Study of crop production, physiology, genetics, and sustainable farming systems.',
    topics: [
      'Plant Physiology and Morphology',
      'Crop Production Systems',
      'Plant Breeding and Genetics',
      'Horticulture and Floriculture'
    ]
  },
  {
    id: 'soil-science',
    name: '🧪 Soil Science',
    desc: 'Soil properties, fertility, classification, and conservation methods.',
    topics: [
      'Soil Formation and Classification',
      'Soil Fertility and Nutrient Management',
      'Soil Conservation Techniques'
    ]
  },
  {
    id: 'crop-protection',
    name: '🛡️ Crop Protection',
    desc: 'Integrated Pest Management (IPM), diseases, weeds, and pesticide safety.',
    topics: [
      'Integrated Pest Management (IPM)',
      'Pesticide Safety and Application',
      'Biological Control Methods'
    ]
  },
  {
    id: 'animal-science',
    name: '🐄 Animal Science',
    desc: 'Animal nutrition, breeding, health, and livestock production management.',
    topics: [
      'Animal Nutrition and Feeding',
      'Livestock Health and Disease Control',
      'Dairy and Poultry Production'
    ]
  },
  {
    id: 'agricultural-economics',
    name: '💰 Agricultural Economics',
    desc: 'Farm management, marketing, pricing, and agricultural policy analysis.',
    topics: [
      'Farm Management and Accounting',
      'Agricultural Market Analysis',
      'Cooperative Economics'
    ]
  },
  {
    id: 'agricultural-extension',
    name: '📢 Agricultural Extension',
    desc: 'Communication, education, and technology transfer in rural communities.',
    topics: [
      'Extension Methodologies',
      'Rural Development Approaches',
      'Program Planning and Evaluation'
    ]
  }
];

// Data: Resources
const resources = {
  'crop-science': [
    { title: 'FAO Crop Production Guidelines', url: 'https://www.fao.org/crop-production' },
    { title: 'Philippine Crop Science Society', url: 'https://www.philcropscience.org' }
  ],
  'soil-science': [
    { title: 'FAO Soil Portal', url: 'https://www.fao.org/soils-portal' },
    { title: 'Soil Science Society of America', url: 'https://www.soils.org' }
  ],
  'crop-protection': [
    { title: 'IPM Guidelines - FAO', url: 'https://www.fao.org/ipm' },
    { title: 'Plantwise Knowledge Bank', url: 'https://www.plantwise.org' }
  ],
  'animal-science': [
    { title: 'FAO Animal Production', url: 'https://www.fao.org/animal-production' },
    { title: 'Livestock Vaccine Guide', url: 'https://www.oie.int' }
  ],
  'agricultural-economics': [
    { title: 'FAO Agricultural Economics', url: 'https://www.fao.org/economic' },
    { title: 'Global Agricultural Trade System', url: 'https://apps.fas.usda.gov/gats' }
  ],
  'agricultural-extension': [
    { title: 'Global Forum for Rural Advisory Services', url: 'https://gfras.org' },
    { title: 'Extension Best Practices', url: 'https://www.extension.org' }
  ]
};

// Data: Quiz Questions
const quizQuestions = [
  {
    question: "Which of the following is a C4 plant?",
    options: ["Rice", "Wheat", "Maize", "Soybean"],
    answer: 2
  },
  {
    question: "What is the primary function of stomata in plants?",
    options: ["Water absorption", "Photosynthesis", "Gas exchange", "Nutrient transport"],
    answer: 2
  },
  {
    question: "Which soil horizon contains the most organic matter?",
    options: ["A-horizon", "B-horizon", "C-horizon", "R-horizon"],
    answer: 0
  },
  {
    question: "What does IPM stand for in agriculture?",
    options: ["Integrated Plant Management", "Integrated Pest Management", "Intensive Production Method", "Internal Plant Monitoring"],
    answer: 1
  },
  {
    question: "Which of the following is a ruminant animal?",
    options: ["Pig", "Chicken", "Goat", "Horse"],
    answer: 2
  }
];

// Quiz State
let currentQ = 0;
let userAnswers = [];
let score = 0;

// DOM Elements
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a[data-nav]');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const areasContainer = document.getElementById('areasContainer');
const resourcesContainer = document.getElementById('resourcesContainer');
const startQuizBtn = document.getElementById('startQuizBtn');
const quizContainer = document.getElementById('quizContainer');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const currentNum = document.getElementById('currentNum');
const totalNum = document.getElementById('totalNum');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resultBox = document.getElementById('resultBox');
const scoreValue = document.getElementById('scoreValue');
const retakeBtn = document.getElementById('retakeBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadAreas();
  loadResources();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('href').slice(1);
      showSection(target);
    });
  });

  // Search
  searchBtn.addEventListener('click', searchAreas);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAreas();
  });

  // Quiz
  startQuizBtn.addEventListener('click', startQuiz);
  prevBtn.addEventListener('click', prevQuestion);
  nextBtn.addEventListener('click', nextQuestion);
  retakeBtn.addEventListener('click', resetQuiz);
}

// Show Section
function showSection(id) {
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  navLinks.forEach(a => a.classList.remove('active'));
  document.querySelector(`nav a[href="#${id}"]`).classList.add('active');
}

// Load Areas
function loadAreas() {
  areasContainer.innerHTML = '';
  areas.forEach(area => {
    let html = `
      <div class="area-card">
        <h3>${area.name}</h3>
        <p>${area.desc}</p>
        <ul class="topic-list">
    `;
    area.topics.forEach(t => {
      html += `<li>${t}</li>`;
    });
    html += `</ul></div>`;
    areasContainer.innerHTML += html;
  });
}

// Search Areas
function searchAreas() {
  const term = searchInput.value.toLowerCase().trim();
  if (!term) return loadAreas();

  const filtered = areas.filter(a => 
    a.name.toLowerCase().includes(term) || 
    a.desc.toLowerCase().includes(term)
  );

  areasContainer.innerHTML = '';
  if (filtered.length === 0) {
    areasContainer.innerHTML = '<p style="color:#666; font-style:italic;">No areas match your search.</p>';
  } else {
    filtered.forEach(area => {
      let html = `
        <div class="area-card">
          <h3>${area.name}</h3>
          <p>${area.desc}</p>
          <ul class="topic-list">
      `;
      area.topics.forEach(t => {
        html += `<li>${t}</li>`;
      });
      html += `</ul></div>`;
      areasContainer.innerHTML += html;
    });
  }
}

// Load Resources
function loadResources() {
  resourcesContainer.innerHTML = '';
  areas.forEach(area => {
    let html = `<h3>${area.name}</h3><ul class="resource-list">`;
    (resources[area.id] || []).forEach(res => {
      html += `<li><a href="${res.url}" target="_blank">${res.title}</a></li>`;
    });
    html += `</ul>`;
    resourcesContainer.innerHTML += html;
  });
}

// Quiz Functions
function startQuiz() {
  quizContainer.style.display = 'block';
  currentQ = 0;
  userAnswers = [];
  score = 0;
  showQuestion();
}

function showQuestion() {
  const q = quizQuestions[currentQ];
  currentNum.textContent = currentQ + 1;
  totalNum.textContent = quizQuestions.length;
  quizQuestion.textContent = q.question;

  quizOptions.innerHTML = '';
  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    if (userAnswers[currentQ] === index) btn.classList.add('selected');
    btn.addEventListener('click', () => selectAnswer(index));
    quizOptions.appendChild(btn);
  });

  resultBox.style.display = 'none';
  prevBtn.disabled = currentQ === 0;
  nextBtn.textContent = currentQ === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next →';
}

function selectAnswer(index) {
  userAnswers[currentQ] = index;
  document.querySelectorAll('.quiz-options button').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

function nextQuestion() {
  if (currentQ < quizQuestions.length - 1) {
    currentQ++;
    showQuestion();
  } else {
    calculateScore();
  }
}

function prevQuestion() {
  if (currentQ > 0) {
    currentQ--;
    showQuestion();
  }
}

function calculateScore() {
  score = 0;
  quizQuestions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) score++;
  });
  scoreValue.textContent = Math.round((score / quizQuestions.length) * 100);
  resultBox.style.display = 'block';
  quizOptions.innerHTML = '';
}

function resetQuiz() {
  quizContainer.style.display = 'none';
  showSection('mock-tests');
}