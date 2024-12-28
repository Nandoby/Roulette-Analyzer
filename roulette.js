class RouletteAnalyzer {
    constructor() {
        this.results = [];
        this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        this.numberColors = {};
        this.redNumbers.forEach(num => this.numberColors[num] = 'rouge');
        for (let i = 1; i <= 36; i++) {
            if (!this.redNumbers.includes(i)) {
                this.numberColors[i] = 'noir';
            }
        }
        this.numberColors[0] = 'vert';
        this.baseBet = 1.00;  // Mise de base par défaut
        this.level1Multipliers = [1, 2, 4, 8];  // Multiplicateurs pour le niveau 1
        this.level2Multipliers = [5, 7, 9, 12, 16, 22, 29, 39, 52];  // Multiplicateurs pour le niveau 2
        this.resetBetting();
    }

    setBaseBet(amount) {
        this.baseBet = Number(amount);
    }

    resetBetting() {
        this.allResults = []; // Nouveau tableau pour tous les résultats, y compris les 0
        this.redCount = 0;
        this.blackCount = 0;
        this.currentLevel = 1;
        this.betIndex = 0;
        this.currentBetColor = null;
        this.paroli = false;
        this.paroliBet = 0;
        this.baseMaxResults = 12; // Nombre de base de résultats hors 0
        this.isTracking = false;
        this.previousState = null;
    }

    getAdjustedMaxResults() {
        // Compte le nombre de 0 dans les derniers résultats
        const zeroCount = this.results.filter(num => num === 0).length;
        // Ajuste le maxResults en fonction du nombre de 0
        return this.baseMaxResults + zeroCount;
    }

    addResult(number) {
        if (number < 0 || number > 36) {
            throw new Error('Le numéro doit être entre 0 et 36');
        }

        // Sauvegarder l'état avant d'ajouter le numéro
        this.previousState = {
            isTracking: this.isTracking,
            currentLevel: this.currentLevel,
            betIndex: this.betIndex,
            paroli: this.paroli,
            currentBetColor: this.currentBetColor,
            paroliBet: this.paroliBet
        };

        // Ajouter le numéro aux résultats pour l'affichage
        this.allResults.push(number);
        this.results.push(number);

        // Si on n'a pas encore détecté le pattern 6-6
        if (!this.isTracking) {
            // Limiter à maxResults ajusté seulement avant la détection du pattern
            const adjustedMax = this.getAdjustedMaxResults();
            if (this.results.length > adjustedMax) {
                this.results = this.results.slice(-adjustedMax);
            }
        }

        // Si on avait un pari en cours
        if (this.currentBetColor) {
            if (number === 0) {
                // Le 0 compte comme une perte
                this.handleLoss();
            } else {
                const resultColor = this.numberColors[number];
                const won = (this.currentBetColor === 'rouge' && resultColor === 'rouge') ||
                           (this.currentBetColor === 'noir' && resultColor === 'noir');
                
                if (won) {
                    this.handleWin();
                } else {
                    this.handleLoss();
                }
            }
            this.currentBetColor = null;
        }

        return this.analyze();
    }

    handleWin() {
        if (this.currentLevel === 1) {
            // Victoire au niveau 1 : on réinitialise
            this.betIndex = 0;
            this.isTracking = false;
            // On prend les 12 derniers numéros non-verts et les 0 entre eux
            const nonGreenResults = [];
            let index = this.results.length - 1;
            let countNonGreen = 0;
            let lastNonGreenIndex = -1;
            
            // D'abord, trouvons l'index du 12ème numéro non-vert
            while (index >= 0 && countNonGreen < 12) {
                if (this.results[index] !== 0) {
                    countNonGreen++;
                    if (countNonGreen === 12) {
                        lastNonGreenIndex = index;
                    }
                }
                index--;
            }

            // Si on a trouvé 12 numéros non-verts, prenons tous les numéros depuis cet index
            if (lastNonGreenIndex !== -1) {
                this.results = this.results.slice(lastNonGreenIndex);
            }
        } else if (this.currentLevel === 2) {
            if (!this.paroli) {
                // Premier gain au niveau 2 : on active le Paroli (on continue)
                this.paroli = true;
                let currentBet = this.level2Multipliers[this.betIndex] * this.baseBet;
                this.paroliBet = currentBet * 2;  // Double la mise pour le prochain coup
            } else {
                // Victoire avec le Paroli doublé : on réinitialise tout
                // On prend les 12 derniers numéros non-verts et les 0 entre eux
                const nonGreenResults = [];
                let index = this.results.length - 1;
                let countNonGreen = 0;
                let lastNonGreenIndex = -1;
                
                // D'abord, trouvons l'index du 12ème numéro non-vert
                while (index >= 0 && countNonGreen < 12) {
                    if (this.numberColors[this.results[index]] === 'vert') {
                        nonGreenResults.unshift(this.results[index]);
                    } else {
                        nonGreenResults.unshift(this.results[index]);
                        countNonGreen++;
                        if (countNonGreen === 12) {
                            lastNonGreenIndex = index;
                        }
                    }
                    index--;
                }

                // Si on a trouvé 12 numéros non-verts, prenons tous les numéros depuis cet index
                if (lastNonGreenIndex !== -1) {
                    const lastResults = this.results.slice(lastNonGreenIndex);
                    this.resetBetting();
                    this.results = lastResults;
                }
            }
        }
    }

    handleLoss() {
        if (this.currentLevel === 1) {
            this.betIndex++;
            if (this.betIndex >= this.level1Multipliers.length) {
                // Si on a perdu toutes les mises du niveau 1, on passe au niveau 2
                this.currentLevel = 2;
                this.betIndex = 0;
                this.paroli = false;
            }
        } else if (this.currentLevel === 2) {
            if (this.paroli) {
                // Si on perd pendant un paroli, on passe à la mise suivante
                this.betIndex++;
                this.paroli = false;
            } else {
                this.betIndex++;
            }
            
            // Si on a épuisé toutes les mises du niveau 2, on recommence au début
            if (this.betIndex >= this.level2Multipliers.length) {
                this.resetBetting();
            }
        }
    }

    getCurrentResults() {
        return this.results.map(number => ({
            number,
            color: this.numberColors[number]
        }));
    }

    getCurrentBet() {
        if (this.currentLevel === 1) {
            return this.level1Multipliers[this.betIndex] * this.baseBet;
        } else {
            if (this.paroli) {
                return this.paroliBet;  // Le paroliBet est déjà calculé avec la mise de base
            }
            return this.level2Multipliers[this.betIndex] * this.baseBet;
        }
    }

    calculateBet() {
        let amount;
        if (this.currentLevel === 1) {
            amount = this.level1Multipliers[this.betIndex] * this.baseBet;
        } else {
            if (this.paroli) {
                amount = this.paroliBet;
            } else {
                amount = this.level2Multipliers[this.betIndex] * this.baseBet;
            }
        }
        return Number(amount).toFixed(2);
    }

    analyze() {
        let nonGreenResults = [];
        let tempResults = [...this.results];
        let index = tempResults.length - 1;
        
        // On prend les 12 derniers résultats non-verts, plus les 0 qui sont entre eux
        let countNonGreen = 0;
        while (index >= 0 && countNonGreen < 12) {
            if (this.numberColors[tempResults[index]] === 'vert') {
                nonGreenResults.unshift(tempResults[index]);
            } else {
                nonGreenResults.unshift(tempResults[index]);
                countNonGreen++;
            }
            index--;
        }

        const colors = nonGreenResults.map(num => this.numberColors[num]);
        let redCount = colors.filter(color => color === 'rouge').length;
        let blackCount = colors.filter(color => color === 'noir').length;

        // Détection initiale (6 rouges et 6 noirs)
        const patternDetected = !this.isTracking && (redCount === blackCount && redCount === 6);
        
        let recommendation = null;
        let betColor = null;
        let betAmount = 0;

        // Après une détection, on suit la stratégie
        if (patternDetected) {
            this.lastDetection = true;
            this.isTracking = true;
            recommendation = "Pattern détecté! Commencez à suivre les résultats.";
        } 
        else if (this.isTracking) {
            // On prend les résultats après la détection du pattern
            let postDetectionResults = [];
            let i = tempResults.length - 1;
            while (i >= 0) {
                if (this.numberColors[tempResults[i]] !== 'vert') {
                    postDetectionResults.unshift(tempResults[i]);
                }
                i--;
            }
            
            const postColors = postDetectionResults.map(num => this.numberColors[num]);
            const postRedCount = postColors.filter(color => color === 'rouge').length;
            const postBlackCount = postColors.filter(color => color === 'noir').length;
            
            const difference = Math.abs(postRedCount - postBlackCount);
            
            if (difference >= 1) {
                betColor = postRedCount > postBlackCount ? 'rouge' : 'noir';
                betAmount = this.getCurrentBet();
                this.currentBetColor = betColor;
                
                let levelInfo = this.currentLevel === 1 ? "Niveau 1" : "Niveau 2";
                if (this.currentLevel === 2 && this.paroli) {
                    levelInfo += " (Paroli)";
                }
                
                recommendation = `${levelInfo} - Misez ${betAmount.toFixed(2)} € sur ${betColor}`;
            } else {
                recommendation = "Égalité atteinte. Attendez un nouveau déséquilibre.";
            }
            
            // Mettre à jour les compteurs pour l'affichage
            redCount = postRedCount;
            blackCount = postBlackCount;
        } else {
            recommendation = "En attente de pattern (6-6)";
        }

        return {
            patternDetected,
            redCount,
            blackCount,
            total: nonGreenResults.length,
            recommendation,
            betColor,
            message: this.generateMessage(patternDetected, redCount, blackCount, recommendation),
            betAmount,
            isTracking: this.isTracking,
            currentLevel: this.currentLevel,
            paroli: this.paroli
        };
    }

    generateMessage(patternDetected, redCount, blackCount, recommendation) {
        if (patternDetected && !this.isTracking) {
            return `Pattern détecté! 6 rouges et 6 noirs - Système activé!`;
        } else if (recommendation) {
            return `${redCount} rouges et ${blackCount} noirs - ${recommendation}`;
        } else if (this.isTracking) {
            return `${redCount} rouges et ${blackCount} noirs - En attente d'un déséquilibre`;
        } else {
            return `${redCount} rouges et ${blackCount} noirs - En attente de pattern (6-6)`;
        }
    }

    clearResults() {
        this.allResults = [];
        this.resetBetting();
    }

    removeLastResult() {
        if (this.results.length === 0) {
            throw new Error('Aucun résultat à supprimer');
        }

        // Supprimer le dernier résultat des deux tableaux
        this.results.pop();
        this.allResults.pop();

        // Réinitialiser si plus de résultats
        if (this.results.length === 0) {
            this.resetBetting();
            return {
                message: "Historique vide",
                redCount: 0,
                blackCount: 0,
                total: 0,
                patternDetected: false,
                isTracking: false,
                currentLevel: 1,
                paroli: false
            };
        }

        // Restaurer l'état précédent s'il existe
        if (this.previousState) {
            this.isTracking = this.previousState.isTracking;
            this.currentLevel = this.previousState.currentLevel;
            this.betIndex = this.previousState.betIndex;
            this.paroli = this.previousState.paroli;
            this.currentBetColor = this.previousState.currentBetColor;
            this.paroliBet = this.previousState.paroliBet;
        }

        // Recalculer l'analyse avec la logique existante
        return this.analyze();
    }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouletteAnalyzer;
}