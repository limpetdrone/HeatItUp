# Állapot

Fázis: funkcionálisan teljes forrás; eszközös QA hiányzik.
Technológia: Expo 57 / React Native 0.86 / JavaScript.

| Terület | Állapot |
| --- | --- |
| Beépített tartalom | 392 kártya (src/data/builtinCards.json), szintenként ≥30 kérdés és ≥30 feladat, en/hu/de; 82 feladat a Downloads/heatitup-cards-300-v3.json-ból átemelve, a fájl szintezése felülírva |
| Szintek | 1–2 fehérneműben, 3 vetkőzés, 4 meztelen kézi/intim, 5 teljes szex és orál |
| Kategória/szerep/ruha mezők | oral/penetration, role: receive, clothingType a vetkőztető lapokon |
| Párhuzamos csoportok | 140 lap parallelSafe, dupla (max. 300 s) párhuzamos idővel |
| Testrész-kerék | 10 {bodyPart} lap, szintenként 2 |
| Azonos nemű kapcsolók | minden partneres feladatra érvényesek (korábban csak a kategóriákra) |
| Ruhakövetés kikapcsolva | vetkőztető lapok is megjelennek, a ruhatár nem változik |
| Profilok, presetek, elutasítás, kerekek, időzítő, szintváltás | implementált, tesztelt |
| Spotify | a dokumentált szolgáltatói akadály miatt nincs vezérlés |

Ellenőrzött: 74/74 Jest teszt; lint; Android/iOS/web export; webes futtatás böngészőben (5. és 4. szint kártyái, sötét UI, kontraszt).
Nem ellenőrzött: valódi eszköz, hangjelzés, a11y/képernyőolvasó, YouTube, natív bináris.
A 48 demókártya törölve; a cardMessages.js üres, a lapok saját fordítással regisztrálnak.
Ismétlődő lap csavart kap (src/domain/twists.js, 10 változat, en/hu/de).
Következő: eszközös végigjátszás; magyar/német tartalom anyanyelvi lektorálása.
Draft forrás: content/drafts/cards-v3.json; a régi draftok törölve.
