# Roulette Analyzer v1.0

Système d'analyse de roulette en temps réel avec gestion de mises progressives.

## Fonctionnalités

### Détection de Patterns
- Détecte les patterns 6 rouges / 6 noirs
- Ignore les zéros dans le comptage mais les affiche
- Maintient les 12 derniers résultats après un gain de paroli

### Système de Mises à Deux Niveaux
#### Niveau 1 (Progressive)
- Mises : 1€, 2€, 3€, 4€, 8€
- Passe au niveau 2 si toutes les mises sont perdues

#### Niveau 2 (avec Paroli)
- Mises de base : 5€, 7€, 9€, 12€, 16€, 22€, 29€, 39€, 52€
- Paroli : Double la mise après un gain
- Retour à l'attente de pattern après un gain de paroli

### Interface
- Affichage des derniers résultats de gauche à drioite (plus récent à gauche)
- Statistiques en temps réel
- Recommandations de mises automatiques
- Affichage du niveau de jeu actuel

## Notes de Version
- Version 1.0 : Version stable avec gestion complète des patterns et du système de mises à deux niveaux
- Interface utilisateur intuitive et informative