# 1.0 – Presetek és változó játékoslista

Ez a dokumentum az 1.0 névsorkezelésének szerződése. Az itt felülírt MVP-korlátok: csak memóriában élő állapot, név mint játékosazonosító, modulo alapú körléptetés.

## Felhasználói műveletek

| Hely | Művelet | Hatás |
| --- | --- | --- |
| Játékosok panel | Szünet | Átmenetileg kimarad a további kiválasztásból. |
| Játékosok panel | Visszatérés | Újra aktív, a még el nem fogyasztott saját lépésein sorra kerül. |
| Játékosok panel | Kivétel ebből a játékból | A játék hátralévő részében kimarad; a presetben megmarad. |
| Presetek → Szerkesztés | Játékos törlése a presetből | Csak az adott presetből töröl. A már elindított játék változatlan. |

A szünet bármikor visszafordítható. A játékból kivétel előtt rövid megerősítés és név: „Anna ebben a játékban már nem kerül sorra. A presetben megmarad.” A végleg kivett játékos ebben a sessionben nem aktiválható vissza. A preset törlése sem töröl más presetből azonos nevű játékost; nincs globális személynyilvántartás az 1.0-ban.

## Adatmodell – JSDoc-ként implementálandó

```text
PresetMember = { id: string, name: string }
Preset = { id, name, members: PresetMember[], defaults: {maxIntensity, rounds, music} }
SessionPlayer = { id, sourceMemberId: string|null, name, status: 'active'|'paused'|'removed' }
Turn = { id, round: number, playerId, status: 'pending'|'open'|'completed'|'passed'|'omitted',
         omittedReason: null|'paused'|'removed' }
SessionSettings = { maxIntensity, rounds, music } // nincs külön players tömb
Session = { schemaVersion: 2, id, sourcePresetId: string|null,
            roster: SessionPlayer[], settings: SessionSettings, turns: Turn[], cursor: number,
            currentCardId: string|null, cardRevision: number, remainingCardIds: string[],
            phase: 'playing'|'waiting'|'finished', waitReason: null|'no_active_turns'|'no_cards',
            endReason: null|'rounds'|'stopped'|'no_players' }
```

Az ID-k a létrehozó rétegben keletkeznek; a motor nem generál UUID-t vagy időbélyeget. Nevek megjelenítésre valók. Indításkor 1–8 egyedi, az MVP névszabályai szerint validált játékos; mindenki aktív. A presetből teljes mély másolat készül, beleértve a beágyazott zeneopciókat is. Az elindított játék semmilyen motorfüggvénye nem kap preset-tárolót.

Kiadási defaults: új játékhoz 3 kör, Szikra; a zenebeállítás forrása MUSIC.md. Preset név: körülvágott, 1–40 kódpont, a helyi presetek között magyar kisbetűsítéssel egyedi. Új/másolt preset saját ID-t és új member ID-kat kap. Üres preset nem menthető; az utolsó játékos törlésekor új tagot kell megadni vagy az egész presetet törölni.

## Körléptetés, pontosan

Indításkor készíts legfeljebb 80 fix sorszámú turnt: körönként a kezdő névsor minden tagjának egyet. Az ID és a sorrend nem változik névsormódosításkor. A `resolvedTurns % players.length` számítás megszűnik. A következő saját kör a sorban lévő következő `pending` turn; elmúlt turnt nem lehet újranyitni.

1. Kész/Passz csak az egyetlen `open` turnt zárhatja le. Ezután keress következő játszható lépést. Az esemény tartalmazza a várt turn ID-t és cardRevisiont; elavult vagy duplikált esemény hatástalan.
2. Szünet/kivétel az aktuális játékoson: az `open` turn `omitted` lesz a megfelelő okkal. A nyitott kártya elfogyasztott, de nem nő sem a kész, sem a passz érték. A következő játékos új kártyát kap.
3. Szünet egy másik játékoson: a nyitott turn megmarad. A szünetelő jövőbeli turnjei egyelőre `pending` állapotban maradnak.
4. Végleges kivételkor a játékos minden jövőbeli pending turnje `omitted/removed`. A múltbeli eredmények változatlanok.
5. Léptetés előtt: ha nincs aktív játékoshoz tartozó pending turn, de van szünetelőhöz tartozó pending turn, állj `waiting` állapotba. Ne fogyaszd el az összes hátralévő kört pusztán azért, mert mindenki szünetel vagy csak szünetelőnek maradt lépése.
6. Egyébként a sorrendben előtted lévő szünetelő játékos pending turnjeit jelöld `omitted/paused`-ra, amíg el nem éred a következő aktív pending turnt; azt nyisd meg. Így nincs visszamenőleges körpótlás.
7. Visszatéréskor csak a játékos státusza lesz active. A már kimaradt turnjei kimaradtak maradnak. A jelenlegi nyitott kártyát nem előzi meg; várakozó játék esetén újra lefut a léptetés.
8. Ha nincs pending/open turn, vége. Ha mindenki removed, `no_players`; egyébként `rounds`. A kézi befejezés `stopped`, a még nyitott vagy pending turn nem válik kész/passz eredménnyé.

Példa: A–B–C, 3 kör. A első kártyája után B szünetel: B első lépése kimarad, C következik. Ha B C kártyája alatt visszajön, a második körben, A után kerül sorra. Ha B még azelőtt jön vissza, hogy a motor túllépett volna az első turnjén, azt még megkaphatja. Egy turnt soha nem kap meg kétszer.

## Létszámfüggő kártyák

`eligibleCards` az aktív játékosok számát használja. A paused/removed résztvevő nem számít partnernek. Ha a nyitott kártya a létszámváltozás miatt érvénytelen, ugyanannak az aktív játékosnak adj megfelelő másik kártyát; a turn nem fogy el, `cardRevision` nő. A zenefeladat kulcsa is változik. Ha a kártya továbbra is megfelelő, megmarad.

Az alkalmassági készlet változásakor újrakeverhető a teljes megfelelő pakli; azonnali ismétlés elkerülendő, ha van más lap. Az újrakeverés miatti későbbi ismétlés elfogadott. Üres megfelelő paklinál várakozó állapot, olvasható hiba és beállításokra/kilépésre vezető művelet; nincs végtelen húzás. Egy aktív játékos esetén az egyéni mód folytatódik.

## Exportok és fájlhatárok

```text
domain/presets.js: validatePreset, createPresetSnapshot
domain/session.js: startSession, resolveTurn, changePlayerStatus, stopSession, getSessionSummary
storage/repository.js: loadPresets, savePreset, deletePreset, loadSession, saveSession, clearSession
screens/PresetsScreen.js, PresetEditorScreen.js, PlayersScreen.js
```

A tiszta motor függvényei sessiont és szükség esetén kártyákat/RNG-t kapnak, új sessiont adnak. Hibás ID vagy tiltott állapotváltás strukturált hibát ad, nem félkész állapotot. `getSessionSummary` a turnnaplóból számít completed/passed/omitted értékeket; az eredeti tervméret és a még hátralévő lépések külön látszanak. A UI nem tart párhuzamos eredményszámlálót.

## Helyi mentés és folytatás

Külön verziózott rekord: `heatitup.presets.v1` és `heatitup.session.v2`. Natív tárolóként Expo-kompatibilis AsyncStorage, weben ugyanazon repository adapter webes megfelelője; a kiválasztott verzió támogatását F02-ben ellenőrizni kell. Az MVP nem mentett játékot, ezért nincs régi mentés migrálandó; ismeretlen/sérült verzió nem indíthat hibás sessiont.

Írási sorba rendezett snapshotmentés minden érdemi sessionváltozás után; az utolsó állapotnak kell győznie lassú háttértárnál is. A UI csak tényleges siker után állítja, hogy a preset mentve van. Hibánál újrapróbálás, a futó játék maradjon használható. Presetadat és sessionadat nem közös hivatkozás és nem közös mentési művelet.

Visszaolvasáskor validáld az ID-hivatkozásokat, kártya-ID-kat, turnstátuszokat és az egyetlen nyitott turn invariánsát; hibás session nem indítható el.

Folytatáskor a névsorstátusz, turn, aktuális kártya és pakli áll vissza; zene nem indul el magától. Aktív mentés mellett új játék előtt a felhasználó választhat folytatást vagy lecserélést. Teljes játék törlése a sessionrekordot törli, nem a preseteket. Összegzésből új játékhoz a nem removed névsor másolata lesz a szerkeszthető draft; a paused tagok új játékban active állapotból indulnak.

## Elfogadási esetek

- Aktuális / következő / már sorra került tag szüneteltetése és kivétele, 1/2/8 fővel.
- Mind szünetel → waiting; egy visszatér → folytatás. Mindenki removed → lezárás.
- Az aktív tagok lépései elfogytak, csak szünetelőnek maradt → waiting, Visszatérés és Befejezés is működik.
- 2 → 1 aktív fő: páros kártya cserélődik, a turn és az eredmény nem fogy; a késői zenei válasz eldobódik.
- Körhatáron visszatérés, gyors duplakattintás, elavult resolveTurn: nincs dupla lépés vagy kimaradt aktív játékos.
- Szüneteltetés/kivétel/befejezés/folytatás után a preset mély összehasonlítással változatlan.
- Preset szerkesztése/törlése után a már elindított session változatlan, akkor is, ha sourcePresetId már nem található.
- Azonos nevű tag két külön presetben; az egyikből törlés nem érinti a másikat.
- Újraindítás, sérült mentés, sikertelen írás, gyors egymás utáni mentések.
