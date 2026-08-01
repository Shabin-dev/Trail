const display   = document.getElementById('display');
const historyEl = document.getElementById('history');
const memIndicator = document.getElementById('memIndicator');

let currentValue = '0';
let storedValue = null;
let pendingOperator = null;
let waitingForNext = false;
let lastExpression = '';
let memory = 0;
let hasError = false;

const OP_SYMBOLS = { '+':'+', '-':'−', '*':'×', '/':'÷' };

function formatNumber(num) {
  if (!isFinite(num)) return 'Error';
  if (Number.isInteger(num)) return String(num);
  // trim floating point noise, cap precision
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

function updateDisplay() {
  display.textContent = currentValue;
  display.classList.toggle('error', currentValue === 'Error');
  historyEl.textContent = lastExpression || '\u00A0';
  memIndicator.classList.toggle('active', memory !== 0);
}

function inputDigit(digit) {
  if (hasError) resetCalculator();
  if (waitingForNext) {
    currentValue = digit === '.' ? '0.' : digit;
    waitingForNext = false;
    return;
  }
  if (digit === '.' && currentValue.includes('.')) return;
  if (currentValue.replace('-','').replace('.','').length >= 15) return;
  currentValue = (currentValue === '0' && digit !== '.') ? digit : currentValue + digit;
}

function calculate(first, second, operator) {
  switch(operator){
    case '+': return first + second;
    case '-': return first - second;
    case '*': return first * second;
    case '/': return second === 0 ? NaN : first / second;
    default: return second;
  }
}

function handleOperator(operator) {
  if (hasError) return;
  const value = parseFloat(currentValue);
  if (pendingOperator && !waitingForNext) {
    const result = calculate(storedValue, value, pendingOperator);
    currentValue = formatNumber(result);
    if (currentValue === 'Error') { hasError = true; return updateAfterError(); }
    storedValue = parseFloat(currentValue);
  } else {
    storedValue = value;
  }
  lastExpression = `${formatNumber(storedValue)} ${OP_SYMBOLS[operator]}`;
  pendingOperator = operator;
  waitingForNext = true;
}

function handleEquals() {
  if (hasError) return;
  if (pendingOperator === null) return;
  const value = parseFloat(currentValue);
  lastExpression = `${formatNumber(storedValue)} ${OP_SYMBOLS[pendingOperator]} ${formatNumber(value)} =`;
  const result = calculate(storedValue, value, pendingOperator);
  currentValue = formatNumber(result);
  if (currentValue === 'Error') return updateAfterError();
  pendingOperator = null;
  waitingForNext = true;
}

function updateAfterError(){
  hasError = true;
  currentValue = 'Error';
  updateDisplay();
}

function resetCalculator() {
  currentValue = '0';
  storedValue = null;
  pendingOperator = null;
  waitingForNext = false;
  lastExpression = '';
  hasError = false;
}

function backspace() {
  if (hasError) return resetCalculator();
  if (waitingForNext) return;
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
}

function toggleSign() {
  if (hasError) return;
  if (currentValue === '0') return;
  currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : '-' + currentValue;
}

function percentValue() {
  if (hasError) return;
  const value = parseFloat(currentValue);
  currentValue = formatNumber(
    pendingOperator && storedValue !== null ? (storedValue * value) / 100 : value / 100
  );
}

function sqrtValue() {
  if (hasError) return;
  const value = parseFloat(currentValue);
  if (value < 0) return updateAfterError();
  currentValue = formatNumber(Math.sqrt(value));
  waitingForNext = true;
}

function squareValue() {
  if (hasError) return;
  const value = parseFloat(currentValue);
  currentValue = formatNumber(value * value);
  waitingForNext = true;
}

function memoryClear(){ memory = 0; updateDisplay(); }
function memoryRecall(){
  currentValue = formatNumber(memory);
  waitingForNext = false;
}
function memoryAdd(){ memory += parseFloat(currentValue) || 0; }
function memorySubtract(){ memory -= parseFloat(currentValue) || 0; }

function handleAction(action, opAttr) {
  switch(action){
    case 'digit':        break; // handled by caller with button text
    case 'operator':     handleOperator(opAttr); break;
    case 'equals':        handleEquals(); break;
    case 'clear':          resetCalculator(); break;
    case 'backspace':      backspace(); break;
    case 'toggle-sign':    toggleSign(); break;
    case 'percent':        percentValue(); break;
    case 'sqrt':           sqrtValue(); break;
    case 'square':         squareValue(); break;
    case 'mc':             memoryClear(); break;
    case 'mr':             memoryRecall(); break;
    case 'mplus':          memoryAdd(); break;
    case 'mminus':         memorySubtract(); break;
  }
  updateDisplay();
}

document.querySelector('.buttons').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  if (!action) return;
  if (action === 'digit') {
    inputDigit(button.textContent.trim());
    updateDisplay();
  } else {
    handleAction(action, button.dataset.op);
  }
});

document.querySelector('.row-mem').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  handleAction(button.dataset.action);
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (/^[0-9]$/.test(e.key)) { inputDigit(e.key); updateDisplay(); return; }
  if (e.key === '.') { inputDigit('.'); updateDisplay(); return; }
  if (['+','-','*','/'].includes(e.key)) { handleOperator(e.key); updateDisplay(); return; }
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); handleEquals(); updateDisplay(); return; }
  if (e.key === 'Backspace') { backspace(); updateDisplay(); return; }
  if (e.key === 'Escape') { resetCalculator(); updateDisplay(); return; }
  if (e.key === '%') { percentValue(); updateDisplay(); return; }
});

updateDisplay();