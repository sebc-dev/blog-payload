# parse-failures.jq
# Filtre jq pour extraire les échecs de tests de manière concise et optimisée pour l'IA
# Basé sur les recommandations du rapport d'optimisation

# Itérer sur chaque fichier de test
.testResults |

# Conserver le nom du fichier dans une variable
.name as $file |

# Sélectionner uniquement les fichiers qui ont échoué
select(.status == "failed") |

# Itérer sur chaque test individuel dans le fichier
.assertionResults |

# Sélectionner uniquement les tests qui ont échoué
select(.status == "failed") |

# Construire la chaîne de sortie formatée avec troncature intelligente
"--- ÉCHEC DE TEST ---\n" +
"Fichier: \($file)\n" +
"Suite  : \(.ancestorTitles | join(" > "))\n" +
"Test   : \(.title)\n\n" +
"Erreur :\n\(.failureMessages | .[0:1500] + (if length > 1500 then "\n... (message tronqué, voir les logs complets)" else "" end))\n"