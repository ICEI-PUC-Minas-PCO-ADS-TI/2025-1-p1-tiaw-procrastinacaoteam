const questions = [
  {
    question: "❓ Você costuma deixar tarefas para o último minuto?",
    answers: [
      { text: "Sempre", score: 3 },
      { text: "Às vezes", score: 2 },
      { text: "Raramente", score: 1 }
    ]
  },
  {
    question: "📱 Você se distrai com facilidade quando precisa focar?",
    answers: [
      { text: "Sim, muito fácil", score: 3 },
      { text: "Depende do dia", score: 2 },
      { text: "Não, sou bem focado(a)", score: 1 }
    ]
  },
  {
    question: "📵 Você usa o celular quando tem tarefas importantes?",
    answers: [
      { text: "Sim, o tempo todo", score: 3 },
      { text: "Às vezes", score: 2 },
      { text: "Não, só depois", score: 1 }
    ]
  },
  {
    question: "📝 Você faz listas de tarefas (to-do list)?",
    answers: [
      { text: "Nunca", score: 3 },
      { text: "Às vezes", score: 2 },
      { text: "Sim, sempre", score: 1 }
    ]
  },
  {
    question: "⌛ Já perdeu prazos importantes por adiar atividades?",
    answers: [
      { text: "Sim, várias vezes", score: 3 },
      { text: "Raramente", score: 2 },
      { text: "Nunca", score: 1 }
    ]
  }
];

let currentQuestionIndex = 0;
let totalScore = 0;

const questionContainer = document.getElementById('question-container');
const nextBtn = document.getElementById('next-btn');
const result = document.getElementById('result');
const progress = document.getElementById('progress');
const restartBtn = document.getElementById('restart-btn');

function showQuestion() {
  const q = questions[currentQuestionIndex];
  questionContainer.classList.add('question-fade');
  questionContainer.innerHTML = `
    <h2>${q.question}</h2>
    <div class="options">
      ${q.answers.map(a =>
        `<button onclick="selectAnswer(event, ${a.score})"><span>${a.text}</span></button>`
      ).join('')}
    </div>
  `;
  updateProgressBar();
  setTimeout(() => questionContainer.classList.remove('question-fade'), 400);
}

function selectAnswer(event, score) {
  totalScore += score;
  nextBtn.classList.remove('hidden');

  const buttons = document.querySelectorAll(".options button");
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected');
  });

  event.target.classList.add('selected');
}

nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  nextBtn.classList.add('hidden');
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  questionContainer.innerHTML = "";
  progress.style.width = '100%';

  let feedback = "";
  if (totalScore >= 13) {
    feedback = "🚨 Você procrastina bastante. Tente estabelecer rotinas e dividir tarefas!";
  } else if (totalScore >= 9) {
    feedback = "⚖️ Você procrastina às vezes, mas está no controle.";
  } else {
    feedback = "✅ Você é muito disciplinado(a), parabéns!";
  }

  result.innerHTML = `<h2>Resultado:</h2><p>${feedback}</p>`;
  result.classList.remove('hidden');
  restartBtn.classList.remove('hidden');
}

restartBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  totalScore = 0;
  result.classList.add('hidden');
  restartBtn.classList.add('hidden');
  showQuestion();
});

function updateProgressBar() {
  const percent = (currentQuestionIndex / questions.length) * 100;
  progress.style.width = `${percent}%`;
}

showQuestion();
