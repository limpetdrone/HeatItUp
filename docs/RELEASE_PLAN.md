# HeatItUp 1.0 – korábbi, szűkített verzióterv

A később bemásolt teljes alapkövetelményhez ez nem teljes terv. Az eltéréseket a [követelményaudit](REQUIREMENT_AUDIT.md) rögzíti.

Állapot: 1.0 specifikáció; a fő funkciók implementációja elkészült, a részleges ellenőrzéseket és nyitott kiadási feltételeket a STATUS.md / RELEASE_NOTES.md tartalmazza. Az MVP forrása a kiindulópont. A terv kis kontextussal, feladatonként végrehajtható.

## Cél és megerősített igények

Expo + React Native, JavaScript, Android/iOS/web; magyar, 1–8 fős felnőtt ismerkedős játék. A végleges verzióhoz:

- Mentett játékos- és beállításpresetek.
- Játékos szüneteltetése, visszahozása, illetve végleges kivétele **az aktuális játékból**. Ezek nem módosítják a presetet. A presetből törlés csak a preset szerkesztőjében történik.
- Spotify és YouTube Music zenevezérlés igénye; szolgáltatónként valós képességekkel és az alábbi megvalósíthatósági feltételekkel.
- Beállítható feladatfüggő zene: hangulathoz illő, dalszövegi poénra épülő vagy vegyes választás. A szövegi kapcsolat valóban a dal tartalmához kötődjön, ne pusztán a címéhez.
- Tokenhatékony működés: szerkesztett kártya–dal kapcsolatok, helyi kiválasztás, játék közben 0 LLM-hívás.

A korábbi, minden kihívásra fizikai tevékenységet előíró szabály visszavonva; nem követelmény.

## Javasolt 1.0 hatókör

Egy közös készüléken játszott játék. Az MVP intenzitásai, körszámai, Kész/Passz viselkedése és 48 kártyája megmarad; a változó névsor miatt a körléptetés új modellt kap. Helyi presetmentés, félbehagyott játék folytatása, névsorkezelés, zenepanel, feladathoz választott dalok, hibatűrés és ellenőrzött kiadási folyamat készül.

A játék zene és hálózat nélkül is teljesen működik. A külső zeneszolgáltatás hálózatot igényel. Fiókos közösségi rendszer, távoli multiplayer, chat, fizetés és felhős szinkron külön jövőbeli hatókör; az 1.0-hoz nem szükségesek.

## Felhasználói útvonal

1. **Kezdőlap:** Új játék, Játék folytatása (ha van mentés), Presetek, Zene beállításai. Az új játék előtt az eredeti 18+ nyilatkozat.
2. **Preset kiválasztása / új összeállítás:** 1–8 játékos, intenzitás, körszám, zeneopciók. Presetből indulva független munkapéldány készül.
3. **Játék:** kártya, aktuális játékos, kör, Kész/Passz, Játékosok, zenepanel. A zenepanel hibája nem akadályozhatja a játékmenetet.
4. **Játékosok panel:** mindenki státusza, Szünet / Visszatérés / Kivétel ebből a játékból. Rövid felirat: „A mentett preset változatlan marad.”
5. **Összegzés:** kész/passz/kimaradt lépések külön; új játék ugyanazzal a jelen lévő összeállítással, vagy vissza a beállításokhoz. A mentett presetet nem írja felül.
6. **Preset szerkesztése:** név, névsor, opciók, mentés/másolat/törlés. Játékos tartós eltávolítására itt van külön művelet.

## Egyetlen specifikáció funkciónként

- [Játékosok, presetek és körléptetés](release/PLAYERS.md): adattípusok, állapotváltások, mentés, tesztesetek.
- [Zene és szolgáltatók](release/MUSIC.md): vezérlés, dalszövegi kapcsolatok, platformkorlátok, technikai szerződések.
- [Végrehajtási feladatok](release/TASKS.md): F01–F10, olvasási listák, fájlhatárok, kész-feltételek.

Az érintett funkciók 1.0 megvalósításakor ezek felülírják az MVP `PRODUCT.md` / `CONTRACTS.md` idevágó részeit. A többi MVP-szabály továbbra is érvényes.

## Valós szolgáltatói korlátok

**Spotify:** a jelenlegi Developer Policy III.2 tiltja a Spotify-platformra épülő játékokat. Emiatt a kért integrált vezérlés jelenleg termékfüggőségként blokkolt: a konkrét felhasználás megengedhetőségét kell rendezni, nem pusztán SDK-t választani. A másik zenei szolgáltatással közös integrációt is vizsgálni kell. [Spotify Developer Policy](https://developer.spotify.com/policy).

**YouTube Music:** az áttekintett hivatalos felületek YouTube beágyazott lejátszót és adat-API-t dokumentálnak; a külön YouTube Music app általános távirányításához nem találtunk igazolt hivatalos API-t. Tervezhető út: YouTube-lejátszó az alkalmazásban, és külön, kézi „Megnyitás YouTube Musicban” funkció. Az utóbbi nem teljes távirányítás. [Hivatalos YouTube-fejlesztői felületek](https://developers.google.com/youtube).

A teljes, kért Spotify + YT Music távirányítást **nem lehet késznek jelölni** pusztán külső linkekkel. Ha a szolgáltatói feltételek nem teljesülnek, a YouTube-lejátszós, szűkebb kiadást külön termékdöntésként kell elfogadni. A terv elkészítéséhez ez a döntés most nem szükséges.

## Kiadási készültség

- A telepítés lockfile-ból reprodukálható, lint és viselkedéstesztek sikeresek.
- A preset és a játék állapota egymástól független; újraindítás után is igazoltan helyesen áll vissza.
- Változó létszám mellett nincs hibás kör, végtelen várakozásból kivezető művelet nélküli képernyő vagy érvénytelen páros kártya.
- Mindhárom platformon tényleges UI-teszt és az elérhető zenei képességek ellenőrzése; natív development/release build külön bizonyítékkal.
- A szolgáltatói akadályok és az esetleges szűkített hatókör kifejezetten rendezettek. Nem elég egy működő fejlesztői zenefiók.
- Kiadási ikonok, splash, alkalmazásazonosítók, korhatár-/adatkezelési és store-adatok a tényleges működést írják le. Publikálás külön felhasználói utasításra.

## Következő modell indítópromptja

> A HeatItUp 1.0 tervét valósítsd meg. Olvasd az AGENTS.md-t, a STATUS.md-t és a docs/RELEASE_PLAN.md-t. Utána csak a docs/release/TASKS.md aktuális feladatát és annak olvasási listáját töltsd be. Az elkészült MVP-t folytasd; ne scaffoldold újra. A szolgáltatói akadályokat kezeld valós függőségként, ne találj ki API-t és ne jelöld a külső megnyitást távirányításnak. Folyamatosan haladj a független feladatokkal, célzottan ellenőrizz, és tömören frissítsd a STATUS.md-t.
