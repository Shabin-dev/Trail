const display = document.getElementById('display');
let currentValue = '0';
let storedValue = null;
let pendingOperator = null;
let waitingForNext = false;

function updateDisplay() {
  display.textContent = currentValue;
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
}

function toggleSign() {
  currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : '-' + currentValue;
}

function percentValue() {
  currentValue = String(parseFloat(currentValue) / 100);
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
      currentValue = String(calculate(storedValue, parseFloat(currentValue), pendingOperator));
      pendingOperator = null;
      waitingForNext = true;
      break;
    case 'clear':
      resetCalculator();
      break;
    case 'toggle-sign':
      toggleSign();
      break;
    case 'percent':
      percentValue();
      break;
  }

  updateDisplay();
}

const buttons = document.querySelector('.buttons');
buttons.addEventListener('click', handleButtonClick);
updateDisplay();
console.log("blah",buttons);
