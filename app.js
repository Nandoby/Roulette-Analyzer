document.addEventListener("DOMContentLoaded", () => {
  const analyzer = new RouletteAnalyzer();
  const numberInput = document.getElementById("numberInput");
  const addButton = document.getElementById("addButton");
  const resetButton = document.getElementById("resetButton");
  const alertArea = document.getElementById("alertArea");
  const alertMessage = document.getElementById("alertMessage");
  const resultsDisplay = document.getElementById("resultsDisplay");
  const redCount = document.getElementById("redCount");
  const blackCount = document.getElementById("blackCount");
  const totalCount = document.getElementById("totalCount");

  function updateDisplay(results, analysis) {
    // Mise à jour de l'affichage des résultats
    resultsDisplay.innerHTML = "";
    results.forEach((result) => {
      const cell = document.createElement("div");
      cell.className = `number-cell ${result.color}`;
      cell.textContent = result.number;
      resultsDisplay.appendChild(cell);
    });

    // Mise à jour des statistiques
    redCount.textContent = analysis.redCount;
    blackCount.textContent = analysis.blackCount;
    totalCount.textContent = analysis.total;

    // Mise à jour de l'alerte et des recommandations
    alertArea.style.display = "block";
    alertMessage.textContent = analysis.message;

    // Changement de style selon le type de message
    if (analysis.patternDetected) {
      alertMessage.className = "alert alert-success";
    } else if (analysis.recommendation) {
      alertMessage.className = "alert alert-warning";
    } else {
      alertMessage.className = "alert alert-info";
    }
  }

  function addNumber() {
    const number = parseInt(numberInput.value);
    if (isNaN(number) || number < 0 || number > 36) {
      alert("Veuillez entrer un numéro valide entre 0 et 36");
      return;
    }

    try {
      const analysis = analyzer.addResult(number);
      const results = analyzer.getCurrentResults();
      updateDisplay(results, analysis);
      numberInput.value = "";
    } catch (error) {
      alert(error.message);
    }
  }

  function resetAnalyzer() {
    if (confirm("Voulez-vous vraiment réinitialiser l'analyseur ?")) {
      analyzer.clearResults();
      resultsDisplay.innerHTML = "";
      alertArea.style.display = "none";
      redCount.textContent = "0";
      blackCount.textContent = "0";
      totalCount.textContent = "0";
      numberInput.value = "";
    }
  }

  // Gestionnaires d'événements
  addButton.addEventListener("click", addNumber);
  resetButton.addEventListener("click", resetAnalyzer);
  numberInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addNumber();
    }
  });

  // Focus initial sur l'input
  numberInput.focus();
});
