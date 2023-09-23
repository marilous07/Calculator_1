function initHistory() {
    if (window.isc) {
    isc.Page.setEvent("load", function() {
  
      let historyArray = [];
  
      // Δημιουργία της φόρμας και του ιστορικού
      isc.DynamicForm.create({
          ID: "calculatorForm",
          width: 300,
          fields: [
              {name: "display", type: "text", canEdit: false},
              {name: "history", type: "canvas", showTitle: false},
              // Άλλα πεδία και κουμπιά εδώ...
          ]
      }).draw();
  
      // προσθήκη αποτελέσματος στο ιστορικό
      function addToHistory(firstOperand, operation, secondOperand, result) {
          const historyEntry = `${firstOperand} ${operation} ${secondOperand} = ${result}`;
          historyArray.push(historyEntry);
          updateHistoryDisplay();
      }
  
      // ενημέρωση οθόνης ιστορικού
      function updateHistoryDisplay() {
          const historyDiv = isc.Canvas.getById("history");
          let historyHtml = "";
          for (const item of historyArray) {
              historyHtml += `<p>${item}</p>`;
          }
  
          // Προσθήκη του κουμπιού Clear History
          historyHtml += `<button id="clearHistoryBtn" onclick="clearHistory()">Clear History</button>`;
          historyDiv.setContents(historyHtml);
      }
  
      // Clear History Button
      function clearHistory() {
          historyArray = [];
          updateHistoryDisplay();
      }
  
    });
  }}
  