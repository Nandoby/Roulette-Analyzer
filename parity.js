class ParityAnalyzer {
    constructor() {
        this.results = []
        this.evenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
        this.oddNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
        this.numberParity = {};
        this.evenNumbers.forEach(num => this.numberParity[num] = 'pair');
        this.oddNumbers.forEach(num => this.numberParity[num] = 'impair');
        this.numberParity[0] = 'vert';

        this.numberColors = {};
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        redNumbers.forEach(num => this.numberColors[num] = 'rouge');
        for (let i = 1; i <= 36; i++) {
            if (!redNumbers.includes(i)) {
                this.numberColors[i] = 'noir';
            }
        }
        this.numberColors[0] = 'vert';
        
        this.evenCount = 0;
        this.oddCount = 0;
        this.baseBet = 1.00;
        this.levelMultipliers = [1, 2, 4, 8];
        this.level2Multipliers = [5, 7, 9, 12, 16, 22, 29, 39, 52];
        this.resetBetting();
        this.getAdjustedMaxResults = this.getAdjustedMaxResults.bind(this);
    }

    setBaseBet(amount) {
        this.baseBet = Number(amount);
    }

    resetBetting() {
        this.allResults = [];
        this.evenCount = 0;
        this.oddCount = 0;
        this.currentLevel = 1;
        this.betIndex = 0;
        this.currentBetParity = null;
        this.paroli = false;
        this.paroliBet = 0;
        this.baseMaxResults = 12;
        this.isTracking = false;
        this.previousState = null;
    }

    addResult(number) {
        if (number < 0 || number > 36) {
            throw new Error('Le numéro doit être entre 0 et 36');
        }

        this.previousState = {
            isTracking: this.isTracking,
            currentLevel: this.currentLevel,
            betIndex: this.betIndex,
            paroli: this.paroli,
            currentBetParity: this.currentBetParity,
            paroliBet: this.paroliBet
        };

        this.allResults.push(number);
        this.results.push(number);

        if (!this.isTracking) {
            const adjustedMax = this.getAdjustedMaxResults();
            if (this.results.length > adjustedMax) {
                this.results = this.results.slice(-adjustedMax);
            }
        }

        if (this.currentBetParity) {
            if (number === 0) {
                this.handleLoss();
            } else {
                const resultParity = this.numberParity[number];
                const won = (this.currentBetParity === 'pair' && resultParity === 'pair') || (this.currentBetParity === 'impair' && resultParity === 'impair');

                if (won) {
                    this.handleWin();
                } else {
                    this.handleLoss();
                }
            }
            this.currentBetParity = null;
        }

        return this.analyze();
    }

    getAdjustedMaxResults() {
        const zeroCount = this.results.filter(num => num === 0).length;
        return this.baseMaxResults + zeroCount
    }

    handleWin() {
        if (this.currentLevel === 1) {
            this.betIndex = 0;
            this.isTracking = false;
            const nonGreenResults = [];
            let index = this.results.length - 1;
            let countNonGreen = 0;
            let lastNonGreenIndex = -1;

            while (index >= 0 && countNonGreen < 12) {
                if (this.results[index] !== 0) {
                    countNonGreen++;
                    if (countNonGreen === 12) {
                        lastNonGreenIndex = index;
                    }
                }
                index--;
            }

            if (lastNonGreenIndex !== -1) {
                this.results = this.results.slice(lastNonGreenIndex);
            }
        } else if (this.currentLevel === 2) {
            if (!this.paroli) {
                this.paroli = true;
                let currentBet = this.level2Multipliers[this.betIndex] * this.baseBet;
                this.paroliBet = currentBet * 2;
            } else {
                const nonGreenResults = [];
                let index = this.results.length - 1;
                let countNonGreen = 0;
                let lastNonGreenIndex = -1;

                while (index >= 0 && countNonGreen < 12) {
                    if (this.numberParity[this.results[index]] === 'vert') {
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
            if (this.betIndex >= this.levelMultipliers.length) {
                this.currentLevel = 2;
                this.betIndex = 0;
                this.paroli = false;
            }
        } else if (this.currentLevel === 2) {
            if (this.paroli) {
                this.betIndex++;
                this.paroli = false;
            } else {
                this.betIndex++;
            }
            
            if (this.betIndex >= this.level2Multipliers.length) {
                this.resetBetting();
            }
        }
    }

    getCurrentResults() {
        return this.results.map(number => ({
            number,
            color: this.numberColors[number],
            parity: this.numberParity[number]
        }))
    }

    getCurrentBet() {
        if (this.currentLevel === 1) {
            return this.levelMultipliers[this.betIndex] * this.baseBet;
        } else {
            if (this.paroli) {
                return this.paroliBet;
            }
            return this.level2Multipliers[this.betIndex] * this.baseBet;
        }
    }

    analyze() {
        let nonGreenResults = [];
        let tempResults = [...this.results];
        let index = tempResults.length - 1;

        let countNonGreen = 0;
        while (index >= 0 && countNonGreen < 12) {
            if (this.numberParity[tempResults[index]] === 'vert') {
                nonGreenResults.unshift(tempResults[index]);
            } else {
                nonGreenResults.unshift(tempResults[index]);
                countNonGreen++;
            }
            index--;
        }

        const parities = nonGreenResults.map(num => this.numberParity[num]);
        let evenCount = parities.filter(parity => parity === 'pair').length;
        let oddCount = parities.filter(parity => parity === 'impair').length;

        const patternDetected = evenCount === oddCount && evenCount === 6;

        let recommendation = null;
        let betParity = null;
        let betAmount = 0;

        if (patternDetected && !this.isTracking) {
            this.lastDetection = true;
            this.isTracking = true;
            recommendation = "Pattern détecté! Commencez à suivre les résultats";
        }
        else if (this.isTracking) {
            let postDetectionResults = [];
            let i = tempResults.length - 1;
            while (i >= 0) {
                if (this.numberParity[tempResults[i]] !== 'vert') {
                    postDetectionResults.unshift(tempResults[i])
                }
                i--;
            }

            const postParities = postDetectionResults.map(num => this.numberParity[num]);
            const postEvenCount = postParities.filter(parity => parity === 'pair').length;
            const postOddCount = postParities.filter(parity => parity === 'impair').length;

            const difference = Math.abs(postEvenCount - postOddCount);

            if (difference >= 1) {
                betParity = postEvenCount > postOddCount ? 'pair' : 'impair';
                betAmount = this.getCurrentBet();
                this.currentBetParity = betParity;

                let levelInfo = this.currentLevel === 1 ? "Niveau 1" : "Niveau 2";
                if (this.currentLevel === 2 && this.paroli) {
                    levelInfo += " (Paroli)";
                }

                recommendation = `${levelInfo} - Misez ${betAmount.toFixed(2)} € sur ${betParity}`;
            } else {
                recommendation = "Egalité atteinte. Attendez un nouveau déséquilibre";
            }

            evenCount = postEvenCount;
            oddCount = postOddCount;
        } else {
            recommendation = "En attente de pattern (6-6)";
        }

        return {
            patternDetected,
            evenCount,
            oddCount,
            total: nonGreenResults.length,
            recommendation,
            betParity,
            message: this.generateMessage(patternDetected, evenCount, oddCount, recommendation),
            betAmount,
            isTracking: this.isTracking,
            currentLevel: this.currentLevel,
            paroli: this.paroli
        };
    }

    generateMessage(patternDetected, evenCount, oddCount, recommendation) {
        let message = `${evenCount} pairs et ${oddCount} impairs - `;

        if (patternDetected && !this.isTracking) {
            message += "Pattern détecté ! - Système activé !";
        } else if (recommendation) {
            message += recommendation.replace(/(\d+\.\d+) €/g, '<strong>$1 €</strong>');
        } else if (this.isTracking) {
            message += "En attente d'un déséquilibre"
        } else {
            message += "En attente de pattern (6-6)"
        }

        return message
    }

    clearResults() {
        this.allResults = [];
        this.resetBetting();
    }

    removeLastResult() {
        if (this.results.length === 0) {
            throw new Error('Aucun résultat à supprimer');
        }

        this.results.pop();
        this.allResults.pop();

        if (this.results.length === 0) {
            this.resetBetting();
            return {
                message: "Historique vide",
                evenCount: 0,
                oddCount: 0,
                total: 0,
                patternDetected: false,
                isTracking: false,
                currentLevel: 1,
                paroli: false
            };
        }

        if (this.previousState) {
            this.isTracking = this.previousState.isTracking;
            this.currentLevel = this.previousState.currentLevel;
            this.betIndex = this.previousState.betIndex;
            this.paroli = this.previousState.paroli;
            this.currentBetParity = this.previousState.currentBetParity;
            this.paroliBet = this.previousState.paroliBet;
        }

        return this.analyze();
    }
}