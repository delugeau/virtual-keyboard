// Virtual Keyboard AZERTY for Pi OS
console.log('Virtual Keyboard AZERTY Loading...');

let currentInput = null;
let shiftActive = false;
let keyboard = null;
let longPressTimer = null;
let currentAccentMenu = null;

// Accent mappings for French AZERTY
const accentMap = {
  'a': ['à', 'á', 'â', 'ä', 'ã', 'å'],
  'e': ['è', 'é', 'ê', 'ë'],
  'i': ['ì', 'í', 'î', 'ï'],
  'o': ['ò', 'ó', 'ô', 'ö', 'õ', 'ø'],
  'u': ['ù', 'ú', 'û', 'ü'],
  'c': ['ç'],
  'n': ['ñ'],
  'y': ['ÿ']
};

// Create keyboard HTML with AZERTY layout
function createKeyboard() {
  if (keyboard) return;
  
  keyboard = document.createElement('div');
  keyboard.id = 'virtual-keyboard';
  
  keyboard.innerHTML = `
    <div class="kb-header">
      <span>Clavier Virtuel AZERTY</span>
      <button class="kb-close" onclick="hideKeyboard()">×</button>
    </div>
    <div class="kb-row">
      <button class="kb-key" data-key="&" data-shift="1">&</button>
      <button class="kb-key" data-key="é" data-shift="2">é</button>
      <button class="kb-key" data-key='"' data-shift="3">"</button>
      <button class="kb-key" data-key="'" data-shift="4">'</button>
      <button class="kb-key" data-key="(" data-shift="5">(</button>
      <button class="kb-key" data-key="-" data-shift="6">-</button>
      <button class="kb-key" data-key="è" data-shift="7">è</button>
      <button class="kb-key" data-key="_" data-shift="8">_</button>
      <button class="kb-key" data-key="ç" data-shift="9">ç</button>
      <button class="kb-key" data-key="à" data-shift="0">à</button>
      <button class="kb-key" data-key=")" data-shift="°">)</button>
      <button class="kb-key wide" data-action="backspace">⌫</button>
    </div>
    <div class="kb-row">
      <button class="kb-key" data-key="a" data-shift="A" data-accents="true">a</button>
      <button class="kb-key" data-key="z" data-shift="Z">z</button>
      <button class="kb-key" data-key="e" data-shift="E" data-accents="true">e</button>
      <button class="kb-key" data-key="r" data-shift="R">r</button>
      <button class="kb-key" data-key="t" data-shift="T">t</button>
      <button class="kb-key" data-key="y" data-shift="Y" data-accents="true">y</button>
      <button class="kb-key" data-key="u" data-shift="U" data-accents="true">u</button>
      <button class="kb-key" data-key="i" data-shift="I" data-accents="true">i</button>
      <button class="kb-key" data-key="o" data-shift="O" data-accents="true">o</button>
      <button class="kb-key" data-key="p" data-shift="P">p</button>
      <button class="kb-key" data-key="^" data-shift="¨">^</button>
      <button class="kb-key" data-key="$" data-shift="£">$</button>
    </div>
    <div class="kb-row">
      <button class="kb-key" data-key="q" data-shift="Q">q</button>
      <button class="kb-key" data-key="s" data-shift="S">s</button>
      <button class="kb-key" data-key="d" data-shift="D">d</button>
      <button class="kb-key" data-key="f" data-shift="F">f</button>
      <button class="kb-key" data-key="g" data-shift="G">g</button>
      <button class="kb-key" data-key="h" data-shift="H">h</button>
      <button class="kb-key" data-key="j" data-shift="J">j</button>
      <button class="kb-key" data-key="k" data-shift="K">k</button>
      <button class="kb-key" data-key="l" data-shift="L">l</button>
      <button class="kb-key" data-key="m" data-shift="M">m</button>
      <button class="kb-key" data-key="ù" data-shift="%">ù</button>
      <button class="kb-key wide" data-action="return">↵</button>
    </div>
    <div class="kb-row">
      <button class="kb-key extra-wide" data-action="shift">⇧</button>
      <button class="kb-key" data-key="w" data-shift="W">w</button>
      <button class="kb-key" data-key="x" data-shift="X">x</button>
      <button class="kb-key" data-key="c" data-shift="C" data-accents="true">c</button>
      <button class="kb-key" data-key="v" data-shift="V">v</button>
      <button class="kb-key" data-key="b" data-shift="B">b</button>
      <button class="kb-key" data-key="n" data-shift="N" data-accents="true">n</button>
      <button class="kb-key" data-key="," data-shift="?">,</button>
      <button class="kb-key" data-key=";" data-shift=".">;</button>
      <button class="kb-key" data-key=":" data-shift="/">:</button>
      <button class="kb-key" data-key="!" data-shift="§">!</button>
    </div>
    <div class="kb-row">
      <button class="kb-key space" data-action="space">Espace</button>
    </div>
  `;
  
  document.body.appendChild(keyboard);
  
  // Add event handlers
  keyboard.addEventListener('mousedown', handleMouseDown);
  keyboard.addEventListener('mouseup', handleMouseUp);
  keyboard.addEventListener('mouseleave', handleMouseLeave);
  keyboard.addEventListener('click', handleKeyClick);
  keyboard.addEventListener('mousedown', e => e.preventDefault());
}

// Handle mouse down for long press
function handleMouseDown(e) {
  const key = e.target;
  if (!key.classList.contains('kb-key') || !key.dataset.accents) return;
  
  const letter = key.dataset.key.toLowerCase();
  if (!accentMap[letter]) return;
  
  // Start long press timer
  longPressTimer = setTimeout(() => {
    showAccentMenu(key, letter);
    key.classList.add('long-press');
  }, 500);
}

// Handle mouse up
function handleMouseUp(e) {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  const key = e.target;
  if (key.classList.contains('kb-key')) {
    key.classList.remove('long-press');
  }
}

// Handle mouse leave
function handleMouseLeave(e) {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  const key = e.target;
  if (key.classList.contains('kb-key')) {
    key.classList.remove('long-press');
  }
}

// Show accent menu
function showAccentMenu(keyElement, letter) {
  hideAccentMenu();
  
  const accents = accentMap[letter];
  if (!accents) return;
  
  const menu = document.createElement('div');
  menu.className = 'accent-menu show';
  
  accents.forEach(accent => {
    const option = document.createElement('button');
    option.className = 'accent-option';
    option.textContent = accent;
    option.onclick = () => {
      typeCharacter(accent);
      hideAccentMenu();
    };
    menu.appendChild(option);
  });
  
  keyElement.appendChild(menu);
  currentAccentMenu = menu;
}

// Hide accent menu
function hideAccentMenu() {
  if (currentAccentMenu) {
    currentAccentMenu.remove();
    currentAccentMenu = null;
  }
  
  // Remove long-press class from all keys
  const longPressKeys = keyboard.querySelectorAll('.kb-key.long-press');
  longPressKeys.forEach(key => key.classList.remove('long-press'));
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
    hideAccentMenu();
    updateShiftState();
  }
}

// Make hideKeyboard global
window.hideKeyboard = hideKeyboard;

// Handle key clicks
function handleKeyClick(e) {
  const key = e.target;
  if (!key.classList.contains('kb-key')) return;
  
  // Don't process click if accent menu is showing
  if (currentAccentMenu) {
    hideAccentMenu();
    return;
  }
  
  const keyValue = shiftActive ? key.dataset.shift : key.dataset.key;
  const action = key.dataset.action;
  
  if (!currentInput) return;
  
  if (action) {
    handleSpecialKey(action);
  } else if (keyValue) {
    typeCharacter(keyValue);
    
    // Reset shift after typing letter (except for special chars)
    if (shiftActive && keyValue.match(/[a-zA-Z]/)) {
      shiftActive = false;
      updateShiftState();
    }
  }
}

// Handle special keys
function handleSpecialKey(action) {
  switch(action) {
    case 'backspace':
      handleBackspace();
      break;
    case 'return':
      handleReturn();
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

// Handle return (always new line)
function handleReturn() {
  typeCharacter('\n');
}

// Toggle shift
function toggleShift() {
  shiftActive = !shiftActive;
  updateShiftState();
  updateKeyLabels();
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

// Update key labels based on shift state
function updateKeyLabels() {
  const keys = keyboard.querySelectorAll('.kb-key[data-key]');
  keys.forEach(key => {
    const normalKey = key.dataset.key;
    const shiftKey = key.dataset.shift;
    
    if (shiftKey) {
      key.textContent = shiftActive ? shiftKey : normalKey;
    }
  });
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

// Hide accent menu when clicking outside
document.addEventListener('click', function(e) {
  if (currentAccentMenu && !currentAccentMenu.contains(e.target)) {
    hideAccentMenu();
  }
});

console.log('Virtual Keyboard AZERTY Ready!');