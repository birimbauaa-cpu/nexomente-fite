(() => {
  'use strict';

  const body = document.body;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    // ---------- Experience settings ----------
  const systemPrefersDark =
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

  const experience = {
    lowStimulus: false,
    largeText: false,
    highContrast: false,
    darkMode: systemPrefersDark,
    ...safeParse(localStorage.getItem('nexomente:experience')),
  };

  const controls = {
    lowStimulus: [
      $('#lowStimulusToggle'),
      $('#dialogLowStimulus')
    ],

    largeText: [
      $('#largeTextToggle'),
      $('#dialogLargeText')
    ],

    highContrast: [
      $('#contrastToggle'),
      $('#dialogContrast')
    ],

    darkMode: [
      $('#darkModeToggle'),
      $('#dialogDarkMode')
    ],
  };

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  }

  function applyExperience() {
    body.classList.toggle(
      'low-stimulus',
      !!experience.lowStimulus
    );

    body.classList.toggle(
      'large-text',
      !!experience.largeText
    );

    body.classList.toggle(
      'high-contrast',
      !!experience.highContrast
    );

    body.classList.toggle(
      'dark-mode',
      !!experience.darkMode
    );

    // Faz campos nativos do navegador acompanharem o tema.
    document.documentElement.style.colorScheme =
      experience.darkMode ? 'dark' : 'light';

    // Altera a cor da barra do navegador no celular.
    const themeColor =
      document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.setAttribute(
        'content',
        experience.darkMode ? '#0f1613' : '#153A34'
      );
    }

    // Mantém os controles da página e do modal sincronizados.
    Object.entries(controls).forEach(([key, elements]) => {
      elements
        .filter(Boolean)
        .forEach((el) => {
          el.checked = !!experience[key];
        });
    });

    // Salva todas as escolhas no navegador.
    localStorage.setItem(
      'nexomente:experience',
      JSON.stringify(experience)
    );
  }

  Object.entries(controls).forEach(([key, elements]) => {
    elements
      .filter(Boolean)
      .forEach((el) => {
        el.addEventListener('change', () => {
          experience[key] = el.checked;
          applyExperience();
        });
      });
  });

  applyExperience();

  const experienceDialog = $('#experienceDialog');

  $('#openExperience')?.addEventListener(
    'click',
    () => experienceDialog?.showModal()
  );

  $('#resetExperience')?.addEventListener('click', () => {
    experience.lowStimulus = false;
    experience.largeText = false;
    experience.highContrast = false;
    experience.darkMode = false;

    applyExperience();
  });

  // ---------- Quick intent navigation ----------
  const contextMessage = $('#contextMessage');
  $$('.need-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = $(card.dataset.target);
      if (contextMessage) contextMessage.textContent = card.dataset.message || '';
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
  });

  // ---------- Focus timer ----------
  const timerDisplay = $('#timerDisplay');
  const focusRoomTime = $('#focusRoomTime');
  const ringProgress = $('#ringProgress');
  const timerToggle = $('#timerToggle');
  const focusRoomToggle = $('#focusRoomToggle');
  const timerReset = $('#timerReset');
  const focusRoomReset = $('#focusRoomReset');
  const taskInput = $('#focusTask');
  const focusRoomTask = $('#focusRoomTask');
  const focusRoom = $('#focusRoom');
  const circumference = 2 * Math.PI * 52;

  let selectedMinutes = Number(localStorage.getItem('nexomente:timerMinutes')) || 25;
  let totalSeconds = selectedMinutes * 60;
  let remainingSeconds = totalSeconds;
  let timerId = null;

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerUI() {
    const label = formatTime(remainingSeconds);
    if (timerDisplay) timerDisplay.textContent = label;
    if (focusRoomTime) focusRoomTime.textContent = label;
    const progress = totalSeconds ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
    if (ringProgress) ringProgress.style.strokeDashoffset = String(circumference * (1 - progress));
    if (timerId) document.title = `${label} · NexoMente`;
    else document.title = 'NexoMente — foco do seu jeito';
  }

  function setTimerButtons() {
    const text = timerId ? 'Pausar' : (remainingSeconds < totalSeconds ? 'Continuar' : 'Começar');
    if (timerToggle) timerToggle.textContent = text;
    if (focusRoomToggle) focusRoomToggle.textContent = text;
  }

  function tick() {
    remainingSeconds -= 1;
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      clearInterval(timerId);
      timerId = null;
      setTimerButtons();
      updateTimerUI();
      if ('vibrate' in navigator) navigator.vibrate?.([80, 80, 80]);
      return;
    }
    updateTimerUI();
  }

  function toggleTimer() {
    if (remainingSeconds <= 0) resetTimer();
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      timerId = setInterval(tick, 1000);
    }
    setTimerButtons();
    updateTimerUI();
  }

  function resetTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    totalSeconds = selectedMinutes * 60;
    remainingSeconds = totalSeconds;
    setTimerButtons();
    updateTimerUI();
  }

  timerToggle?.addEventListener('click', toggleTimer);
  focusRoomToggle?.addEventListener('click', toggleTimer);
  timerReset?.addEventListener('click', resetTimer);
  focusRoomReset?.addEventListener('click', resetTimer);

  $$('.preset').forEach(button => {
    if (Number(button.dataset.minutes) === selectedMinutes) {
      $$('.preset').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
    }
    button.addEventListener('click', () => {
      selectedMinutes = Number(button.dataset.minutes);
      localStorage.setItem('nexomente:timerMinutes', String(selectedMinutes));
      $$('.preset').forEach(b => b.classList.toggle('active', b === button));
      resetTimer();
    });
  });

  taskInput.value = localStorage.getItem('nexomente:focusTask') || '';
  taskInput?.addEventListener('input', () => {
    localStorage.setItem('nexomente:focusTask', taskInput.value);
    if (focusRoomTask) focusRoomTask.textContent = taskInput.value.trim() || 'Escolha uma tarefa na tela anterior.';
  });

  $('#openFocusRoom')?.addEventListener('click', () => {
    if (focusRoomTask) focusRoomTask.textContent = taskInput.value.trim() || 'Escolha uma tarefa na tela anterior.';
    focusRoom?.showModal();
  });
  $('#closeFocusRoom')?.addEventListener('click', () => focusRoom?.close());
  focusRoom?.addEventListener('cancel', () => focusRoom.close());
  updateTimerUI();
  setTimerButtons();

  // ---------- Task breaker: simple local heuristic, no server/AI required ----------
  const bigTask = $('#bigTask');
  const taskType = $('#taskType');
  const energyLevel = $('#energyLevel');
  const stepResult = $('#stepResult');

  const templates = {
    study: [
      'Definir exatamente o conteúdo que entra neste bloco',
      'Separar material, água e o que você vai usar',
      'Fazer uma passada rápida para localizar os pontos principais',
      'Estudar um tópico por vez e marcar dúvidas',
      'Fechar o material e tentar lembrar os pontos principais',
      'Revisar só o que ficou confuso e encerrar o bloco',
    ],
    presentation: [
      'Escrever em uma frase o que a apresentação precisa comunicar',
      'Listar de 3 a 5 ideias essenciais',
      'Separar as informações ou imagens que sustentam cada ideia',
      'Montar primeiro uma versão simples, sem tentar deixar perfeita',
      'Revisar a ordem e cortar o que estiver sobrando',
      'Treinar uma vez cronometrando e anotar os ajustes finais',
    ],
    writing: [
      'Definir o objetivo do texto em uma frase',
      'Anotar os tópicos que precisam aparecer',
      'Colocar os tópicos em uma ordem simples',
      'Escrever uma primeira versão sem editar a cada frase',
      'Fazer uma pausa curta',
      'Revisar clareza, erros e o que ainda estiver faltando',
    ],
    home: [
      'Escolher uma área pequena ou um resultado específico',
      'Separar apenas o que é necessário para começar',
      'Fazer a primeira ação física de menos de 2 minutos',
      'Continuar por um bloco curto sem adicionar novas tarefas',
      'Parar, conferir o que mudou e decidir o próximo bloco',
    ],
    generic: [
      'Definir como você vai saber que a tarefa terminou',
      'Separar o que precisa estar à mão antes de começar',
      'Escolher a menor ação possível que já conta como início',
      'Fazer um bloco curto só nessa ação',
      'Conferir o que falta e escolher o próximo passo',
      'Finalizar ou deixar anotado o ponto exato de retomada',
    ],
  };

  function detectType(text) {
    const t = text.toLowerCase();
    if (/(prova|estudar|revisar|matéria|capítulo|exercício|biologia|física|química|matemática)/.test(t)) return 'study';
    if (/(apresenta|slide|seminário|feira|pitch|trabalho|projeto)/.test(t)) return 'presentation';
    if (/(texto|redação|relatório|resumo|artigo|escrever)/.test(t)) return 'writing';
    if (/(arrumar|limpar|organizar quarto|lavar|guardar|cozinha)/.test(t)) return 'home';
    return 'generic';
  }

  function buildSteps() {
    const task = bigTask.value.trim();
    if (!task) {
      stepResult.innerHTML = '<p class="step-note">Escreva a tarefa primeiro. Pode ser do jeito que ela está aparecendo na sua cabeça.</p>';
      bigTask.focus();
      return;
    }
    const chosen = taskType.value === 'auto' ? detectType(task) : taskType.value;
    let steps = [...(templates[chosen] || templates.generic)];
    const energy = energyLevel.value;
    if (energy === 'low') steps = steps.slice(0, 4).map((s, i) => i === 2 ? `Começar por 5 minutos: ${s.charAt(0).toLowerCase()}${s.slice(1)}` : s);
    if (energy === 'high') steps.push('Se ainda houver energia, preparar o próximo bloco antes de encerrar');

    const safeTask = task.replace(/[<>"'&]/g, char => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;','&':'&amp;'}[char]));
    stepResult.innerHTML = `
      <p class="step-note"><strong>Objetivo:</strong> ${safeTask}. Você não precisa fazer todos os passos agora — comece pelo primeiro.</p>
      <ol class="step-list">
        ${steps.map((step, i) => `
          <li class="step-item">
            <input type="checkbox" id="step-${i}" />
            <label for="step-${i}"><strong>Passo ${i + 1}.</strong> ${step}</label>
          </li>`).join('')}
      </ol>`;
  }

  $('#breakTask')?.addEventListener('click', buildSteps);

  // ---------- Three priorities ----------
  const priorityInputs = [$('#priority1'), $('#priority2'), $('#priority3')].filter(Boolean);
  const savedState = $('#savedState');
  const savedPriorities = safeParse(localStorage.getItem('nexomente:priorities'));
  priorityInputs.forEach((input, index) => {
    input.value = savedPriorities[index] || '';
    input.addEventListener('input', () => {
      const values = priorityInputs.map(item => item.value);
      localStorage.setItem('nexomente:priorities', JSON.stringify(values));
      if (savedState) savedState.textContent = 'Salvo agora neste navegador.';
    });
  });
  $('#clearPriorities')?.addEventListener('click', () => {
    priorityInputs.forEach(input => { input.value = ''; });
    localStorage.removeItem('nexomente:priorities');
    if (savedState) savedState.textContent = 'Lista limpa.';
  });

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
