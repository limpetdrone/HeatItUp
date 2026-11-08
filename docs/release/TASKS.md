# 1.0 – Végrehajtási sorrend

Minden feladat végén: célzott ellenőrzés, rövid STATUS-frissítés. A teljes fájlt ne olvasd újra minden körben; az aktuális szakasz és a megadott olvasási lista elég. A feladatok most tervállapotban vannak. A tényleges implementálást új felhasználói kérés indítja.

## F01 – Megbízható kiinduló build

Olvasd: STATUS, package.json, a korábbi 06-validation feladat.

- A lockfile már megjelent a repóban; ellenőrizd az aktuális telepítést, ne tekintsd továbbra is biztosan blokkoltnak a régi npm-hiba miatt.
- `npm ci`, tesztek, lint, Expo Doctor, teljes platformexport. Javítsd a tényleges hibákat, őrizd meg a működő SDK-verziókat.
- Nyisd meg a jelenlegi UI-t weben és az elérhető natív célokon; jegyezd fel a kiinduló hibákat.
- Kész: reprodukálható alap és platformonként pontos ellenőrzési státusz. Sikertelen natív eszközteszt nem állhat sikeresként.

## F02 – Preset adattár és szerkesztő

Olvasd: PLAYERS.md adatmodell, mentés; meglévő validation.js.

- Közös stabil ID-k és validáció; presets domain + repository adapter, verziózott tárolás.
- Preset lista, létrehozás, másolat, szerkesztés, tagtörlés és presettörlés. A tárolási csomag kompatibilitását célzott hivatalos dokumentációval ellenőrizd.
- A Setup presetből mélyen másolt draftot kap. Explicit „Mentés presetként”, nem automatikus visszaírás.
- Teszt: névütközés, 1/8 tag, üres lista, másolat függetlensége, sérült adat, íráshiba és újraindítás utáni visszaolvasás.
- Kész: a preset egy app-újraindítás után is helyes; hibás mentésre nincs sikerjelzés.

## F03 – Sessionmotor változó névsorral

Olvasd: PLAYERS.md körléptetés és exportok; meglévő engine.js / engine.test.js.

- A modulo alapú motort váltsd ki a fix turnlistával, roster státuszokkal és session/cardRevision azonosítással.
- Implementáld a pause/resume/remove műveleteket, waiting állapotot és a létszámfüggő újrahúzást. A preset repositoryt a motor nem importálhatja.
- Az MVP tesztjeit alakítsd át az új szerződésre; egészítsd ki a PLAYERS elfogadási eseteivel és elavult eseményteszttel.
- Kész: 1/2/8 fő, körhatárok, mindenki szünetel/eltávozik, 2→1 fő és visszatérés determinisztikusan helyes.

## F04 – Játékosok panel és folytatás

Olvasd: PLAYERS.md felhasználói műveletek, mentés; App.js és GameScreen.js.

- Kösd be a sessionmotort, PlayersScreen-t, státuszokat, a játékból kivétel megerősítését és a waiting képernyőt.
- Állítsd át az összegzést: kész/passz/kimaradt külön, eredeti terv és hátralévő lépések láthatók.
- Sessionmentés soros írásokkal; folytatás pontos kártyával, névsorral és paklival. Újrakezdés az előírt draftból.
- Teszteld a felhasználói folyamatot és bizonyítsd, hogy sem a session-, sem a presetműveletek nem írják át egymást.
- Kész: játék közben elmenő és visszatérő résztvevőt új játék indítása nélkül kezel a felület.

## F05 – Szolgáltatói megvalósíthatóság lezárása

Olvasd: MUSIC.md szolgáltatói képességek és az ott hivatkozott aktuális elsődleges források.

- Rögzíts platformonként igazolt capability táblát: YouTube embed, YouTube Music megnyitás, Spotify kért vezérlés.
- Spotify játékhasználat és közös zenei integráció jelenleg blokkolt. Ha nincs igazolt megengedett út, ezt rögzítsd; ne építs API-prototípust megoldásként a szerződéses akadályra.
- A hiányzó YouTube Music távirányítást ne pótold privát API-val. A külső megnyitás külön képesség.
- Kész: konkrét technikai út és akadálylista; nyilvános integrációként csak igazolt képesség szerepel. Szolgáltató megkeresése/üzenetküldés külön felhasználói utasítást igényel.
- Az F06–F08 független részei folytathatók, az F09 és a teljes kért hatókör kiadása a rendezésre vár.

## F06 – Zenekatalógus és helyi kiválasztás

Olvasd: MUSIC.md beállítások és katalógus; a kártyákból csak az aktuálisan szerkesztett rész.

- Tracks és cardMusicLinks fájlok, katalógusvalidáció és tiszta selectTrack függvény.
- Először 6 kártyával járasd végig a működést; végső tartalmi munka után mind a 48 kártyánál legyen mindkét kapcsolattípus.
- Csak ellenőrzött dalhivatkozás és szerkesztői indoklás. Az ellenőrizetlen kapcsolat reviewed=false, így nem kerül éles ajánlatba.
- Teszt: determinisztikus választás, stílusváltás, explicit szűrés, ismétléskerülés, hiányzó forrás vagy találat. A teszt nem helyettesíti a dalszövegi poén emberi ellenőrzését.
- Kész: legalább 96 ellenőrzött kapcsolat és játék közben 0 LLM-hívás. A tartalmilag még nem ellenőrzött sorok nyitott feladatok maradnak.

## F07 – Zenei beállítások, vezérlő és YouTube

Olvasd: MUSIC.md adapter és felhasználói működés; F05 eredménye.

- MusicSettingsScreen, helyi beállításmentés, MusicPanel és szolgáltatófüggetlen controller.
- Webes IFrame, natív WebView adapter. A player originje/azonosítása és a platformos SDK/csomagverzió célzottan ellenőrizendő.
- Csak olyan képernyőn játsszon a YouTube, ahol a valódi player látható; háttérbe kerülés, panelcsukás és képernyőváltás kezelése.
- Teszt: lejátszás/szünet, eseményalapú státusz, tiltott autoplay, régiós/embedding hiba, offline helyzet; kártya- és providerváltás során régi callback eldobása.
- Kész: a kért feladathoz dalválasztás ténylegesen működik YouTube-pal weben és natív célokon. A linkes Music mód világosan külső megnyitásként viselkedik.

## F08 – A két funkció együtt és használhatóság

Olvasd: PLAYERS/MUSIC elfogadási esetek, az érintett UI-fájlok.

- Játékos kivétele zenebetöltés közben; 2→1 fő miatti kártyacsere; mindenki szünetel; játék folytatása; többszöri gyors passz.
- 320 px webnézet, natív kis képernyő, 8 név és billentyűzet, nagy betűméret, VoiceOver/TalkBack, webes billentyűzet és fókusz.
- YouTube player mellett is elérhető Kész/Passz és játékoskezelés; nincs levágott vezérlő vagy észrevétlenül tovább szóló elrejtett player.
- Kész: platformonként rögzített eredmény; a fennmaradó tényleges hibák javítva, az eszközhiány külön feltüntetve.

## F09 – Spotify, feltételes megvalósítás

Előfeltétel: F05-ben igazolt, a teljes HeatItUp-esetre érvényes megengedett út. Ennek hiányában a feladat blokkolt, nem kész.

- A jóváhagyott hozzáféréshez válassz platformonként API/SDK megoldást; pontosítsd a capability táblát a kód előtt.
- Hitelesítés, kapcsolatbontás, választott lejátszóeszköz, play/pause, feladatfüggő dalindítás, tokenfrissítés és hibakezelés. A tokenek tárolási módja külön biztonságos adapter.
- Teszt: engedélymegtagadás, lejárt kapcsolat, Premium/aktív eszköz hiánya, kvóta/rate limit, appváltás, régi parancsok. Nincs kettős lejátszás két provideren.
- Kész: tényleges Spotify-fiókkal/platformonként ellenőrzött és a tervezett nyilvános használatra elérhető funkció. Ha csak kézi külső megnyitás lehetséges, az kisebb hatókör, nem az F09 teljesítése.

## F10 – Kiadási csomag

Olvasd: RELEASE_PLAN készültség, STATUS, releváns buildkonfiguráció.

- Reprodukálható telepítés, teljes teszt/lint/export, kiadási build Androidra és iOS-re, ellenőrzött webes production csomag.
- Név/ikon/splash, saját bundle/package azonosítók, verziózás, szükséges EAS/buildprofilok. Felesleges engedély és nem használt csomag ne maradjon.
- Adatkezelési leírás: mi mentődik helyben, mit kap a zenei szolgáltató, hogyan törölhető. Store-leírás és korhatár a tényleges tartalom alapján; a lejátszó szolgáltatói előírásai is teljesülnek.
- Friss telepítés, mentés-visszaállítás, frissítési migráció és hálózat nélküli alapjáték ellenőrzése.
- Kész: ellenőrzött kiadási artifactok és rövid kiadási jegyzet. A teljes kért zenei hatókör csak F05/F09 rendezése után kész; eltérő, szűkített verzióhoz explicit termékdöntés kell. Store-feltöltés/publikálás külön utasításra.
