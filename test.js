// Virtual Keyboard for Pi OS
console.log('Virtual Keyboard Loading...');

let currentInput = null;
let shiftActive = false;
let keyboard = null;

// Create keyboard HTML
function createKeyboard() {
  if (keyboard) return;
  
  keyboard = document.createElement('div');
  keyboard.id = 'virtual-keyboard';
  
  keyboard.innerHTML = `
    <div class="kb-header">
      <span>Virtual Keyboard</span>
      <button class="kb-close" onclick="hideKeyboard()">×</button>
    </div>
    <div class="kb-row">
      <button class="kb-key" data-key="1">1</button>
      <button class="kb-key" data-key="2">2</button>
      <button class="kb-key" data-key="3">3</button>
      <button class="kb-key" data-key="4">4</button>
      <button class="kb-key" data-key="5">5</button>
      <button class="kb-key" data-key="6">6</button>
      <button class="kb-key" data-key="7">7</button>
      <button class="kb-key" data-key="8">8</button>
      <button class="kb-key" data-key="9">9</button>
      <button class="kb-key" data-key="0">0</button>
      <button class="kb-key wide" data-action="backspace">⌫</button>
    </div>
    <div class="kb-row">
      <button class="kb-key" data-key="q">q</button>
      <button class="kb-key" data-key="w">w</button>
      <button class="kb-key" data-key="e">e</button>
      <button class="kb-key" data-key="r">r</button>
      <button class="kb-key" data-key="t">t</button>
      <button class="kb-key" data-key="y">y</button>
      <button class="kb-key" data-key="u">u</button>
      <button class="kb-key" data-key="i">i</button>
      <button class="kb-key" data-key="o">o</button>
      <button class="kb-key" data-key="p">p</button>
    </div>
    <div class="kb-row">
      <button class="kb-key" data-key="a">a</button>
      <button class="kb-key" data-key="s">s</button>
      <button class="kb-key" data-key="d">d</button>
      <button class="kb-key" data-key="f">f</button>
      <button class="kb-key" data-key="g">g</button>
      <button class="kb-key" data-key="h">h</button>
      <button class="kb-key" data-key="j">j</button>
      <button class="kb-key" data-key="k">k</button>
      <button class="kb-key" data-key="l">l</button>
      <button class="kb-key wide" data-action="enter">⏎</button>
    </div>
    <div class="kb-row">
      <button class="kb-key wide" data-action="shift">⇧</button>
      <button class="kb-key" data-key="z">z</button>
      <button class="kb-key" data-key="x">x</button>
      <button class="kb-key" data-key="c">c</button>
      <button class="kb-key" data-key="v">v</button>
      <button class="kb-key" data-key="b">b</button>
      <button class="kb-key" data-key="n">n</button>
      <button class="kb-key" data-key="m">m</button>
      <button class="kb-key" data-key=",">,</button>
      <button class="kb-key" data-key=".">.</button>
    </div>
    <div class="kb-row">
      <button class="kb-key space" data-action="space">Space</button>
    </div>
  `;
  
  document.body.appendChild(keyboard);
  
  // Add click handlers
  keyboard.addEventListener('click', handleKeyClick);
  keyboard.addEventListener('mousedown', e => e.preventDefault());
}

// Show keyboard
function showKeyboard(input) {
  if (!keyboard) createKeyboard();
  currentInput = input;
  keyboard.style.display = 'block';
  console.log('Keyboard shown for:', input.tagName);
}

// Hide keyboard
function hideKeyboard() {
  if (keyboard) {
    keyboard.style.display = 'none';
    currentInput = null;
    shiftActive = false;
    updateShiftState();
  }
}

// Make hideKeyboard global
window.hideKeyboard = hideKeyboard;

// Handle key clicks
function handleKeyClick(e) {
  const key = e.target;
  if (!key.classList.contains('kb-key')) return;
  
  const keyValue = key.dataset.key;
  const action = key.dataset.action;
  
  if (!currentInput) return;
  
  if (action) {
    handleSpecialKey(action);
  } else if (keyValue) {
    typeCharacter(keyValue);
  }
}

// Handle special keys
function handleSpecialKey(action) {
  switch(action) {
    case 'backspace':
      handleBackspace();
      break;
    case 'enter':
      handleEnter();
      break;
    case 'shift':
      toggleShift();
      break;
    case 'space':
      typeCharacter(' ');
      break;
  }
}

// Type character
function typeCharacter(char) {
  if (shiftActive && char.match(/[a-z]/)) {
    char = char.toUpperCase();
    shiftActive = false;
    updateShiftState();
  }
  
  const start = currentInput.selectionStart || 0;
  const end = currentInput.selectionEnd || 0;
  const value = currentInput.value || '';
  
  currentInput.value = value.slice(0, start) + char + value.slice(end);
  currentInput.setSelectionRange(start + 1, start + 1);
  
  // Trigger events
  currentInput.dispatchEvent(new Event('input', { bubbles: true }));
  currentInput.dispatchEvent(new Event('change', { bubbles: true }));
}

// Handle backspace
function handleBackspace() {
  const start = currentInput.selectionStart || 0;
  const end = currentInput.selectionEnd || 0;
  const value = currentInput.value || '';
  
  if (start !== end) {
    currentInput.value = value.slice(0, start) + value.slice(end);
    currentInput.setSelectionRange(start, start);
  } else if (start > 0) {
    currentInput.value = value.slice(0, start - 1) + value.slice(start);
    currentInput.setSelectionRange(start - 1, start - 1);
  }
  
  currentInput.dispatchEvent(new Event('input', { bubbles: true }));
}

// Handle enter
function handleEnter() {
  if (currentInput.tagName === 'TEXTAREA') {
    typeCharacter('\n');
  } else {
    const form = currentInput.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  }
}

// Toggle shift
function toggleShift() {
  shiftActive = !shiftActive;
  updateShiftState();
}

// Update shift state
function updateShiftState() {
  const shiftKey = keyboard.querySelector('[data-action="shift"]');
  if (shiftKey) {
    if (shiftActive) {
      shiftKey.classList.add('shift-active');
    } else {
      shiftKey.classList.remove('shift-active');
    }
  }
}

// Check if element is text input
function isTextInput(element) {
  const textTypes = ['text', 'password', 'email', 'search', 'url', 'tel', 'number'];
  return (
    (element.tagName === 'INPUT' && textTypes.includes(element.type)) ||
    element.tagName === 'TEXTAREA' ||
    element.contentEditable === 'true'
  );
}

// Event listeners
document.addEventListener('click', function(e) {
  if (isTextInput(e.target)) {
    showKeyboard(e.target);
  } else if (keyboard && !keyboard.contains(e.target)) {
    hideKeyboard();
  }
});

document.addEventListener('focus', function(e) {
  if (isTextInput(e.target)) {
    showKeyboard(e.target);
  }
}, true);

console.log('Virtual Keyboard Ready!');