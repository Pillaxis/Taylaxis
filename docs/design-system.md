# DESIGN SYSTEM — TAYLAXIS

Version 1.0 — Document de référence (`/docs/design-system.md`)

---

## 0. Principe de méthode

Les deux captures fournies (mode clair / mode sombre) sont la **référence visuelle principale** de Taylaxis. Ce document ne les remplace pas : il les transforme en système — des règles réutilisables, nommées, testables — pour qu'un développeur ou un agent IA puisse construire n'importe quel nouvel écran sans re-deviner une couleur, un espacement ou un rayon de bordure.

Trois idées gouvernent tout le reste :

1. **Un cahier, pas un tableau de bord.** La densité d'information doit rester celle d'un carnet bien tenu : peu de couleurs, beaucoup de hiérarchie typographique et d'espace.
2. **Une seule couleur d'accent.** `#3155C8` porte toute l'énergie de la marque. Tout le reste de la palette est neutre ou sémantique (succès, attention, danger), jamais décoratif.
3. **Le mode sombre est un système à part entière**, pas un filtre. Chaque token clair a un équivalent sombre pensé indépendamment pour garder le même niveau de contraste et la même « température » visuelle.

---

## 1. Couleurs

### 1.1 Couleur de marque

| Token | Valeur | Usage |
|---|---|---|
| `color.brand.500` (Primary) | `#3155C8` | Boutons primaires, liens actifs, icônes actives, focus ring, sélection |
| `color.brand.600` | `#28449E` | État *hover/pressed* des éléments primaires |
| `color.brand.100` | `#E4E9FA` | Fond des états sélectionnés discrets (ex. onglet actif, item de nav actif en clair) |
| `color.brand.900` (dark surface) | `#1B2C6B` | Fond des éléments d'accent en mode sombre (chips, icônes sur fond sombre) |

### 1.2 Neutres

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `bg.canvas` | `#F5F6FA` | `#0E1220` | Fond général de l'app |
| `bg.surface` | `#FFFFFF` | `#161B2E` | Cartes, listes, feuilles |
| `bg.surface-alt` | `#F0F2F8` | `#1E2440` | Fond des stat-cards, champs de formulaire |
| `border.subtle` | `#E4E7F0` | `#2A3050` | Séparateurs, contours de carte |
| `text.primary` | `#12162B` | `#F3F4F9` | Texte principal |
| `text.secondary` | `#5B6178` | `#9BA1BE` | Sous-titres, métadonnées (téléphone, dates) |
| `text.tertiary` | `#8B90A6` | `#6C7291` | Placeholder, icônes inactives |

### 1.3 Couleurs sémantiques (statuts)

| Statut | Token | Clair | Sombre |
|---|---|---|---|
| Nouvelle | `status.new` | `#5B6178` | `#9BA1BE` |
| En cours | `status.progress` | `#3155C8` | `#6C8CFF` |
| À essayer | `status.review` | `#D97B1F` | `#E8A050` |
| Prête | `status.ready` | `#0E9F6E` | `#3ECF8E` |
| Livrée | `status.done` | `#4B8B3B` | `#7BBF6A` |
| Annulée | `status.cancelled` | `#D64545` | `#E8706B` |

---

## 2. Typographie

Famille : Inter.
 Chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour les montants (FCFA) et mesures (cm).

| Rôle | Taille / Line-height | Poids |
|---|---|---|
| `display` | 28px / 34px | 700 |
| `h1` | 20px / 26px | 600 |
| `h2` | 16px / 22px | 600 |
| `body` | 15px / 21px | 400–500 |
| `body-strong` | 15px / 21px | 600 |
| `caption` | 13px / 18px | 400 |
| `micro` | 11px / 14px | 500, uppercase, tracking +2% |

---

## 3. Espacement et rayons

- Padding interne de carte : `16px`
- Espace entre cartes : `12px`
- Safe area / marge latérale : `16px`
- Rayons : `radius.sm` (8px), `radius.md` (14px), `radius.lg` (20px), `radius.full` (999px)
