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

  const analyzer = new RouletteAnalyzer();
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

  // Initialisation du graphique
  const ctx = document.getElementById("statsChart").getContext("2d");
  const statsChart = new Chart(ctx, {
      type: "bar",
      data: {
          labels: ["Rouges", "Noirs"],
          datasets: [{
              data: [0, 0],
              backgroundColor: ["#dc3545", "#212529"],
              borderColor: ["#dc3545", "#212529"],
              borderWidth: 1,
          }],
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
      analyzer.setBaseBet(amount);
      const results = analyzer.getCurrentResults();
      const analysis = analyzer.analyze();
      updateDisplay(results, analysis);
  });

  function formatBet(amount) {
      return amount.toFixed(2) + " €";
  }

  function updateDisplay(results, analysis) {
      // Vider complètement l'affichage
      resultsDisplay.innerHTML = "";
      
      // Afficher les résultats du plus récent au plus ancien
      for (let i = results.length - 1; i >= 0; i--) {
          const result = results[i];
          const cell = document.createElement("div");
          cell.className = `number-cell ${result.color}${
              i === results.length - 1 ? " new-cell" : ""
          }`;
          cell.textContent = result.number;
          resultsDisplay.appendChild(cell);
      }

      redCount.textContent = analysis.redCount;
      blackCount.textContent = analysis.blackCount;
      totalCount.textContent = resultsDisplay.children.length;

      updateChart(analysis.redCount, analysis.blackCount);
      
      alertArea.style.display = "block";

      if (analysis.recommendation && analysis.betAmount > 0) {
          analysis.message = analysis.message.replace(
              /Misez (\d+) pièces? sur/,
              `Misez ${formatBet(analysis.betAmount)} sur`
          );
      }

      if (analysis.patternDetected) {
          alertMessage.className = "alert alert-success";
      } else if (analysis.recommendation && analysis.betColor) {
          alertMessage.className = "alert alert-warning";
      } else {
          alertMessage.className = "alert alert-info";
      }

      if (analysis.betAmount) {
          const parts = analysis.message.split(/Misez ([\d.]+) € sur/);
          if (parts.length === 3) {
              const coloredWord = parts[2].trim();
              const color = coloredWord === "rouge" ? "#dc3545" : "#212529";
              analysis.message = `${parts[0]}Misez <span class="bet-amount">${parts[1]} €</span> sur <span style="color: ${color}; font-weight: bold;">${coloredWord}</span>`;
          }
      }

      alertMessage.innerHTML = analysis.message;
      
      // Mettre à jour l'état du bouton d'annulation
      undoButton.disabled = results.length === 0;
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
          numberInput.focus();
      } catch (error) {
          alert(error.message);
      }
  }

  function undoLastNumber() {
      try {
          const analysis = analyzer.removeLastResult();
          const results = analyzer.getCurrentResults();
          updateDisplay(results, analysis);
          numberInput.focus();
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