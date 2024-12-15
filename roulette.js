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
        this.maxResults = 24; // On double la taille pour compenser les 0 potentiels
        this.isTracking = false;
    }

    addResult(number) {
        if (number < 0 || number > 36) {
            throw new Error('Le numéro doit être entre 0 et 36');
        }

        // Ajouter le numéro aux résultats
        this.results.push(number);
        this.allResults.push(number);

        // Si on dépasse maxResults, on retire les plus anciens
        if (this.results.length > this.maxResults) {
            this.results = this.results.slice(-this.maxResults);
        }

        // Si c'est un 0 et qu'on avait un pari en cours, on passe à la mise suivante
        if (number === 0 && this.currentBetColor) {
            this.handleLoss();
            return this.analyze();
        }

        // Si on avait un pari en cours, vérifions le résultat
        if (this.currentBetColor) {
            const resultColor = this.numberColors[number];
            
            // Si c'est un 0, on passe à la mise suivante
            if (resultColor === 'vert') {
                this.handleLoss();
            } else {
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

        // Gestion des résultats non-tracking
        if (!this.isTracking) {
            if (this.results.length > this.maxResults) {
                this.results = this.results.slice(-this.maxResults);
            }
        }

        return this.analyze();
    }

    handleWin() {
        if (this.currentLevel === 1) {
            this.betIndex = 0;
            this.isTracking = false;
            if (this.results.length > 12) {
                this.results = this.results.slice(-12);
            }
        } else if (this.currentLevel === 2) {
            if (!this.paroli) {
                this.paroli = true;
                let currentBet = this.level2Multipliers[this.betIndex] * this.baseBet;
                this.paroliBet = currentBet * 2;  // Double la mise pour le prochain coup
            } else {
                const lastResults = this.results.slice(-12);
                this.resetBetting();
                this.results = lastResults;
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
        // On prend plus que 12 résultats pour compenser les 0 potentiels
        let nonGreenResults = [];
        let tempResults = [...this.results];
        let index = tempResults.length - 1;
        
        while (index >= 0 && nonGreenResults.length < 12) {
            if (this.numberColors[tempResults[index]] !== 'vert') {
                nonGreenResults.unshift(tempResults[index]);
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

        if (patternDetected) {
            this.lastDetection = true;
            this.isTracking = true;
            recommendation = "Pattern détecté! Commencez à suivre les résultats.";
        } 
        // Après une détection, on suit la stratégie
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
            return "Pattern détecté! 6 rouges et 6 noirs - Système activé!";
        } else if (recommendation) {
            return `${redCount} rouges et ${blackCount} noirs - ${recommendation}`;
        } else if (this.isTracking) {
            return `${redCount} rouges et ${blackCount} noirs - En attente d'un déséquilibre`;
        } else {
            return `${redCount} rouges et ${blackCount} noirs - En attente de pattern (6-6)`;
        }
    }

    clearResults() {
        this.results = [];
        this.allResults = [];
        this.lastDetection = false;
        this.isTracking = false;
        this.currentBetColor = null;
        this.currentLevel = 1;
        this.betIndex = 0;
        this.paroli = false;
        this.paroliBet = 0;
    }
}
