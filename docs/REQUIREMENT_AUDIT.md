# HeatItUp – a teljes alapkövetelmény és a jelenlegi kód összevetése

A felhasználó által most bemásolt teljes specifikáció szerinti ellenőrzés. A korábbi MVP és 1.0 terv ennél lényegesen szűkebb volt. Az eredeti állapotfelmérést az új általános funkciók elkészülte után az érintett sorokban frissítettük. Nem tekinthető teljes végleges verziónak a jelenlegi implementáció. Több „Hiányzik” sor elavult: a profilok, párok, ruhatár, kerekek, időzítő, szintváltás, elutasítás és körbeadós setup azóta implementált (lásd STATUS.md).

Jelölések: **megvan** = a forrásban implementált; **részleges** = csak egy része vagy eltérő viselkedés; **hiányzik** = nincs megfelelő implementáció. A megvan nem jelent automatikusan tényleges készüléken ellenőrzött kiadást.

| Követelmény | Állapot | Jelenlegi bizonyíték / eltérés |
| --- | --- | --- |
| HeatItUp projekt, Expo / React Native | Megvan | package.json, app.json, src/App.js. |
| Angol kódazonosítók | Megvan | Angol függvény-, változó- és mezőnevek. A megjelenítési szövegek magyarok. |
| 2–8 játékos | Megvan | Új játék és mentés minimuma 2 fő; a régi egyfős preset szerkesztésre továbbra is betölthető. |
| Android / iOS | Részleges | Közös forrás és mindkét JS-export megvan; natív bináris és eszközös QA nincs igazolva. |
| Angol, magyar, német játék | Megvan a jelenlegi tartalomhoz | Lokalizált felület és mind a 48 meglévő kártya; élő váltás tesztelt. A teljes kért tartalmi készlet ettől még hiányzik. |
| Telefon nyelve alapértelmezett, Settings felülírással | Megvan | expo-localization, en/hu/de felismerés, angol fallback; Nyelv képernyő, helyben mentett felülírás. |
| Érzéki, sötét, olvasható felület | Részleges | theme.js sötét palettája és nagy betűk megvannak; a végleges vizuális/kontraszt/eszközös QA hiányzik. |
| Név szerinti hozzáadás | Megvan | SetupScreen.js; egyedi név ellenőrzése. |
| Nem / nemi identitás kiválasztása | Hiányzik | A roster/preset jelenleg nevet és azonosítókat tartalmaz. |
| Párok megjelölése | Hiányzik | Nincs párkapcsolati adat vagy párválasztó. |
| Játékosok körben következnek | Megvan | session.js fix körlistája, szünet/kivétel kezeléssel. |
| „Felelsz vagy mersz” választás minden játékosnál | Megvan | Choosing állapot; csak a választott kérdés/kihívás típusból húz, elavult választás hatástalan. |
| A kért tartalmú kérdés- és feladatkészlet | Megvan | 310 beépített kártya src/data/builtinCards.json-ban, öt szinten explicit 18+ tartalommal; anyanyelvi lektorálás hiányzik. |
| Öt, megfelelően kalibrált szint | Megvan | Fehérneműs kezdés: 1–2 érintés/csók, 3 vetkőzés, 4 meztelen kézi/intim, 5 teljes szex és orál. |
| Kezdő szint kiválasztása | Részleges | Indítás előtt háromfokú plafon állítható; ez nem az öt szint szerinti aktuális/kezdő szint modellje. |
| Játék közben előre/hátra szintváltás | Hiányzik | Nincs szintváltó vagy hozzá tartozó motorátmenet. |
| Négy kör után következő szint ajánlása | Hiányzik | Nincs körhöz kötött szintajánló. |
| Meglévő kérdés-/feladatminták kutatása | Részleges | Webes listák átnézve; a végleges készlet saját szöveg, nem másolat. |
| Ruhadarabok opcionális checkboxlistája | Hiányzik | Nincs ruházati adatmodell vagy szerkesztő. |
| Ruházat változásának követése | Hiányzik | Nincs ruházati állapot vagy feladat utáni ruházatfrissítés. |
| Feladatonkénti időtartam és időzítő | Hiányzik | A kártyák nem tartalmaznak duration mezőt. A GameScreen 300 ms időzítője kizárólag a dupla érintést gátolja. |
| Gyengéd hangjelzés a végén | Hiányzik | Nincs feladatidőzítőhöz kötött audiojelzés. |
| Globális kategóriakapcsolók, a megadott alapértékekkel | Hiányzik | Csak intenzitás- és létszámszűrés van. |
| Egyéni kategóriaengedélyek | Hiányzik | Nincs személyenkénti preferenciamodell. |
| Adó/fogadó szerep külön engedélyezése | Hiányzik | A feladatokhoz sincs strukturált adó/fogadó szerepmodell. |
| Partnerenkénti tiltás, csak párral szabály | Hiányzik | Nincs játékos–játékos engedélyezési mátrix. |
| Presetek mentése és visszatöltése | Részleges | Névsort, körszámot, intenzitást és zeneopciót ment; a hiányzó párok/preferenciák/ruházat nem szerepelnek benne. |
| Párhuzamos feladatvégzés több csoportban, alapból kikapcsolva | Hiányzik | Egyszerre egy nyitott turn és egy aktuális játékos van. |
| Kérdést csak aktuális játékos / mindenki válaszolja | Hiányzik | Nincs ilyen beállítás vagy külön válaszadói kör. |
| Játékosonkénti ismétléskerülés | Hiányzik | Nincs játékoshoz rendelt kártyaelőzmény; újrakeveréskor ismétlődés lehetséges. |
| Játékon belüli ismétléskerülés | Részleges | Paklin belül nem húzza újra ugyanazt a lapot, újrakeveréskor közvetlen ismétlést kerül; nincs szemantikus variáció/csavar. |
| Partner-szerencsekerék, alapból kikapcsolva | Hiányzik | Nincs strukturált partnerkijelölés vagy kerék. |
| Szintfüggő testtáj-szerencsekerék, alapból bekapcsolva | Hiányzik | Nincs testtáj-adat, szűrés vagy kerék. |
| Fogadó szerepű feladatok több résztvevővel | Hiányzik | A kártya csak szöveg, típus, intenzitás és minimumlétszám; nincsenek résztvevői szerepek. |
| Ki kivel mit végzett: részletes eseménytörténet | Hiányzik | A turnlistában csak a soron lévő játékos, kör és eredmény szerepel; partner/aktivitás/szerep és kártyatörténet nincs. |
| Kiegyensúlyozott szerepek, kombinációk és párok ritkább kijelölése | Hiányzik | Körsorrend van, kapcsolati/szerep-alapú kiegyensúlyozás nincs. |
| Elutasítás/passzolás | Részleges | Egyszerű Passz megvan, indok és szabálytanulás nélkül. |
| Elutasítás oka, hatóköre és opcionális presetmentése | Hiányzik | Nem lehet partner-/kategória-/szerepszabályt rögzíteni passzoláskor. |
| Játékmesteres setup | Részleges | Egy személy kitöltheti az egyszerű névsort és opciókat; a teljes kért beállításrendszer hiányzik. |
| Körbeadott telefonos, személyenkénti setup | Hiányzik | Nincs résztvevőnkénti belépési/szerkesztési folyamat. |
| Létszám javítása setup közben, újrakezdés nélkül | Részleges | A központi névlistán lehet hozzáadni/törölni; a körbeadós setup még nem létezik. |

## A később kért kiegészítések

- Játékos szüneteltetése / visszatérése / kivétele a játékból: implementált, motor- és UI-folyamatteszt is van.
- Játék és preset egymástól független kezelése: implementált és tesztelt.
- Játék folytatása: implementált és tesztelt.
- YouTube-lejátszó és saját feladat–dal társítás: implementált, de valós hálózati/eszközös lejátszási QA nincs igazolva.
- Spotify-vezérlés: nincs implementálva; a korábbi tervben dokumentált szolgáltatói akadály továbbra is nyitott.
- A külön YouTube Music app távirányítása: nincs; külső megnyitás van.
- Gyári, ellenőrzött zenei párosítások: hiányoznak.

## Bizonyíték és következtetés

Ellenőrzött fájlok: src/App.js, src/domain/validation.js, session.js, presets.js, types.js, src/screens/*, src/data/cards.js, src/music/selectTrack.js, package.json és app.json. A jelenlegi 47 sikeres teszt az implementált részhalmaz működését vizsgálja; nem bizonyítja a teljes alapkövetelmény megvalósítását.

A jelenlegi termék ismerkedős alapalkalmazás presetekkel és sessionkezeléssel. A teljes bemásolt specifikáció nagy része még nincs sem a kódban, sem a korábbi 1.0 feladatsorban. A korábbi terv teljesítése ezért önmagában nem jelenti ennek az alapkövetelménynek a teljesítését.
