# HeatItUp

**Teljességi audit:** a most megadott teljes alapkövetelmény jelentős része még hiányzik. Tételes összevetés: [REQUIREMENT_AUDIT.md](docs/REQUIREMENT_AUDIT.md). A korábbi 1.0 terv szűkebb hatókört fed le.

Angol, magyar és német nyelvű, 2–8 fős felnőtt ismerkedős játék Expo / React Native alapon, közös Android-, iOS- és webforrással. Az 1.0 fő funkciói implementálva; a teljes nyilvános kiadás még nincs készre minősítve. Pontos állapot: [STATUS.md](STATUS.md), nyitott kiadási feltételek: [RELEASE_NOTES.md](RELEASE_NOTES.md).

## Indítás

```bash
npm install
npm start
```

Node.js és npm szükséges. Hálózati hozzáférés mellett tiszta telepítéshez `npm ci`. Expo SDK 57-et támogató Expo Go vagy development build szükséges natívan.

| Parancs | Működés |
| --- | --- |
| npm run web | webes fejlesztői szerver |
| npm run android / npm run ios | natív kliens vagy szimulátor megnyitása |
| npm test | egyszer lefutó tesztek |
| npm run lint | ESLint |
| npm run export | production JS/asset export mindhárom platformra |
| npx expo run:android / npx expo run:ios | helyi natív development build megfelelő SDK/Xcode mellett |

Az EAS preview/production profilok az eas.json-ban vannak; EAS-projektkapcsolat, végleges saját alkalmazásazonosítók és aláírás szükséges a natív kiadáshoz. A JS-export nem natív alkalmazásbuild.

## Használat

- A kezdőlapon új játék, korábbi játék folytatása, mentett játék törlése, presetek és zenebeállítások érhetők el. A játékindítás és folytatás 18+ önbevalláshoz kötött.
- 48 kártya három nyelven, három intenzitás, 3/5/10 kör. Minden lépés előtt Felelsz/Mersz választás; a Kész és a Passz is egy lépés.
- A Játékosok panelen szüneteltetés, visszatérés vagy végleges kivétel az aktuális játékból. A preset nem változik. Tartós tagtörlés a presetszerkesztőben történik.
- Mindenki szünetelésekor várakozás; egy visszatérő résztvevővel folytatható. Egy aktív főnél csak egyéni kártya kerül sorra.
- A session helyben mentődik, és újraindítás után folytatható. A presetek, a játék és a zenekatalógus külön rekordok.
- Zene: kikapcsolva, kézi vagy feladathoz választott dal; hangulat, dalszövegi poén vagy vegyes stílus. Játék közben 0 LLM-hívás.

## Nyelv

Alapértelmezés a telefon első támogatott nyelve (English/Magyar/Deutsch); más nyelvnél angol. A kezdőlap Nyelv gombjával a beállítás felülírható, vagy visszaállítható automatikusra. A választás a készüléken megmarad. A játékosnevek és saját szövegek nem fordítódnak le.

A régi egyfős presetek szerkesztésre megnyithatók, de indításhoz és új mentéshez legalább két név szükséges. Egy korábbi egyfős játékmentés a megváltozott létszámszabály miatt nem folytatható.

## Zenekatalógus

A saját katalógus üresből indul. A Zene beállításainál válassz feladatot, adj meg YouTube/YouTube Music HTTPS dal-linket, címet, rövid indoklást és kapcsolattípust. Meghallgatással ellenőrzött párosítást jelölj jóváhagyottnak; csak ilyen dal kerül az ajánlatokba. Explicit dal külön jelölhető és szűrhető.

A YouTube-player a játék alatt látható marad, saját vezérlőivel indítható/szüneteltethető. YouTube Music esetén külső megnyitás történik; ez nem a külön app távirányítása. Spotify-vezérlés nem implementált a tervben dokumentált szolgáltatói korlát miatt. A 48 kártyához tervezett 96 gyári, meghallgatott párosítás még hiányzik.

## Ellenőrzés és korlátok

47 automatikus teszt (köztük preset → játék → szünet → újraindítás → folytatás UI-folyamat), lint és Android/iOS/web export sikeres. Az új függőségek letöltését az itteni npm DNS-hiba akadályozta; a helyi ellenőrzés külön csomagmásolatból, a lockfile bővítése eredeti csomagmetaadatokból történt. Az offline npm ci dry-run sikeres; tiszta telepítés hálózattal még ellenőrzendő.

A környezet nem engedett helyi HTTP-szervert indítani, így a vizuális böngészős ellenőrzés nem történt meg. Eszközös/akadálymentességi teszt, valós YouTube-lejátszás és natív bináris build még szükséges. Ezeket nem helyettesítik az automatikus tesztek.

## Fejlesztői belépési pontok

- [AGENTS.md](AGENTS.md): tokenhatékony munkarend.
- [1.0 terv](docs/RELEASE_PLAN.md), [feladatok](docs/release/TASKS.md).
- [Névsor/preset specifikáció](docs/release/PLAYERS.md), [zenei specifikáció](docs/release/MUSIC.md).
- [Adatkezelési működés](PRIVACY.md).

Fejlesztéskor az aktuális feladatot és annak olvasási listáját töltsd be. A működéshez nincs saját backend vagy AI API-kulcs. Publikálás külön felhasználói utasításra történik.
