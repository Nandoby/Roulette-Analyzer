// Fonction pour basculer le thème
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-bs-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-bs-theme", savedTheme);

  const colorAnalyzer = new RouletteAnalyzer();
  const parityAnalyzer = new ParityAnalyzer();
  console.log("Analyseurs initialisés:", { colorAnalyzer, parityAnalyzer });

  // Vérification que les éléments DOM existent
  const requiredElements = {
    numberInput: document.getElementById("numberInput"),
    addButton: document.getElementById("addButton"),
    undoButton: document.getElementById("undoButton"),
    navResetButton: document.getElementById("navResetButton"),
    alertArea: document.getElementById("alertArea"),
    alertMessage: document.getElementById("alertMessage"),
    resultsDisplay: document.getElementById("resultsDisplay"),
    redCount: document.getElementById("redCount"),
    blackCount: document.getElementById("blackCount"),
    totalCount: document.getElementById("totalCount"),
    evenCount: document.getElementById("evenCount"),
    oddCount: document.getElementById("oddCount"),
  };

  // Vérification que tous les éléments sont présents
  Object.entries(requiredElements).forEach(([name, element]) => {
    if (!element) {
      console.error(`Élément manquant: ${name}`);
    }
  });

  const sharedResults = [];

  const numberInput = document.getElementById("numberInput");
  const addButton = document.getElementById("addButton");
  const undoButton = document.getElementById("undoButton");
  const navResetButton = document.getElementById("navResetButton");
  const alertArea = document.getElementById("alertArea");
  const alertMessage = document.getElementById("alertMessage");
  const resultsDisplay = document.getElementById("resultsDisplay");
  const redCount = document.getElementById("redCount");
  const blackCount = document.getElementById("blackCount");
  const totalCount = document.getElementById("totalCount");
  const baseUnitInput = document.getElementById("baseUnitInput");
  const setBaseUnitButton = document.getElementById("setBaseUnitButton");
  const evenCount = document.getElementById("evenCount");
  const oddCount = document.getElementById("oddCount");

  // Initialisation du graphique
  const ctx = document.getElementById("statsChart").getContext("2d");
  const statsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Rouges", "Noirs"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#dc3545", "#212529"],
          borderColor: ["#dc3545", "#212529"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });

  const ctxParity = document
    .getElementById("statsChartParity")
    .getContext("2d");
  const statsChartParity = new Chart(ctxParity, {
    type: "bar",
    data: {
      labels: ["Pairs", "Impairs"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#007bff", "#6c757d"],
          borderColor: ["#007bff", "#6c757d"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });

  function updateChart(redCount, blackCount) {
    statsChart.data.datasets[0].data = [redCount, blackCount];
    statsChart.update();
  }

  function updateChartParity(evenCount, oddCount) {
    statsChartParity.data.datasets[0].data = [evenCount, oddCount];
    statsChartParity.update();
  }

  numberInput.addEventListener("input", function () {
    const value = this.value;
    const number = parseInt(value);

    if (value === "" || isNaN(number) || number < 0 || number > 36) {
      addButton.disabled = true;
    } else {
      addButton.disabled = false;
    }
  });

  addButton.disabled = true;
  undoButton.disabled = true;

  setBaseUnitButton.addEventListener("click", () => {
    const amount = parseFloat(baseUnitInput.value);
    if (amount <= 0) {
      alert("La mise de base doit être supérieure à 0");
      return;
    }
    colorAnalyzer.setBaseBet(amount);
    parityAnalyzer.setBaseBet(amount);
    const colorResults = colorAnalyzer.getCurrentResults();
    const parityResults = parityAnalyzer.getCurrentResults();
    const colorAnalysis = colorAnalyzer.analyze();
    const parityAnalysis = parityAnalyzer.analyze();
    updateDisplay(colorResults, colorAnalysis, parityResults, parityAnalysis);
  });

  function formatBet(amount) {
    return amount.toFixed(2) + " €";
  }

  function updateDisplay(
    colorResults,
    colorAnalysis,
    parityResults,
    parityAnalysis
  ) {
    resultsDisplay.innerHTML = "";

    for (let i = colorResults.length - 1; i >= 0; i--) {
      const result = colorResults[i];
      const cell = document.createElement("div");
      cell.className = `number-cell ${result.color} ${result.parity}${
        i === colorResults.length - 1 ? " new-cell" : ""
      }`;
      cell.textContent = result.number;
      resultsDisplay.appendChild(cell);
    }

    redCount.textContent = colorAnalysis.redCount;
    blackCount.textContent = colorAnalysis.blackCount;
    totalCount.textContent = resultsDisplay.children.length;

    // Ajout des compteurs pair/impair
    evenCount.textContent = parityAnalysis.evenCount;
    oddCount.textContent = parityAnalysis.oddCount;

    updateChart(colorAnalysis.redCount, colorAnalysis.blackCount);
    updateChartParity(parityAnalysis.evenCount, parityAnalysis.oddCount);

    alertArea.style.display = "block";

    if (colorAnalysis.recommendation && colorAnalysis.betAmount > 0) {
      colorAnalysis.message = colorAnalysis.message.replace(
        /Misez (\d+) pièces? sur/,
        `Misez ${formatBet(colorAnalysis.betAmount)} sur`
      );
    }

    if (parityAnalysis.recommendation && parityAnalysis.betAmount > 0) {
      parityAnalysis.message = parityAnalysis.message.replace(
        /Misez (\d+) pièces? sur/,
        `Misez ${formatBet(parityAnalysis.betAmount)} sur`
      );
    }

    if (colorAnalysis.patternDetected) {
      alertMessage.className = "alert alert-success";
    } else if (colorAnalysis.recommendation && colorAnalysis.betColor) {
      alertMessage.className = "alert alert-warning";
    } else {
      alertMessage.className = "alert alert-info";
    }

    alertMessage.innerHTML =
      colorAnalysis.message + "<br>" + parityAnalysis.message;
    undoButton.disabled = colorResults.length === 0;
  }

  function addNumber() {
    const number = parseInt(numberInput.value);
    if (isNaN(number) || number < 0 || number > 36) {
      alert("Veuillez entrer un numéro valide entre 0 et 36");
      return;
    }

    try {
      sharedResults.push(number);

      const colorAnalysis = colorAnalyzer.addResult(number);
      const parityAnalysis = parityAnalyzer.addResult(number);
      const colorResults = colorAnalyzer.getCurrentResults();
      const parityResults = parityAnalyzer.getCurrentResults();

      // Debug
      console.log("Numéro ajouté:", number);
      console.log("Analyse couleur:", colorAnalysis);
      console.log("Analyse parité:", parityAnalysis);
      console.log("Résultats couleur:", colorResults);
      console.log("Résultats parité:", parityResults);

      updateDisplay(colorResults, colorAnalysis, parityResults, parityAnalysis);
      numberInput.value = "";
      numberInput.focus();
    } catch (error) {
      console.error("Erreur lors de l'ajout du numéro:", error);
      alert(error.message);
    }
  }

  function undoLastNumber() {
    try {
      sharedResults.pop();
      const colorAnalysis = colorAnalyzer.removeLastResult();
      const parityAnalysis = parityAnalyzer.removeLastResult();
      const colorResults = colorAnalyzer.getCurrentResults();
      const parityResults = parityAnalyzer.getCurrentResults();
      updateDisplay(colorResults, colorAnalysis, parityResults, parityAnalysis);
      numberInput.focus();
    } catch (error) {
      alert(error.message);
    }
  }

  function resetAnalyzer() {
    if (confirm("Voulez-vous vraiment réinitialiser l'analyseur ?")) {
      sharedResults.length = 0;
      colorAnalyzer.clearResults();
      parityAnalyzer.clearResults();
      resultsDisplay.innerHTML = "";
      alertArea.style.display = "none";
      redCount.textContent = "0";
      blackCount.textContent = "0";
      totalCount.textContent = "0";
      numberInput.value = "";
      undoButton.disabled = true;
      numberInput.focus();
    }
  }

  addButton.addEventListener("click", addNumber);
  undoButton.addEventListener("click", undoLastNumber);
  navResetButton.addEventListener("click", resetAnalyzer);
  numberInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addNumber();
    }
  });

  numberInput.focus();
});
