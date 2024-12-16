# Roulette Pattern Analyzer

Application web permettant d'analyser les résultats de la roulette et de fournir des recommandations de mises basées sur les patterns détectés.

## Fonctionnalités

### Analyse des Résultats
- Affichage des 12 derniers numéros non-verts
- Détection du pattern 6-6 (6 rouges et 6 noirs)
- Affichage des zéros (vert) sans les compter dans l'analyse
- Compteurs distincts pour rouge et noir

### Système de Mise
#### Niveau 1 - Progression
- Mise initiale : 0.10€
- Progression : 0.20€ → 0.40€ → 0.80€
- Passage au niveau 2 après 4 pertes

#### Niveau 2 - Paroli
- Mise initiale : 0.50€
- Premier gain : mise doublée à 1€
- Second gain : retour à la recherche de pattern

### Recommandations
- Attente d'un pattern 6-6
- Recommandation uniquement quand le pattern est rompu (7-6 ou 6-7)
- Mise sur la couleur majoritaire

### Interface
- Affichage clair des résultats et compteurs
- Bouton de réinitialisation
- Mode sombre/clair
- Mise en évidence des recommandations

## Tests Validés
- ✅ Gestion des zéros multiples
- ✅ Progression des mises niveau 1
- ✅ Système paroli niveau 2
- ✅ Réinitialisation complète
- ✅ Limite des 12 derniers numéros
- ✅ Détection pattern 6-6

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
- Gestion améliorée des résultats après un gain de paroli
- Interface utilisateur intuitive et informative
- Version 2.0.0 : Ajout du système de mise personnalisable
