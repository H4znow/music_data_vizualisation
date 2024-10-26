library(dplyr)
library(jsonlite)

add_column_to_dataframe <- function(data, column_name, values = NULL, default_value = NULL) {
  +  # Vérifier si le nom de la colonne existe déjà
       if (column_name %in% colnames(data)) {
           stop(paste("La colonne", column_name, "existe déjà dans le dataframe."))
         }
     
       # Si des valeurs sont fournies, vérifier leur longueur
       if (!is.null(values)) {
           if (length(values) != nrow(data)) {
               stop("Le nombre de valeurs ne correspond pas au nombre de lignes du dataframe.")
            }
           # Ajouter les valeurs fournies
             data[[column_name]] <- values
           } else if (!is.null(default_value)) {
               # Ajouter une colonne avec une valeur par défaut
                 data[[column_name]] <- rep(default_value, nrow(data))
               } else {
                  stop("Il faut fournir soit des valeurs, soit une valeur par défaut.")
                }
  
       # Retourner le dataframe modifié
      return(data)
   }

remove_column <- function(data, column_name) {
  # Vérifier si le nom de la colonne existe
  if (!column_name %in% colnames(data)) {
    stop(paste("La colonne", column_name, "n'existe pas dans le dataframe."))
  }
  
  # Supprimer la colonne
  data[[column_name]] <- NULL
  
  # Retourner le dataframe modifié
  return(data)
}
add_super_genre <- function(data) {
  # Vérifier si la colonne "genre" existe
  if (!"genre" %in% colnames(data)) {
    stop("La colonne 'genre' doit exister dans le dataframe.")
  }
  
  # Définir les supergenres en fonction des genres
  data$super_genre <- NA  # Initialiser la colonne
  
  # Logique pour définir le super genre
  data$super_genre[data$genre %in% c("Rock", "Metal", "Punk")] <- "Musique Rock"
  data$super_genre[data$genre %in% c("Pop", "Dance", "Hip-Hop")] <- "Musique Pop"
  data$super_genre[data$genre %in% c("Classical", "Jazz", "Blues")] <- "Musique Classique"
  data$super_genre[data$genre %in% c("Reggae", "Ska")] <- "Musique Reggae"
  data$super_genre[data$genre %in% c("Electronic", "Techno", "House")] <- "Musique Électronique"
  
  # Retourner le dataframe modifié
  return(data)
}
# Fonction pour garder uniquement les colonnes spécifiées dans un dataframe
keep_columns <- function(data, columns_to_keep) {
  # Vérifier si toutes les colonnes à garder existent dans le dataframe
  missing_columns <- setdiff(columns_to_keep, colnames(data))
  if (length(missing_columns) > 0) {
    stop(paste("Les colonnes suivantes sont manquantes dans le dataframe:", 
               paste(missing_columns, collapse = ", ")))
  }
  
  # Garder uniquement les colonnes spécifiées
  data <- data[ , columns_to_keep, drop = FALSE]
  
  # Retourner le dataframe modifié
  return(data)
}
# Spécifier le fichier JSON d'entrée et le fichier JSON de sortie
input_file <- "test.json"  # Remplacez par le chemin réel de votre fichier JSON
output_file <- "test.json"  # Dossier pour le fichier modifié

# Liste des colonnes à garder
columns_to_keep <- c("id", "name")  # Spécifiez les colonnes que vous souhaitez garder

# Lire le fichier JSON
data <- fromJSON(input_file)

# Afficher le dataframe initial
cat("Dataframe initial:\n")
print(head(data))

# Garder uniquement les colonnes spécifiées
data_modified <- keep_columns(data, columns_to_keep)

# Enregistrer le dataframe modifié dans un nouveau fichier JSON
write_json(data_modified, output_file)

# Afficher un message de confirmation
cat("Le fichier JSON a été traité et enregistré sous:", output_file, "\n")