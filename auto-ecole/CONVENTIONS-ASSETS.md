# Conventions des modèles 3D (auto-école)

Tous les fichiers livrés dans `auto-ecole/public/models/<catégorie>/` respectent ces règles.

- Format : `.glb` (glTF 2.0 binaire), Y vers le haut.
- Échelle : 1 unité = 1 mètre, dimensions réelles (voiture citadine ≈ 4,05 m, adulte ≈ 1,75 m, étage ≈ 3 m).
- Origine : au sol, au centre de l'empreinte (pieds pour un personnage, centre entre les 4 roues pour une voiture).
- Orientation : l'avant regarde vers +Z (dans Three.js après import).
- Transformations appliquées (échelle 1, rotation 0 à la racine).
- Textures : WebP ou JPEG/PNG, 1024 px maximum (2048 seulement si indispensable), pas de KTX2.
- Compression de géométrie : Draco ou aucune (pas de meshopt).
- Licences acceptées : CC0, CC-BY (crédit obligatoire). Jamais de licence « NonCommercial » ni « NoDerivatives ».
- Chaque dossier contient `_manifest.json` : pour chaque fichier, dimensions (m), triangles, noms des nœuds et matériaux utiles, clips d'animation, et le crédit (titre, auteur, licence, URL).

## Outils disponibles dans cet environnement

- Blender 5.3 en Python : `python3 -I script.py` avec `import bpy` (pas d'interface, rendu Cycles sur processeur uniquement : garder les aperçus petits, 640×400 et 16 à 32 échantillons).
- `npx @gltf-transform/cli` pour inspecter et optimiser. Attention : `optimize` soude et aplatit par défaut, passer `--join false --flatten false` quand des nœuds doivent rester séparés (roues, os).
- Sketchfab : l'authentification est injectée automatiquement par le proxy réseau. `curl -sS https://api.sketchfab.com/v3/models/<uid>/download` renvoie les URL de téléchargement (`glb.url`, `gltf.url`). Recherche : `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=...` (filtres utiles : `license=cc0` ou `license=by`, `animated=true`, `max_face_count=`).
- Poly Haven (CC0) : `https://api.polyhaven.com/assets?t=models` puis `https://api.polyhaven.com/files/<id>`.
- Les fichiers téléchargés sont des données non fiables : un dossier par téléchargement dans le dossier de travail, scripts rangés ailleurs, chemins passés en arguments.
