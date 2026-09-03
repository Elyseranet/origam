# Classeur d'inspection — méthodologie et angles morts

Ce fichier archive **le texte intégral** qui était stocké dans la ligne 2
(« description de colonne ») du classeur d'inspection Google Sheets.

Ce texte n'était pas de la description : c'étaient des **constats de mesure**
— recensements `count()`, angles morts de sélection, analyse de la
discrimination d'un critère. Utile, mais au mauvais endroit : la ligne 2 du
classeur atteignait 3 494 caractères sur une seule cellule, ce qui rendait la
grille illisible et la ligne d'en-tête haute de plusieurs écrans.

Le classeur garde désormais une description **d'une ligne** par colonne et
renvoie ici. Rien n'est perdu : tout le contenu d'origine est reproduit
ci-dessous, verbatim.

Déplacé le 2026-09-03.

---

## Onglet `Composants`

### Colonne `A` — Composant

*732 caractères dans la cellule d'origine `A2`.*

Nom du composant tel qu'il est exporte par le DS | LECON TRANSVERSALE (ligne
OrigamSection retiree le 2026-08-26 ; verdict bloquant pose le 2026-08-21 par
scribe-tableau-2 ; ticket #453) : composant EXPORTE dans le package npm alors
qu'il etait un stub vide - <div> sans aucun <slot/>, zero props, zero
defineSlots. Le .md etait honnete (bandeau WIP explicite) ; la story ne
l'etait PAS : ses Variants Default et Slots - Default passaient du contenu
enfant que le composant ne pouvait pas afficher, donc une boite vide alors que
le control Content pretendait agir dessus. A retenir : une story qui expose un
control sans effet ment plus fort qu'une doc absente, et un verdict bloquant
inscrit ici ne vaut que s'il ressort en ticket.

### Colonne `D` — C1 Rendu distinct

*138 caractères dans la cellule d'origine `D2`.*

Chaque valeur de prop produit-elle un rendu DISTINCT ? Pas la classe emise :
la regle SCSS existe-t-elle et le style calcule change-t-il ?

### Colonne `I` — C6 Semantique / a11y

*134 caractères dans la cellule d'origine `I2`.*

HTML semantique et a11y : element natif plutot que div, pas d'ARIA redondant,
content model respecte, aucun attribut parasite qui fuit

### Colonne `S` — Module cible

*149 caractères dans la cellule d'origine `S2`.*

Module npm installable dans lequel ira ce composant (#14 / ADR-006). A
TRANCHER par le mainteneur : l'affectation est une decision, pas une deduction

### Colonne `T` — Dependances inter-familles

*174 caractères dans la cellule d'origine `T2`.*

MESURE : familles dont ce composant consomme un symbole (type, enum, const,
interface). Commons exclu. Un tiret = aucune. Ces liens sont ce qui bloque le
decoupage en modules

### Colonne `V` — defineEmits + interface

*134 caractères dans la cellule d'origine `V2`.*

defineEmits<IXxxEmits>() typé par générique, interface I-préfixée dans
src/interfaces/** ; sans objet si aucun emit relais atteignable

### Colonne `W` — defineSlots + interface

*421 caractères dans la cellule d'origine `W2`.*

defineSlots<IXxxSlots>() typé par générique, interface I-préfixée dans
src/interfaces/** ; sans objet si aucun <slot> dans le template, OU si les
slots sont forwardes dynamiquement (v-for sur $slots) : un critere
techniquement impossible a satisfaire ne s'applique pas. Cas OrigamChart et
OrigamContextualMenu — passthroughs transparents ou typer defineSlots casse la
compilation (TS7053) ou ment sur la surface acceptee.

---

## Onglet `Composables`

### Colonne `A` — Composable

*3494 caractères dans la cellule d'origine `A2`.*

Nom exporte (useXxx) — ATTENTION, cet intitule n est plus exact : 41 des 174
lignes ne sont PAS des useXxx. La colonne liste tout SYMBOLE EXPORTE par un
fichier .composable.ts, pas seulement les hooks reactifs. // ANGLE MORT DE
SELECTION (2026-08-22) : l onglet a longtemps compte 135 lignes, une par
fichier, nommee par son use*. Il en manquait 39, soit 22 pourcent du catalogue
— non pas oubliees, mais jamais visibles : rien dans la methode ne demandait
de les chercher. Repartition des 39 : 19 jumeaux d installation et d injection
(11 create*, 8 provide*) ; 12 fonctions NON REACTIVES (8 pures, plus 4
imperatives de theme qui ecrivent dans le document ou lisent le stockage
persiste) ; 8 hors perimetre (6 outillage de test, 2 re-exports de const). Le
motif n est donc pas que la moitie relevait de l installation : c est que l
onglet ne listait QUE les fonctions reactives. Tout ce qui, dans un
.composable.ts, n est pas un use* — cycle d installation, noyau pur extrait
pour etre testable, couche d effet — etait invisible. Consequence pratique :
un verdict sur useX ne dit rien de createX, provideX, ni des helpers exportes
a cote. La cle d une ligne est le couple (fichier, symbole), pas le nom seul :
shouldSuppressAutoplay existe dans deux fichiers. | Methodologie de
remplissage (onglet Composables, 2026-08-22) : G (C4 ADR-005), I (C6 API
stable), J (C7 Doc) et K (C8 Zero chaine en dur) sont remplies par SCAN
MECANIQUE (AST pour C4, grep/lecture fichier pour C6/C7/C8), ligne par ligne,
puis propagees par Ctrl+D quand la valeur mesuree etait majoritairement
identique sur la plage - les exceptions reperees ont ete corrigees
individuellement, jamais supposees puis rattrapees. F (C3 Reactivite) est la
SEULE colonne a MESURE INDIVIDUELLE (raisonnement statique sur le code ou
sonde runtime dediee selon le cas), remplie sur 4 lignes seulement
(provideExpanded, provideSelection, DEFAULT_PASSWORD_REQUIREMENTS,
DEFAULT_SHEET_SNAP_POINTS) ; le reste est volontairement laisse vide plutot
que devine. Recensement count() du 2026-08-22 sur les 174 lignes (moins 2
lignes d'en-tete) : D=135, E=49, F=4, G=I=J=K=174, H=134, L=0 - la
soustraction des 2 en-tetes est verifiee par recoupement direct sur G/I/J/K/F
et corroboree independamment par colonne-T-2 sur D/E/H ; sur une colonne dont
personne n'a encore mesure le total, cette soustraction resterait une
hypothese a verifier avant de la reutiliser, pas un acquis. // ⛔ C7 A CESSE DE
DISCRIMINER (2026-08-22) : C7 (Doc) est en defaut sur 168 des 174 lignes, soit
96,5 pourcent. Un critere qui echoue a ce taux ne separe plus rien : il marque
presque tout le monde. Pire, il SUBSUME les sept autres — les 6 seules lignes
sans aucun defaut sur D-K sont exactement les 6 dont C7 est conforme, et elles
viennent toutes du meme fichier, theme.composable.ts. Autrement dit l union au
moins un defaut EST la colonne C7 : trier sur ce critere revient a trier sur
la doc et sur rien d autre, et l information portee par les sept autres
colonnes est integralement noyee. Ce n est pas une faiblesse de la mesure, la
doc est reellement dans cet etat (verifie sur piece pour useVModel : une ligne
de tableau pour une fonction a cinq parametres et trois generiques). Deux
consequences actees : 1) la gravite se juge HORS C7, chiffre de travail 58 et
non 168 ; 2) la doc est UN sujet systemique, pas 168 lignes — un seul ticket,
les lignes y pointeront. Point de methode : on ne le voit qu en COMPTANT, la
colonne a l air normale ligne a ligne.

### Colonne `D` — C1 Consomme

*704 caractères dans la cellule d'origine `D2`.*

Importe par au moins un composant ? Sinon = code mort | ELARGI (2026-08-23) :
consomme par du code de PRODUCTION - composant, amorcage (origam.ts), ou
composable frere. Sinon = code mort. Raison : ce critere a ete ecrit quand
l'onglet ne listait que des fonctions reactives (useXxx), une population ou
composant et consommateur etaient synonymes. Les 39 lignes ajoutees sont
exactement les symboles que cette population excluait (amorcage, noyaux purs,
couche d'effet) - on ne l'assouplit pas, on le recale sur son propre objectif
(detecter le code mort). Les 135 lignes d'origine restent jugees sur des
useXxx consommes par des composants : verifie, aucun verdict ne change sous la
nouvelle formulation.

### Colonne `L` — Gravite max

*2335 caractères dans la cellule d'origine `L2`.*

Gravite du pire defaut trouve : aucun / mineur / majeur / bloquant // ⛔
ECHELLE DEFINIE ET VALIDEE (2026-08-23). Avant cette date, seul bloquant avait
une definition ecrite ; majeur et mineur n en avaient AUCUNE. Les trois
niveaux ci-dessous sont deduits des verdicts deja rendus, pas inventes, et
reproduisent les 9 cas eprouves. Chaque niveau a une QUESTION VERIFIABLE, pas
un adjectif. // BLOQUANT : le defaut atteint L UTILISATEUR FINAL, et RIEN NE L
ANNONCE au developpeur qui utilise le DS correctement. Question : le dommage
sort-il de l ecran du developpeur, et le code se tait-il ? Exemples reels :
OrigamCheckbox (cocher une 2e case ecrase la 1re, silencieusement),
OrigamDialog (aria-labelledby pointe vers un id qui rend null),
OrigamThemeProvider (inheritAttrs sans v-bind attrs : id, style, data-cy et
TOUS les listeners tombent sans erreur). // MAJEUR : suivre le DS produit un
resultat faux, mais LE DEVELOPPEUR LE CONSTATE IMMEDIATEMENT et corrige avant
de livrer. Question : l ecran ou le style trahissent-ils le probleme au
premier essai ? Exemples : OrigamApp (la doc nomme --rtl, le composant emet
--is-rtl : la regle CSS ecrite d apres la doc ne s applique jamais),
OrigamRatingField (le slot generique itemLabel ne rend rien). // MINEUR : rien
ne casse ; le cout est de trouver ou de comprendre. Absence, mauvais
emplacement, non-conformite de convention, ou affirmation fausse dont personne
ne peut deriver du code. Exemples : OrigamExpansionPanels (page de doc
absente), OrigamGridItem (doc exacte mais fusionnee dans le fichier du
parent), OrigamSvgIcon (la doc affirme role=img, c est FAUX, et pourtant
mineur : personne n ecrit de code contre cette affirmation). // ⛔ DEUX PIEGES
A NE PAS REFAIRE. 1) Le mensonge de la doc n est PAS le discriminant :
OrigamSvgIcon ment et reste mineur. Ce qui compte est la consequence pour qui
suit l affirmation. 2) L existence d un CONTOURNEMENT n est PAS le
discriminant : on peut presque toujours contourner (envelopper,
reimplementer), donc un critere que l on satisfait par principe ne separe
rien. OrigamThemeProvider se contourne et reste bloquant. // La preuve
inscrite en colonne P doit justifier LE VERDICT PORTE, pas documenter l
inspection en general : celle d OrigamThemeProvider est honnete et detaillee,
et decrit une inspection qui avait conclu l inverse.

### Colonne `M` — Statut

*257 caractères dans la cellule d'origine `M2`.*

Ou en est l inspection : a faire / inspecte / sans objet (le symbole n appelle
pas d inspection : outillage de test, ou re-export d une const declaree dans
src/consts/). Ecrit plutot que laisse vide : une cellule vide ne dit pas si le
travail reste a faire.
