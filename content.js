class VirtualKeyboard {
  constructor() {
    this.activeInput = null;
    this.isShiftPressed = false;
    this.keyboard = null;
    this.init();
  }

  init() {
    this.createKeyboard();
    this.bindEvents();
  }

  createKeyboard() {
    // Remove existing keyboard if any
    const existing = document.getElementById('virtual-keyboard');
    if (existing) existing.remove();

    this.keyboard = document.createElement('div');
    this.keyboard.id = 'virtual-keyboard';
    
    const keyLayout = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter'],
      ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '?'],
      ['space']
    ];

    this.keyboard.innerHTML = `
      <div class="keyboard-header">
        <span>Virtual Keyboard</span>
        <button class="keyboard-close" data-action="close">×</button>
      </div>
    `;

    keyLayout.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';
      
      row.forEach(key => {
        const keyButton = document.createElement('button');
        keyButton.className = `keyboard-key ${key}`;
        keyButton.dataset.key = key;
        
        switch(key) {
          case 'space':
            keyButton.textContent = 'Space';
            keyButton.dataset.action = 'space';
            break;
          case 'backspace':
            keyButton.textContent = '⌫';
            keyButton.dataset.action = 'backspace';
            break;
          case 'enter':
            keyButton.textContent = 'Enter';
            keyButton.dataset.action = 'enter';
            break;
          case 'shift':
            keyButton.textContent = '⇧';
            keyButton.dataset.action = 'shift';
            break;
          default:
            keyButton.textContent = key;
            keyButton.dataset.action = 'type';
        }
        
        rowDiv.appendChild(keyButton);
      });
      
      this.keyboard.appendChild(rowDiv);
    });

    document.body.appendChild(this.keyboard);
  }

  bindEvents() {
    // Show keyboard on input focus/click
    document.addEventListener('click', (e) => {
      if (this.isTextInput(e.target)) {
        this.showKeyboard(e.target);
      } else if (!this.keyboard.contains(e.target)) {
        this.hideKeyboard();
      }
    });

    document.addEventListener('focus', (e) => {
      if (this.isTextInput(e.target)) {
        this.showKeyboard(e.target);
      }
    }, true);

    // Handle keyboard clicks
    this.keyboard.addEventListener('click', (e) => {
      if (e.target.classList.contains('keyboard-key') || e.target.dataset.action) {
        e.preventDefault();
        this.handleKeyPress(e.target);
      }
    });

    // Prevent keyboard from losing focus when clicked
    this.keyboard.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  }

  isTextInput(element) {
    const textInputTypes = ['text', 'password', 'email', 'search', 'url', 'tel', 'number'];
    
    return (
      element.tagName === 'INPUT' && textInputTypes.includes(element.type) ||
      element.tagName === 'TEXTAREA' ||
      element.contentEditable === 'true'
    );
  }

  showKeyboard(input) {
    this.activeInput = input;
    this.keyboard.style.display = 'block';
    
    // Scroll to keep input visible
    setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  hideKeyboard() {
    this.keyboard.style.display = 'none';
    this.activeInput = null;
    this.isShiftPressed = false;
    this.updateShiftState();
  }

  handleKeyPress(keyElement) {
    const action = keyElement.dataset.action;
    const key = keyElement.dataset.key;

    if (!this.activeInput) return;

    switch(action) {
      case 'type':
        this.typeCharacter(key);
        break;
      case 'space':
        this.typeCharacter(' ');
        break;
      case 'backspace':
        this.handleBackspace();
        break;
      case 'enter':
        this.handleEnter();
        break;
      case 'shift':
        this.toggleShift();
        break;
      case 'close':
        this.hideKeyboard();
        break;
    }
  }

  typeCharacter(char) {
    if (this.isShiftPressed && char.match(/[a-z]/)) {
      char = char.toUpperCase();
    }

    if (this.activeInput.tagName === 'INPUT' || this.activeInput.tagName === 'TEXTAREA') {
      const start = this.activeInput.selectionStart;
      const end = this.activeInput.selectionEnd;
      const value = this.activeInput.value;
      
      this.activeInput.value = value.slice(0, start) + char + value.slice(end);
      this.activeInput.setSelectionRange(start + 1, start + 1);
      
      // Trigger input event
      this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (this.activeInput.contentEditable === 'true') {
      document.execCommand('insertText', false, char);
    }

    // Reset shift after typing (like real keyboard)
    if (this.isShiftPressed && char.match(/[a-z]/)) {
      this.isShiftPressed = false;
      this.updateShiftState();
    }
  }

  handleBackspace() {
    if (this.activeInput.tagName === 'INPUT' || this.activeInput.tagName === 'TEXTAREA') {
      const start = this.activeInput.selectionStart;
      const end = this.activeInput.selectionEnd;
      
      if (start !== end) {
        // Delete selection
        const value = this.activeInput.value;
        this.activeInput.value = value.slice(0, start) + value.slice(end);
        this.activeInput.setSelectionRange(start, start);
      } else if (start > 0) {
        // Delete one character
        const value = this.activeInput.value;
        this.activeInput.value = value.slice(0, start - 1) + value.slice(start);
        this.activeInput.setSelectionRange(start - 1, start - 1);
      }
      
      this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (this.activeInput.contentEditable === 'true') {
      document.execCommand('delete', false, null);
    }
  }

  handleEnter() {
    if (this.activeInput.tagName === 'TEXTAREA' || this.activeInput.contentEditable === 'true') {
      this.typeCharacter('\n');
    } else {
      // For regular inputs, trigger form submission or blur
      const form = this.activeInput.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  }

  toggleShift() {
    this.isShiftPressed = !this.isShiftPressed;
    this.updateShiftState();
  }

  updateShiftState() {
    const shiftKey = this.keyboard.querySelector('[data-action="shift"]');
    if (this.isShiftPressed) {
      shiftKey.classList.add('shift-active');
    } else {
      shiftKey.classList.remove('shift-active');
    }
  }
}

// Initialize the virtual keyboard when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VirtualKeyboard();
  });
} else {
  new VirtualKeyboard();
}