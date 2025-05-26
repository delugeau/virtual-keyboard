// Simple test to verify extension loads
console.log('Virtual Keyboard Extension Loaded!');

// Create a simple test div
const testDiv = document.createElement('div');
testDiv.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  padding: 10px;
  z-index: 9999;
  border-radius: 5px;
`;
testDiv.textContent = 'Extension Working!';
document.body.appendChild(testDiv);

// Remove test div after 3 seconds
setTimeout(() => {
  testDiv.remove();
}, 3000);

// Basic input detection test
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    console.log('Input field clicked:', e.target);
    alert('Input detected! Extension is working.');
  }
});