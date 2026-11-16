# 04 — Rendu 3D web « jeu vidéo » : état de l'art (novembre 2026)

Périmètre : démo diorama auto-école (bâtiment, voitures type Peugeot 208, moniteurs, élèves) en Three.js r187 + React Three Fiber v9, cible PC portable moyen et téléphone récent.
Date de la recherche : 16 novembre 2026.

Niveaux de preuve utilisés dans ce document :

| Marque | Signification |
|---|---|
| **[V]** | Vérifié aujourd'hui sur source primaire (registre npm/PyPI, code source three.js r187, doc officielle, dépôt GitHub) |
| **[S]** | Source secondaire (blog, forum, article de presse) — plausible, non recoupé sur source primaire |
| **[M]** | Connaissance générale non revérifiée aujourd'hui |
| **[NV]** | Non vérifié / introuvable |

État du projet constaté dans `demo/package.json` : `three ^0.187.0`, `@react-three/fiber ^9.8.2`, `@react-three/drei ^10.7.9`. Ce sont les dernières versions stables de chacun [V].

---

## 0. Synthèse décisionnelle

| Question | Verdict |
|---|---|
| WebGPU ou WebGL pour cette démo ? | **WebGLRenderer + pmndrs/postprocessing** comme chemin de production aujourd'hui. WebGPURenderer + TSL seulement si l'on veut SSGI/TRAA dynamiques et qu'on accepte de se passer des composants drei à shaders. |
| pmndrs/postprocessing avec WebGPU ? | **Non.** Bibliothèque WebGL uniquement (GLSL + `ShaderMaterial`, non supportés par `WebGPURenderer`). |
| Ce qui donne le « look jeu » | Direction artistique et éclairage (HDRI, lightmaps bakées, AO, grade, tilt-shift), pas l'API graphique. Tout cela existe en WebGL. |
| Unity Web ou Three.js ? | **Three.js** pour une démo partageable par lien (poids, temps de chargement, mobile, intégration React). |
| Unreal vers le web ? | Pas d'export officiel UE5 ; uniquement Pixel Streaming (serveur GPU par session) ou outils tiers. Hors sujet ici. |

---

## 1. WebGPURenderer + TSL en 2026

### 1.1 Versions et statut

| Élément | Fait | Preuve |
|---|---|---|
| three.js | r187 publiée le 30 octobre 2026 (r186 : 24 sept., r185 : 1er juil., r184 : 16 avr.) | [V] npm + GitHub releases |
| Statut officiel de WebGPURenderer | Le manuel dit textuellement : « The renderer itself is still in an experimental state although its maturity level has been greatly improved in the last years » | [V] manuel three.js |
| WebGLRenderer | Toujours maintenu, « the recommended choice for pure WebGL 2 applications » ; plus de nouvelles fonctionnalités majeures prévues | [V] manuel |
| Non supportés par WebGPURenderer | `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile()`, `EffectComposer` et ses passes : à porter en node materials / TSL | [V] manuel |
| Repli WebGL2 | Automatique si WebGPU absent ; forçable avec `forceWebGL: true` | [V] manuel |
| Initialisation | Asynchrone : `setAnimationLoop()` ou `await renderer.init()` ; `renderAsync()` déprécié depuis r181 | [V] manuel + guide de migration |
| Post-traitement | Classe `PostProcessing` renommée `RenderPipeline` en r183 | [V] guide de migration + exemples r187 |
| Instabilité d'API | Chaque version r179 à r187 contient des changements cassants sur les nœuds de post-traitement (TRAA r179, DOF r180, GTAO r181/r185/r186, SSR r183/r185, PCFSoftShadowMap retiré r186, PMREM refait r187) | [V] guide de migration |

Conclusion : utilisable en production (des sites primés le font, voir section 4), mais **épingler la version exacte de three** et prévoir du temps à chaque montée de version.

### 1.2 React Three Fiber

| Élément | Fait | Preuve |
|---|---|---|
| R3F stable | 9.8.2 (octobre 2026), peer `react >=19 <19.4`, `three >=0.156` | [V] npm |
| Support WebGPU en v9 | Oui : la prop `gl` accepte un callback asynchrone ; import depuis `three/webgpu` ; `extend(THREE)` pour exposer les node materials en JSX | [V] guide de migration v9 |
| R3F v10 | Alpha uniquement (10.0.0-alpha.6, 17 oct. 2026). WebGPURenderer y devient le défaut ; GLSL passe par `@react-three/fiber/legacy` ; hooks TSL déplacés dans `@react-three/tsl` ; `useRenderPipeline` remplace `usePostProcessing` | [V] notes de version GitHub |

Patron v9 (issu du guide de migration officiel) :

```tsx
import * as THREE from 'three/webgpu'
import { Canvas, extend, type ThreeToJSXElements } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}
extend(THREE as any)

<Canvas
  gl={async (props) => {
    const renderer = new THREE.WebGPURenderer(props as any)
    await renderer.init()
    return renderer
  }}
/>
```

### 1.3 drei et postprocessing

| Paquet | Version stable | Compatibilité WebGPURenderer | Preuve |
|---|---|---|---|
| `@react-three/drei` | 10.7.9 (25 sept. 2026), peer R3F `^9` | **Partielle.** Les helpers sans shader (OrbitControls, useGLTF, Html, Environment) fonctionnent ; les composants à `ShaderMaterial` ne fonctionnent pas. | [V] npm, [S] forum |
| drei v11 | 11.0.0-alpha.7 (5 sept. 2026) : entrée `/webgpu`, portage TSL en cours (BlurPass, BakeShadows), cible R3F v10 alpha + three 0.185 | Encore alpha ; tickets ouverts : `MeshDiscardMaterial` sans implémentation WebGPU (#2660), BakeShadows (#2665), 16 stories « WebGL-only » (#2843) | [V] GitHub drei |
| Composants drei signalés cassés sous WebGPU | `ContactShadows` (pas de version TSL, fil sans réponse), `MeshTransmissionMaterial`, `Stars` (corrigé en v11 alpha) | [V] forum three.js + tickets |
| `postprocessing` (pmndrs) | 6.39.6 (1er nov. 2026), peer `three >=0.168 <0.188` ; v7 toujours en bêta (7.0.0-beta.16) | **Non compatible.** Feuille de route v7 : « WebGPU is not widely available yet, so it's not the focus right now » (mainteneur, 2023) ; tickets « Does it support WebGPU? » fermés en doublon (#690, #700) | [V] npm + GitHub |
| `@react-three/postprocessing` | 3.2.2 (21 oct. 2026), peer `postprocessing ^6.36`, R3F `>=9.7` | Non compatible (enveloppe de la précédente) | [V] npm |
| `n8ao` | 2.1.0 (15 nov. 2026) | WebGL uniquement (peer `postprocessing`) | [V] npm |

Attention : la contrainte `three < 0.188` de `postprocessing` signifie que la chaîne WebGL cassera à l'installation dès r188 tant que la bibliothèque n'aura pas publié de mise à jour.

### 1.4 Part de navigateurs WebGPU (caniuse, données brutes lues le 16/11/2026)

| Navigateur | Support | Note |
|---|---|---|
| Global | **86,8 % complet + 3,3 % partiel** | [V] |
| Chrome / Edge desktop | Oui depuis 113 | Linux : dépend du matériel et des pilotes |
| Chrome Android | Oui (157) | Android 12+ et GPU Qualcomm/ARM selon web.dev [S] |
| Safari iOS | Oui depuis 26.0 | |
| Safari macOS | Partiel depuis 26.0 | Activé par défaut seulement sur macOS 26 Tahoe ou plus |
| Firefox desktop | Partiel | Windows (depuis 141) et macOS 26 sur Apple Silicon (depuis 145) ; pas Linux |
| Firefox Android | Non (derrière flag) | |
| Samsung Internet | Oui depuis 24 | |

Donc environ 10 à 13 % des visiteurs passent par le repli WebGL2.

### 1.5 Qualité du repli WebGL2 et performance

| Constat | Preuve |
|---|---|
| Le repli est fonctionnel (TSL compilé en GLSL), mais les effets à compute shaders n'ont pas d'équivalent | [V] manuel, [S] |
| Scènes à nombreux meshes : WebGPURenderer mesuré environ 2x plus lent côté CPU et 5 à 10x plus lent à la première image que WebGLRenderer en r183 (4 000 meshes : 4,5 ms contre 9,7 ms ; première image 32 ms contre 167 ms, et 344 ms avec `forceWebGL`). Même écart sur les deux backends. Mesure d'un utilisateur, sans réponse de mainteneur trouvée. | [S] forum, mai 2026 |
| Cause identifiée par un mainteneur en 2025 : un UBO par objet, beaucoup de bind groups ; ticket #30560 | [S] forum + GitHub |
| Remède : instancing, `BatchedMesh`, fusion de géométries (le pipeline gltf-transform le fait) | [S] |

Pour un diorama à quelques dizaines de draw calls, ce surcoût CPU est négligeable. Le temps de première image (compilation des pipelines) reste à mesurer sur téléphone [NV].

---

## 2. Post-traitement natif TSL (`three/addons/tsl/display`)

Fichiers présents en r187 [V] : `BloomNode`, `DepthOfFieldNode`, `GTAONode`, `SSAONode`, `SSGINode`, `SSRNode`, `SSSNode`, `TRAANode`, `TAAUNode`, `FSR1Node`, `FXAANode`, `SMAANode`, `SSAAPassNode`, `Lut3DNode`, `MotionBlur`, `FilmNode`, `ChromaticAberrationNode`, `GodraysNode`, `LensflareNode`, `OutlineNode`, `DenoiseNode`, `RecurrentDenoiseNode`, `GaussianBlurNode`, `BilateralBlurNode`, `SharpenNode`, `AfterImageNode`, `BleachBypass`, `Sepia`, `CRT`, `boxBlur`, `hashBlur`, `radialBlur`, `depthAwareBlur`, `lensDirt`, `TemporalReprojectNode`.
**Il n'existe pas de nœud tilt-shift** (`TiltShift.js` : 404) : à composer soi-même (flou gaussien mélangé selon `screenUV.y`, ou DOF avec distance de mise au point sur le plan du diorama).

| Effet | Utilisable en prod ? | Coût | Pièges vérifiés |
|---|---|---|---|
| **Bloom** | Oui | Faible (demi-résolution par défaut, 5 mips) | Bloom sélectif via MRT `emissive` (exemple officiel `webgpu_postprocessing_bloom_emissive`) [V] |
| **LUT 3D** | Oui | Très faible | À appliquer après tone mapping : l'exemple désactive la transformation de sortie par défaut et utilise `renderOutput` [V] |
| **FXAA / SMAA** | Oui | Faible | Alternative à TRAA quand on n'a pas de bruit temporel à résoudre |
| **Film grain, aberration chromatique, vignette** | Oui | Très faible | |
| **DOF** | Oui | Moyen | Nouvelle implémentation et nouvelle API depuis r180 ; désactivé sur mobile par Bruno Simon [V] |
| **GTAO** | Oui | Moyen | Doc : `resolutionScale` 0,5 « should be sufficient for most scenes » ; 16 échantillons par défaut ; bruité, donc nécessite TRAA (`useTemporalFiltering`) ou `DenoiseNode`. Rendu changé en r185 (plus sombre et plus large) et paramètres dépréciés en r186 [V] |
| **SSAO** | Oui | Faible à moyen | Auto-débruité : pas besoin de TRAA, compatible MSAA (commentaire de l'exemple officiel) [V] |
| **TRAA** | Oui avec réserves | Moyen | « MSAA must be disabled when TRAA is in use » ; exige un MRT `velocity` ; ghosting en mouvement (ticket #31892 ouvert sur l'exemple SSGI) ; `useSubpixelCorrection` peut créer un motif en carrés [V] |
| **TAAU** | Récent | Moyen | Anti-aliasing + upscaling en une passe ; MSAA interdit [V] |
| **SSGI** | Avec prudence | **Élevé** | Coût = `sliceCount * stepCount * 2` échantillons par pixel. L'exemple officiel commente `setPixelRatio(devicePixelRatio)` avec « probably too costly for most hardware ». `resolutionScale` 0,5 augmente nettement le bruit : la doc recommande de baisser d'abord le pixel ratio du renderer [V] |
| **SSR** | Avec prudence | **Élevé** | API changée en r183 et r185 ; `quality` « as low as possible » ; `environmentNode` incompatible avec PMREM / `scene.environment` ; mode stochastique exige un débruiteur. Un mainteneur rapportait 4 FPS en pleine résolution sur M2 Pro mi-2025 [V] doc, [S] PR |
| **Motion blur** | Oui | Moyen | Exige le MRT `velocity` |

### Piège SSGI + TRAA (le plus important)

1. SSGI avec filtrage temporel (défaut) **exige** TRAA ; sans TRAA il faut un `DenoiseNode` [V].
2. TRAA interdit le MSAA : il faut `samples = 0` sur la passe de scène [V].
3. TRAA produit du ghosting sur les objets en mouvement (les voitures qui roulent), ticket ouvert [V].
4. Le MRT nécessaire (output, diffuseColor, normal, velocity) coûte en bande passante mémoire ; l'exemple officiel passe diffuse et normales en `UnsignedByteType` pour limiter [V].
5. Le site threejs.paris a dû « tune the SSGI aggressively » et ajouter un système de qualité adaptative par appareil [S].

Pour un diorama dont le décor est statique, des lightmaps bakées donnent un meilleur résultat que SSGI pour un coût d'exécution nul.

---

## 3. Techniques « look jeu vidéo », classées par rapport impact / coût

Les noms d'exemples three.js cités existent dans `examples/files.json` de r187 [V]. URL : `https://threejs.org/examples/#<nom>`.

| # | Technique | Impact | Coût runtime | Recommandation pour le diorama | Références |
|---|---|---|---|---|---|
| 1 | **HDRI + tone mapping + exposition** | Très fort | Nul | HDRI Poly Haven (CC0) en `scene.environment`. **AgX** pour un rendu filmique sans dérive de teinte ; **Neutral** (Khronos) si les couleurs de marque doivent rester fidèles ; ACES sature et décale les teintes. Une scène éclairée pour ACES ne s'améliore pas en changeant seulement l'opérateur. | Forum « Tone Mapping Overview » ; modelviewer.dev/examples/tone-mapping ; `webgpu_materials_envmaps_groundprojected` |
| 2 | **Lightmaps / AO bakées dans Blender** | Très fort | Nul | Bâtiment, sol, trottoirs : bake Cycles, seconde UV. glTF n'a pas de slot lightmap (seulement occlusion) : soit bake dans la couleur de base, soit texture séparée avec `texture.channel = 1` et `flipY = false`. | `webgpu_materials_lightmap` ; `webgpu_lightmap_baking` ; forum « Apply UV coordinates and lightmaps baked from Blender » ; tchayen « Baked lighting in r3f » |
| 3 | **Une ombre directionnelle douce bien cadrée + ombres de contact** | Fort | Faible à moyen | Diorama = frustum d'ombre serré, donc **pas besoin de CSM**. `PCFShadowMap` est doux par défaut depuis r182/r186. Sous les voitures : plan d'AO baké en multiply (méthode de l'exemple Ferrari officiel). | `webgl_materials_car` ; `webgpu_shadow_contact` ; `webgpu_shadowmap_csm` (`CSMShadowNode`) et `webgpu_lights_sunlight` (addon `SunLight`, 2 cascades par défaut depuis r186) si la scène grandit ; Sundial (ombres virtuelles paginées, MIT) |
| 4 | **AO écran** | Fort | Moyen | WebGL : N8AO. TSL : GTAO à demi-résolution + TRAA, ou SSAO + MSAA sur mobile. | `webgpu_postprocessing_ao` ; github.com/N8python/n8ao |
| 5 | **Tilt-shift / DOF** | Fort (effet maquette) | Moyen | Signature visuelle d'un diorama. WebGL : effet TiltShift de pmndrs [M]. TSL : à composer. À couper sur mobile. | `webgpu_postprocessing_dof`, `webgpu_postprocessing_dof_basic` |
| 6 | **Color grading LUT + vignette + grain léger** | Fort | Très faible | Une LUT `.cube` 32 ou 64 donne l'identité visuelle. | `webgpu_postprocessing_3dlut` (`Lut3DNode`, `LUTCubeLoader`) |
| 7 | **Peinture carrosserie** | Fort (les voitures sont le sujet) | Faible | `MeshPhysicalMaterial` : `metalness 1, roughness 0.5, clearcoat 1, clearcoatRoughness 0.03` (valeurs de l'exemple officiel). Paillettes : `FlakesTexture` en normal map. | `webgl_materials_car` ; `webgpu_clearcoat` |
| 8 | **Bloom sélectif (émissif)** | Moyen à fort | Faible | Phares, feux stop, clignotants, enseigne, fenêtres de nuit. MRT `emissive` en TSL ; seuil de luminance en WebGL. | `webgpu_postprocessing_bloom_emissive`, `webgpu_postprocessing_bloom_selective` |
| 9 | **Végétation instanciée + vent en vertex shader** | Moyen | Faible | Bruno Simon : brins d'herbe d'un seul triangle (environ 78 400, une seule géométrie), feuillages en plans face caméra avec texture SDF, instancing des arbres. | Étude de cas Awwwards du folio 2025 ; Codrops « How to make the fluffiest grass » (fév. 2025) ; `webgpu_instance_mesh` ; forum « Three.js Grassworks » |
| 10 | **Brouillard de hauteur** | Moyen | Très faible | `scene.fogNode = fog(color, exponentialHeightFogFactor(density, height))` en TSL. Fond de scène et profondeur. | `webgpu_fog_height`, `webgpu_custom_fog_scattering`, `webgpu_postprocessing_fog` |
| 11 | **Mode nuit : fenêtres éclairées, phares** | Fort en démo | Faible à moyen | Fenêtres en émissif + bloom ; lampadaires en lumières ponctuelles sans ombre. Lumières nombreuses : éclairage en clusters (WebGPU). | `webgpu_lights_clustered_city` ; `webgpu_lights_ies_spotlight` |
| 12 | **Vitres** | Moyen | **Élevé si `transmission`** | Préférer verre teinté en alpha + envMap. `transmission` impose une passe de rendu supplémentaire de la scène [M]. | `webgpu_materials_transmission`, `webgpu_loader_gltf_transmission`, `webgpu_backdrop` |
| 13 | **Route mouillée / reflets** | Moyen | Élevé | Réflecteur planaire flouté à résolution réduite plutôt que SSR. En WebGL : `MeshReflectorMaterial` de drei [M]. | `webgpu_reflection_roughness`, `webgpu_reflection_blurred`, `webgpu_postprocessing_ssr` |
| 14 | **Personnages animés en nombre** | Moyen | Moyen | Skinning instancié. | `webgpu_skinning_instancing` |
| 15 | **Eau** | Faible ici | Moyen | Seulement si une fontaine ou une flaque sert la composition. | `webgpu_backdrop_water`, `webgpu_water`, `webgpu_ocean` |
| 16 | **SSGI / SSR temps réel** | Fort sur desktop | Très élevé | À réserver à un préréglage « ultra » desktop. | `webgpu_postprocessing_ssgi`, `webgpu_postprocessing_ssr_denoise` |

Options d'ombres non retenues par défaut : PCSS (`SoftShadows` de drei, WebGL, ajusté en 10.7.9 pour les three récents [V]) ; ombres accumulées (`webgpu_shadowmap_progressive`).

---

## 4. Références de sites et démos (2024-2026)

| # | Projet | Ce qui est remarquable techniquement | Code | Preuve |
|---|---|---|---|---|
| 1 | **Folio 2025 de Bruno Simon** — bruno-simon.com | Monde ouvert conduisible ; shaders TSL, WebGPU avec repli automatique ; herbe en triangles uniques, feuillages SDF, cycle météo synchronisé ; préréglage mobile automatique (DOF et flou d'eau coupés, ombres réduites) ; textures ETC1S/UASTC, Draco, palette de couleurs par UV. Environ 2 000 étoiles. | **Ouvert, MIT** : github.com/brunosimon/folio-2025 | [V] dépôt + étude de cas Awwwards (11 mars 2026). Prix : « Site of the Month » janvier 2026 [S, à confirmer] |
| 2 | **Exemples officiels three.js** — `webgpu_postprocessing_ssgi`, `webgpu_lights_clustered_city`, `webgpu_lights_sunlight`, `webgl_materials_car` | Référence de câblage exacte pour chaque effet en r187 | **Ouvert, MIT** | [V] |
| 3 | **threejs.paris** (Makio64 + Hervé Studio) | WebGPURenderer + SSGI en production, réglé agressivement, système de performance adaptatif | [NV] | [S] Codrops, 28 fév. 2026 (page non lue : 403) |
| 4 | **False Earth** | Paysage procédural infini, compute shaders et draws indirects, millions de brins d'herbe interactifs | [NV] | [S] Codrops, 21 avr. 2026 (403) |
| 5 | **Messenger** (Abeto) — messenger.abeto.co | Jeu complet sur mini-planète, three.js WebGL + three-mesh-bvh, atlas de couleurs 16x16 pour tout le jeu (changement d'ambiance global), assets découpés et compressés pour mobile, multijoueur à 10 par salle | Fermé | [V] étude de cas Awwwards (15 janv. 2026). Prix [NV] |
| 6 | **Interactive 3D with BatchedMesh and WebGPURenderer** (Codrops, 30 oct. 2024) | Ville de blocs en `BatchedMesh` + AO + DOF en TSL | Lien GitHub annoncé dans l'article [NV] | [S] (403) |
| 7 | **IVRESS** (Utsubo) — brand.ivress.co.jp | WebGPURenderer avec repli WebGL, shaders TSL compilés pour les deux backends ; FWA Site of the Month mai 2026 | Fermé | [S] auto-déclaré par le studio |
| 8 | **Oryzo** (Lusion) — oryzo.ai | Rendu produit 3D, Awwwards Site of the Month avril 2026 | Fermé | [S] |
| 9 | **three-geospatial** (Takram) | Atmosphère et nuages physiques ; compatible R3F v9 + `@react-three/postprocessing` (peer deps vérifiées), chemin WebGPU en cours | **Ouvert, MIT** | [V] npm |
| 10 | **advanced-threejs-tsl-webgpu-rendering** (Makio64) | Guide d'optimisation TSL/WebGPU (cache de nœuds, MRT, compute) | Ouvert (licence non affichée) | [V] dépôt |

Le plus utile à étudier pour ce projet : le n° 1 (même problème : voitures + décor stylisé + mobile, code complet) et le n° 5 pour la discipline d'assets.

---

## 5. Pipeline d'assets

### 5.1 gltf-transform (CLI 4.5.1, options lues dans `optimize -h` [V])

| Option | Défaut | Remarque |
|---|---|---|
| `--compress` | `meshopt` | Alternatives : `draco`, `quantize`. Meshopt compresse aussi les animations et décode vite ; à servir en brotli/gzip. Draco donne des fichiers un peu plus petits [S]. |
| `--texture-compress` | `auto` | `ktx2` optimise la VRAM, `webp`/`avif` seulement le transfert (décompressés en RGBA en mémoire GPU). |
| `--texture-size` | 2048 | 1024 suffit pour un diorama ; 512 pour les props. |
| `--simplify` | `true`, erreur 0.0001 | Décimation meshoptimizer légère par défaut. |
| `--flatten`, `--join`, `--join-named` | tous `true` | **Piège : fusionne les nœuds nommés.** Les roues, portières et volant d'une voiture seront soudés à la caisse. Pour tout modèle animé par nœuds : `--join false` (ou au minimum `--join-named false`) et `--flatten false`. |
| `--instance` | `true`, minimum 5 | Génère `EXT_mesh_gpu_instancing`. |
| `--palette` | `true`, minimum 5 | Fusionne les matériaux unis en texture palette (même idée que Bruno Simon et Abeto). |

Commandes types :

```bash
# Décor statique : tout fusionner
gltf-transform optimize decor.glb decor.opt.glb --compress meshopt --texture-compress ktx2 --texture-size 1024

# Voiture avec roues animées : préserver la hiérarchie
gltf-transform optimize 208.glb 208.opt.glb --compress meshopt --texture-compress ktx2 \
  --texture-size 1024 --flatten false --join false --simplify-error 0.001

# Diagnostic avant tout
gltf-transform inspect 208.glb
```

Notes :
- KTX2 : UASTC pour normales et ORM, ETC1S pour la couleur [S]. Bruno Simon utilise ETC1S qualité 255 via glTF-Transform et `toktx` [V]. Les commandes `etc1s`/`uastc` nécessitent KTX-Software installé [M].
- Faire de la compression la dernière étape de la chaîne [S].
- Côté chargement : `GLTFLoader.setMeshoptDecoder`, `setKTX2Loader` ; avec WebGPURenderer, appeler `ktx2Loader.detectSupport(renderer)` après `await renderer.init()` (r181) [V].
- Ni `ktx`, ni `toktx`, ni `blender` ne sont installés sur la machine de travail actuelle [V].

### 5.2 Budgets (ordres de grandeur)

Aucune source normative n'existe ; les seuils ci-dessous croisent des guides secondaires [S] et les pratiques des projets de la section 4. À valider par mesure (`renderer.info.render.calls` et `.triangles`).

| Poste | Téléphone récent | PC portable moyen (iGPU) |
|---|---|---|
| Draw calls par image | 100 à 150 max | 300 à 500 max |
| Triangles à l'écran | 300 000 à 500 000 | 1 à 2 millions |
| Voiture « héros » | 20 000 à 40 000 triangles | 60 000 à 100 000 triangles |
| Voiture de trafic | 5 000 à 15 000 | 15 000 à 30 000 |
| Personnage | 5 000 à 13 000 (Quaternius : environ 13 000 [V]) | idem |
| Textures | 1024 max, KTX2 | 2048 max pour les héros, KTX2 |
| Pixel ratio | plafonné à 1,5 | plafonné à 1,5 ou 2 |
| Ombres | 1 lumière, 1024 | 1 lumière, 2048 |
| Poids initial transféré | 5 à 8 Mo | 10 à 15 Mo |
| Poids total | moins de 25 Mo | moins de 40 Mo |

Un modèle de voiture « réaliste » Sketchfab fait couramment 300 000 à 1 000 000 de triangles et 20 à 50 matériaux : décimation et fusion de matériaux obligatoires.

### 5.3 Sources de modèles

| Source | Contenu | Licence | Compte requis | Preuve |
|---|---|---|---|---|
| **Poly Haven** | HDRI, textures PBR, quelques modèles | CC0, sans attribution | Non mentionné sur la page licence ; API publique `api.polyhaven.com` | [V] |
| **Kenney** (City Kit Commercial/Suburban/Roads/Industrial, Car Kit v3.1) | Bâtiments, routes, voitures low-poly | CC0 | Téléchargement avec invite de don contournable, pas de compte mentionné | [V] |
| **Quaternius** (Universal Base Characters, août 2025 ; Universal Animation Library 1 et 2, 120 à 130+ animations) | Personnages rigués humanoïdes (environ 13 000 triangles), animations compatibles retargeting Mixamo | CC0 ; 60 à 70 % du pack gratuit, niveaux payants pour sources | Via le site ou itch.io | [V] site, [S] |
| **KayKit** (Kay Lousberg, City Builder Bits) | Bâtiments, routes, feux, véhicules, arbres ; OBJ/FBX/glTF | CC0, sans attribution ; gratuit 4,6 Mo, extras payants | itch.io, prix libre | [S] itch.io |
| **Mixamo** (Adobe) | Auto-rig et animations | Gratuit, usage commercial permis, redistribution des fichiers bruts interdite ; en maintenance, pas d'évolution | **Compte Adobe requis** (Enterprise ID non supporté) | [S] |
| **Sketchfab** | Voitures réalistes | Par modèle (CC-BY, CC-BY-NC, etc.) : vérifier chaque fiche | Compte requis pour télécharger [M] ; téléchargements gratuits maintenus « jusqu'à nouvel ordre » depuis le lancement de Fab (annonce d'oct. 2024, pas de date de fin trouvée) | [V] billet 2024, état nov. 2026 [NV] |
| **Ready Player Me** | — | **Service fermé le 31 janvier 2026** après rachat par Netflix (annoncé le 19 déc. 2025) : créateur d'avatars, PlayerZero et API hors ligne | — | [S] concordants |

Peugeot 208 : **aucun modèle réaliste gratuit sous CC-BY confirmé**. Le seul résultat Sketchfab trouvé (« 2024 Peugeot e208 », VeesGuy) fait 3 746 triangles avec une texture 1024 et n'affiche ni licence ni bouton de téléchargement dans la page lue [V]. Les 208 détaillées sont payantes (CGTrader, TurboSquid, RenderHub) [S]. Référence officielle de voiture réaliste libre : la Ferrari 458 de l'exemple three.js (modèle Sketchfab de vicent091036, licence à vérifier sur la fiche) [V pour l'existence]. Attention aussi au droit des marques : logo et silhouette Peugeot dans une démo commerciale.

---

## 6. Blender en ligne de commande

| Élément | Fait | Preuve |
|---|---|---|
| Version stable | **Blender 5.3**, sortie le 10 novembre 2026 ; 5.4 en alpha | [V] notes de version |
| LTS | 5.2 LTS (14 juil. 2026, support jusqu'à juil. 2028) ; 4.5 LTS (jusqu'à juil. 2027) | [V] |
| Paquet PyPI `bpy` | **5.3.0** (10 nov. 2026), `requires_python ==3.13.*` ; wheels macOS arm64 (13+), Linux x86_64 manylinux_2_28, Windows amd64 et arm64 ; environ 428 Mo | [V] PyPI |
| `bpy` LTS | 5.2.4 (Python 3.13) et 4.5.16 (Python 3.11, inclut macOS x86_64) | [V] PyPI |
| Machine de travail | Python 3.13.18 : compatible en principe avec `bpy` 5.3.0 (installation non testée) | [V] |

Pipeline headless [M pour les noms d'opérateurs, API standard non réexécutée aujourd'hui] :

```bash
blender -b scene.blend -P bake_export.py -- --out public/models/decor.glb
```

| Étape | Moyen |
|---|---|
| Seconde UV | `bpy.ops.uv.lightmap_pack` ou `smart_project` sur un calque UV dédié |
| Bake | Moteur Cycles ; `bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT','INDIRECT'})`, `type='AO'` ou `'COMBINED'` ; un nœud Image Texture actif par matériau comme cible |
| Export | `bpy.ops.export_scene.gltf(filepath=..., export_format='GLB')` ; exporter sans compression puis compresser avec gltf-transform (méthode de Bruno Simon [V]) |
| Lightmap dans glTF | Pas de slot standard. AO via `occlusionTexture`. Lightmap : texture séparée appliquée dans three (`material.lightMap`, `channel = 1`, `flipY = false`) ou bake dans la couleur de base [S] forum |
| Décimation | Modificateur Decimate dans Blender, ou `gltf-transform simplify` (plus simple à automatiser) |
| Limite | En headless sans GPU, Cycles tourne sur CPU : quelques minutes par bake 2K |

### Serveurs MCP Blender

| Serveur | Statut | Capacités | Limites et risques | Preuve |
|---|---|---|---|---|
| **ahujasid/blender-mcp** | Communautaire, MIT, 34 600 étoiles, non affilié à la Blender Foundation | 9 outils dont `execute_blender_code`, `get_scene_info`, captures de viewport, import Poly Haven / Sketchfab / Poly Pizza, génération 3D (Hyper3D, Hunyuan3D, Meshy, Tripo). Blender 3.0+, Python 3.10+, `uv` | Exécute du Python arbitraire ; socket TCP 9876 **sans authentification ni chiffrement** ; télémétrie anonyme activée par défaut (`DISABLE_TELEMETRY=true`) ; mode sûr optionnel ; exige une instance Blender ouverte avec l'add-on ; déconnexions fréquentes | [V] README |
| **Blender MCP officiel (Blender Lab)** | Fondation Blender, `projects.blender.org/lab/blender_mcp` ; v1.0.0 fin avril 2026 [S] | Add-on + serveur MCP stdio ; orienté analyse de scène, débogage, script | Mode arrière-plan partiel (requêtes synchrones seulement) ; pas de bac à sable [S] | [V] README, détails [S] |

Avis : un MCP sert à construire et inspecter une scène de façon interactive. Pour un pipeline reproductible (bake, décimation, export), un script `blender -b -P` versionné est plus fiable.

---

## 7. Unity et Unreal vers le web

| Point | Fait | Preuve |
|---|---|---|
| Unity 6.3 LTS | WebGPU : « experimental and not supported by all browsers and devices » ; WebGL2 par défaut | [V] doc Unity 6000.3 |
| Unity 6.6 (1er sept. 2026, version courante) | La mention « experimental » a disparu de la page WebGPU ; WebGL2 reste le défaut ; plusieurs médias rapportent « no longer experimental » | [V] doc 6000.6 pour l'absence de mention, [S] pour la citation |
| Limites WebGPU Unity 6.6 | Pas de résolution dynamique, pas de compute asynchrone, pas de cubemap arrays, pas de lecture GPU synchrone ; certains formats absents sur Safari et Firefox | [V] |
| Navigateurs mobiles | iOS Safari 15+ et Chrome Android 58+ listés comme supportés | [V] doc 6.3 et 6.6 |
| Threads | C# mono-thread sur le web | [V] |
| Taille de build | Projet URP vide : environ 10,7 Mo par défaut, 2 à 5 Mo après optimisation « disk size » et retrait de modules (tests communautaires 2024) | [S] |
| Mémoire | Environ 200 Mo pour un build release quasi vide (Unity 6000.0.41) | [S] forum Unity |
| Temps de chargement mobile | Aucune mesure fiable trouvée | [NV] |
| Unreal Engine 5 | Pas d'export HTML5/WebGL officiel. Voies : Pixel Streaming (serveur GPU par session) ou outils tiers WebAssembly/WebGPU (Wonder Interactive pour UE 5.6 à 5.8, SimplyStream) | [S] |

### Verdict

**Three.js pour cette démo.** Arguments :

1. **Poids et démarrage** : un bundle three + R3F pèse quelques centaines de Ko gzippés contre plusieurs Mo de runtime WebAssembly Unity avant le premier asset, plus environ 200 Mo de mémoire au repos. Sur un lien ouvert depuis un téléphone, c'est la différence entre afficher la scène tout de suite et perdre le visiteur.
2. **Intégration** : la démo vit dans une application React (interface, données métier, routage). Unity impose un canvas isolé et un pont JS/C#.
3. **Mobile** : supporté officiellement par Unity mais avec une marge mémoire faible sur iOS ; three.js laisse un contrôle fin des préréglages.
4. **Itération** : rechargement à chaud contre des builds Web Unity de plusieurs minutes.
5. **Ce qu'Unity apporterait** (éditeur, bake de lightmaps intégré, URP, animation) est remplacé ici par Blender + gltf-transform.

Unity redevient pertinent si la démo devient un vrai jeu (physique véhicule poussée, IA de trafic, nombreux niveaux) et que le chargement de 5 à 15 secondes est acceptable.

---

## 8. Recommandation d'architecture pour la refonte

| Couche | Choix | Raison |
|---|---|---|
| Renderer | `WebGLRenderer` (R3F v9 par défaut) | Écosystème drei 10 + postprocessing 6 complet et stable ; mobile sûr |
| Post-traitement | `@react-three/postprocessing` : N8AO, bloom, tilt-shift, LUT, vignette, SMAA | Chaîne fusionnée en peu de passes |
| Éclairage | HDRI Poly Haven + 1 directionnelle à ombre douce + lightmaps/AO bakées | 80 % du rendu pour un coût quasi nul |
| Matériaux | `MeshPhysicalMaterial` clearcoat pour les carrosseries, verre en alpha | Pas de `transmission` |
| Shaders custom | Les écrire le moins possible ; si nécessaire, les isoler pour un portage TSL ultérieur | Ne pas multiplier les `onBeforeCompile` non portables |
| Qualité adaptative | 3 préréglages (mobile / laptop / desktop) : pixel ratio, taille d'ombre, DOF, AO | Pratique commune aux projets de la section 4 |
| Migration WebGPU | À réévaluer quand R3F v10 et drei v11 sortent en stable | Aujourd'hui tous deux en alpha |

Si WebGPU est malgré tout retenu maintenant : R3F v9 + `three/webgpu`, `RenderPipeline` TSL (GTAO demi-résolution + TRAA + bloom émissif + LUT + DOF), aucun composant drei à shader, three épinglé à `0.187.0` exact, préréglage mobile sans TRAA ni DOF (SSAO + MSAA).

---

## 9. Ce qui n'a pas pu être vérifié

| Sujet | Limite |
|---|---|
| Articles Codrops (threejs.paris, False Earth, BatchedMesh, Garden Anomaly) | Site en 403 : seuls les extraits de recherche ont été lus ; ouverture du code non confirmée |
| Prix Awwwards/FWA du folio de Bruno Simon et de Messenger | Indices seulement (« Site of the Month » janv. 2026 pour le folio) ; pages de palmarès non lues |
| Unity 6.6 « WebGPU no longer experimental » | Citation issue de médias secondaires ; la doc officielle 6.6 ne contient simplement plus la mention |
| Taille de build et temps de chargement Unity 6.6 | Aucun benchmark 2026 ; chiffres de 2024 |
| Performance réelle de WebGPURenderer sur téléphone (première image, SSGI, TRAA) | Aucune mesure fiable trouvée ; à mesurer sur appareil |
| Écart CPU WebGPU/WebGL en r187 | Les mesures trouvées datent de r183 et viennent d'un seul utilisateur |
| Sketchfab en novembre 2026 | Obligation de compte et maintien des téléchargements gratuits non reconfirmés ; dernier billet officiel lu : octobre 2024 |
| Peugeot 208 réaliste sous licence libre | Introuvable |
| Mixamo | Conditions lues via sources secondaires uniquement |
| blender.org (page de téléchargement et page Lab MCP) | 403 ; versions confirmées par les notes de version développeur et PyPI |
| Budgets de la section 5.2 | Ordres de grandeur, pas de norme |
| Éléments marqués [M] | TiltShift pmndrs, `MeshReflectorMaterial`, coût de `transmission`, noms d'opérateurs `bpy`, dépendance KTX-Software |

---

## Sources

### three.js
- Manuel WebGPURenderer : https://threejs.org/manual/pages/webgpurenderer
- Releases : https://github.com/mrdoob/three.js/releases
- Guide de migration : https://github.com/mrdoob/three.js/wiki/Migration-Guide
- Nœuds de post-traitement r187 : https://github.com/mrdoob/three.js/tree/r187/examples/jsm/tsl/display
- SSGINode : https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/tsl/display/SSGINode.js
- TRAANode : https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/tsl/display/TRAANode.js
- SSRNode : https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/tsl/display/SSRNode.js
- GTAONode : https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/tsl/display/GTAONode.js
- Exemple SSGI r187 : https://raw.githubusercontent.com/mrdoob/three.js/r187/examples/webgpu_postprocessing_ssgi.html
- Liste des exemples r187 : https://raw.githubusercontent.com/mrdoob/three.js/r187/examples/files.json
- Exemples en ligne : https://threejs.org/examples/
- CSMShadowNode : https://threejs.org/docs/pages/CSMShadowNode.html
- Ticket ghosting TRAA : https://github.com/mrdoob/three.js/issues/31892
- PR SSR/TRAA (performance) : https://github.com/mrdoob/three.js/pull/32133
- Forum, écart CPU r183 : https://discourse.threejs.org/t/webgpurenderer-2x-slower-cpu-and-5-10x-slower-first-frame-than-webglrenderer-on-many-mesh-scenes-r183-same-on-both-backends/91904
- Forum, performance WebGPU 2025 : https://discourse.threejs.org/t/why-webgpurenderer-performance-significantly-lower-than-webglrenderer/77629
- Forum, ContactShadows WebGPU : https://discourse.threejs.org/t/drei-contact-shadow-with-webgpu/85689
- Forum, MeshTransmissionMaterial WebGPU : https://discourse.threejs.org/t/drei-meshtransmissionmaterial-webgpu/87427
- Forum, CSM sur WebGPU : https://discourse.threejs.org/t/cascaded-shadow-maps-csm-on-webgpu/84235
- Forum, Sundial : https://discourse.threejs.org/t/sundial-paged-virtual-sun-shadows-for-three-js-webgpurenderer-mit-on-npm/94912
- Forum, tone mapping : https://discourse.threejs.org/t/tone-mapping-overview/75204
- Forum, lightmaps Blender : https://discourse.threejs.org/t/apply-uv-coordinates-and-lightmaps-baked-from-blender-to-mesh/63910
- Forum, Grassworks : https://discourse.threejs.org/t/migrating-my-grass-system-to-webgpu-and-making-a-robust-grass-plugin/92893

### React Three Fiber, drei, postprocessing
- Guide de migration R3F v9 : https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide
- Releases R3F : https://github.com/pmndrs/react-three-fiber/releases
- Releases drei : https://github.com/pmndrs/drei/releases
- Tickets drei WebGPU : https://github.com/pmndrs/drei/issues?q=WebGPURenderer
- Audit WebGPU drei : https://github.com/pmndrs/drei/issues/2533
- Feuille de route postprocessing : https://github.com/pmndrs/postprocessing/issues/279
- Tickets postprocessing WebGPU : https://github.com/pmndrs/postprocessing/issues?q=WebGPU
- Registre npm (versions et peer dependencies) : https://registry.npmjs.org/postprocessing , https://registry.npmjs.org/@react-three/fiber , https://registry.npmjs.org/@react-three/drei , https://registry.npmjs.org/@react-three/postprocessing , https://registry.npmjs.org/n8ao
- N8AO : https://github.com/N8python/n8ao
- Baked lighting in r3f : https://tchayen.github.io/posts/baked-lighting-in-r3f

### Navigateurs
- caniuse WebGPU : https://caniuse.com/webgpu
- Données brutes caniuse : https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/webgpu.json
- web.dev, WebGPU dans les navigateurs majeurs : https://web.dev/blog/webgpu-supported-major-browsers

### Références de sites
- Folio 2025, dépôt : https://github.com/brunosimon/folio-2025
- Folio 2025, étude de cas : https://www.awwwards.com/brunos-portfolio-case-study.html
- Messenger, étude de cas : https://www.awwwards.com/messenger.html
- threejs.paris, Codrops : https://tympanus.net/codrops/2026/02/28/when-community-becomes-ui-building-the-website-for-the-first-three-js-conference/
- False Earth, Codrops : https://tympanus.net/codrops/2026/04/21/false-earth-from-webgl-limits-to-a-webgpu-driven-world/
- BatchedMesh + WebGPURenderer, Codrops : https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/
- Fluffiest grass, Codrops : https://tympanus.net/codrops/2025/02/04/how-to-make-the-fluffiest-grass-with-three-js/
- Garden Anomaly, Codrops : https://tympanus.net/codrops/2026/08/06/garden-anomaly-a-tiny-webgpu-and-tsl-experiment/
- Sélection Utsubo 2026 : https://www.utsubo.com/blog/best-threejs-websites-2026
- Makio64, guide TSL/WebGPU : https://github.com/Makio64/advanced-threejs-tsl-webgpu-rendering
- Takram three-geospatial : https://github.com/takram-design-engineering/three-geospatial

### Assets
- glTF Transform CLI : https://gltf-transform.dev/cli
- Poly Haven, licence : https://polyhaven.com/license
- Kenney City Kit Commercial : https://kenney.nl/assets/city-kit-commercial
- Kenney Car Kit : https://kenney.nl/assets/car-kit
- Quaternius Universal Base Characters : https://quaternius.com/packs/universalbasecharacters.html
- Quaternius Universal Animation Library : https://quaternius.com/packs/universalanimationlibrary.html
- KayKit City Builder Bits : https://kaylousberg.itch.io/city-builder-bits
- Sketchfab, billet Fab : https://sketchfab.com/blogs/community/sketchfab-update-what-you-need-to-know-now-that-fabs-live/
- Sketchfab, Peugeot e208 : https://sketchfab.com/3d-models/2024-peugeot-e208-abacfe4254d8415dba69aeb97663f716
- Ferrari 458 de l'exemple three.js : https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6
- Mixamo, FAQ licence (communauté Adobe) : https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400
- Ready Player Me, fermeture : https://genies.com/blog/ready-player-me-shutdown , https://avatarsdk.com/blog/2026/08/31/avatar-platforms-2026-whos-alive-whos-gone/

### Blender
- Notes de version : https://developer.blender.org/docs/release_notes/
- PyPI bpy : https://pypi.org/project/bpy/
- blender-mcp (communautaire) : https://github.com/ahujasid/blender-mcp
- Blender MCP (Blender Lab) : https://projects.blender.org/lab/blender_mcp
- Tutoriel Khronos, conversion headless : https://github.khronos.org/glTF-Tutorials/BlenderGltfConverter/

### Unity et Unreal
- Unity 6.3, WebGPU : https://docs.unity.com/en-us/engine/6000.3/manual/platform-specific/webgl/develop/graphics/web-gpu
- Unity 6.6, WebGPU : https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/develop/graphics/web-gpu
- Unity 6.6, limites WebGPU : https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/develop/graphics/web-gpu/limitations
- Unity 6.6, compatibilité navigateurs : https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/intro/browsercompatibility
- Unity, aperçu technique Web : https://docs.unity.com/en-us/engine/6000.3/manual/platform-specific/webgl/intro/technical-overview
- Unity, mémoire des builds Web : https://discussions.unity.com/t/web-build-memory-consumption-on-unity-6/1613334
- Unity, taille minimale de build : https://discussions.unity.com/t/smallest-possible-webgl-build-size/917019
- Unity 6.6, presse : https://alternativeto.net/news/2026/9/unity-6-6-adds-webgpu-build-analysis-and-coreclr-prep/
- Unreal, WebGPU tiers : https://forums.unrealengine.com/t/webgpu-for-unreal-engine-5-5-6-and-5-7-support/2693702
