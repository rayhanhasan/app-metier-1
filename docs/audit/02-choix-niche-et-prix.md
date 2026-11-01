# Audit 02 : choix de la niche pour la démo « jumeau numérique 3D » et grille de prix

> Date de rédaction : 1er novembre 2026. Public visé : dirigeants de TPE/PME locales présents dans un club d'affaires.
> Règle suivie : chaque chiffre est accompagné de sa source et de son année, sous la forme `[n]` (voir la section « Sources »). Les **calculs dérivés** sont signalés « (calcul) ». Les **estimations non sourcées** sont signalées « (jugement) ». Les sources commerciales, c'est-à-dire des éditeurs ou des agences qui vendent le service, sont signalées « (source commerciale) ».

---

## 0. Résumé exécutif

| # | Niche | Note /30 | Verdict |
|---|---|---|---|
| 1 | **Immobilier : administrateurs de biens (ADB), agences avec gestion, SCI/investisseurs** | **27** | **Recommandée** pour la démo principale |
| 2 | BTP / artisans (suivi de chantiers) | 21 | Second « skin » de la même démo |
| 3 | Logistique / entrepôts PME | 19 | Excellente métaphore 3D, mais peu présente en club |
| 4 ex aequo | Hôtellerie / campings | 17 | Plans interactifs déjà standard chez les éditeurs |
| 4 ex aequo | Restauration multi-sites | 17 | Douleur forte, mais faible capacité à payer et 3D peu utile |

- **Pourquoi l'immobilier.** C'est un gros marché : 39 691 entreprises dans la branche Immobilier [1] et environ 1,9 million de SCI actives dans Sirene [2]. La douleur est mesurée : 39 % des ADB constatent une hausse des impayés sur 5 ans [3], et 1,1 million de passoires F/G restent dans le parc locatif privé [4] alors que la location des G est interdite depuis 2025 [5]. Les logiciels en place sont centrés sur la comptabilité mandant, pas sur la visualisation [7]. Enfin, la métaphore « l'immeuble *est* la base de données » est la plus naturelle des cinq. Elle parle aussi aux prescripteurs du club : les experts-comptables tiennent les SCI, et les assureurs vendent la GLI, que 74 % des ADB proposent [3].
- **La concurrence 3D** existe, mais elle vise d'autres usages et d'autres tailles de clients : capture et visite virtuelle (Matterport [41]), commercialisation du neuf (Habiteo/Bien'ici [42], sélecteurs de lots [43]), BIM-GEM et maintenance de grands patrimoines (Abyla, Carl Berger-Levrault, ARCHIBUS, Spinalcom [33–38]). Je n'ai trouvé **aucune offre** qui combine une vue 3D simple du patrimoine, le statut locatif par lot et des alertes d'action pour une structure de 50 à 1 500 lots. Ce trou est probable, pas prouvé (voir § 2.3).
- **Prix recommandé pour ce public** : une offre d'appel « Jumeau Express » (audit + prototype 3D sur données réelles en 2 semaines) entre **2 900 et 4 900 € HT**, déductible du projet. Ensuite un MVP entre **12 000 et 25 000 € HT**, puis un abonnement maintenance et hébergement entre **150 et 450 € HT/mois** (voir § 3 et § 4).

---

## 1. Méthode et limites

- **Notation /5 par critère** (6 critères, total /30). Les notes sont un **jugement argumenté** fondé sur les chiffres sourcés de chaque fiche. Elles ne sont pas une mesure.
  1. **Taille du marché** : nombre d'entreprises adressables en France.
  2. **Espace laissé par l'existant** : 5 signifie que les logiciels en place laissent un vrai trou pour du sur-mesure ou une couche visuelle ; 1 signifie un marché saturé de SaaS bon marché.
  3. **Intensité de la douleur** : obligations, pertes financières, temps perdu.
  4. **Capacité à payer** une application sur mesure, de 10 000 à 30 000 € et plus.
  5. **Pertinence de la métaphore 3D** : la 3D aide-t-elle *vraiment* à décider ?
  6. **Présence probable dans le club**. Ce critère repose sur le public décrit par le commanditaire (artisans BTP, agents immobiliers, restaurateurs, garagistes, experts-comptables, assureurs, commerçants, hôteliers, investisseurs) et sur la règle BNI d'« un seul représentant par métier » [32]. Je n'ai pas trouvé de statistique publique sur la composition des clubs d'affaires.
- **Limites de la collecte.** Plusieurs pages primaires étaient inaccessibles : CCI France (403), baromètre Malt (403), étude complète Galian (503). Pour ces cas, le chiffre vient d'un relais secondaire et il est signalé.

---

## 2. Comparatif des 5 niches

### 2.1 Fiches par niche

#### (a) Immobilier : gestion locative, administrateurs de biens, SCI

| Élément | Donnée | Source |
|---|---|---|
| Entreprises de la branche Immobilier | **39 691 entreprises, 55 697 établissements employeurs, 150 875 salariés** (URSSAF 2025, masse salariale 2024) | [1] |
| Poids des agences (NAF 6831Z) | 53 % des établissements employeurs de la branche (base INSEE BTS 2022), soit environ 29 500 établissements (calcul, en croisant deux millésimes) | [1] |
| Poids de l'administration de biens (NAF 6832A) | 9 % des établissements employeurs de la branche (BTS 2022), soit environ 5 000 (calcul) | [1] |
| Taille des structures | 93 % des établissements de la branche ont moins de 11 postes | [1] |
| Cartes professionnelles | 20 684 cartes d'agent immobilier traitées par les CCI en 2024. Chiffre lu via un relais, car la page cci.fr renvoyait une erreur 403. Il s'agit de cartes *traitées*, pas du stock total | [10] |
| SCI | **1 904 564 SCI actives** dans Sirene au 1er sept. 2026, catégorie juridique 6540. Ce décompte **inclut les SCI dormantes non radiées** et provient d'une source privée qui exploite Sirene | [2] |
| Recours aux ADB | 48 % des propriétaires-bailleurs font appel à un ADB et 36 % ne l'ont jamais fait (Galian-SMABTP x Viavoice, 2026 : 102 ADB de plus de 50 lots et 606 bailleurs) | [3] |
| Marché de l'administration de biens | Environ 8 Md€ de dépenses annuelles en gestion résidentielle (Xerfi, date de l'étude non précisée sur la page publique) | [6] |

**Logiciels existants et faiblesses**
- **Côté professionnels** : la suite SPI et la marque ICS chez Septeo, Crypto et Gercop chez Orisha Real Estate, Seiitra (filiale d'Emeria) [7]. Ce sont des progiciels **centrés sur la comptabilité mandant**, le quittancement et le reversement, vendus **sur devis** [7]. Une source commerciale avance 1 à 4 € HT par lot et par mois, et le cas d'un cabinet lyonnais de 2 300 lots qui paie 4 €/lot/mois pour un progiciel « sans extranet satisfaisant » [8]. La faiblesse principale (jugement) : ce sont des outils tabulaires, faits pour le comptable, qui ne proposent ni vue d'ensemble du patrimoine ni pilotage visuel des priorités.
- **Côté particuliers et SCI** : Rentila (gratuit pour un petit parc) et BailFacile (119,88 €/an pour 1 bien) [9]. Les comparatifs indiquent que ces outils ne sont **pas conçus pour la gestion en SCI**, ou ne la couvrent que partiellement [9].

**Douleur**
- **Impayés.** 39 % des ADB constatent une hausse des impayés sur 5 ans (47 % parlent de stabilité). 41 % des bailleurs ont déjà subi un impayé, soit 4 points de plus qu'en 2024 [3].
- **DPE.** 13,8 % du parc locatif privé est classé F ou G au 1er janvier 2025, soit environ 1,1 million de logements [4]. La location des logements G est interdite depuis le 1er janvier 2025, celle des F le sera en 2028 et celle des E en 2034 [5]. *Incertitude : la même page du SDES cite aussi un taux de 29,3 % sans en préciser l'assiette [4].*
- **Motivations des bailleurs qui délèguent.** Gain de temps (72 %), protection contre les impayés (57 %), accompagnement réglementaire (52 %) [3]. Ce sont exactement les fonctions d'un tableau de bord qui « dit quoi faire ».

**Capacité à payer.** Les honoraires de gestion se situent généralement entre 5 et 10 % du loyer, et les bailleurs estiment le « juste prix » à 8 % [3]. Les ADB de plus de 50 lots ont un chiffre d'affaires récurrent. Les SCI familiales ont une capacité faible, contrairement aux investisseurs multi-lots (jugement).

**Métaphore 3D.** C'est la meilleure des cinq (jugement). L'actif physique (immeuble, étage, lot) correspond exactement à l'unité de donnée (bail, locataire, DPE, loyer). Colorer les lots par statut rend l'information lisible en une seconde.

**Présence dans le club.** Agents immobiliers et investisseurs sont explicitement cités dans le public du club. Beaucoup de dirigeants détiennent une SCI, ce qui découle de la masse des 1,9 million de SCI [2] (jugement). Les experts-comptables et les assureurs du club sont des **prescripteurs naturels** : ils tiennent la comptabilité des SCI et vendent la GLI, que 74 % des ADB proposent [3].

#### (b) BTP / artisans (suivi de chantiers)

| Élément | Donnée | Source |
|---|---|---|
| Entreprises artisanales du bâtiment | **620 000 petites entreprises**, soit 97 % des entreprises du secteur (CAPEB, déc. 2024) | [11] |
| Conjoncture | Activité artisanale en recul d'environ 5 % en 2024 (CAPEB) | [11] |
| Défaillances | Construction : 4 696 défaillances au T4 2025, en baisse de 8,1 % sur un an (Altares, relayé par Batiweb) | [16] |
| Charge administrative | « 13 heures par semaine perdues en administratif » (Qonto x OpinionWay, mai 2026, **titre de presse seul**, méthodologie non consultée). Le poids de l'administratif est cité par 41 % des dirigeants parmi leurs 3 premières sources de stress (CAPEB, baromètre ArtiSanté 2025) | [13], [12] |
| Réglementation à venir | Facturation électronique : réception obligatoire pour toutes les entreprises au 1er sept. 2026, émission obligatoire pour les PME/TPE au 1er sept. 2027 | [17] |

**Logiciels existants et faiblesses.** Le marché est saturé de SaaS bon marché : Obat de 25 à 32 € HT/mois [15], Batappli de 429 à 1 309 €/an [14], Sage Batigest Connect dès 31,08 € HT/mois, Costructor dès 15 €/mois [14][15], et d'autres comme Tolteck ou Graneet. Ces prix servent d'ancrage psychologique et rendent difficile la vente d'un sur-mesure à 15 000 € à un artisan de moins de 10 salariés (jugement).

**Métaphore 3D.** Elle est moyenne (jugement). On peut représenter une carte isométrique de la ville avec les chantiers et leur avancement, mais un chantier est temporaire et l'actif n'est pas « possédé ». Le gain par rapport à un planning ou un Kanban est moins net.

**Présence dans le club.** Très forte : les artisans BTP sont cités en premier dans le public.

#### (c) Hôtellerie / campings

| Élément | Donnée | Source |
|---|---|---|
| Hôtels | **14 886 hôtels, 618 200 chambres** (INSEE, données annuelles 2025, moyenne mensuelle). Autre périmètre : 16 058 établissements au 1er janv. 2026 en métropole, non classés inclus (INSEE relayé par la CCI Paris IdF) | [18], [20b] |
| Part d'indépendants | 76 à 82 % des hôtels selon les sources (Coach Omnium 2023 : 82 %). Fourchette incertaine | [20] |
| Campings | **7 637 établissements** (FNHPA, 2026). CA direct de 4,7 Md€ et 34 540 emplois (Asterès pour la FNHPA, 2025) | [19] |
| Défaillances HCR | Environ 9 468 défaillances dans l'hôtellerie-restauration en 2025, en hausse de 9 % (GHR / Altares) | [26] |

**Logiciels existants.**
- **Hôtels** : PMS Mews, Medialog et Misterbooking (ce dernier revendique plus de 3 000 hôtels équipés), tarifs sur devis [21].
- **Campings** : Ctoutvert, qui a racheté Inaxel, ainsi que Thelis et Anolla [22]. Le **plan interactif des emplacements est déjà une fonction standard** de ces logiciels, et Anny propose même une carte 3D des emplacements [22]. Le trou laissé pour une démo 3D est donc faible.

**Capacité à payer.** Moyenne : le CA moyen d'un camping est d'environ 615 k€ (calcul : 4,7 Md€ / 7 637). La saisonnalité est forte.

**Présence dans le club.** Les hôteliers sont cités dans le public, mais les campings sont plutôt ruraux et saisonniers (jugement).

#### (d) Restauration multi-sites

| Élément | Donnée | Source |
|---|---|---|
| Établissements HCR employeurs | 166 080 établissements, dont 44 % en restauration traditionnelle et 24 % en restauration rapide ; 84 % des établissements HCR ont entre 1 et 9 salariés (AKTO, données 2019) | [23] |
| Chaînes | 20 796 points de vente, 311 enseignes de restauration rapide et 141 de restauration à table, marché de 21 Md€ (Food Service Vision, Revue Chaînes 2025, données 2024) | [24] |
| Indépendants | Environ 89 % de la restauration commerciale (Gira, relayé par un tiers) | [25] |
| Défaillances | 7 715 défaillances en restauration en 2025, en hausse de 9,2 % (UMIH, février 2026) | [26] |
| Groupes multi-sites indépendants (2 à 10 restaurants) | **Aucun chiffre trouvé** | — |

**Logiciels existants.** Le marché est dense : caisses Lightspeed et Zelty, pilotage des coûts matière Inpulse (plus de 3 500 restaurants revendiqués, tarif sur demande) [27], outils de planning et de réservation. La douleur porte surtout sur la marge et le personnel, des problèmes qu'une vue 3D ne résout pas directement (jugement).

**Métaphore 3D.** Moyenne : plan de salle ou de cuisine, carte des sites. Les plans de salle existent déjà dans les caisses (jugement).

#### (e) Logistique / entrepôts PME

| Élément | Donnée | Source |
|---|---|---|
| Grands entrepôts | **3 900 entrepôts de 10 000 m² ou plus** fin 2024 (SDES) | [28] |
| Entreprises d'entreposage non frigorifique (NAF 5210B) | 1 938 entreprises, dont 423 de 10 salariés ou plus (INSEE Ésane, **2016**, chiffre ancien) | [29] |
| Filière au sens large | 150 000 entreprises et 1,8 million d'emplois (France Logistique, livre blanc 2022, **chiffre de filière**) | [30] |
| Limite | Une grande partie des petits entrepôts appartient à des industriels ou des négociants et n'est pas codée 52.10, donc la cible réelle est floue | [28], [29] |

**Logiciels existants.** Generix WMS à partir de 30 000 € [31]. Pour Mecalux Easy WMS, une licence estimée entre 15 000 et 80 000 €, plus 18 à 22 % de maintenance annuelle (estimation d'un site tiers) [31]. Les PME sans WMS gèrent leur stock dans un ERP ou sur Excel (jugement).

**Métaphore 3D.** Excellente (racks, emplacements, taux de remplissage). **Présence dans le club** : faible, car logisticiens et grossistes sont rares dans le public décrit.

### 2.2 Grille de notation

| Critère (/5) | (a) Immobilier | (b) BTP | (c) Hôtellerie / camping | (d) Restauration multi-sites | (e) Logistique PME |
|---|---|---|---|---|---|
| Taille du marché | **5** (39 691 entreprises [1], 1,9 M SCI [2]) | **5** (620 000 entreprises [11]) | 3 (14 886 hôtels [18], 7 637 campings [19]) | 3 (cible multi-sites non chiffrée) | 2 (3 900 grands entrepôts [28]) |
| Espace laissé par l'existant | **4** (progiciels comptables, pas de vue visuelle [7]) | 2 (SaaS de 15 à 40 €/mois [14][15]) | 2 (plans interactifs standard, 3D chez Anny [22]) | 2 (écosystème caisse et coûts matière dense [27]) | 3 (WMS chers, trou PME [31]) |
| Intensité de la douleur | **4** (impayés, DPE, réglementation [3][4][5]) | 4 (administratif, e-facture [12][13][17]) | 3 | **4** (défaillances +9,2 % [26]) | 3 (non chiffrée) |
| Capacité à payer du sur-mesure | **4** (ADB de plus de 50 lots ; faible pour les SCI familiales) | 2 (TPE, activité en baisse [11]) | 3 | 2 (marges fragiles [26]) | **4** (habitués à des WMS à 30 k€ et plus [31]) |
| Pertinence de la métaphore 3D | **5** | 3 | 4 (mais déjà faite) | 3 | **5** |
| Présence dans le club | **5** (agents, investisseurs, prescripteurs) | **5** | 2 | 3 | 2 |
| **Total /30** | **27** | **21** | **17** | **17** | **19** |

### 2.3 Classement argumenté

1. **Immobilier (27/30).** C'est la seule niche qui obtient 4 ou 5 sur tous les critères. Ses atouts décisifs : (i) la métaphore 3D est *fonctionnelle* et pas seulement décorative ; (ii) les obligations datées créent un sentiment d'urgence (DPE F interdit à la location en 2028 [5]) ; (iii) le public du club contient à la fois les clients (agents, investisseurs) et les prescripteurs (experts-comptables, assureurs).
   **Risque principal** : la comptabilité mandant est réglementée (loi Hoguet, garantie financière, compte séquestre [10]) et déjà couverte par SPI, Crypto ou Gercop [7]. Il faut **se positionner en couche de pilotage visuel et d'alertes**, alimentée par des exports, et **ne pas remplacer le progiciel comptable**. *À vérifier : quels exports ou API ces progiciels proposent réellement.*
2. **BTP (21/30).** Le marché est énorme et très présent dans le club, mais les clients sont habitués à des logiciels à 30 €/mois. Il vaut mieux le traiter comme un **second habillage de la même démo**, une « ville isométrique des chantiers », pour capter les artisans au stand et viser les PME de plus de 10 salariés.
3. **Logistique (19/30).** C'est la niche la plus cohérente techniquement, mais la moins présente dans un club d'affaires local. Elle reste une piste pour une prospection directe ultérieure.
4. **Hôtellerie / campings (17/30) et restauration multi-sites (17/30), ex aequo.** Pour les campings, la 3D est déjà banalisée chez les éditeurs [22]. Pour la restauration, la douleur réelle (marge, personnel) se situe hors du champ de la 3D.

**Sous-cible recommandée** (jugement) : (1) les **ADB et agences avec activité de gestion, de 50 à environ 1 500 lots**, une taille comparable aux ADB de plus de 50 lots de l'étude Galian [3]. Une source commerciale estime qu'au-delà de 1 000 à 1 500 lots le sur-mesure devient compétitif face au SaaS [8], ce qui reste à valider. (2) Les **investisseurs et SCI patrimoniales multi-lots** (5 lots et plus) mal servis par Rentila ou BailFacile [9].

**Scénario de démo conseillé** : 3 immeubles isométriques dont les lots sont colorés par statut (loué, vacant, préavis, impayé, DPE F/G, travaux). Un clic sur un lot ouvre la fiche locataire, le bail, l'échéancier et les quittances. Un panneau « **À faire aujourd'hui** » liste par exemple : relance d'impayé à J+10, DPE à refaire avant la relocation, révision IRL, fin de bail à 3 mois, attestation d'assurance manquante. C'est l'équivalent immobilier du garage de la vidéo de référence.

---

## 3. Jumeaux numériques existants dans l'immobilier

### 3.1 Panorama

| Acteur / offre | Ce que fait la 3D | Cible | Prix public | Source |
|---|---|---|---|---|
| **Matterport** | Capture 3D (« digital twin ») et visite virtuelle d'un espace existant | Agences, gestionnaires, assurance, construction | Les sources divergent : Free ; Starter de 9,99 à 14 $/mois ; Professional de 58 à 69 $/mois ; Business de 296 à 355 $/mois (2026). D'après PricingSaaS, Starter et Business ont été supprimés en oct. 2026 et un pack caméra Pro3 est proposé à 1 995 $. *Page officielle non lisible* | [41] |
| **Habiteo** (Bien'ici depuis juin 2022) | Maquettes et visites 3D de logements neufs non construits, configurateurs | Promoteurs (147 clients en 2016) | Sur devis. Ensemble Bien'ici + Habiteo : 40 M€ de CA annoncé | [42] |
| **Sélecteurs de lots 3D** (ex. Maverickframe) | Choix immeuble, étage, lot avec prix et disponibilités en direct | Promoteurs (commercialisation VEFA) | Sur devis | [43] |
| **Abyla** (Labeo) | BIM exploitation, référentiel patrimonial | Bailleurs sociaux (Habitat 76 : 5 000 logements, 1 M€ d'économie revendiquée) | Sur devis | [37] |
| **Carl Berger-Levrault** (BIM-CIM GEM, viewer BL.VIZ) | GMAO et maintenance sur maquette Open BIM (IFC, 3D Tiles) | Collectivités, grands patrimoines | Sur devis | [34] |
| **ARCHIBUS, Clearly.BIM** | Gestion des actifs immobiliers et maintenance | Grands patrimoines tertiaires | Sur devis | [35] |
| **Spinalcom** (SpinalTwin) | « Système d'exploitation du bâtiment », jumeau temps réel | Tertiaire | 1 499 par an d'après un agrégateur (**non vérifié**, devise non précisée) | [38] |
| **Yardi** (Floorplan Manager), **Twinview** | Plans et espaces, documents, tableaux de bord | Grands bailleurs et facility managers | Non public | [39], [40] |
| **Production de maquette** (scan-to-BIM) | Relevé de l'existant puis maquette d'exploitation | Toute cible | 3 €/m² pour le scan intérieur, dès 5 €/m² pour la maquette d'exploitation (Guyenne Études, 2026), soit 3 000 à 5 000 € pour 1 000 m² (calcul) | [36] |

Le CSTB définit le **BIM-GEM** comme un référentiel qui reprend les données de conception pour l'exploitation. Le **jumeau numérique** y ajoute simulation, capteurs et IA [33].

### 3.2 Y a-t-il un trou pour les PME, agences et SCI ?

- **Constat.** Les offres trouvées se répartissent en trois familles : (1) **marketing et capture** (Matterport, Habiteo, sélecteurs de lots) ; (2) **maintenance technique de grands patrimoines** (BIM-GEM, GMAO), au coût de maquette élevé et vendue sur devis ; (3) **progiciels de gestion locative** sans dimension visuelle [7]. Un article de Bisnow note que le prix du jumeau numérique « peut être trop élevé pour les petites et moyennes sociétés immobilières » [39].
- **Le trou probable** : une **vue 3D schématique** (isométrique « low-poly », générée automatiquement à partir de quelques données : nombre d'étages, lots par étage) couplée au **statut locatif et réglementaire** de chaque lot et à un **moteur d'alertes et d'actions**, à un prix accessible à une structure de 50 à 1 500 lots. L'atout économique (jugement) : **aucun relevé BIM n'est nécessaire**, alors qu'un relevé coûte 3 à 5 €/m² [36]. La 3D est une représentation des données, pas une copie géométrique du bâtiment.
- **Réserve.** L'absence de résultat ne prouve pas l'absence de concurrent. Avant de communiquer « personne ne fait ça », il faut demander une démonstration à Septeo (SPI/ICS), Orisha (Crypto/Gercop) et Seiitra, car certains modules cartographiques ou extranets peuvent exister. Il faut aussi vérifier les proptechs récentes.

---

## 4. Prix d'une application métier sur mesure en France (2025-2026)

### 4.1 TJM des développeurs freelances

| Source (année) | Donnée | Remarque |
|---|---|---|
| Morgan Philips Freelance, étude 2025/2026 [44] | Développeur web : junior 350 € (régions) / 450 € (IDF) ; confirmé 700 € / 800 € ; expert 850 € / 950 € par jour | Cabinet de placement, missions de ses clients |
| Kicklox / Groupe Didaxis 2025 [45] | TJM moyen « IT & logiciel » : **629 €** ; écart province / Paris d'environ 5 % seulement | 663 réponses, juin-juillet 2025 |
| La Fabrique du Net 2026 [46] | TJM moyen développeur freelance, toutes spécialités : environ 520 €/jour | Agrégateur |
| Freelance-solution.fr, mai 2026 [47] | TJM moyen développeur web freelance : environ 450 €/jour (données Malt et FreelanceRepublik) | Agrégateur |
| Régie Portage, citant Malt [48] | 574 €/jour en moyenne pour les développeurs | **Année du baromètre ambiguë** (2024 ou 2026). Page Malt inaccessible (403) |

**Lecture.** Un freelance confirmé en région facture généralement entre **450 et 650 € HT par jour** (synthèse des sources [44]–[47]).

### 4.2 Prix de projets et de maintenance

| Type de livrable | Fourchette HT | Source |
|---|---|---|
| Atelier de cadrage seul | 6 500 à 9 000 € (agence) | [50] (source commerciale) |
| Cadrage + prototype cliquable (environ 2 semaines) | 11 000 à 15 000 € (agence) ; autres articles du même site : 9 000 à 20 000 € ou 8 000 à 25 000 € à Paris | [50] (source commerciale) |
| Ateliers à prix fixe | « Light Discovery » 1 500 €, « Strategy Day » 2 500 €, « Prototyping Sprint » 4 500 € | [51] (source commerciale) |
| MVP / petit périmètre | **10 000 à 30 000 €** | [49] (agence, mise à jour oct. 2026) |
| MVP de plateforme (auth + paiement) | 25 000 à 70 000 € | [50] (source commerciale) |
| Application métier « cœur de process » | 30 000 à 80 000 € | [49] |
| Écosystème complet (web, mobile, intégrations) | 60 000 à 150 000 € et plus | [49] |
| Maintenance annuelle | **10 à 20 % du coût initial par an** [49] ; 15 à 20 % selon Kolonell [50] | [49], [50] |
| Forfait TMA mensuel PME | 350 à 1 500 € ou 800 à 3 500 € HT/mois selon le SLA (les sources se contredisent) | [50] (source commerciale) |
| Hébergement seul | 80 à 400 € HT/mois | [50] (source commerciale) |

**Modèle forfait + abonnement.** Le modèle dominant observé est un forfait de build (cadrage déductible) suivi d'un contrat mensuel de maintenance et d'hébergement [49][50]. Comme repère, les progiciels de gestion locative coûteraient entre 1 et 4 €/lot/mois [8] (source commerciale, à vérifier).

**Aide publique mobilisable (sous conditions).** Le Diag Data IA de Bpifrance : prestation de 10 000 € HT sur 8 jours, prise en charge à 40 % depuis juin 2026 (les sources antérieures indiquaient 50 %) [52]. Il suppose un expert **habilité par Bpifrance** et ne concerne que l'angle data et IA. À vérifier sur le site officiel avant d'en parler au stand.

---

## 5. Pitch du stand

### 5.1 Trois accroches (une phrase chacune)

1. **« Voyez votre patrimoine comme un immeuble, pas comme un tableur : chaque lot qui passe au rouge, c'est un loyer, un DPE ou un bail qui demande une action aujourd'hui. »** (cible : ADB, agents, investisseurs)
2. **« Votre logiciel compte vos loyers ; le mien vous dit quoi faire ce matin. »** (cible : ADB déjà équipés de SPI, Crypto ou Gercop, en positionnement complémentaire)
3. **« Donnez-moi votre fichier Excel, je vous rends votre entreprise en 3D cliquable en 15 jours. »** (accroche universelle pour les artisans, restaurateurs et garagistes qui passent au stand)

### 5.2 Offre packagée proposée

| Palier | Contenu | Délai | Prix recommandé (HT) | Justification |
|---|---|---|---|---|
| 0. Diagnostic stand | 30 min : « montrez-moi votre fichier, je vous montre votre jumeau » | Sur RDV | Offert | Génération de leads |
| **1. Jumeau Express** | Atelier de cadrage d'une demi-journée, import de vos données réelles (Excel/CSV), prototype 3D cliquable (1 à 3 immeubles, jusqu'à environ 100 lots, ou 10 chantiers), 5 règles d'alerte « À faire aujourd'hui », restitution et chiffrage du MVP | **2 semaines** | **2 900 à 4 900 €**, **déductible** du MVP si signature sous 60 jours | 6 à 8 jours à 450-650 €/j [44]–[47] (calcul) ; repère « Prototyping Sprint » à 4 500 € [51] ; volontairement sous les 11 000 à 15 000 € d'une agence [50] |
| 2. MVP métier | Fiches lots et locataires, échéancier, quittances (hors comptabilité mandant), moteur d'alertes, imports et exports, accès multi-utilisateurs | 6 à 10 semaines | **12 000 à 25 000 €** | Fourchette MVP de 10 000 à 30 000 € [49] |
| 3. Abonnement « Sérénité » | Hébergement, sauvegardes, maintenance corrective, petites évolutions, support | Mensuel | **150 à 450 €/mois** | 10 à 20 %/an du build [49], soit 100 à 420 €/mois pour un build de 12 000 à 25 000 € (calcul), plus un hébergement léger |

**Pourquoi cette fourchette pour ce public** (jugement) : 93 % des établissements immobiliers ont moins de 11 postes [1]. Un ticket d'entrée inférieur à 5 000 € et déductible permet au dirigeant de décider seul, sans appel d'offres. Les paliers suivants restent sous les prix d'agence [49][50].

**Points de vigilance à afficher dans l'offre** : pas de maniement de fonds (compte séquestre, loi Hoguet [10]) ; conformité RGPD des données locataires ; réversibilité des données (export).

---

## 6. Incertitudes et points à vérifier

| Point | Pourquoi c'est incertain | Action |
|---|---|---|
| 1,9 M SCI [2] | Inclut les SCI dormantes non radiées, source privée | Interroger Sirene (catégorie 6540) soi-même si le chiffre doit apparaître sur un support |
| 20 684 cartes CCI [10] | Page primaire inaccessible (403) ; cartes « traitées » et non stock | Vérifier sur cci.fr |
| 13,8 % contre 29,3 % de passoires dans le parc locatif privé [4] | Deux taux sur la même page SDES sans assiette explicite | Lire le rapport SDES complet |
| Matterport [41] | Prix divergents selon les agrégateurs et refonte de la grille en oct. 2026 | Consulter matterport.com/plans |
| Prix par lot des progiciels [8] | Source commerciale (agence qui vend du sur-mesure) | Demander des devis à Septeo, Orisha et Seiitra |
| Absence de concurrent « 3D + statut locatif + alertes » | Absence de résultat, pas preuve d'absence | Démos éditeurs et veille proptech |
| Qonto x OpinionWay, 13 h/semaine [13] | Seul le titre a été consulté | Lire l'étude originale avant de la citer au stand |
| Composition des clubs d'affaires | Aucune statistique publique trouvée | Demander la liste des membres et métiers à l'animateur du club |
| Diag Data IA [52] | Taux de 50 % puis 40 %, conditions d'habilitation | Vérifier sur le site de Bpifrance |

---

## Sources

1. OPCO EP, *Panorama de branche Immobilier, édition 2025* (URSSAF 2025 / masse salariale 2024 ; INSEE BTS 2022) : https://www.opcoep.fr/ressources/centre-ressources/branches/immobilier/panorama-immobilier-2025-opcoep.pdf
2. Scalon, nombre de SCI actives dans Sirene au 1er sept. 2026 (publié le 15 oct. 2026) : https://scalon.fr/en/blog/sci-naf-code
3. Galian-SMABTP x Viavoice, *Regards croisés ADB / bailleurs*, juin 2026 : communiqué https://api-minio.galian.fr/galianfr/s3fs-public/2026-06/communique-de-presse-etude-galian-smabtp-x-viavoice.pdf ; étude https://api-minio.galian.fr/galianfr/s3fs-public/2026-06/enquete-galian-smabtp-x-viavoice-regards-croises-adb-bailleurs-2026.pdf ; synthèse Monimmeuble (29 juin 2026) https://monimmeuble.com/?p=107763
4. SDES, *Le parc de logements par classe de performance énergétique au 1er janvier 2025* : https://www.statistiques.developpement-durable.gouv.fr/le-parc-de-logements-par-classe-de-performance-energetique-au-1er-janvier-2025
5. Calendrier d'interdiction de location G 2025, F 2028, E 2034 (loi Climat et résilience) : Selectra https://selectra.info/energie/actualites/marche/passoires-thermiques-calendrier-interdiction-location ; ministère https://www.ecologie.gouv.fr/presse/logements-classes-dpe-g-regles-evoluent-1er-janvier-gouvernement-continue-proteger
6. Xerfi, *Le marché des administrateurs de biens* : https://www.xerfi.com/presentationetude/le-marche-des-administrateurs-de-biens_BAT35
7. La Fabrique du Net, logiciels de comptabilité immobilière (Septeo SPI/ICS, Orisha Crypto/Gercop, Seiitra) : https://www.lafabriquedunet.fr/logiciels/gestion/comptabilite/comptabilite-immobilier ; https://www.lafabriquedunet.fr/logiciel/ics-immo ; https://www.lafabriquedunet.fr/logiciel/crypto-immo ; https://www.lafabriquedunet.fr/logiciel/gercop
8. Kolonell (agence, source commerciale), prix par lot des progiciels de gestion locative, 2026 : https://kolonell.com/fr/blog/meilleur-logiciel-gestion-locative-administrateur-biens-marseille-2026 ; https://kolonell.com/fr/blog/logiciel-gestion-locative-administrateur-biens-bordeaux-2026
9. Logiciels de gestion locative pour particuliers et SCI (Rentila, BailFacile) : https://www.gererseul.com/comparatif/gererseul-vs-bailfacile/ ; https://bailfacile.fr/logiciel-gestion-locative/rentila-avis ; https://investissement-locatif-avis.fr/meilleurs-logiciels-gestion-locative-2026/
10. CCI France, fichier des professionnels de l'immobilier (20 684 cartes traitées en 2024 ; page en 403 lors de la consultation) : https://www.cci.fr/ressources/formalites-en-ligne/fichier-des-professionnels-de-limmobilier ; relais : https://www.createuragenceimmobiliere.com/creer-mon-agence/obtenir-une-carte-professionnelle-dagent-immobilier
11. CAPEB, communiqué du 23 déc. 2024 (620 000 entreprises artisanales, activité -5 % en 2024) : https://capeb.fr/www/capeb/media/communique-de-presse-nomination-nouveau-gouvernement-231224.pdf
12. CAPEB, baromètre ArtiSanté, 11e édition (juin 2025) : https://www.capeb.fr/actualites/publication-de-la-11e-edition-du-barometre-artisante-des-chefs-d-entreprise-du-btp-et-du-paysage-toujours-sous-pression-malgre-une-volonte-de-mieux-concilier-vie-professionnelle-et-personnelle
13. Forum Construire, Qonto x OpinionWay, mai 2026 (13 h/semaine d'administratif) : https://www.forumconstruire.com/actualites/index-cat_6.php
14. Codeur.com, comparatif des logiciels de facturation BTP (mai 2026) : https://www.codeur.com/comparatif/logiciel-facturation-btp
15. Tool-Advisor, logiciels devis-facture bâtiment 2026 : https://tool-advisor.fr/logiciel-facturation/comparatif/logiciel-devis-facture-batiment/
16. Batiweb / Altares, défaillances dans la construction en 2025 : https://www.batiweb.com/actualites/conjoncture/les-faillites-d-entreprises-battent-des-records-mais-la-construction-resiste-48087
17. Keobiz, calendrier de la facturation électronique 2026-2027 : https://www.keobiz.fr/le-mag/facturation-electronique-calendrier-2026-2027/
18. INSEE, *Parc et fréquentation des hôtels, données annuelles 2025* : https://www.insee.fr/fr/statistiques/2015412
19. FNHPA, dossier de presse 2026 (7 637 campings ; étude Asterès 2026) : https://fnhpa-pro.fr/wp-content/uploads/2026/04/FNHPA-Dossier-de-presse-2026_Final.pdf
20. Part des hôtels indépendants (Coach Omnium et autres, sources divergentes) : https://m.lhotellerie-restauration.fr/actualite/theme/coachomnium ; https://propulsebyca.fr/idees-business/hotellerie/marche-hotellerie
    - 20b. CCI Paris Île-de-France, chiffres clés du tourisme (INSEE, 1er janv. 2026) : https://www.cci-paris-idf.fr/sites/default/files/2026-10/Tourisme.pdf
21. PMS hôteliers : https://www.lafabriquedunet.fr/logiciel/mews ; https://www.lafabriquedunet.fr/logiciel/medialog ; https://hoteltechreport.com/compare/medialog-vs-mews
22. Logiciels de camping et plans interactifs : https://touchstay.com/fr/blog/meilleur-logiciel-gestion-campings ; https://anolla.com/fr/logiciel-de-gestion-de-camping ; https://anny.co/en/solutions/campground-booking-system ; https://www.tendancehotellerie.fr/mot/ctoutvert
23. AKTO, *Monographie HCR 2023, national* (données 2019) : https://observatoire.akto.fr/content/uploads/sites/3/2024/02/Monographie-HR-2023-National.pdf
24. Food Service Vision, *Revue Chaînes 2025* (données 2024), relayée par Franchise Magazine : https://www.franchise-magazine.com/news-franchise/enquete-chaines-restauration-rapide-juin-2025
25. Gira, part des indépendants, relayé par Independant.io : https://independant.io/le-chiffre-daffaires-des-restaurateurs-independants-en-augmentation-de-15-vs-2019/
26. Défaillances HCR 2025 : UMIH, *L'Essentiel* n° 35 (février 2026) https://www.umih.fr/assets/files/site/medias/l-essentiel-nous-chrd/2026_fevrier_L_Essentiel_n_35.pdf ; GHR, observatoire (février 2026) https://cdn.ghr.fr/IMG/pdf/observatoire_ghr_bilan22025_fev2026.pdf
27. Inpulse : https://www.inpulse.ai/en ; https://www.appvizer.fr/operations/gestion-de-stock/inpulse
28. SDES, surface des entrepôts de 10 000 m² ou plus en 2024 : https://www.statistiques.developpement-durable.gouv.fr/la-surface-des-entrepots-et-plateformes-logistiques-de-10-000-m2-ou-plus-en-hausse-de-23-en-2024
29. INSEE, fiche sectorielle Ésane 5210B (2016) : https://www.insee.fr/fr/statistiques/4497660
30. France Logistique, livre blanc 2022 : https://www.ort.bourgogne-franche-comte.developpement-durable.gouv.fr/IMG/pdf/2022-02-08_france-logistique-tetl-pour-france-performante-livre-blanc.pdf
31. Prix des WMS : https://www.lafabriquedunet.fr/logiciel/easy-mecalux-wms ; https://www.getapp.fr/software/2051916/generix-wms
32. BNI France (règle d'un métier par groupe, profil des membres) : https://www.creerentreprise.fr/reseau-affaires-bni-avis-et-conseils/ ; https://www.plateya.fr/blog/detail/avis-bni-le-vrai-cout-et-pourquoi-ne-pas-y-aller-2026
33. CSTB, *Du BIM-GEM au jumeau numérique* : https://www.cstb.fr/getmedia/a7aa705c-d66c-4a73-a409-371f81b8830d/CSTB-bim-gem-jumeau-numerique.pdf
34. Carl Berger-Levrault, viewer BL.VIZ pour le BIM-GEM : https://www.controles-essais-mesures.fr/informatique-industrielle/bim-gem-un-nouveau-viewer-3d-adapte-aux-jumeaux-numeriques/
35. Hexabim, comparatif des solutions de jumeau numérique : https://www.hexabim.com/solutions/tag/usage/jumeau-numerique ; https://www.hexabim.com/guides-solutions-bim/pilotez-jumeau-numerique-operationnel-outils-bim
36. Guyenne Études, tarifs du jumeau numérique d'un bâtiment existant (2026) : https://www.guyenne-etudes.fr/jumeau-numerique/
37. Habitat 76 et Abyla (Labeo) : https://www.solutions-numeriques.com/?p=22637
38. SpinalTwin / Spinalcom (agrégateur GetApp) : https://www.getapp.com/operations-management-software/a/spinalbim-suite/
39. Bisnow, coût du jumeau numérique pour les petites et moyennes sociétés immobilières : https://www.bisnow.com/news/houston/technology/one-is-a-lonely-number-is-it-time-to-get-your-building-a-digital-twin-104742
40. Yardi, livre blanc sur les jumeaux numériques : https://resources.yardi.com/documents/digital-twins-harnessing-the-power-of-spatial-visualization-data-white-paper
41. Prix Matterport (agrégateurs, 2026) : https://pricingsaas.com/companies/matterport ; https://pricingsaas.com/companies/matterport/diffs/2026W42 ; https://toolradar.com/tools/matterport/pricing ; page officielle (non lisible) https://matterport.com/plans
42. Habiteo : rachat par Bien'ici en juin 2022 https://www.mysweetimmo.com/2022/06/08/bienici-rachete-habiteo-le-specialiste-de-la-3d-dans-limmobilier/ ; 147 promoteurs clients en 2016 https://www.maddyness.com/2016/06/15/immobilier-habiteo-leve-3-millions-deuros-developper-systeme-de-modelisation-3d-de-biens-immobiliers/
43. Maverickframe, sélecteur de logements 3D : https://maverickframe.com/fr/services/selecteur-de-logements/
44. Blog du Modérateur, étude Morgan Philips Freelance « TJM IT 2025/2026 » (14 oct. 2025) : https://www.blogdumoderateur.com/freelances-taux-journaliers-moyens-it-france-2025/
45. Kicklox / Groupe Didaxis, *Étude TJM freelances tech 2025* : https://www.kicklox.com/wp-content/uploads/2025/10/KICKLOX-GROUPE-DIDAXIS-Etude-2025-TJM-freelances-tech_compressed.pdf
46. La Fabrique du Net, TJM des développeurs freelances en 2026 : https://www.lafabriquedunet.fr/tarifs-des-developpeurs-freelances-dans-les-grandes-villes-de-france/
47. Freelance-solution.fr, TJM développeur web 2026 : https://www.freelance-solution.fr/tarif-freelance/tjm-developpeur-web/
48. Régie Portage, évolution des TJM IT (citant Malt) : https://www.regie-portage.fr/blog/freelance/evolution-tjm-it-tech/
49. Fenxi (agence), prix d'une application sur mesure pour PME (déc. 2025, mise à jour 31 oct. 2026) : https://fenxi.fr/blog/prix-application-sur-mesure-pme/
50. Kolonell (agence, source commerciale), MVP, TMA et cadrage, 2026 : https://kolonell.com/fr/blog/prix-plateforme-metier-sur-mesure-mvp-startup-toulouse-2026 ; https://kolonell.com/fr/blog/tma-maintenance-annuelle-application-sur-mesure-2026 ; https://kolonell.com/fr/blog/atelier-cadrage-product-discovery-prix-2026
51. Context Studios, ateliers à prix fixe : https://www.contextstudios.ai/fr/services/ai-workshop.md
52. Bpifrance, Diag Data IA : https://les-aides.fr/aide/aVkf3w/bpifrance.diagnostic-data-intelligence-artificielle.pdf ; https://www.lemondeinformatique.fr/actualites/lire-le-gouvernement-presente-son-plan-osez-l-ia-dans-les-entreprises-97309.html ; https://www.actuia.com/acteur/nicolas-dufourcq/
