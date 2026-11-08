# Termékspecifikáció – javasolt MVP

Ez az elkészült MVP alapja. A végleges verzió új, megerősített igényeit és az érintett szabályok módosítását a [HeatItUp 1.0 terv](RELEASE_PLAN.md) tartalmazza: presetek, változó névsor, folytatás és feladathoz választott zene.

## Biztos igények és feltételezések

A felhasználó HeatItUp néven felnőtteknek szóló szexuális/ismerkedős játékot kér, 1–8 fővel; először gyengébb modell által végrehajtható, tokenhatékony tervet. Megerősített technológiai irány: Expo + React, a meglévő multiplatform appok mintájára. Tervezett célok: Android, iOS és web, közös JavaScript forrásból.

A továbbiak **javasolt alapértelmezések**, nem megerősített igények. Ezek módosításának helye ez a fájl; az érintett szerződéseket és feladatokat együtt kell frissíteni.

## Játék

- Magyar multiplatform alkalmazás; mindenki ugyanazt a készüléket használja, körbeadva.
- 1 fő: önismereti kérdések és egyedül végezhető játékos kihívások. 2–8 fő: közös ismerkedés, kérdések és kihívások.
- Belépéskor egy Switch kapcsoló: „Minden résztvevő betöltötte a 18. életévét.” Enélkül nincs továbblépés. Ez önbevallás, nem személyazonosság-ellenőrzés.
- Játékosnevek: 1–8 darab, körülvágott whitespace, névenként 1–20 Unicode-kódpont. Kis-/nagybetűtől függetlenül egyediek magyar locale szerinti kisbetűsítés után. Belső szóközök megmaradnak. Üres sor érvénytelen, nem automatikusan eldobott játékos.
- Választható intenzitási plafon: `1 Szikra`, `2 Flört`, `3 Merész`. Alapérték 1. Mindig az összes, plafonnál nem erősebb kártya használható; nincs automatikus emelés.
- Választható körszám: 3, 5, 10; alapérték 3. Egy körben minden játékos egyszer következik, a megadott névsorrendben. A teljes játék hossza `játékosok × körök` lépés.
- Minden lépésben egy véletlen, megfelelő kártya látszik. A „Kész” és a „Passz” egyaránt elfogyasztja a lépést és a kártyát. Nincs pontozás, verseny vagy passzolási büntetés.
- Több résztvevős kihívásnál az aktuális játékos választ önként jelentkező társat; nincs nemhez, orientációhoz vagy kapcsolati státuszhoz kötött párosítási algoritmus.
- Játék közben bármikor „Játék befejezése”; közvetlenül az összegzésre visz. A még nyitott kártya nem számít megoldottnak vagy passzoltnak.
- A pakli kimerülésekor újrakeverés; ugyanaz a kártya nem jelenhet meg két egymást követő lépésben, ha legalább kettő elérhető.

## Képernyők

1. **Belépés:** logó feliratként, rövid leírás, 18+ kapcsoló, „Kezdjük”. Segédszöveg: „Bármelyik feladat passzolható. Csak azt vállaljátok, ami mindenkinek belefér.”
2. **Beállítás:** egy alap névsor „Játékos 1” értékkel; játékos hozzáadása/törlése; intenzitás és körszám; összes lépés előnézete; „Játék indítása”. Érvénytelen mező mellett konkrét hiba. Egy játékosnál „Egyéni mód” felirat.
3. **Játék:** aktuális játékos, kör `1/3`, játékos `1/2`, kártyatípus, intenzitás, kártyaszöveg; „Kész”, „Passz”, „Játék befejezése”. A kártyák nem tartalmaznak beírható választ és nem kérnek fotót.
4. **Összegzés:** lezárt/tervezett lépések, kész és passz darabszám, teljes vagy megszakított játék. „Új játék ugyanezekkel” új paklit indít. „Beállítások” megtartja a neveket és opciókat szerkesztésre.

## Adatok és hatókör

- Minden állapot csak memóriában él. Webes frissítés vagy a natív app folyamatának újraindulása visszaállítja a belépőképernyőt; ezt röviden jelezze a beállítás képernyő. Egyszerű háttérbe kerülés önmagában nem nulláz.
- Android rendszer-vissza: beállítás → belépés; összegzés → beállítás megtartott adatokkal; játék → megszakított összegzés; belépésen az OS alapművelete. Látható navigációs gombok is legyenek. Weben nincs URL-alapú képernyőelőzmény.
- A 48 magyar kártya buildbe csomagolt adat. A kezdőkészlet flörtölő, kapcsolati és önismereti; nem grafikus. Részletek: 02 feladat.
- Nincs fiók, backend, adatbázis, analitika, online szobakód, chat, távoli matchmaking, fizetés vagy AI-generálás.
- A natív kiadásba csomagolt kártyákhoz nem kell tartalomkiszolgáló. Weben nincs garantált offline újranyitás vagy telepíthető PWA az MVP-ben. A már betöltött játék nem kér új tartalmat a hálózatról.
- Az online többjátékos mód és személyre szabott tartalom külön következő verzió lehet, most ne épüljön hozzájuk infrastruktúra. Store-publikálás és aláírt release-build nem része az első implementálásnak.

## Nyitott termékdöntések

Közös vagy külön eszköz; a félbeszakadt eredeti üzenet folytatása; kívánt kártyahangulat. Új válasz nélkül a fenti alapértelmezések szerint implementálható a terv.
