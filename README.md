# VisualDon - Projet HEIG-VD
## Évolution des émissions de CO2 dans le monde de 2001 à 2022
État du déploiement : [![Netlify Status](https://api.netlify.com/api/v1/badges/e5ca3c8a-15bb-420d-8885-4c1f7e6f877a/deploy-status)](https://visualdon-kuasar.netlify.app/)
# Contexte
Ce jeu de données fournit un aperçu détaillé des émissions mondiales de CO2 au niveau des pays, permettant une meilleure compréhension de la contribution de chaque pays et de l'impact humain sur le climat. Il contient des informations sur les émissions totales ainsi que sur celles provenant du charbon, du pétrole, du gaz, de la production de ciment et des torchères ainsi que d'autres sources.

### Source: 
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7215364.svg)](https://doi.org/10.5281/zenodo.7215364)

### Auteur :
[![Auteur](https://img.shields.io/badge/Auteur-Global%20Carbon%20Project-blue)](https://www.globalcarbonproject.org/)
# Description
Les données sont au format CSV et sont disponibles dans le dossier [dataset](dataset).

| Nom de la colonne  | Description                                                                                    |
|--------------------|------------------------------------------------------------------------------------------------|
| Country            | Le nom du pays. (String)                                                                       |
| ISO 3166-1 alpha-3 | Le code du pays. (String)                                                                      |
| Year               | Année de collection. (Integer)                                                                 |
| Total              | Le montant total des émissions de CO2 pour le pays donné dans l'année spécifiée. (Float)                   |
| Coal               | Le montant des émissions de CO2 provenant du charbon pour le pays donné dans l'année spécifiée. (Float)               |
| Oil                | Le montant des émissions de CO2 provenant du pétrole pour le pays donné dans l'année spécifiée. (Float)                |
| Gas                | Le montant des émissions de CO2 provenant du gaz pour le pays donné dans l'année spécifiée. (Float)                |
| Cement             | Le montant des émissions de CO2 provenant de la production de ciment pour le pays donné dans l'année spécifiée. (Float)  |
| Flaring            | Le montant des émissions de CO2 provenant des opérations de torchage pour le pays donné dans l'année spécifiée. (Float) |
| Other              | Le montant des émissions de CO2 provenant d'autres sources pour le pays donné dans l'année spécifiée. (Float)      |
| Per Capita         | Le montant des émissions de CO2 par habitant pour le pays donné dans l'année spécifiée. (Float)              |

### Le dataset contient 2 fichiers CSV:

[GCB2022v27_MtCO2_flat.csv](dataset/GCB2022v27_MtCO2_flat.csv) : contient les données sur les émissions de CO2

[GCB2022v27_percapita_flat.csv](dataset/GCB2022v27_MtCO2_flat.csv) : contient les données sur les émissions de CO2 par habitant

# But
Le but de ce projet est de créer une application web qui permet de visualiser les données de manière interactive.
Les données seront présentée sous forme d'une carte du monde avec des données sur les émissions de CO2 par pays et de permettre de visualiser la progression en fonction des années.
Cela permettra également de mettre en évidence les pays qui ont le plus d'émissions de CO2 et de voir les pays qui ont le plus progressé.

# Référence

[![DOI](https://zenodo.org/badge/DOI/10.5194/essd-13-5213-2021.svg)](http://doi.org/10.5194/essd-13-5213-2021)

Cette étude présente un nouvel ensemble de données synthétiques sur les émissions anthropiques de gaz à effet de serre (GES) pour la période allant de 1970 à 2019, qui compilent des informations fiables sur les émissions de CO2, de CH4, de N2O et des gaz fluorés (F-gaz). Les résultats montrent une croissance continue des émissions de GES dans tous les secteurs et groupes de gaz, sans réduction significative observée dans aucun secteur mondial. Les auteurs soulignent l'importance de développer des estimations d'émissions de GES indépendantes, robustes et en temps réel pour suivre les progrès de la politique climatique.

# Wireframes
![Wireframe1](https://user-images.githubusercontent.com/60432398/225912605-72723a33-2e76-4531-a0a4-b551e31d0658.png)
![wireframe2](https://user-images.githubusercontent.com/60432398/225912011-2556706d-002b-4140-92ec-972d61db84ff.png)
![wireframe3](https://user-images.githubusercontent.com/60432398/225912051-eecfce85-e0e6-4163-8a34-b99246c0742e.png)
![wireframe4](https://user-images.githubusercontent.com/60432398/225912096-108eb151-9a92-4b3e-a304-9e703736383b.png)

