let historyArray = [];

// προσθήκη αποτελέσματος στο ιστορικό
function addToHistory(firstOperand, operation, secondOperand, result) {
    const historyEntry = `${firstOperand} ${operation} ${secondOperand} = ${result}`;
    historyArray.push(historyEntry);
    updateHistoryDisplay();
}

// ενημέρωση οθόνης ιστορικού
function updateHistoryDisplay() {
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";
    for (const item of historyArray) {
        const newItem = document.createElement("p");
        newItem.textContent = item;
        historyDiv.appendChild(newItem);
    }

    // Δημιουργία του κουμπιού "Clear"
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearHistoryBtn';
    clearBtn.innerHTML = 'Clear History';
    clearBtn.onclick = clearHistory;
  
    // Προσθήκη του κουμπιού στο div του ιστορικού
    historyDiv.appendChild(clearBtn);
}

// clear btn
function clearHistory() {
    historyArray = [];
    updateHistoryDisplay();
}
