function initCalculator() {
  if (window.isc) {
  isc.Page.setEvent("load", function() {
    
    // Οι αρχικές μεταβλητές παραμένουν ίδιες
    let currentInput = "";
    let operation = null;
    let firstOperand = "";

    isc.DynamicForm.create({
      ID: "calculatorForm",
      width: 300,
      fields: [
        {name: "display", type: "text", canEdit: false},
        {name: "clear", type: "button", title: "C", click: clearDisplay},
        {name: "addOne", type: "button", title: "1", click: function() { appendNumber(1); }},
        {name: "addTwo", type: "button", title: "2", click: function() { appendNumber(2); }},
        // Οι υπόλοιποι αριθμοί και λειτουργίες εδώ...
      ]
    }).draw();

    function clearDisplay() {
      calculatorForm.setValue("display", "");
      currentInput = "";
      firstOperand = "";
      operation = null;
    }
    
    function appendNumber(number) {
      currentInput += number;
      calculatorForm.setValue("display", currentInput);
    }

    function performOperation(op) {
      if (!firstOperand) {
        firstOperand = currentInput;
        currentInput = "";
        operation = op;
      }
    }

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

      calculatorForm.setValue("display", result);
      firstOperand = result;
      currentInput = "";
      operation = null;
    }
  });
}}
