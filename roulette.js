class RouletteAnalyzer {
    constructor() {
        this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        this.numberColors = {};
        this.redNumbers.forEach(num => this.numberColors[num] = 'rouge');
        for (let i = 1; i <= 36; i++) {
            if (!this.redNumbers.includes(i)) {
                this.numberColors[i] = 'noir';
            }
        }
        this.numberColors[0] = 'vert';
        
        this.resetBetting();
    }

    resetBetting() {
        this.results = [];
        this.allResults = []; // Nouveau tableau pour tous les résultats, y compris les 0
        this.redCount = 0;
        this.blackCount = 0;
        this.currentLevel = 1;
        this.betIndex = 0;
        this.currentBetColor = null;
        this.paroli = false;
        this.paroliBet = 0;
        this.level1Multipliers = [1, 2, 4, 8];
        this.level2Multipliers = [5, 7, 9, 12, 16, 22, 29, 39, 52];
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
            // En niveau 1, on recommence au début après une victoire
            this.betIndex = 0;
            this.isTracking = false;
            if (this.results.length > 12) {
                this.results = this.results.slice(-12);
            }
        } else if (this.currentLevel === 2) {
            if (!this.paroli) {
                // Premier gain du paroli
                this.paroli = true;
                this.paroliBet = this.level2Multipliers[this.betIndex] * 2;  // Double la mise pour le prochain coup
            } else {
                // Deuxième gain du paroli - on garde exactement les 12 derniers résultats
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
            return this.level1Multipliers[this.betIndex];
        } else {
            if (this.paroli) {
                return this.paroliBet;
            } else {
                return this.level2Multipliers[this.betIndex];
            }
        }
    }

    analyze() {
        // On prend plus que 12 résultats pour compenser les 0 potentiels
        let nonGreenResults = [];
        let tempResults = [...this.results];
        let index = tempResults.length - 1;
        
        // On collecte les 12 derniers résultats non-verts pour le comptage
        while (index >= 0 && nonGreenResults.length < 12) {
            if (this.numberColors[tempResults[index]] !== 'vert') {
                nonGreenResults.unshift(tempResults[index]);
            }
            index--;
        }

        const colors = nonGreenResults.map(num => this.numberColors[num]);
        let redCount = colors.filter(color => color === 'rouge').length;
        let blackCount = colors.filter(color => color === 'noir').length;

        // Pour le total, on prend soit tous les résultats non-verts si on est en tracking,
        // soit juste les 12 derniers si on n'est pas en tracking
        const totalResults = this.isTracking ? 
            tempResults.filter(num => this.numberColors[num] !== 'vert') :
            nonGreenResults;

        let recommendation = null;
        let betColor = null;
        let betAmount = 0;

        // Détection initiale (6 rouges et 6 noirs)
        const patternDetected = !this.isTracking && (redCount === blackCount && redCount === 6);
        
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
                
                recommendation = `${levelInfo} - Misez ${betAmount} pièce${betAmount > 1 ? 's' : ''} sur ${betColor}`;
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
            total: totalResults.length,
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
        if (patternDetected) {
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
