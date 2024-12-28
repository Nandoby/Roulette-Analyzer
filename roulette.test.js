const RouletteAnalyzer = require("./roulette.js");

describe("RouletteAnalyzer", () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new RouletteAnalyzer();
  });

  describe("Initialisation", () => {
    test("devrait être correctement initialisé", () => {
      expect(analyzer.results).toEqual([]);
      expect(analyzer.allResults).toEqual([]);
      expect(analyzer.isTracking).toBe(false);
      expect(analyzer.currentLevel).toBe(1);
    });
  });

  describe("Detection de pattern 6-6", () => {
    test("devrait détecter un pattern 6-6", () => {
      // Alternance de rouges et noirs pour avoir 6 de chaque
      const sequence = [
        1, // rouge
        2, // noir
        3, // rouge
        4, // noir
        5, // rouge
        6, // noir
        7, // rouge
        8, // noir
        9, // rouge
        10, // noir
        12, // rouge
        11, // noir
      ];

      sequence.forEach((num) => analyzer.addResult(num));

      const result = analyzer.analyze();
      expect(result.patternDetected).toBe(true);
      expect(result.redCount).toBe(6);
      expect(result.blackCount).toBe(6);
    });

    test("ne devrait pas détecter avec moins de 12 numéros", () => {
      // 5 rouges et 5 noirs
      [1, 3, 5, 7, 9, 2, 4, 6, 8, 10].forEach((num) => analyzer.addResult(num));

      const result = analyzer.analyze();
      expect(result.patternDetected).toBe(false);
    });
  });

  describe("Fonction d'annulation", () => {
    test("devrait annuler correctement après une détection", () => {
      // Créer un pattern 6-6
      [1, 3, 5, 7, 9, 12, 2, 4, 6, 8, 10, 11].forEach((num) =>
        analyzer.addResult(num)
      );

      // Ajouter un numéro après la détection
      analyzer.addResult(1);

      // Annuler le dernier numéro
      analyzer.removeLastResult();

      const result = analyzer.analyze();
      expect(result.redCount).toBe(6);
      expect(result.blackCount).toBe(6);
      expect(result.isTracking).toBe(true);
    });

    test("devrait restaurer l'état précédent", () => {
      // Pattern 6-6
      [1, 3, 5, 7, 9, 12, 2, 4, 6, 8, 10, 11].forEach((num) =>
        analyzer.addResult(num)
      );

      const stateAvantAjout = {
        isTracking: analyzer.isTracking,
        currentLevel: analyzer.currentLevel,
        betIndex: analyzer.betIndex,
      };

      analyzer.addResult(1);
      analyzer.removeLastResult();

      expect(analyzer.isTracking).toBe(stateAvantAjout.isTracking);
      expect(analyzer.currentLevel).toBe(stateAvantAjout.currentLevel);
      expect(analyzer.betIndex).toBe(stateAvantAjout.betIndex);
    });

    test("devrait gérer l'annulation sur un historique vide", () => {
      expect(() => analyzer.removeLastResult()).toThrow(
        "Aucun résultat à supprimer"
      );
    });
  });

  describe("Gestion des mises", () => {
    test("devrait suivre la progression des mises niveau 1", () => {
      // Pattern 6-6
      [1, 3, 5, 7, 9, 12, 2, 4, 6, 8, 10, 11].forEach((num) =>
        analyzer.addResult(num)
      );

      // Ajouter un rouge pour créer un déséquilibre
      analyzer.addResult(1);

      const result = analyzer.analyze();
      expect(result.betAmount).toBe(1.0); // Première mise du niveau 1
      expect(analyzer.currentLevel).toBe(1);
    });

    test("devrait passer au niveau 2 après 4 pertes", () => {
      // Pattern 6-6
      [1, 3, 5, 7, 9, 12, 2, 4, 6, 8, 10, 11].forEach((num) =>
        analyzer.addResult(num)
      );

      // Simuler 4 pertes
      [1, 1, 1, 1].forEach((num) => {
        analyzer.addResult(num); // Crée un déséquilibre rouge
        analyzer.addResult(2); // Perte sur noir
      });

      expect(analyzer.currentLevel).toBe(2);
    });
  });

  describe("Gestion du Paroli", () => {
    test("devrait activer le Paroli après un gain au niveau 2", () => {
      // Pattern 6-6
      [1, 3, 5, 7, 9, 12, 2, 4, 6, 8, 10, 11].forEach((num) =>
        analyzer.addResult(num)
      );

      // Passer au niveau 2 avec 4 pertes
      [2, 2, 2, 2].forEach((num) => {
        analyzer.addResult(num); // Déséquilibre noir
        analyzer.addResult(1); // Mise sur rouge (perte)
      });

      // Gain au niveau 2
      analyzer.addResult(2); // Déséquilibre noir
      analyzer.addResult(2); // Mise sur noir (gain)

      expect(analyzer.paroli).toBe(true);
    });
  });
});
