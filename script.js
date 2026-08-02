const display = document.getElementById('display');
const historyEl = document.getElementById('history');
let currentValue = '0';
let storedValue = null;
let pendingOperator = null;
let waitingForNext = false;
let lastExpression = '';

function updateDisplay() {
  display.textContent = currentValue;
  historyEl.textContent = lastExpression || 'Start tapping numbers';
}

function inputDigit(digit) {
  if (waitingForNext) {
    currentValue = digit === '.' ? '0.' : digit;
    waitingForNext = false;
    return;
  }
  if (digit === '.' && currentValue.includes('.')) return;
  currentValue = currentValue === '0' && digit !== '.' ? digit : currentValue + digit;
}

function handleOperator(operator) {
  const value = parseFloat(currentValue);
  if (pendingOperator && !waitingForNext) {
    currentValue = String(calculate(storedValue, value, pendingOperator));
  }
  storedValue = parseFloat(currentValue);
  pendingOperator = operator;
  waitingForNext = true;
}

function calculate(first, second, operator) {
  if (operator === '+') return first + second;
  if (operator === '-') return first - second;
  if (operator === '*') return first * second;
  if (operator === '/') return second === 0 ? 'Error' : first / second;
  return second;
}

function resetCalculator() {
  currentValue = '0';
  storedValue = null;
  pendingOperator = null;
  waitingForNext = false;
  lastExpression = '';
}

function clearEntry() {
  currentValue = '0';
  waitingForNext = false;
}

function toggleSign() {
  currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : '-' + currentValue;
}

function percentValue() {
  currentValue = String(parseFloat(currentValue) / 100);
}

function backspaceValue() {
  if (currentValue.length > 1) {
    currentValue = currentValue.slice(0, -1);
  } else {
    currentValue = '0';
  }
}

function squareValue() {
  currentValue = String(parseFloat(currentValue) ** 2);
}

function sqrtValue() {
  const value = parseFloat(currentValue);
  currentValue = value < 0 ? 'Error' : String(Math.sqrt(value));
}

function handleButtonClick(event) {
  const button = event.target;
  const action = button.dataset.action;
  const buttonContent = button.textContent;

  if (!action) return;

  switch (action) {
    case 'digit':
      inputDigit(buttonContent);
      break;
    case 'operator':
      handleOperator(buttonContent);
      break;
    case 'equals':
      if (pendingOperator === null) return;
      const result = calculate(storedValue, parseFloat(currentValue), pendingOperator);
      lastExpression = `${storedValue} ${pendingOperator} ${currentValue} = ${result}`;
      currentValue = String(result);
      pendingOperator = null;
      waitingForNext = true;
      break;
    case 'clear':
      resetCalculator();
      break;
    case 'clear-entry':
      clearEntry();
      break;
    case 'toggle-sign':
      toggleSign();
      break;
    case 'percent':
      percentValue();
      break;
    case 'backspace':
      backspaceValue();
      break;
    case 'square':
      squareValue();
      break;
    case 'sqrt':
      sqrtValue();
      break;
  }

  updateDisplay();
}

const buttons = document.querySelector('.buttons');
buttons.addEventListener('click', handleButtonClick);
window.addEventListener('keydown', (e) => {
  if (/^[0-9]$/.test(e.key)) {
    inputDigit(e.key);
    updateDisplay();
  } else if (e.key === '.') {
    inputDigit('.');
    updateDisplay();
  } else if (['+','-','*','/'].includes(e.key)) {
    handleOperator(e.key);
    updateDisplay();
  } else if (e.key === 'Enter' || e.key === '=') {
    handleButtonClick({ target: { dataset: { action: 'equals' }, textContent: '=' } });
    updateDisplay();
  } else if (e.key === 'Escape') {
    resetCalculator();
    updateDisplay();
  } else if (e.key === 'Backspace') {
    backspaceValue();
    updateDisplay();
  }
});
updateDisplay();
