# Audit 01 : le marché des logiciels de gestion immobilière en France

> **Date de rédaction :** 1er novembre 2026.
> **Contexte :** préparation d'une démo de « jumeau numérique 3D » d'un parc locatif (immeubles en 3D, lots cliquables colorés par statut, copilote d'alertes), présentée sur un stand de club d'affaires. Le public comprend des dirigeants de PME, des agents immobiliers, des administrateurs de biens (ADB) et des investisseurs en SCI.
> **Règles de citation :** chaque chiffre renvoie à une source `[Sn]` (voir § 8), avec son année. Les niveaux de confiance sont les suivants :
> - **A** : source publique officielle (INSEE, SDES, service-public, ministère).
> - **B** : étude sectorielle ou enquête avec méthode connue, mais échantillon non représentatif ou relais de presse.
> - **C** : source commerciale (éditeur, comparateur concurrent) ou chiffre non sourcé. À utiliser avec prudence, jamais sur un support imprimé sans vérification.
>
> Les calculs faits par l'auteur sont signalés **(calcul)**, les avis argumentés **(jugement)**.
> **Limites de la collecte :** plusieurs pages primaires étaient inaccessibles (PDF complet Galian en 503, Capterra et La Fabrique du Net en 403, rapport Nogal trop volumineux). Je n'ai trouvé aucune statistique officielle sur le nombre d'ADB, ni sur le nombre total de lots en gestion déléguée. Ces chiffres restent **incertains**.

---

## 0. Résumé exécutif

1. **Un marché large mais mal mesuré.**
   - Les bailleurs privés logent 23,1 % des résidences principales au 1er janvier 2025, soit environ 7,3 millions de logements (calcul) [S2]. Les trois quarts de ce parc appartiennent à des personnes physiques [S1].
   - Environ 1 million de ménages (3,5 %) possèdent au moins 5 logements. Ils détiennent à eux seuls **50 % des logements loués par des particuliers** (INSEE, données 2017) [S3]. C'est le cœur de cible « investisseur / SCI ».
   - La gestion déléguée à un professionnel couvre environ un tiers du marché (35 % selon le rapport Nogal, 2019 [S5]) à la moitié des bailleurs (48 % des bailleurs interrogés par Galian/ViaVoice, 2026 [S4]).
   - Le marché de l'administration de biens représente environ 8 Md€ de dépenses annuelles. Xerfi le décrit comme « fortement fragmenté » (2026) [S6].
2. **Des logiciels pros anciens, et des utilisateurs captifs.**
   - Le marché pro est tenu par quelques groupes (Septeo, Orisha Real Estate, ICS, La Boîte Immo) et des acteurs « full web » (Vilogi), tous sur devis [S9].
   - Dans l'enquête ANGC 2024 auprès de 622 professionnels du syndic [S8] :
     - près de **40 % veulent changer de logiciel**, et **59 % des utilisateurs de Crypto et d'ICS** l'envisagent ;
     - l'intuitivité moyenne est de 3,34/5 ;
     - seuls 24,9 % des répondants disposent d'une version mobile ;
     - la migration obtient **2,74/10**. C'est le frein principal.
3. **Côté particuliers, des outils bon marché mais fragmentés.**
   - Les offres vont de 0 à environ 10 €/mois par bien (Rentila, BailFacile, Gererseul, Smartloc…) [S17][S18][S19].
   - Le tableur reste courant. Un bailleur résume ainsi sur un forum : « je n'ai pour l'instant trouvé aucun outil qui gère tout » [S38].
4. **Une pression réglementaire qui crée l'urgence.**
   - Les logements G sont non décents (donc non louables) depuis le 1er janvier 2025, les F le seront au **1er janvier 2028** (dans 14 mois), les E au 1er janvier 2034 [S43].
   - Les loyers des F/G sont gelés depuis le 24 août 2022 [S45].
   - Le parc locatif privé comptait encore **1,147 million de passoires F/G au 1er janvier 2025** (13,8 %) [S1].
   - Le DPE change de calcul au 1er janvier 2026 (coefficient de l'électricité ramené à 1,9 [S44]), puis au 1er janvier 2027 (1,7, d'après des sources spécialisées [S47]).
   - Un projet de loi « relance du logement », adopté au Sénat le 8 juillet 2026 et non promulgué, permettrait de relouer des F/G contre un **engagement de travaux** [S48]. Chaque lot aurait alors une échéance à suivre.
5. **La niche 3D est vide pour les PME (jugement).**
   - Les jumeaux numériques et le BIM d'exploitation existent chez les bailleurs sociaux et dans le tertiaire grands comptes (Habitat 76, CDC Habitat, Seqens, Spinalcom) [S58][S60][S61].
   - Le coût d'adoption est le frein cité [S59][S63].
   - Je n'ai trouvé **aucune offre** qui associe une vue 3D légère du parc, un statut locatif par lot et des alertes d'action pour un ADB ou un investisseur de 10 à 2 000 lots. Ce manque est probable, pas prouvé.
6. **L'IA seule ne différencie plus.**
   - Septeo a présenté en octobre 2026 un agent « MIA » (exécutant, copilote, vocal) [S10]. Rivage se dit « IA-native » [S9][S15].
   - La valeur est dans la **combinaison** de quatre éléments :
     - une vue d'ensemble spatiale ;
     - des alertes réglementaires et financières chiffrées en euros ;
     - une couche posée **par-dessus** le logiciel existant, sans migration ;
     - un développement sur mesure du workflow.

**Angles prioritaires pour la démo :**
1. « Radar DPE 2025-2034 » avec curseur temporel.
2. « Cockpit cash » : impayés, IRL oubliés, régularisations dues.
3. Vue consolidée multi-SCI / multi-mandants.
4. Couche visuelle sans migration.
5. Travaux et artisans localisés sur le lot.

---

## 1. Segments et taille du marché

### 1.1 Le parc locatif privé (socle commun aux trois segments)

| Indicateur | Valeur | Année | Source | Confiance |
|---|---|---|---|---|
| Résidences principales (France hors Mayotte) | 31,7 millions | 1er janv. 2025 | [S2] | A |
| Part louée par des bailleurs privés | 23,1 %, soit environ 7,3 millions (calcul) | 1er janv. 2025 | [S2] | A |
| Part du parc locatif privé appartenant à des personnes physiques | environ 3/4 ; 61 % des propriétaires ont 50 à 80 ans et environ 13 % plus de 80 ans | 2025 (publié en nov. 2025) | [S1] | A |
| Structure du parc locatif privé | 70 % d'appartements, 14 % de logements de moins de 30 m², 35 % construits avant 1948 | 2025 | [S1] | A |

### 1.2 Segment (b) : bailleurs particuliers et SCI (multipropriétaires)

| Indicateur | Valeur | Année | Source | Confiance |
|---|---|---|---|---|
| Ménages multipropriétaires (2 logements ou plus) | 7,3 millions (24 % des ménages) | données 2017, publiées en 2021 | [S3] | A (ancien) |
| Ménages ayant 5 logements ou plus | 3,5 % des ménages (environ 1 million). Ils détiennent **50 % des logements loués par des particuliers** | 2017 | [S3] | A (ancien) |
| Logements en location possédés par des particuliers | environ 6,7 millions | 2017 | [S3] | A (ancien) |
| Nombre de propriétaires bailleurs | « 3,8 millions de bailleurs pour 6,8 millions de biens », chiffre non sourcé | non daté | [S70] | C |
| Nombre de SCI | très incertain : environ 0,7 M « en activité » (blog, 2024), 1,2 M (estimation souvent citée), 1,9 M SCI actives dans Sirene **y compris les dormantes** (voir audit 02) | 2024-2026 | [S71] | C |

**Lecture (jugement) :** le cœur de cible « investisseur multi-lots / SCI » compte environ **1 million de ménages à 5 logements ou plus** [S3]. Ce profil est surreprésenté dans un club d'affaires. Un forum Moneyvox de juin 2026 montre une demande explicite pour des outils de pros, venant d'un investisseur qui crée une foncière de plus de 10 lots : « Je cherche quelque chose de "professionnel" » [S39].

### 1.3 Segment (a) : administrateurs de biens / gestion locative pro

| Indicateur | Valeur | Année | Source | Confiance |
|---|---|---|---|---|
| Dépenses annuelles de gestion immobilière résidentielle (marché de l'ADB) | environ 8 Md€ | étude mise à jour le 24/06/2026 | [S6] | B |
| Structure du marché | « fortement fragmenté », cabinets indépendants dominants face aux réseaux nationaux, consolidation en cours | 2026 | [S6] | B |
| Part de marché des ADB dans la gestion locative | environ 35 %, une grande majorité de bailleurs gérant seuls | 2019 | [S5] | B |
| Bailleurs faisant appel à un ADB | **48 %** ; 36 % n'y ont jamais eu recours. Enquête Galian-SMABTP/ViaVoice auprès de plus de 600 bailleurs (**Galian est le garant financier des pros**, l'échantillon est donc probablement biaisé) | 2026 | [S4] | B |
| Taille des cabinets indépendants interrogés (102 ADB de plus de 50 lots) | 27 % gèrent 50 à 149 lots, 23 % 150 à 299, 50 % 300 lots ou plus. Échantillon **non représentatif** | 2026 | [S4] | B |
| Nombre de cabinets | « environ 30 000 » cabinets de gestion immobilière, chiffre non sourcé. Le chiffre officiel (registre des cartes G en CCI) n'est pas publié | 2024 | [S7] | C |
| Lots en gestion locative chez les adhérents FNAIM | 1,5 à 1,6 million, d'après des relais secondaires non vérifiés | 2023 | — | C |
| Honoraires de gestion | 5 à 10 % HT des loyers encaissés (comparateurs). Les bailleurs jugent le « juste prix » à **8 % du loyer** en moyenne | 2026 | [S4] | B |

**Ce que pensent les bailleurs en gestion déléguée (Galian 2026) [S4] :**
- 86 % sont satisfaits de la transparence et 84 % jugent les informations claires, mais le NPS ne dépasse pas **+11**.
- **81 % pensent pouvoir gérer seuls.**
- Leurs motivations sont de gagner du temps (72 %), se protéger des impayés (57 %) et être accompagnés face à la réglementation (52 %).
- Côté ADB, 30 % se diversifient ou l'envisagent, en premier lieu vers la **rénovation énergétique (43 %)**.

### 1.4 Segment (c) : syndics de copropriété (bref)

| Indicateur | Valeur | Année | Source | Confiance |
|---|---|---|---|---|
| Copropriétés identifiées / immatriculées | 908 579 identifiées, dont 562 612 immatriculées (environ 62 %) | CoproFF 2023 | [S57] | B |
| Copropriétés gérées par un syndic non professionnel | environ 1 sur 10, dont 83 % sont de petites copropriétés | étude SYNBIOSE, mai 2025 | [S57] | B |
| Insatisfaction logicielle | près de 40 % des professionnels veulent changer de logiciel de syndic (622 répondants) | 2024 | [S8] | B |
| Taille des copropriétés | à peine plus de 10 % dépassent 50 lots et 1 % dépassent 200 lots | 2025 | relais Monimmeuble | B |

**Lecture (jugement) :** le syndic est un marché saturé, très normé (AG, appels de fonds) et à forte inertie logicielle. Pour la démo, il vaut mieux le traiter comme un **contexte** (immeubles en copropriété, travaux votés en AG) que comme une cible.

---

## 2. Acteurs et prix

### 2.1 Logiciels pour professionnels (ADB, agences, syndics)

Aucun éditeur pro majeur ne publie ses prix. Tous sont « sur devis » [S9]. Les fourchettes indicatives relevées viennent de sources commerciales (confiance C) : 60 à 300 €/mois, ou 1,5 à 8 € HT par lot et par mois selon les modules [S34].

| Acteur (groupe) | Cible | Fonctionnalités clés | Prix public | Ancienneté de l'UX (jugement, sauf mention) | Sources |
|---|---|---|---|---|---|
| **Septeo** : SPI Gestion Locative, Septeo ADB, plateforme **Modelo** et IA **MIA** (présentées le 14/10/2026) | Agences, ADB, syndics | Mise en gestion, comptabilité, quittancement, relances, GLI, OCR des factures, une cinquantaine d'indicateurs, extranets. Septeo veut fédérer cinq métiers sur des référentiels communs, avec API et marketplace. MIA a trois modes : agent exécutant (arrêtés de loyers), copilote (appels de fonds), interface vocale | Sur devis | Suite historique en cours de refonte. Septeo reconnaît lui-même que les logiciels « communiquent rarement entre eux » | [S9][S10][S11] ; environ 2 200 clients ADB selon une interview (C) [S12] |
| **ICS** : Spirit Gestion, LocNet, ICSign, Comfact. Rattachement à Septeo selon La Fabrique du Net, présenté comme indépendant par Rivage, **à vérifier** | ADB, syndics (suite multi-métier) | Comptabilité mandant, parcours locatif, état des lieux, signature, GED | Sur devis | **Ancienne** : logiciel le plus utilisé de l'enquête ANGC (114 répondants). 59 % des utilisateurs de Crypto et d'ICS envisagent de changer (2024) | [S8][S9][S32] |
| **Orisha Real Estate** : Crypto, Gercop, Wipimo, X14-Gérance, Powimo/Thetrawin (ex-Seiitra), Kolimmo | Agences, ADB, réseaux, grands comptes | Encaissements, règlements aux propriétaires, comptes rendus, rapprochement, relances, tickets, extranets, multi-société, passerelles gérance-copropriété | Sur devis | **Ancienne** pour Crypto et Gercop (Gercop édite « depuis 43 ans »), plus récente pour Wipimo. Le groupe déclare équiper environ 6 000 cabinets (interview 2023, C). Seiitra revendique plus de 350 clients et 7 500 utilisateurs | [S9][S13][S14][S33] |
| **Vilogi** | ADB, agences, bailleurs pros, syndics | Full web : baux, révisions, impayés, CAF, régularisations, fiscalité, extranets, application mobile « VILOGI & Me », API REST bidirectionnelle | Sur devis | Plutôt moderne : intuitivité **4,2/5** dans l'enquête ANGC, une des meilleures notes | [S8][S9][S69] |
| **LOCKimmo** | Agences, ADB | Comptabilité, quittances, impayés, révisions, régularisations, états des lieux, synchronisation bancaire | Sur devis | Non évaluée | [S9] |
| **La Boîte Immo** : Hektor (transaction), Oskar (gestion locative) | Agences indépendantes | Hektor : CRM de transaction. Oskar : baux, paiement intégré, impayés, révisions, avis d'échéance. IA intégrée depuis 2024, rachat de HOQI (home staging par IA) en décembre 2025 | Sur devis | Moderne côté transaction | [S9][S31][S68] |
| **Apimo** (CRM de transaction) | Agences | Mandats, diffusion, CRM | « À partir de 59,90 €/mois » (Appvizer, non daté) | Moderne (web) | [S31] |
| **Netty** (CRM de transaction et site web) | Agences | Logiciel de transaction 100 % web et site optimisé pour le référencement | « À partir de 89 €/mois » (guide Brevo, non daté) | Moderne (web) | [S30] |

**Nouveaux entrants (proptech) :**

| Acteur | Création / financement | Positionnement | Source |
|---|---|---|---|
| **Rivage** | Fondée en 2025, 1,5 M€ levés (Kima Ventures). Vise 5 M€ d'ARR en 2027 | Gestion locative « IA-native » : comptabilité mandant, rapprochement bancaire (« jusqu'à 95 % des opérations », chiffre de l'éditeur), relances multicanal, reconnaissance des factures, **API ouverte et connexion MCP** | [S9][S15] |
| **Ublo** | Fondée en 2020, 1,8 M€ levés en décembre 2025, plus de 250 clients, CA en hausse de plus de 300 % entre 2024 et 2025 | Plateforme pour pros (foncières, coliving, logement social) : quittancement, ticketing, export FEC, API GraphQL | [S9][S16] |
| **Matera, Monsieur Hugo, Smartloc, Brik** | — | Offres hybrides « logiciel + services » (syndic coopératif, prélèvement des loyers, assurance, artisans) | [S18][S19] |

### 2.2 Logiciels pour bailleurs particuliers et SCI

| Acteur | Cible | Fonctionnalités clés | Prix public (date du relevé) | Avis / UX | Sources |
|---|---|---|---|---|---|
| **Rentila** (depuis 2008) | Petits bailleurs, 1 à 5 lots | Quittances, relances, IRL, charges, bilan fiscal 2044/2072 | Gratuit pour 1 lot ; **Silver 59 € HT/an** (2 à 5 lots) ; **Gold 119 € HT/an** (lots illimités), relevé le 15/09/2026 [S17]. D'autres sources donnent 4,90 et 9,90 €/mois [S18] | Trustpilot 4,2/5 (104 avis). Critiques sur l'UX et le support (voir § 3) | [S17][S18][S20][S21] |
| **BailFacile** | Bailleurs autonomes | Bail et état des lieux en ligne, signature illimitée, espace locataire, coffre-fort, support 7j/7. Plateforme agréée pour la facture électronique | **9,99 €/mois** en engagement annuel pour 1 bien, 12,99 € en mensuel, 13,99 €/mois pour 2 biens, devis à partir de 3 biens (avril 2026) | Trustpilot 4,6/5 (2 743 avis). Critiques sur la transparence tarifaire | [S18][S22][S52] |
| **Qalimo** | Petits bailleurs et pros | Gestion locative, synchronisation bancaire | **Non publié** (formules Starter et Pro) | Trustpilot 4,9/5 (167 avis, profil non sollicité) | [S23][S39] |
| **Smovin** (Belgique) | Particuliers, puis pros | Suivi des paiements, contrats, indexation | « À partir de 4 € par mois et par bien » | — | [S25] |
| **Gererseul** (depuis 2010) | Bailleurs en location nue | Quittances, relances, options fiscales, assistance téléphonique | **117 € TTC/an par logement** (9,75 €/mois) ou 14,90 €/mois sans engagement ; −15 % dès 3 biens ; déclaration fiscale à 299 € (relevé le 15/09/2026) | Interface « jugée limitante » [S19], « peu intuitive et beaucoup de publicité » [S26] | [S17][S19][S26] |
| **Smartloc** | Particuliers, multi-biens | Bail, état des lieux, quittances, indexation, relances, réseau d'artisans | Zen 6,50 €/mois ; Multi 12,50 €/mois (2 à 4 biens) ; Investisseur 20 €/mois (5 à 15 biens) | — | [S18] |
| **Monsieur Hugo** | Bailleurs autonomes « avec filet » | Prélèvement automatique, protection juridique, artisans d'urgence 24/7 | 33,90 €/mois par bien [S18] ou « dès 14,90 €/mois » [S19] : **les sources divergent** | Trustpilot 4,4/5 (341 avis) | [S18][S19][S24] |
| **Immobilier Loyer** | SCI, multi-propriétaires | Nom propre et plusieurs SCI dans un même compte, déclarations 2044/2072, comptes d'associés | Option SCI à +5 €/mois | — | [S19] |
| **Ownily** | SCI familiales | Comptabilité de SCI et gestion locative, créée en 2020, open banking via Powens | Non trouvé | — | [S27] |
| **Masteos** | Investisseurs | **Ce n'est pas un logiciel** : investissement clé en main, commission de 5 % TTC (minimum 8 000 €) | — | — | [S28] |
| **Lokizi** | Bailleurs en meublé | **Ce n'est pas un logiciel** : agence de gestion locative meublée (Bordeaux, Paris) | — | — | [S29] |

### 2.3 Lecture du paysage (jugement)

- **Deux mondes étanches :**
  - les logiciels pros, centrés sur la comptabilité mandant, chers, sur devis, difficiles à quitter ;
  - les outils pour particuliers, centrés sur le bail et la quittance, bon marché, sans vision patrimoniale consolidée.
- **Tous affichent des listes et des tableaux.** Aucun acteur relevé ne propose une représentation **spatiale** du parc (immeuble, étage, lot), ni une **projection temporelle** des échéances réglementaires.
- **Les interfaces s'ouvrent :** API ouvertes et marketplace chez Septeo, API REST chez Vilogi, GraphQL chez Ublo, API et MCP chez Rivage [S9][S10]. Une **couche visuelle par-dessus** devient faisable sans remplacer l'outil en place. Un prestataire rappelle qu'on peut « construire une nouvelle couche applicative par-dessus l'existant » au lieu de migrer [S37].
- **Le marché se consolide** : rachats d'Inch (2025) et de Cadastre.com par Septeo, de Seiitra par Orisha, de HOQI et Protexa par La Boîte Immo [S11][S14][S68]. Les grands éditeurs construisent des plateformes, ce qui laisse de la place au **sur-mesure de niche** autour d'elles.

---

## 3. Points de douleur réels

| # | Douleur | Preuves / verbatims (courts, exacts) | Source | Qui souffre le plus |
|---|---|---|---|---|
| 1 | **UX datée, ergonomie** | Intuitivité moyenne de 3,34/5 ; 59 % des utilisateurs de Crypto et d'ICS veulent changer (2024) [S8]. « des UX vieillissantes et un mobile-first souvent absent », « une architecture qui dépasse les 20 ans d'ancienneté » (éditeur concurrent, C) [S35]. « vos outils digitaux donnent parfois l'impression d'avoir dix ans de retard » (prestataire, C) [S36]. Sur Rentila : « UX pas du tout orientée utilisateur », « assez compliqué à prendre en main » [S21] | [S8][S21][S35][S36] | ADB, syndics |
| 2 | **Outils cloisonnés, double saisie** | Septeo, premier éditeur du marché, l'écrit lui-même : « les logiciels communiquent rarement entre eux », et « Un même contact peut exister en plusieurs versions dans des systèmes distincts » [S10]. Il évoque aussi les « fichiers excel bricolés pour compenser » [S36] | [S10][S36] | ADB multi-métiers |
| 3 | **Pas de vue d'ensemble, outils fragmentés** (Excel, logiciel, compta, mails) | « je n'ai pour l'instant trouvé aucun outil qui gère tout », « il va toujours y avoir une fonctionnalité qui manque », « le bon vieil Excel » (forum Investisseurs Heureux) [S38]. « Excel suffit pour 1 bien, devient pénible à 2, et insoutenable à 3 » (éditeur, C) [S40] | [S38][S40] | Investisseurs multi-SCI |
| 4 | **Réactivité, suivi des travaux et des artisans** | 22 % des propriétaires disent que leur agence met **une semaine ou plus** à répondre sur un problème de gestion (33 % côté locataires). Plus des 3/4 doivent relancer leur agence (enquête IAD sur des agences parisiennes, publiée le 04/05/2026) [S41] | [S41] | Mandants d'ADB, locataires |
| 5 | **Impayés et relances** | 41 % des bailleurs ont déjà subi un impayé (+4 points par rapport à 2024). 39 % des ADB voient une hausse sur 5 ans. Seuls 39 % des bailleurs ont une GLI [S4]. Baromètre Monsieur Hugo : 3,47 % de retards en janvier 2026 (1 181 prélèvements), 2,8 % en moyenne sur 6 mois (mai 2026, C) [S42]. Il n'existe **aucune série statistique officielle** des impayés (rapport parlementaire) | [S4][S42] | Tous |
| 6 | **Régularisation des charges** | « Faire cette régularisation depuis un Excel demande 2 à 3 heures de croisement de factures, copro, et provisions » (éditeur, C) [S40]. Le locataire peut réclamer sur **3 ans** (prescription de la loi ALUR, art. 7-1 de la loi de 1989) [S54] | [S40][S54] | Particuliers, petites agences |
| 7 | **Révision IRL** | Une révision non demandée **ne se rattrape pas** et elle est perdue au bout d'un an [S45]. « Excel ne vous rappelle pas la date » (éditeur, C) [S40]. Elle est **interdite** pour les F/G loués depuis le 24/08/2022 [S45], d'où un risque d'indexation illégale | [S40][S45] | Particuliers |
| 8 | **Suivi des diagnostics (DPE)** | Les DPE réalisés entre le 1er janvier 2018 et le 30 juin 2021 sont **invalides depuis le 1er janvier 2025**. Le calcul change en 2026, puis en 2027 [S44][S47]. La validité de chaque DPE est à suivre lot par lot | [S44][S47] | Tous |
| 9 | **Mobile** | 155 répondants sur 622 seulement (24,9 %) disposent d'une version mobile. Ces logiciels obtiennent une meilleure intuitivité (3,70/5 contre 3,23/5) [S8] | [S8] | Gestionnaires terrain |
| 10 | **Migration et dépendance à l'éditeur** | Migration notée **2,74/10**. « La migration vers un nouveau logiciel est souvent le talon d'Achille qui freine de nombreux cabinets » (président de l'ANGC) [S8]. Les professionnels ont « la peur de perdre leur historique » (C) [S35]. L'ANGC signale aussi des cessations d'activité subites d'éditeurs [S8] | [S8][S35] | ADB, syndics |
| 11 | **Prix et transparence** | Sur BailFacile : « Gratuité annoncée, paiement exigé à la fin ! », « La transparence sur les tarifs devrait être une priorité » [S22]. Côté pros, aucun prix n'est publié [S9] | [S9][S22] | Particuliers |
| 12 | **Support** | Sur Rentila : « Gros Moins pour le support », « Ce dernier ne comprend pas toujours les demandes » (à propos du chat) [S21] | [S21] | Particuliers |
| 13 | **Fiabilité, confiance (banque, données)** | « depuis le mois de novembre 2022 mes quittances ne sont plus générées ». Sur la synchronisation bancaire : « un accès TOTAL a TOUS mes comptes » (forum, 2023) [S38] | [S38] | Particuliers |

**Synthèse (jugement) :** les cinq douleurs les plus « vendables » sur un stand sont :
1. pas de vue d'ensemble et outils fragmentés ;
2. argent perdu (impayés, IRL non révisé, régularisation ratée) ;
3. échéances DPE et conformité ;
4. réactivité et suivi des travaux ;
5. logiciels datés impossibles à quitter.

---

## 4. Contraintes réglementaires qui créent un besoin urgent

### 4.1 Calendrier

| Date | Obligation | Effet pour un bailleur ou un gestionnaire | Source (confiance) |
|---|---|---|---|
| **24 août 2022** | **Gel des loyers F/G** en métropole : pas de révision, de majoration ni de réévaluation si le bail est signé, renouvelé ou reconduit depuis cette date | Un IRL appliqué par erreur sur un F/G est illégal. Il faut croiser le DPE et le bail lot par lot | [S45] (A) |
| 1er janvier 2023 | Logement non décent au-delà de **450 kWh/m²/an** d'énergie finale | Premier seuil, aujourd'hui dépassé par le calendrier par classes | [S43] (A) |
| 1er avril 2023 / 1er janvier 2025 / 1er janvier 2034 | **Audit énergétique** obligatoire à la vente (maisons et immeubles en monopropriété) : F/G depuis avril 2023, E depuis janvier 2025, D à partir de 2034. Les appartements en copropriété ne sont pas concernés | Un immeuble détenu en SCI est concerné à la revente | [S51] (B ; art. L126-28-1 CCH) |
| **1er janvier 2025** | **Classe G non décente** en métropole : seuls les logements A à F sont louables (nouveaux baux, renouvellements, reconductions tacites). Le juge peut ordonner des travaux, réduire ou suspendre le loyer | Les lots G ne sont plus relouables | [S43][S46] (A) |
| 1er janvier 2025 | DPE réalisés entre 2018 et le 30 juin 2021 **invalides** | DPE à refaire avant toute relocation | [S44] (A) |
| **1er janvier 2026** | Nouveau DPE : coefficient de conversion de l'électricité ramené **de 2,3 à 1,9**. Les DPE existants peuvent être mis à jour gratuitement par attestation | Des lots chauffés à l'électricité changent de classe sans travaux. Le SDES estime à environ **700 000** le nombre de passoires en moins parmi les résidences principales | [S44][S1] (A) |
| 1er janvier 2027 | Coefficient de l'électricité ramené à **1,7** (arrêté du 19/08/2026 selon des sources spécialisées, que la FFB présente encore comme un projet au 02/09/2026). Création d'une mention « A0 » et de nouvelles données dans le DPE (arrêté publié au JO le 13/08/2026) | Nouvelle vague de reclassements. **À vérifier sur Légifrance** | [S47] (B) |
| **1er janvier 2028** | **Classe F non décente** en métropole (seuls A à E sont louables). Outre-mer : A à E à partir de 2028 | Échéance la plus vendeuse : **dans 14 mois** (calcul) | [S43] (A) |
| 1er janvier 2034 | **Classe E non décente** (seuls A à D sont louables) | Horizon de planification des travaux | [S43] (A) |
| En cours | **Projet de loi « relance du logement »** : adopté au Sénat le **8 juillet 2026**, examen à l'Assemblée nationale à l'automne 2026 en procédure accélérée, **non promulgué**. Il permettrait de relouer des F/G contre un engagement de travaux : contrat signé avant le 1er janvier 2030, présomption de conformité de 3 ans (maison, immeuble) ou 5 ans (copropriété). Il prévoit aussi des exemptions pour contraintes techniques ou refus de l'AG. **Tant que la loi n'est pas promulguée, l'interdiction s'applique** | Si la loi passe, il faudra suivre des **engagements de travaux datés** par lot : c'est du suivi d'échéances pur | [S48] (B) |
| **24 novembre 2026** | Fin de l'expérimentation de l'**encadrement des loyers** (loi ELAN, prolongée par la loi 3DS) dans 9 territoires (Paris, Lille, Plaine Commune, Lyon, Est Ensemble, Montpellier, Bordeaux, Pays basque, Grenoble). Le Sénat a voté une prolongation de 2 ans le **21/10/2026** (325 voix contre 17), sans nouvelles villes. Le texte retourne à l'Assemblée. **Issue incertaine** | Il faut contrôler le loyer de référence majoré par lot dans les zones concernées | [S49] (B) |
| Variable selon les communes | **Permis de louer** : déclaration ou autorisation préalable de mise en location (CERFA 15652*01). Amende jusqu'à 5 000 €, 15 000 € en cas de récidive sous 3 ans ou de location malgré un refus | Il faut savoir quelle commune impose quoi et suivre l'autorisation par lot | [S50] (B) |
| Chaque trimestre | **Révision IRL** : clause obligatoire dans le bail, une fois par an, à demander dans l'année, sans rétroactivité | Alerte à la date anniversaire, montant calculé, courrier prêt | [S45] (A) |
| **1er septembre 2026 / 1er septembre 2027** | **Facturation électronique** : réception obligatoire pour toutes les entreprises assujetties depuis le 1er septembre 2026 ; émission pour les grandes entreprises et ETI depuis cette date, pour les **PME et TPE (donc la plupart des ADB) au 1er septembre 2027**. Pas de sanction pendant la phase de tolérance jusqu'à fin 2026. Pour les bailleurs, selon BailFacile (à vérifier) : une location nue sans SIREN n'est pas concernée, les SCI et LMNP doivent pouvoir recevoir | Les factures d'artisans arrivent **structurées** : on peut les rattacher automatiquement au bon lot et au bon ticket | [S52] (A, et C pour la partie bailleurs) |
| Permanent | **Loi Hoguet / ALUR** : carte professionnelle G (gestion) délivrée par la CCI pour 3 ans avec formation continue, garantie financière, registre des mandats conservé 10 ans, prescription des actions du bail ramenée à 3 ans par ALUR | Traçabilité attendue par les ADB (mandats, fonds de mandants) | [S53][S54] (B) |
| Depuis le 19 novembre 2024 | **Loi Le Meur** (meublés de tourisme) : DPE obligatoire pour les meublés de tourisme hors résidence principale, trajectoire vers la classe D d'ici 2034 (les étapes intermédiaires n'ont pas été confirmées par les sources trouvées) | 44 % des bailleurs ont un bien en location saisonnière ou l'envisagent [S4] | [S55] (B) |
| 2026-2027 | **MaPrimeRénov'** : les bailleurs y ont accès. La rénovation d'ampleur vise les logements E, F ou G avec un gain minimal de 2 classes. À partir du 1er janvier 2027, les maisons F/G ne pourront plus passer par le parcours par geste | Financement à intégrer dans un plan de travaux | [S56] (B) |

### 4.2 Les passoires dans le parc locatif privé (SDES / ONRE, publication de novembre 2025) [S1]

| Parc locatif privé (France métropolitaine) | 1er janv. 2023 | 1er janv. 2024 | **1er janv. 2025** | 1er janv. 2025 avec le coefficient 1,9 (simulation) |
|---|---|---|---|---|
| Passoires F+G (nombre) | 1 494 000 | 1 303 000 | **1 147 000** | 871 000 |
| Part du parc locatif privé | 18,5 % | 15,9 % | **13,8 %** | 10,5 % |
| dont appartements | 957 000 (16,6 %) | 835 000 (14,6 %) | 694 000 (12,0 %) | — |
| dont maisons | 536 000 (21,4 %) | 468 000 (18,9 %) | 453 000 (18,1 %) | — |
| Part d'étiquettes **G** | — | 6,9 % | **5,5 %** (environ 0,46 M, calcul) | — |
| Part d'étiquettes **F** | — | 9,0 % | **8,4 %** (environ 0,70 M, calcul) | — |
| Part d'étiquettes **E** (concernées en 2034) | — | 22,0 % | **19,2 %** (environ 1,6 M, calcul) | — |

À retenir pour le discours :
- Au 1er janvier 2024, le parc locatif privé comptait **567 000 logements G** (ministère de la Transition écologique, communiqué du 10/01/2025) [S46].
- Le parc locatif privé concentre 29,3 % de toutes les passoires des résidences principales, et environ la moitié de la baisse 2024-2025 y est observée [S1].
- Ensemble des résidences principales : **3,9 millions de passoires (12,7 %)** au 1er janvier 2025. Ce serait 3,2 millions (10,4 %) avec le coefficient 1,9 [S1].

*Note de méthode :* les volumes F, G et E du parc locatif privé sont des calculs de l'auteur. Ils appliquent les parts du graphique 9 du SDES au parc implicite (1 147 000 / 13,8 %, soit environ 8,3 millions de logements). Ce périmètre SDES diffère de l'estimation INSEE d'environ 7,3 millions de logements loués par des bailleurs privés.

### 4.3 Valeurs récentes de l'IRL (France métropolitaine) [S45]

| Trimestre | IRL | Variation sur un an | Publication INSEE |
|---|---|---|---|
| T3 2025 | 145,77 | +0,87 % | 15/10/2025 |
| T4 2025 | 145,78 | +0,79 % | 15/01/2026 |
| T1 2026 | 146,60 | +0,78 % | 15/04/2026 |
| T2 2026 | 148,37 | +1,15 % | 10/07/2026 |
| **T3 2026** | **148,06** | **+1,57 %** | 15/10/2026 |

---

## 5. Tendances

### 5.1 L'IA dans la gestion locative : passée en quelques mois du gadget au standard

- **Septeo, MIA (octobre 2026)** : IA agentique en trois modes : « Agent exécutant », « Copilote » (qui agit avec l'accord de l'utilisateur) et « Interface vocale ». Elle cible les arrêtés de loyers, les appels de fonds, le suivi locatif et les fournisseurs. Septeo prévient que la fiabilité de l'IA « dépend de la qualité des données » [S10]. Son dirigeant titre déjà : « Parler d'intelligence artificielle, c'est déjà has been » (juillet 2026) [S66].
- **Rivage** se dit conçu « nativement » pour l'IA : reconnaissance des factures, assistant, connexion MCP [S9][S15]. **La Boîte Immo** a intégré l'IA dès 2024 [S68].
- **Financements** : 40 % des montants levés par les startups françaises au S1 2026 concernent des produits intégrant de l'IA (Licorne Society, C) [S67].
- **Côté ADB**, l'IA apparaît comme un sujet émergent (veille réglementaire, DPE, gestion administrative), sans mesure chiffrée d'usage [S4].
- **Conséquence (jugement) :** un « chatbot » ne différencie plus. Ce qui différencie, c'est un copilote **ancré dans les données du parc**, qui **priorise des actions chiffrées en euros et datées par la loi**, et qui explique pourquoi.

### 5.2 Jumeaux numériques et BIM en exploitation : qui le fait déjà ?

| Usage | Qui | Pour qui | Source |
|---|---|---|---|
| BIM GEM (gestion, exploitation, maintenance) sur du logement existant | Habitat 76 (maquette généralisée sur 28 000 logements), CDC Habitat avec le CSTB (outil BIM-GEM), Seqens (maquettes transformées en base interrogeable, « jumeau de sa foncière »), guide de l'USH (2020) | **Bailleurs sociaux** (grands parcs) | [S58][S60] |
| Building operating system et jumeau de données | Spinalcom (3D/BIM, maintenance, énergie, flex office, gestion locative) | **Tertiaire, grands comptes** | [S61] |
| Plateforme de jumeau numérique | Autodesk Tandem, facturé « à la capacité » et accessible via BIM Collaborate Pro | Maîtres d'ouvrage, exploitants techniques | [S62] |
| Visualisation 3D de données | Arskan, **en liquidation depuis février 2023** | — | [S61] |
| Capture 3D et visite virtuelle | Matterport : plus de 20 % des 580 agences Guy Hoquet l'utilisent (communiqué de l'éditeur, C). Check & Visit parle de « jumeau numérique » pour l'état des lieux scanné | Commercialisation, état des lieux | [S64][S65] |

**Freins documentés :**
- le coût d'adoption (relevé de l'existant, adaptation des logiciels, formation), mieux rentabilisé sur les grands parcs (rapport du Congrès des notaires, 2021) [S59] ;
- un prix d'entrée « trop élevé pour les petites et moyennes sociétés immobilières » (Cretech) [S63].

**Offre 3D accessible aux PME et aux agences ?** Mes recherches n'en ont trouvé **aucune** qui associe une 3D légère, un statut locatif par lot et des alertes. Les offres existantes visent la technique du bâtiment (maintenance, énergie) ou la commercialisation (visites), pas la **gestion locative et patrimoniale**. L'audit 02 aboutit à la même conclusion [S71]. Ce manque est probable, pas prouvé.

**Point de vocabulaire (jugement) :** pour un ADB, « jumeau numérique » évoque le BIM, donc un coût et une complexité. Mieux vaut parler de **« jumeau de gestion »** ou de **« carte vivante du parc »** : une 3D générée simplement (nombre d'étages et de lots par étage), sans maquette BIM ni scan, et alimentée par les données de gestion.

### 5.3 Portails locataires et extranets

Ils deviennent un standard :
- extranets propriétaires et locataires chez Septeo, Orisha et Vilogi ;
- application B2B2C « VILOGI & Me » ;
- espaces locataires chez BailFacile et Ublo [S9][S69][S18].

Les attentes portent sur la réactivité. 22 % des propriétaires attendent une réponse plus d'une semaine [S41]. Un portail qui **montre** l'avancement d'un ticket (photo, artisan, date) répond directement à cette douleur.

### 5.4 Open banking et rapprochement des loyers

- La DSP2 permet aux logiciels de lire les flux bancaires par API.
- Rivage revendique un rapprochement automatique de « jusqu'à 95 % des opérations » (chiffre de l'éditeur) [S9]. Ownily s'appuie sur Powens [S27]. Qalimo et LOCKimmo proposent une synchronisation bancaire [S9][S23].
- Le frein est la **confiance**. Un bailleur s'inquiète d'« un accès TOTAL a TOUS mes comptes » [S38]. Dans une démo, il faut montrer l'agrégation en lecture seule et l'hébergement en France. Septeo met d'ailleurs en avant « trois data centers implantés en France » [S10].

### 5.5 Autres signaux

- **Diversification des ADB vers la rénovation énergétique** (43 % de ceux qui se diversifient) [S4]. Ils ont besoin d'un outil pour **vendre** des plans de travaux à leurs mandants.
- **Location saisonnière** : 44 % des bailleurs ont un bien sur une plateforme ou l'envisagent [S4]. Le parc devient mixte (bail nu, meublé, saisonnier), avec des règles différentes par lot.

---

## 6. Opportunités : où une app sur mesure « vue 3D du parc + copilote d'alertes » apporte une vraie valeur

### 6.1 Ce que les logiciels existants font déjà (à ne pas survendre)

Quittancement, relances, calcul de l'IRL, comptabilité mandant, extranets, signature électronique, synchronisation bancaire : c'est **couvert** par la plupart des acteurs, souvent pour quelques euros par mois côté particuliers [S9][S17][S18]. Une IA « copilote » existe chez Septeo et Rivage [S10][S15]. **Il ne faut pas se positionner en remplaçant de ces fonctions.**

### 6.2 Angles concrets, classés par valeur perçue (jugement argumenté)

| Rang | Angle | Pourquoi ça vaut de l'argent | Preuve / douleur | Cible principale |
|---|---|---|---|---|
| **1** | **Radar de conformité DPE 2025-2034** : chaque lot coloré selon sa classe et son échéance (G interdit, F en 2028, E en 2034), validité du DPE, gel des loyers F/G, effet des coefficients 1,9 et 1,7, plan de travaux priorisé | Un lot F devient non louable dans **14 mois**, et son loyer est déjà gelé. C'est une **perte de revenu chiffrable** pour 1,147 million de logements locatifs privés F/G [S1][S43][S45] | § 4.1, douleur 8 | Investisseurs SCI, ADB (vente de rénovation) |
| **2** | **Cockpit cash** : impayés (J+5, J+15, J+30), IRL non demandés (un mois perdu ne se rattrape pas), régularisations de charges dues ou en retard (prescription de 3 ans), vacance | Ça transforme « des oublis » en **euros visibles sur la façade**. 41 % des bailleurs ont déjà subi un impayé [S4] | Douleurs 5, 6 et 7 | Tous |
| **3** | **Vue consolidée multi-SCI / multi-mandants** : un seul écran pour plusieurs SCI, immeubles et villes ; rendement, vacance et risque par lot, immeuble ou associé | 50 % des logements loués par des particuliers appartiennent à des ménages qui ont au moins 5 logements [S3]. Les outils pour particuliers sont pensés « par bien » | Douleur 3 | Investisseurs, family offices, dirigeants de PME en SCI |
| **4** | **Couche visuelle par-dessus l'existant, sans migration** : import des exports CSV ou FEC, ou connexion aux API (Septeo, Vilogi, Ublo, Rivage) ; l'outil métier reste maître des données | La migration est notée 2,74/10, et 40 % des professionnels veulent changer sans passer à l'acte [S8]. On ne remplace pas leur logiciel, on lui ajoute « des yeux » | Douleurs 1, 2 et 10 | ADB, agences |
| **5** | **Travaux et artisans localisés dans l'espace** : ticket posé sur le lot ou la partie commune, photos, devis, artisan, délai ; suivi des **engagements de travaux** si la loi « relance » passe ; rattachement automatique des factures électroniques au ticket | Répond au déficit de réactivité (22 % des propriétaires attendent plus d'une semaine [S41]) et à la diversification vers la rénovation [S4] | Douleur 4, § 4.1 | ADB, gestionnaires techniques |
| **6** | **Copilote d'alertes priorisées** (des actions, pas un chat) : « Ce matin : 5 actions, X € en jeu » ; pour chaque alerte, le pourquoi (règle et date), le montant et un brouillon de courrier ou de mail, validé par un humain | Le format « copilote qui agit avec accord » est celui que Septeo met en avant [S10]. Ici, il est spécialisé, transparent et réglable par le client | Douleurs 5, 7 et 8 | Tous |
| **7** | **Reporting visuel aux mandants et associés** : compte rendu de gérance « vivant » (lien ou PDF avec la vue 3D et les indicateurs) | Seuls 32 % des mandants sont promoteurs, et 81 % pensent pouvoir gérer seuls [S4]. L'ADB doit **prouver** sa valeur pour fidéliser | § 1.3 | ADB |
| **8** | **Aide à l'arbitrage** : vendre, rénover ou garder, en croisant l'audit énergétique obligatoire à la vente, le coût des travaux, MaPrimeRénov' et le loyer gelé ou dégelé | Décision patrimoniale à fort enjeu, peu outillée (jugement) | § 4.1 | Investisseurs, agents (transaction) |

### 6.3 Fonctionnalités « wow » à montrer en démo (environ 3 minutes)

1. **Curseur temporel 2025 → 2028 → 2034.** Les lots passent au rouge au fil du calendrier réglementaire, et un compteur affiche « loyers annuels à risque : X € ». C'est l'effet le plus fort, et il repose sur des dates officielles [S43].
2. **Interrupteur « nouveau DPE 1,9 / 1,7 ».** Quelques lots chauffés à l'électricité passent instantanément de F à E. Message : « vous avez peut-être des lots qui ne sont plus des passoires, sans travaux » [S1][S44][S47].
3. **Clic sur un lot.** La fiche s'ouvre : bail, locataire, date de révision IRL et montant calculé avec l'IRL T3 2026 (148,06), validité du DPE, statut du gel, impayés, tickets de travaux, prochaine échéance.
4. **Panneau copilote.** « 5 actions aujourd'hui » : IRL à demander avant perte, DPE de 2019 invalide, impayé à J+15, régularisation 2025 à faire, artisan sans réponse. Chaque action a un bouton « préparer le courrier ».
5. **Calques de couleur.** On bascule en un clic entre occupation, impayés, DPE et travaux. On peut filtrer par SCI ou par mandant.
6. **Simulation de rénovation.** Un clic sur « isoler + PAC » fait passer le lot en E. Le gel est levé, la date de révision redevient possible, et l'aide potentielle s'affiche (en restant prudent).
7. **Mode tablette ou mobile.** La même vue tient dans la main, pour répondre au manque de mobile (24,9 % seulement [S8]).
8. **« Importé depuis votre logiciel actuel ».** Un import CSV ou FEC en direct, ou une démonstration de connecteur, pour désamorcer l'objection « je ne veux pas changer de logiciel ».

Piste technique à valider : retrouver le **DPE officiel** de chaque lot par adresse dans la base publique de l'ADEME. Cette base alimente les statistiques du SDES, et l'attestation de mise à jour passe par l'Observatoire DPE-Audit [S1][S44]. Ce serait un fort effet « wow » : « vos DPE se remplissent tout seuls ».

### 6.4 Arguments clés par public (phrases d'accroche sourcées)

| Public | Accroche | Source |
|---|---|---|
| Investisseur / SCI | « Au 1er janvier 2028, dans 14 mois, vos lots classés F ne seront plus louables. Leurs loyers sont déjà gelés depuis 2022. » | [S43][S45] |
| Investisseur / SCI | « 1,1 million de logements locatifs privés sont des passoires F/G. Combien sur votre parc ? » | [S1] |
| Administrateur de biens | « 40 % des pros veulent changer de logiciel, mais la migration est notée 2,74/10. On ne vous fait pas migrer : on donne des yeux à votre outil actuel. » | [S8] |
| Administrateur de biens | « 81 % de vos mandants pensent pouvoir gérer seuls. Montrez-leur ce que vous voyez et pas eux. » | [S4] |
| Agent immobilier | « Audit énergétique obligatoire à la vente d'une maison E, F ou G : identifiez les biens à arbitrer avant vos concurrents. » | [S51] |
| Dirigeant de PME (prescripteur) | « Même Septeo, le premier éditeur, écrit que les logiciels "communiquent rarement entre eux". Le sur-mesure relie vos outils au lieu d'en ajouter un. » | [S10] |

### 6.5 Risques et précautions (jugement)

- **Ne pas promettre de conseil juridique.** Le calendrier peut bouger (loi « relance » en cours, encadrement des loyers qui pourrait s'arrêter le 24/11/2026). Il faut un **moteur de règles paramétrable**, avec la date de dernière vérification visible.
- **RGPD** : les données des locataires (impayés, identité) imposent de minimiser, de chiffrer, d'héberger en UE et de tracer les accès.
- **Qualité des données** : un jumeau n'est utile que s'il est à jour. Le connecteur ou l'import compte plus que la 3D.
- **Vocabulaire** : éviter « BIM » et « jumeau numérique » au sens industriel. Préférer « carte vivante du parc ».
- **Chiffres** : sur un support imprimé, n'utiliser que les chiffres de niveau A ou B. Les chiffres C (éditeurs, comparateurs) servent seulement à l'argumentaire oral, en citant la source.

---

## 7. Tableau des chiffres clés (pour slides ou flyer)

| Chiffre | Source | Confiance |
|---|---|---|
| 1 147 000 passoires F/G dans le parc locatif privé (13,8 %) au 1er janvier 2025 | SDES/ONRE, novembre 2025 [S1] | A |
| 3,9 millions de passoires F/G parmi les résidences principales (12,7 %) au 1er janvier 2025 | SDES/ONRE [S1] | A |
| 23,1 % des résidences principales louées par des bailleurs privés (1er janvier 2025) | INSEE [S2] | A |
| Les ménages ayant 5 logements ou plus détiennent 50 % des logements loués par des particuliers | INSEE (données 2017) [S3] | A |
| G non louable depuis le 01/01/2025, F au 01/01/2028, E au 01/01/2034 | service-public.fr [S43] | A |
| IRL T3 2026 : 148,06 (+1,57 %) | service-public / INSEE [S45] | A |
| 40 % des pros du syndic veulent changer de logiciel ; migration notée 2,74/10 ; 24,9 % ont une version mobile | ANGC 2024 [S8] | B |
| 48 % des bailleurs passent par un ADB ; 41 % ont déjà subi un impayé ; 81 % pensent pouvoir gérer seuls | Galian-SMABTP/ViaVoice 2026 [S4] | B |
| Environ 8 Md€ de dépenses annuelles d'administration de biens résidentielle | Xerfi 2026 [S6] | B |
| 22 % des propriétaires attendent une semaine ou plus une réponse de leur agence | Enquête IAD (agences parisiennes), 2026 [S41] | B |

---

## 8. Sources

Consultées le 1er novembre 2026. Les dates entre parenthèses sont celles des documents.

- **[S1]** SDES / ONRE, *Le parc de logements par classe de performance énergétique au 1er janvier 2025* (12 novembre 2025). Page : https://www.statistiques.developpement-durable.gouv.fr/le-parc-de-logements-par-classe-de-performance-energetique-au-1er-janvier-2025 ; PDF relayé : https://www.locservice.fr/actualites/wp-content/uploads/statistiques-sdes-rapport-15-onre-parc-logements-dpe-1er-janvier-2025-nov2025.pdf
- **[S2]** INSEE, *Statut d'occupation des résidences principales, données annuelles 1982-2025* : https://www.insee.fr/fr/statistiques/2415555
- **[S3]** INSEE, *France, portrait social*, « 24 % des ménages détiennent 68 % des logements possédés par des particuliers » (25 novembre 2021, données 2017) : https://www.insee.fr/fr/statistiques/5432517
- **[S4]** Monimmeuble, « Gestion des biens locatifs : ce que révèle l'étude Galian-SMABTP » (29 juin 2026) : https://monimmeuble.com/actualite/gestion-des-biens-locatifs-ce-que-revele-letude-galian-smabtp ; PDF de l'étude (inaccessible, 503) : https://api-minio.galian.fr/galianfr/s3fs-public/2026-06/enquete-galian-smabtp-x-viavoice-regards-croises-adb-bailleurs-2026.pdf
- **[S5]** Rapport Nogal, *Louer en confiance* (juin 2019), vie-publique.fr : https://www.vie-publique.fr/files/rapport/pdf/194000510.pdf (chiffre de 35 % repris d'un extrait, le PDF étant trop volumineux pour être lu en entier)
- **[S6]** Xerfi, *Les administrateurs de biens à l'horizon 2030* (26BAT35, mise à jour du 24/06/2026) : https://www.xerfi.com/presentationetude/le-marche-des-administrateurs-de-biens_bat35
- **[S7]** XVAL, valorisation des cabinets d'administration de biens (26 mars 2024) : https://xval.fr/en/valorisation-cabinet-administration-biens-syndic-gestion-locative/
- **[S8]** Monimmeuble, « Logiciels syndic copropriété : forces et faiblesses dévoilées par l'ANGC » (20 septembre 2024) : https://monimmeuble.com/actualite/logiciels-syndic-copropriete-forces-et-faiblesses-devoilees-par-langc
- **[S9]** Rivage, « Meilleur logiciel de gestion locative en 2026 » (28 août 2026, source éditeur) : https://rivage.immo/blog/meilleur-logiciel-gestion-locative/
- **[S10]** Monimmeuble, « Logiciel immobilier : Septeo unifie cinq métiers avec Modelo et MIA » (21 octobre 2026) : https://monimmeuble.com/?p=109943
- **[S11]** MySweetImmo, « Septeo muscle son offre ADB avec le rachat d'INCH » (28 octobre 2025) : https://www.mysweetimmo.com/2025/10/28/immobilier-septeo-muscle-son-offre-adb-avec-le-rachat-dinch/
- **[S12]** Podcast MySweetImmo, Edouard Sakakini (Septeo ADB) : https://podcast.ausha.co/mon-podcast-immo-mysweetimmo/edouard-sakakini-septeo-adb ; voir aussi https://www.mysweetimmo.com/2025/12/02/a-deux-on-sera-plus-forts-pour-ecrire-lavenir-edouard-sakakini-septeo-adb/
- **[S13]** Monimmeuble, interview Orisha Real Estate (2023) : https://monimmeuble.com/?p=87062
- **[S14]** Orisha, communiqué sur l'acquisition de Seiitra : https://www.orisha.com/en/blog/3602
- **[S15]** Journal du Net, « Rivage lève 1,5 million d'euros » : https://www.journaldunet.com/start-up/1552255-rivage-leve-1-5-million-d-euros-pour-sa-plateforme-de-gestion-immobiliere/
- **[S16]** Les Pépites Tech, top 10 des startups du 5 au 11 janvier 2026 (Ublo) : https://lespepitestech.com/blog/2026/01/12/top-10-des-startups-du-05-au-11-janvier-2026
- **[S17]** Gererseul, comparatif Gererseul vs Rentila (prix relevés le 15/09/2026, **source concurrente**) : https://www.gererseul.com/comparatif/gererseul-vs-rentila/
- **[S18]** BailPDF, comparatif de la gestion locative (14 avril 2026, source commerciale) : https://bailpdf.com/gestion-locative
- **[S19]** Manda, comparatif 2026 des logiciels de gestion locative (28 juillet 2026, source commerciale) : https://manda.fr/ressources/articles/comparatif-des-meilleurs-logiciels-de-gestion-locative
- **[S20]** Appvizer, fiche Rentila : https://www.appvizer.fr/construction/biens-immobiliers/rentila
- **[S21]** Trustpilot, Rentila : https://fr.trustpilot.com/review/www.rentila.com
- **[S22]** Trustpilot, BailFacile : https://fr.trustpilot.com/review/bailfacile.fr
- **[S23]** Trustpilot, Qalimo : https://fr.trustpilot.com/review/qalimo.fr
- **[S24]** Trustpilot, Monsieur Hugo : https://fr.trustpilot.com/review/monsieurhugo.com
- **[S25]** Capterra, Smovin : https://www.capterra.fr/software/177288/smovin
- **[S26]** Investissement-locatif-avis, comparatif 2026 : https://investissement-locatif-avis.fr/meilleurs-logiciels-gestion-locative-2026/
- **[S27]** La Fabrique du Net, Ownily : https://www.lafabriquedunet.fr/logiciel/ownily ; Powens : https://www.powens.com/?p=22136
- **[S28]** Cleerly, avis Masteos : https://cleerly.fr/investissement-locatif/masteos
- **[S29]** Monimmeuble, tag Lokizi : https://monimmeuble.com/tag/lokizi
- **[S30]** Brevo, guide du CRM immobilier (prix Netty) : https://www.brevo.com/fr/blog/crm-immobilier/
- **[S31]** Appvizer, Apimo : https://www.appvizer.fr/construction/agence-immobiliere/apimo ; Appvizer, Hektor : https://www.appvizer.fr/construction/agence-immobiliere/hektor
- **[S32]** La Fabrique du Net, ICS : https://www.lafabriquedunet.fr/logiciel/ics-immo
- **[S33]** Monimmeuble, Gercop : https://monimmeuble.com/actualite/gercop-a-chaque-professionnel-son-logiciel-adapte
- **[S34]** Kolonell, prix des logiciels de gestion locative en 2026 (**source commerciale**, éditeur de sur-mesure) : https://kolonell.com/fr/blog/logiciel-gestion-locative-immobilier-2026 ; La Fabrique du Net : https://www.lafabriquedunet.fr/logiciels/gestion/gestion-locative/gestion-locative-en-ligne
- **[S35]** Diffuze, comparatif des logiciels immobiliers 2026 (28 mai 2026, source commerciale) : https://www.diffuze.fr/blog/logiciel-immobilier-comparatif-2026
- **[S36]** JoliCode, page sur le secteur immobilier (prestataire) : https://jolicode.com/nos-metiers/secteurs/immobilier
- **[S37]** URL Concept, « Comment moderniser un logiciel métier obsolète sans tout reconstruire » : https://www.urlconcept.com/blog/comment-moderniser-un-logiciel-metier-obsolete-sans-tout-reconstruire
- **[S38]** Forum Investisseurs Heureux, fil sur les logiciels de gestion locative (messages de 2020 à 2023) : https://www.investisseurs-heureux.fr/t548-4
- **[S39]** Forum Moneyvox, outils de gestion locative pour une foncière (25-26 juin 2026) : https://www.moneyvox.fr/forums/fil/outils-logiciels-de-gestion-locative-pour-une-fonciere.54346/
- **[S40]** Logio, tableau Excel de gestion locative (26 mai 2026, mis à jour le 27 octobre 2026, source commerciale) : https://logio.fr/blog/tableau-excel-gestion-locative-particulier-gratuit/
- **[S41]** IAD France, « Enquête sur la réactivité des agences immobilières » (4 mai 2026) : https://blog.iadfrance.fr/actualites/enquete-reactivite-agences-immobilieres
- **[S42]** Monimmeuble, « Retard de paiement de loyer : +86 % en janvier 2026 » : https://monimmeuble.com/actualite/retard-de-paiement-de-loyer-86-en-janvier-2026-les-chiffres-cles ; Économie Matin : https://www.economiematin.fr/?p=228128
- **[S43]** Service-public.fr, « Logement décent » (fiche F2042, vérifiée le 21/03/2025) : https://www.service-public.gouv.fr/particuliers/vosdroits/F2042
- **[S44]** Service-public.fr, « Diagnostic de performance énergétique » (fiche F16096, vérifiée le 01/01/2026) : https://www.service-public.gouv.fr/particuliers/vosdroits/F16096
- **[S45]** Service-public.fr, « Indice de référence des loyers (IRL) » (fiche F13723) : https://www.service-public.gouv.fr/particuliers/vosdroits/F13723
- **[S46]** Ministère de la Transition écologique, communiqué « Logements classés DPE G : les règles évoluent au 1er janvier » (10 janvier 2025) : https://www.ecologie.gouv.fr/presse/logements-classes-dpe-g-regles-evoluent-1er-janvier-gouvernement-continue-proteger
- **[S47]** FFB, « DPE : les changements prévus au 1er janvier 2027 » (2 septembre 2026) : https://www.ffbatiment.fr/actualites-batiment/actualite/fd79-diagnostic-performance-energetique-changement2027-septembre2026 ; Confia Diagnostic, arrêté du 19 août 2026 (coefficient 1,7) : https://confiadiagnostic.fr/arrete-19-aout-2026-coefficient-electricite-dpe-1-7-au-1er-janvier-2027-essonne-yonne-paris/
- **[S48]** Kohen Avocats, « Relance-logement : passoires thermiques » (13 septembre 2026) : https://kohenavocats.fr/2026/09/13/relance-logement-passoires-thermiques-bailleurs-locataires-juge-2026/ ; Franceinfo, adoption au Sénat : https://www.franceinfo.fr/economie/immobilier/reforme-du-logement/location-de-passoires-thermiques-adaptation-aux-canicules-droit-de-veto-des-maires-pour-les-attributions-de-hlm-le-projet-de-loi-logement-adopte-au-senat_8100098.html ; Actu-Environnement (24 avril 2026) : https://www.actu-environnement.com/ae/news/projet-loi-relance-logement-remise-marche-location-passoires-thermiques-sebastien-lecornu-47913.php4
- **[S49]** Encadrement des loyers. Public Sénat : https://www.publicsenat.fr/emission/100-senat/le-senat-prolonge-de-deux-ans-lexperimentation-de-lencadrement-des-loyers-e18 ; NosParlementaires (vote du 21 octobre 2026) : https://nosparlementaires.fr/actualites/encadrement-loyers-23-novembre-2026-senat-21-octobre ; PAP, villes concernées : https://www.pap.fr/bailleur/louer-avec-pap/encadrement-des-loyers-ou-en-est-on/a23046
- **[S50]** MySweetImmo, guide du permis de louer (12 juin 2026) : https://www.mysweetimmo.com/2026/06/12/permis-de-louer-le-guide-immobilier-complet-pour-eviter-jusqua-15-000-e-damende/ ; Seban Avocats : https://www.seban-associes.avocat.fr/wp-content/uploads/2025/04/Melissa-Mezine-Permis-de-louer-procedures-dinstruction-de-decision-et-de-sanction-La-Gazette-des-Communes.pdf
- **[S51]** Hellowatt, audit énergétique obligatoire : https://www.hellowatt.fr/renovation/audit-energetique/obligatoire ; notaires : https://www.gence-associes.notaires.fr/upload/GEN-FLASH-INFO-AVRIL.pdf
- **[S52]** Facturation électronique. economie.gouv.fr : https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises ; entreprendre.service-public.gouv.fr (A18953) : https://entreprendre.service-public.gouv.fr/actualites/A18953 ; impots.gouv.fr : https://www.impots.gouv.fr/actualite/facturation-electronique ; BailFacile (cas des bailleurs, source commerciale) : https://www.bailfacile.fr/facturation-electronique-location
- **[S53]** Juritravail, registres obligatoires des agents immobiliers : https://www.juritravail.com/Actualite/agent-immobilier-quels-sont-les-registres-obligatoires-que-vous-devez-obligatoirement-tenir/Id/377278 ; CCI Lyon Métropole, formalités des professions immobilières : https://www.lyon-metropole.cci.fr/formalites-entreprises/formalites-professions-immobilieres
- **[S54]** Justice.fr, délai de prescription des dettes de loyer et de charges : https://www.justice.fr/fiche/delai-prescription-dette-loyer-charges-locatives
- **[S55]** Actu-Juridique, « Locations touristiques : ce que change la loi Le Meur » : https://www.actu-juridique.fr/fiscalite/fiscal-finances/locations-touristiques-ce-que-change-la-loi-le-meur/
- **[S56]** economie.gouv.fr, MaPrimeRénov' rénovation d'ampleur (5 mars 2026) : https://www.economie.gouv.fr/particuliers/faire-des-economies-denergie/maprimerenov-renovation-dampleur-tout-savoir-sur-cette ; BailFacile, guide bailleurs 2026 : https://www.bailfacile.fr/actualites/maprimerenov-guide-bailleurs-pour-acceder-aux-aides-en-2026
- **[S57]** Cerema / CoproFF : https://doc-datafoncier.cerema.fr/doc/export/490 ; étude SYNBIOSE (DREAL Auvergne-Rhône-Alpes, mai 2025) : https://www.auvergne-rhone-alpes.developpement-durable.gouv.fr/IMG/pdf/20250506_synbiose_legarrec.pdf ; RNIC sur data.gouv : https://www.data.gouv.fr/datasets/registre-national-dimmatriculation-des-coproprietes
- **[S58]** Construction21, « La donnée au cœur de l'activité du bailleur social » (Seqens) : https://www.construction21.org/france/articles/h/la-donnee-au-coeur-de-l-activite-du-bailleur-social-une-meilleure-exploitation-pour-un-patrimoine-durable.html
- **[S59]** Rapport du 117e Congrès des notaires (2021), « Le BIM gestion » : https://www.rapport-congresdesnotaires.fr/2021-rapport-du-117e-congres/le-bim-gestion
- **[S60]** Programme APOGÉE BIM GEM (Habitat 76) : https://www.construction21.org/france/data/sources/users/8742/programme-apogeebim-gem23-nov-2016.pdf ; Batiweb, CDC Habitat et CSTB : https://www.batiweb.com/actualites/numerique-bim/bim-gem-cdc-habitat-et-le-cstb-creent-un-nouvel-outil-38666
- **[S61]** Spinalcom, présentation au Forum Teratec 2023 : https://www.teratec.eu/library/pdf/forum/2023/Presentations/Forum_Teratec_2023_A3_Jeremie_Bellec_Spinalcom.pdf ; Arskan : https://en.wikipedia.org/wiki/Arskan
- **[S62]** Autodesk Tandem : https://www.autodesk.com/fr/products/tandem/overview ; https://www.autodesk.com/fr/products/bim-collaborate/features/digital-twin
- **[S63]** CRETech, « Is it time to get your building a digital twin? » : https://www.cretech.com/news/one-is-a-lonely-number-is-it-time-to-get-your-building-a-digital-twin/
- **[S64]** Check & Visit, « Jumeau numérique dans l'immobilier locatif » (mis à jour le 25 mai 2023) : https://blog.checkandvisit.com/jumeau-numerique-immobilier-locatif
- **[S65]** Matterport, cas Guy Hoquet (communiqué de l'éditeur) : https://matterport.com/fr/news/guy-hoquet-boosts-its-results-thanks-3d-virtual-tours-real-estate-made-possible-matterport
- **[S66]** MySweetImmo, « Parler d'intelligence artificielle, c'est déjà has been », Jesus Diaz (Septeo) (15 juillet 2026) : https://www.mysweetimmo.com/2026/07/15/proptech-parler-dintelligence-artificielle-cest-deja-has-been-jesus-diaz-septeo/
- **[S67]** Licorne Society, bilan des levées de fonds du S1 2026 : https://www.licornesociety.com/blog/bilan-levees-de-fonds-s1-2026
- **[S68]** MySweetImmo, rachat de HOQI par La Boîte Immo (4 décembre 2025) : https://www.mysweetimmo.com/2025/12/04/immobilier-la-boite-immo-rachete-hoqi-startup-specialiste-du-home-staging-assiste-par-ia/ ; IA chez La Boîte Immo (28 mai 2024) : https://www.mysweetimmo.com/2024/05/28/pros-de-limmo-la-boite-immo-integre-lia-a-ses-outils-pour-accroitre-votre-efficacite/
- **[S69]** Monimmeuble, « VILOGI & Me, la première application B2B2C » : https://monimmeuble.com/actualite/gestion-immobiliere-vilogi-me-la-premiere-application-b2b2c
- **[S70]** Homunity, « Comprendre la gestion locative » (chiffres non sourcés) : https://www.homunity.com/blog/immobilier/comprendre-la-gestion-locative
- **[S71]** Audit interne 02, « Choix de la niche et grille de prix » : `docs/audit/02-choix-niche-et-prix.md` (décompte des SCI dans Sirene, recensement des offres 3D)
