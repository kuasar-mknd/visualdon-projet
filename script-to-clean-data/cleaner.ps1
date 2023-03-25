# Lecture du fichier CSV
$data = Import-Csv -Path "GCB2022v27_MtCO2_flat.csv"

# Suppression des lignes où Total est égal à 0
$data = $data | Where-Object { $_.Total -ne "0" }

# Exportation des données nettoyées dans un nouveau fichier CSV
$data | Export-Csv -Path "GCB2022v27_MtCO2_flat-new.csv" -NoTypeInformation
