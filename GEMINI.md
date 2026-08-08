# GEMINI.md — Guide d'Architecture & Documentation Taylaxis V1

Bienvenue dans la documentation officielle du projet **Taylaxis**. Ce document est conçu pour présenter l'application, ses fonctionnalités, sa structure technique, ses choix de design et fournir des instructions claires aux modèles d'IA et développeurs travaillant sur le dépôt.

---

## 1. Ce que fait l'application (Vision Produit)

**Taylaxis** est une application SaaS professionnelle dédiée aux tailleurs, couturiers, ateliers de confection et créateurs de mode.

Contrairement aux applications CRUD classiques (qui se contentent d'ajouter et lister des données), Taylaxis est un **outil opérationnel métier** conçu pour accompagner le tailleur au quotidien dans son atelier :

- **Connaître l'urgence réelle** de chaque commande (statut de confection, solde restant, délai de livraison).
- **Proposer automatiquement la Prochaine Action pertinente** pour réduire les retards et maximiser les encaissements.
- **Facturer et suivre les versements** (acomptes et soldes) avec un historique comptable clair.
- **Conserver une traçabilité totale des mensurations** réellement utilisées pour fabriquer chaque vêtement.

---

## 2. Toutes les Fonctionnalités Implémentées

### 🚀 Moteur Métier des Commandes V1 (Order Engine 3D)
1. **Système de Statuts Tridimensionnel** :
   - **Fabrication (`ManufacturingStatus`)** : Séquence contrôlée `BROUILLON` → `CONFIRMEE` → `EN_COURS` → `PRETE` → `A_LIVRER` → `LIVREE` → `TERMINEE`. Les transitions sont sécurisées par un gardien métier (`OrderEngine.canTransitionTo`) qui interdit les régressions incohérentes (ex: passer de `LIVREE` à `EN_COURS`).
   - **Paiement (`PaymentStatus`)** : Calculé automatiquement d'après le registre financier (`NON_PAYEE`, `PARTIELLEMENT_PAYEE`, `PAYEE`).
   - **Échéance (`DueDateStatus`)** : Évalué dynamiquement par rapport à la date de livraison et à l'horloge (`A_TEMPS`, `AUJOURD_HUI`, `BIENTOT`, `EN_RETARD`).
   - **Priorité Métier (`OrderPriority`)** : Score calculé automatiquement (`CRITIQUE`, `HAUTE`, `MOYENNE`, `NORMALE`) pour piloter les alertes.
2. **Actions Contextuelles Pilotées par les Données (Data-Driven)** :
   - **Action Principale Unique** : Un bouton principal proéminent calculé selon la situation exacte (ex: *Confirmer la commande*, *Démarrer la confection*, *Marquer prête*, *Prévenir le client*, *Marquer livrée*, *Encaisser le solde*).
   - **Actions Secondaires Filtrées** : Boutons d'appel direct (`tel:`), liens WhatsApp pré-remplis (`https://wa.me/`), accès aux mensurations, fiche client et annulation (avec masquage automatique si le numéro ou la donnée est absente).
3. **Modal de Détail de Commande (`OrderDetailModal.tsx`)** :
   - Badges 3D sémantiques.
   - Onglet **Détails** : dates, récapitulatif financier et barre de progression du règlement.
   - Onglet **Paiements** : registre des versements et formulaire d'encaissement (Espèces, Mobile Money, Virement, Carte).
   - Onglet **Historique (Timeline)** : journal immutable des événements atelier.
   - Onglet **Mesures utilisées** : consultation des mensurations congelées lors de la prise de commande.

### 👥 Gestion des Clients & Mensurations
- Fiches clients complètes avec recherche et filtres par statut (`Actif`, `Prospect`, `Inactif`).
- Gestion avancée des mensurations personnalisées (poitrine, taille, longueur, carrure, etc. en cm).
- Historique d'achats et dépenses totales (`totalSpentFCFA`).

### 📊 Tableau de Bord Opérationnel (Dashboard / Accueil)
- Indicateurs d'activité : CA du jour, CA du mois, commandes en cours, montants à encaisser.
- Carte d'alerte rouge dynamique identifiant immédiatement les commandes en retard de livraison.
- Liste priorisée des livraisons prochaines avec boutons d'action rapide.

### 📅 Agenda & Rendez-vous Atelier
- Planning d'atelier pour les rendez-vous d'essayage, de prise de mesures, de livraison et consultations.

### 👤 Espace Atelier & Profil ("Moi")
- Informations du tailleur, profil de l'atelier de couture, gestion du plan d'abonnement et réglages des notifications.

---

## 3. Technologies Utilisées (Tech Stack)

| Domaine | Technologie | Usage |
| :--- | :--- | :--- |
| **Core Framework** | **React 19** + **TypeScript** | Framework frontend typé en mode strict (`tsc -b`). |
| **Build Tool** | **Vite 8** | Bundler ultra-rapide pour le développement et la production. |
| **Styling** | **TailwindCSS v4** + Vanilla CSS | Design system réactif, utilitaires modernes et variables d'apparence. |
| **Icônes** | **Lucide React** | Ensemble complet d'icônes vectorielles sémantiques. |
| **Linter / Qualité** | **Oxlint** | Linter haute performance pour la conformité du code. |
| **Persistence** | **LocalStorage Service** | Couche de service réactive préparée pour Supabase / PostgreSQL RLS. |

---

## 4. Décisions de Design & Identité Visuelle

- **Thème Unifié & Propre** :
  - L'application utilise **un mode visuel unique, propre et uniforme** fondé sur une palette claire (`#FAF9FE` / `#FFFFFF`) évitant tout artefact ou bande noire au défilement.
  - Accentuation principale : Violet Pro signature (`#7C3AED` / `#3155C8`).
- **Couleurs Sémantiques** (Utilisées exclusivement pour véhiculer du sens métier) :
  - 🟢 **Vert (`#10B981`)** : Livré, payé, terminé, succès.
  - 🟠 **Or / Orange (`#B45309` / `#D97B1F`)** : En cours de confection, acompte partiel.
  - 🔴 **Rouge (`#EF4444` / `#DC2626`)** : Commande en retard, urgence critique, action d'annulation.
  - 🔵 **Bleu (`#2563EB`)** : Information client, notification, état prêt / à livrer.
  - 🟣 **Violet (`#7C3AED`)** : Identité Taylaxis, action principale, numéro de commande.
- **Approche Mobile-First** :
  - Barre de navigation basse (`BottomNav`) optimale pour une utilisation à une main sur smartphone en atelier.
  - Disposition adaptative fluide (1 colonne sur mobile, grille 2-6 colonnes sur desktop).

---

## 5. Structure des Fichiers du Projet

```
c:\TAYLAXIS\
├── GEMINI.md                    # Documentation officielle pour les modèles d'IA
├── README.md                    # Présentation rapide du projet
├── package.json                 # Dépendances (React 19, TailwindCSS v4, Vite 8, Lucide)
├── vite.config.ts               # Configuration Vite
├── tsconfig.json                # Configuration TypeScript
├── index.html                   # HTML Entry Point
└── src/
    ├── main.tsx                 # Point d'entrée React
    ├── App.tsx                  # Composant racine, routeur d'onglets et gestionnaires principaux
    ├── index.css                # Style global et utilitaires de thème
    ├── types/
    │   └── index.ts             # Source unique de vérité pour les types TypeScript
    ├── services/
    │   ├── orderEngine.ts       # Moteur métier purement logique (calculs 3D, next actions, garde)
    │   ├── orderService.ts       # Service de persistance et journal d'événements timeline
    │   └── userService.ts       # Service profil utilisateur, atelier et mensurations
    ├── components/
    │   ├── common/
    │   │   ├── StatusBadge.tsx  # Composant d'affichage des badges de statut
    │   │   └── NotificationsModal.tsx
    │   ├── layout/
    │   │   ├── Header.tsx       # En-tête supérieur de l'application
    │   │   └── BottomNav.tsx    # Barre de navigation mobile inférieure
    │   └── orders/
    │       └── OrderDetailModal.tsx # Modal d'action contextuelle, timeline, paiements & mesures
    ├── views/
    │   ├── AccueilView.tsx      # Dashboard avec alertes retards et livraisons
    │   ├── CommandesView.tsx    # Liste des commandes avec palettes de filtres et cartes d'action
    │   ├── ClientsView.tsx      # Répertoire et filtres clients
    │   ├── ClientDetailView.tsx # Fiche client détaillée (Info, Mesures, Commandes, Paiements)
    │   ├── MensurationsView.tsx # Vue dédiée à la gestion des mesures
    │   ├── AgendaView.tsx       # Planning des RDV d'essayage et livraisons
    │   └── MoiView.tsx          # Espace atelier, abonnement et profil
    └── data/
        └── mockData.ts          # Jeu de données de démarrage
```

---

## 6. Instructions pour les Modèles d'IA (Agents & Assistants)

Si vous êtes une IA travaillant sur cette codebase, veuillez respecter impérativement les règles suivantes :

### ⚠️ RÈGLES D'ARCHITECTURE ET MÉTIER
1. **Ne pas mélanger les 3 dimensions de statut** :
   - Garder toujours `manufacturingStatus`, `paymentStatus` et `dueDateStatus` indépendants dans les types et la logique.
   - Ne créez JAMAIS un statut unique combinant "En cours et en retard".
2. **Centraliser la logique métier dans `orderEngine.ts`** :
   - Ne dupliquez pas les règles de calcul des prochaines actions ou de priorité dans les composants React.
   - Utilisez toujours `OrderEngine.getNextActions(order, phone)` pour obtenir l'action principale et les actions secondaires.
3. **Traçabilité comptable et historique** :
   - Toute modification de statut ou enregistrement de versement DOIT passer par `OrderService.updateManufacturingStatus()` ou `OrderService.addPayment()` afin d'alimenter la timeline `eventTimeline`.
   - Ne supprimez jamais destructivement des versements financiers ou des snapshots de mensurations sans confirmation explicite.
4. **Conservation du Fond Unifié Propre** :
   - Le fond de l'application doit rester fixé sur la couleur canvas `#FAF9FE` afin d'éviter la réapparition de bandes/traits noirs lors du défilement.
5. **Vérification Obligatoire avant Commit** :
   - Exécutez toujours `cmd.exe /c "npm run build"` pour vérifier l'absence d'erreurs TypeScript ou de variables non utilisées.
