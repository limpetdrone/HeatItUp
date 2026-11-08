# Átadható prompt – HeatItUp 18+ tartalom

A HeatItUp nevű, kizárólag felnőtteknek szóló ismerkedős társasjátékhoz készíts eredeti, explicit 18+ kérdés- és kihíváskártyákat angolul, magyarul és németül. A projekt: `/Users/davidpoka/git/HeatItUp`. A szereped tartalomszerkesztő; az alkalmazáskódot, teszteket és konfigurációt ne módosítsd, mert azokon másik munkafolyamat dolgozik.

## Hangvétel és keretek

Pikáns, érzéki, felnőtt swinger-társasjáték. A kérdések a játékosok szexuális életéről, vágyairól és vicces szexi történeteiről szólnak; a feladatok fizikai, szexuális feladatok a kijelölt játékos(ok)kal vagy magaddal. A játék fehérneműben indul.

Szintek: 1 Bevezető és 2 Flört: érintés, simogatás, csók, fehérneműben. 3 Szikra: bátrabb kényeztetés, vetkőzés meztelenségig. 4 Szenvedély: meztelen játékosok, intim részek csókolása, simogatása, kézzel kényeztetés, teljes orál nélkül. 5 Tüzes: teljes szex, orális szex.

Szabályok: egy kártya egyetlen feladat legyen, "vagy"-gyal ne kínálj két külön feladatot. Ne kérj engedélyt a szövegben (az app kezeli a beállításokat és a passzt). Ne legyen ivás. Eszköz ne kelljen; kötözés ruhadarabbal megengedett. A partnert az app jelöli ki: "the selected player" / "a kijelölt játékos" / "die gewählte Person". Orális lap: `category: "oral"`, behatolás: `category: "penetration"`; ha a húzó kapja a kényeztetést: `role: "receive"`; ha a húzó saját ruháját veszi le: `clothingType`.

## Munkamenet

Olvasd a projekt AGENTS.md-jét, majd csak a meglévő `src/data/cards.js` és `src/i18n/cardMessages.js` szükséges részét a stílus megértéséhez. A végleges adatformátum változhat, ezért kizárólag a `content/drafts/` könyvtárba írj, a jelenlegi futó kártyakészletet ne cseréld le.

Cél: 160 kártya, szintenként és típusonként 16 darab. Először 20 kártyás mintabatch készüljön: minden szint/típus kombinációhoz 2 kártya. Ezután további 20-as batch-ekkel haladj. Meglévő ID-t ne generálj újra, és ne írd felül más szerkesztő fájlját. Batchenként egy külön `cards-batch-NN.json` fájlt hozz létre. A teljes készletet ne másold a chatbe; rövid összefoglalót és fájlhivatkozást adj.

## Draft JSON-formátum

```json
{
  "schemaVersion": 1,
  "cards": [
    {
      "id": "intro-question-001",
      "kind": "question",
      "intensity": 1,
      "minPlayers": 2,
      "participantCount": 1,
      "durationSeconds": 0,
      "parallelSafe": false,
      "tags": ["conversation", "first-impressions"],
      "text": {
        "en": "What small gesture makes a first meeting memorable for you?",
        "hu": "Milyen apró gesztus tesz számodra emlékezetessé egy első találkozást?",
        "de": "Welche kleine Geste macht ein erstes Treffen für dich unvergesslich?"
      },
      "editorNote": "Easy opening question; does not require personal disclosure."
    }
  ]
}
```

A `participantCount` a feladatban ténylegesen részt vevők száma, 1–8. A `minPlayers` a teljes játék minimális létszáma, legalább 2 és nem kisebb a participantCount értékénél. A durationSeconds kérdésnél és egyszeri gesztusnál 0; valóban időt igénylő aktivitásnál indokolt, egész másodperc, legfeljebb 300. ParallelSafe csak egymástól független, párhuzamosan végezhető aktivitásnál true. Az editorNote rövid, angol nyelvű szerkesztői indoklás; nem játékosszöveg.

## Ellenőrzés

Egyedi stabil ID-k; minden kártya mindhárom nyelven; természetes fordítás; legfeljebb 300 karakter nyelvenként; nincs szó szerinti vagy pusztán átnevezett ismétlés. A különböző nyelvek ugyanazt a feladatot jelentsék. Azonos szint/típus kombináción belül legyen változatos témaválasztás. Ne másolj ki létező játékokból kártyákat. Ne találj ki zeneszolgáltatói ID-t, és ne adj meg dalszövegidézetet. Számold össze a batch és a teljes draftkészlet lefedettségét, és a végén jelezd a még hiányzó kombinációkat.
