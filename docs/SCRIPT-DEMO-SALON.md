# Script de démo pour le stand (club d'affaires)

> Objectif : en 30 secondes, faire comprendre **à quoi ça sert**. En 3 minutes, **le prouver** sur des données réelles. Ensuite, prendre un rendez-vous de 30 min (« diagnostic offert »).

---

## 1. Avant l'événement (checklist)

| À faire | Détail |
|---|---|
| Matériel | Écran 27" ou TV 43" en 1080p, PC portable, souris. Une tablette tactile marche aussi. |
| Lancer la démo **hors ligne** | `cd demo && npm install && npm run build && npx vite preview --port 4173`, puis ouvrir `http://localhost:4173/?salon` dans Chrome. |
| Plein écran | Touche **F**, ou le bouton « Plein écran » du menu. |
| Mode salon | Il démarre seul après 45 s sans interaction (`?autosalon=0` pour le couper). Touche **S** pour le lancer ou l'arrêter. Le moindre clic rend la main. |
| Réseau | La démo marche sans Internet. Avec Internet, la page **Connecteurs** interroge l'ADEME, l'INSEE, l'IGN et Géorisques **en direct**. Prévoir un partage de connexion 4G. |
| Personnaliser | Nom du client fictif, prénom, ville : `demo/src/config.ts`. Données du parc : `demo/src/data/portfolio.ts`. |
| Imprimer | `docs/fiche-atlas.pdf` (recto verso A4) : 30 à 50 exemplaires. |

---

## 2. L'accroche (10 secondes, à quelqu'un qui passe)

Choisir selon la personne :

- **Agent immobilier / administrateur de biens** : « Votre logiciel compte vos loyers ; celui-ci vous dit quoi faire ce matin. »
- **Chef d'entreprise avec des SCI** : « Combien de vos appartements seront interdits à la location en 2028 ? Je vous le montre en 10 secondes. »
- **Tout le monde** : « Donnez-moi l'adresse de votre immeuble, je vous montre ses DPE officiels. »

---

## 3. La démo en 3 minutes (parcours conseillé)

| # | Écran | Ce qu'on fait | Ce qu'on dit (court) |
|---|---|---|---|
| 1 | **Plan du parc** | Laisser tourner 3 s, puis cliquer sur la 1re ligne « Impayé de 2 mois ». | « Chaque matin, l'outil classe les urgences par montant. Un clic : on voit le lot, le locataire, l'historique. » |
| 2 | Fiche du lot | Cliquer sur **Relancer**. | « SMS + e-mail partent, l'escalade est automatique à J+8. Plus d'Excel. » |
| 3 | Barre de recherche | Taper « Quels logements seront interdits en 2028 ? » | « On pose la question en français. La réponse cite ses sources : ADEME, Légifrance. » |
| 4 | Calque **DPE** | Faire glisser la frise de 2026 à 2034. | « Les F seront interdits dans 14 mois. Voilà les loyers bloqués si on ne fait rien. » |
| 5 | **Conformité DPE** | Montrer le plan de travaux chiffré. | « Lot par lot : quels travaux, quel budget, quel loyer sécurisé. » |
| 6 | **Lots & locataires** | Filtre « Révision IRL possible » → **Appliquer**. | « 5 révisions oubliées. Une révision non demandée est perdue. Les F/G sont exclus automatiquement, leur loyer est gelé. » |
| 7 | **Connecteurs** | Demander l'adresse du visiteur → **Interroger**. | « Voici les DPE officiels de votre immeuble, en direct depuis l'ADEME. L'outil se branche sur ces données publiques et sur votre logiciel actuel. » |
| 8 | **Fiche & comparatif** | Montrer le comparatif et tendre la fiche papier. | « On ne remplace pas votre logiciel comptable : on se branche dessus. » |

**Le moment clé, c'est l'étape 7** : la donnée est réelle et personnelle, ce n'est plus une maquette.

---

## 4. Objections fréquentes

| Objection | Réponse |
|---|---|
| « J'ai déjà un logiciel (Crypto, ICS, SPI…). » | « Gardez-le pour la comptabilité mandant. Atlas part de vos exports (CSV, FEC) et ajoute ce qui manque : vue d'ensemble, alertes chiffrées, conformité DPE. Pas de migration. » |
| « C'est combien ? » | « Prototype sur **vos** données en 2 semaines : 2 900 à 4 900 € HT, déduits si on continue. Version complète : 12 000 à 25 000 € HT. Maintenance : 150 à 450 €/mois. » |
| « Et mes données ? Le RGPD ? » | « Hébergement en France, accès par rôle, export complet à tout moment. Aucun maniement de fonds : on reste hors du périmètre de la loi Hoguet. » |
| « C'est de l'IA ? Elle va inventer ? » | « Les règles (gel des loyers, interdictions, IRL) sont écrites et testées. Les questions en langage naturel s'appuient sur vos données et des sources officielles, toujours citées. » |
| « Ça marche pour mon métier, qui n'est pas l'immobilier ? » | « Oui, c'est le principe du sur-mesure : garage, chantiers, entrepôt… Le plan 3D et les alertes s'adaptent à votre activité. » |

---

## 5. Le comparatif : ce qu'on dit, ce qu'on ne dit pas

La fiche compare Atlas à **Crypto (Orisha Real Estate)**. Toutes les affirmations sont sourcées dans `docs/audit/03-concurrent-verifie.md`. La publicité comparative est encadrée par les articles L122-1 et suivants du Code de la consommation : elle doit être objective et vérifiable, sans dénigrement.

**À dire :**
- « Crypto tient très bien la comptabilité de gérance. On ne la remplace pas, on s'y ajoute. »
- « Les échéances DPE, le gel des loyers F/G et la vue 3D ne sont pas présentés dans leur documentation publique. Chez nous, c'est le cœur du produit. »

**À ne jamais dire ni imprimer :**
- « Crypto ne fait pas X ». On dit seulement « non mentionné dans leur documentation publique ».
- « 59 % des utilisateurs de Crypto veulent changer ». Le chiffre vient d'une enquête sur les logiciels de **syndic** et il est commun à Crypto et ICS. À l'oral seulement, en citant la source (ANGC 2024).
- « Seule solution 3D », « compatible Crypto » (pas avant un import réel réussi), « logiciel daté ».

**Avant d'imprimer la fiche :**
1. Voir une démo de Crypto, ou interroger un cabinet client, pour confirmer les lignes « non mentionné ».
2. Obtenir un export Crypto réel pour valider « sans migration ».
3. Archiver en PDF, datées, les pages sources citées.
4. Remplacer « Votre nom » et vos coordonnées dans `demo/src/config.ts` (bloc `MAKER`), puis régénérer le PDF.
5. Si possible, faire relire la fiche par un juriste ou par la CCI.

---

## 6. Conclure

1. Proposer le **diagnostic offert de 30 min** : « Envoyez-moi votre fichier Excel, je vous montre votre parc dans l'outil. »
2. Noter : nom, société, nombre de lots ou de sites, logiciel actuel, meilleur créneau.
3. Remettre la fiche papier.

---

## 7. Ce que la démo fait vraiment (pour rester honnête)

| Élément | Statut dans la démo |
|---|---|
| Plan 3D, calques, alertes, tableaux, filtres, export CSV | **Réel** (fonctionne sur les données du parc fictif) |
| Régularisation des charges | **Simplifiée** : alerte et décomptes générés, calcul de démonstration |
| ADEME (DPE), INSEE (IRL), IGN (adresses), Géorisques | **Réel, en direct** (repli sur des données en cache si pas de réseau) |
| Règles réglementaires (G 2025, F 2028, E 2034, gel F/G, IRL) | **Réel** (codées dans `demo/src/lib/utils.ts`) |
| Questions en langage naturel | **Simulé** : reconnaissance de mots-clés hors ligne. En production : un modèle de langage branché sur les données, avec les sources affichées. |
| Banque, signature, LRE, SMS, portails | **Simulé** (notifications de démonstration) |
| Parc, locataires, montants | **Fictifs** |
