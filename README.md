# Roulette Analyzer v2.0

Application web permettant d'analyser les résultats de la roulette et de fournir des recommandations de mises basées sur les patterns détectés.

## Fonctionnalités

- Détection de pattern 6 rouges / 6 noirs
- Système de mise à deux niveaux :
    - Niveau 1 : Mises progressives (x1, x2, x4, x8 de la mise de base)
    - Niveau 2 : Système Paroli avec mises croissantes (x5, x7, x9, x12, x16, x22, x29, x39, x52 de la mise de base)
- Mise de base personnalisable
- Affichage des résultats en temps réel
- Interface intuitive avec codes couleur
- Gestion du numéro 0 (vert)
- Statistiques en direct (rouges, noirs, total)

## Utilisation

1. Définissez votre mise de base (par défaut : 1.00€)
2. Entrez les numéros sortants (0-36)
3. Le système détecte automatiquement le pattern 6-6
4. Suivez les recommandations de mise affichées

## Messages et Codes Couleur

- 🟢 Vert : Pattern 6-6 détecté
- 🟡 Jaune : Recommandation de mise
- 🔵 Bleu : En attente/Égalité

## Notes de Version
- Version 1.0 : Version stable avec gestion complète des patterns et du système de mises à deux niveaux
- Interface utilisateur intuitive et informative
- Version 2.0.0 : Ajout du système de mise personnalisable