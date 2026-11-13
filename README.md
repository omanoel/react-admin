# Atelier Admin

Interface de gestion responsive construite avec React, TypeScript et Vite. Elle permet de gérer les clients, les utilisateurs, les applications, les API et les clés API.

## Démarrer

```sh
npm install
npm run dev
```

Les commandes `npm run build` et `npm run lint` vérifient respectivement la compilation TypeScript/la production et les règles ESLint.

## Fonctionnalités

- Tableau de bord avec le nombre d’enregistrements et l’activité récente.
- Listes avec recherche, fiches détaillées, modification et confirmation de suppression pour les cinq entités.
- Onglets Utilisateurs, Applications et APIs sur la fiche d’un client.
- Un client peut avoir plusieurs utilisateurs et applications ; chaque utilisateur et application appartient à un seul client. Leur création depuis la fiche client préremplit et verrouille ce client.
- Une API peut être associée à zéro, un ou plusieurs clients. Les liaisons se gèrent depuis l’onglet APIs du client ; leur date de création est conservée et retirer une liaison retire aussi l’API des applications de ce client.
- Une application peut utiliser zéro ou plusieurs APIs, uniquement parmi celles associées à son client. Ces liaisons se gèrent depuis l’onglet APIs de l’application ; la fiche API affiche les applications utilisatrices en lecture seule.
- Les clés API appartiennent à une application et peuvent être créées depuis son onglet Clés API.
- Les tableaux peuvent être triés par colonne et affichent 10 enregistrements par page.
- Champs métier, statuts, rôles, identifiants OAuth2 et quotas adaptés à chaque entité.
- Données de démonstration persistées dans le stockage local du navigateur (`atelier-admin-data`).

## Organisation du code

- `src/entities/record.ts` définit le socle commun `RecordItem` : `id`, `name`, `createdOn` et `updatedOn`.
- `src/entities/{clients,users,applications,apis,api-keys}/` regroupe les types et formulaires propres à chaque entité, chacun étendant le socle commun.
- `src/components/` regroupe les composants et utilitaires partagés entre les entités.
- `src/pages/` contient le tableau de bord, les listes, fiches, formulaires, suppressions et gestionnaires de liaisons.
- `src/layout/` contient la mise en page principale et sa navigation.
- `src/state/` configure Redux Toolkit, l’état applicatif et les opérations asynchrones.
- `src/api/mockApiV1.ts` simule le middleware HTTP `/api/v1` ; il initialise et persiste les données dans le stockage local.
- `src/App.tsx` connecte les routes aux actions Redux.
- `src/entities/store.ts` initialise et migre les données locales utilisées par l’API simulée.

## API simulée

L’application passe par une couche HTTP simulée : les thunks Redux Toolkit envoient une méthode et une URL au middleware local, qui valide la requête et renvoie une réponse JSON après un court délai. Les données restent persistées dans `localStorage` pour conserver le comportement de démonstration ; aucune requête ne quitte le navigateur.

| Méthode | Route | Opération |
| --- | --- | --- |
| `GET` | `/api/v1/:entity` | Liste des enregistrements |
| `GET` | `/api/v1/:entity/:id` | Détail |
| `POST` | `/api/v1/:entity` | Création |
| `PUT` | `/api/v1/:entity/:id` | Modification des champs de l’entité |
| `DELETE` | `/api/v1/:entity/:id` | Suppression et nettoyage des références |
| `GET`, `POST`, `PUT` | `/api/v1/clients/:id/apis` | Consultation et gestion des APIs liées à un client |
| `DELETE` | `/api/v1/clients/:id/apis/:apiId` | Retrait d’une API d’un client |
| `GET`, `PUT` | `/api/v1/applications/:id/apis` | Consultation et gestion des APIs d’une application |
| `DELETE` | `/api/v1/applications/:id/apis/:apiId` | Retrait d’une API d’une application |

`:entity` vaut `clients`, `users`, `applications`, `apis` ou `api-keys`. Les routes relationnelles vérifient les contraintes du modèle, notamment qu’une application n’utilise que les APIs liées à son client.

## Routes

| Route | Vue |
| --- | --- |
| `/` | Tableau de bord |
| `/:entity` | Liste (`clients`, `users`, `applications`, `apis` ou `api-keys`) |
| `/:entity/add` | Création |
| `/:entity/:id` | Fiche détaillée |
| `/:entity/:id/upd` | Modification |
| `/:entity/:id/del` | Confirmation de suppression |
| `/clients/:id/apis/edit` | Gestion des APIs associées au client |
| `/applications/:id/apis/edit` | Gestion des APIs utilisées par l’application |
