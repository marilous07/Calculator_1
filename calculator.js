// Δήλωση μεταβλητών

let currentInput = "";
let operation = null;
let firstOperand = "";

// οθόνη
function clearDisplay() {
  currentInput = "";
  operation = null;
  firstOperand = "";
  document.getElementById("display").value = "";
}

// input
function appendNumber(number) {
  currentInput += number;
  document.getElementById("display").value = currentInput;
}

// πράξεις
function performOperation(op) {
  if (!firstOperand) {
    firstOperand = currentInput;
    currentInput = "";
    operation = op;
  }
}

// υπολογισμός αποτελέσματος
function calculate() {
  let result = 0;
  const secondOperand = currentInput;

  if (operation === "+") {
    result = parseFloat(firstOperand) + parseFloat(secondOperand);
  } else if (operation === "-") {
    result = parseFloat(firstOperand) - parseFloat(secondOperand);
  } else if (operation === "*") {
    result = parseFloat(firstOperand) * parseFloat(secondOperand);
  } else if (operation === "/") {
    result = parseFloat(firstOperand) / parseFloat(secondOperand);
  }
    //  αποτέλεσμα και προσθήκη στο ιστορικό
    document.getElementById("display").value = result;
    addToHistory(firstOperand, operation, secondOperand, result);
    firstOperand = result;
    currentInput = "";
    operation = null;

  // Εμφάνιση αποτελέσματος
  document.getElementById("display").value = result;
  firstOperand = result;
  currentInput = "";
  operation = null;
}
