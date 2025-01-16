## 1. Créer une classe `ParityAnalyzer`

- **Définition de la classe** : Créer une classe `ParityAnalyzer` qui ressemble à `RouletteAnalyzer` mais se concentre sur le suivi des nombres pairs et impairs.
- **Propriétés** :
    - `evenNumbers` : tableau des nombres pairs (2,4, 6, ..., 36)
    - `oddNumbers` : tableau des nombres impairs (1, 3, 5, ...35)
    - `numberParity` : objet qui mappe les numéros à 'pair' (pair) ou 'impair' (impair).
    - `evenCount` et `oddCount` : compteurs pour les nombres pairs et impairs.
- **Méthodes** :
    - `addResult(number)` : ajoute un numéro aux résultats et met à jour les compteurs pairs et impairs.
    - `analyze()` : détecte les motifs (par exemple, 6 pairs et 6 impairs dans les 12 résultats non verts les plus récents) et recommande des mises.
    - `reset()` : réinitialise l'état de l'analyseur.

## 2. Mettre à jour le script principal

- **Création d'instances** : Dans le script principal, créer des instances de `RouletteAnalyzer` et `ParityAnalyzer`.
- **Tableau de résultats partagé** : Maintenir un tableau de résultats partagé qui contient tous les numéros entrés. Les deux analyseurs référenceront ce tableau, mais maintiendront leurs propres résultats filtrés (en excluant les zéros).
- **Fonction ajouter un numéro** : Modifier la fonction `addNumber` pour ajouter le numéro au tableau de résultats partagé et appeler `addResult` sur les deux analyseurs.
- **Fonctions annuler et réinitialiser** : Mettre à jour `undoLastNumber` et `resetAnalyzer` pour affecter les deux analyseurs en appelant leurs méthodes respectives.

## 3. Mettre à jour l'interface utilisateur (UI)
- **Cartes de statistiques** : Ajouter une nouvelle carte pour les statistiques de parité, similaire à la carte existante pour les couleurs, affichant les comptes pairs et impairs et un graphique à barres.
- **Zone de messages** : Inclure une nouvelle zone de messages pour les recommandations de parité, parallèle à la zone existante pour les couleurs.
- **Affichage des cellules numériques** : Mettre à jour les divs de cellules numériques pour inclure des classes pour pairs et impairs (par exemple, 'pair' ou 'impair') sans conflit avec les classes de couleur.
- **Unité de base d'entrée** : Assurer que l'entrée de l'unité de base affecte les deux systèmes indépendamment, avec une logique de mise séparée pour chacun.

## 4. Assurer une logique de mise indépendante
- **Systèmes de mise** : Garder les systèmes de mise pour la couleur et la parité indépendants, avec leurs propres niveaux et multiplicateurs, mais partageant la même entrée d'unité de base.
- **Recommandations** : Afficher des recommandations séparées pour la couleur et la parité, en assurant aux utilisateurs de comprendre qu'elles sont des mises distinctes.

## 5. Tester
- **Test de la fonctionnalité** : Tester les deux analyseurs pour s'assurer qu'ils fonctionnent indépendamment et suivent correctement les motifs et recommandent les mises.
- **Cas limites** : Gérer les cas limites, tels que la présence de zéros et le manque de résultats pour la détection de motifs.
- **Consistance de l'UI** : Vérifier que les éléments de l'UI pour les deux systèmes sont clairs, non conflictuels et fournissent des informations exactes.