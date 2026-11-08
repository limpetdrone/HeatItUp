# 03 – Játékmotor

**Olvasd:** `docs/CONTRACTS.md`, `src/domain/types.js`, `validation.js`.
**Módosítható:** `src/domain/engine.js`, `engine.test.js`. Szerződésmódosítás csak tényleges ellentmondás javítására.

## Lépések

1. Implementáld az összes motor-exportot és a privát Fisher–Yates keverőt.
2. Kövesd a szerződés számlálóit, húzási sorrendjét és lezárási szabályait. Ne kerüljön a motorba UI-kód vagy tárolás.
3. Kis, teszten belüli kártyakészletekkel és átadott RNG-vel ellenőrizz. A teljes 48 kártyát ne másold tesztbe.

## Kötelező viselkedéstesztek

| Eset | Elvárt eredmény |
| --- | --- |
| 1 játékos, plafon 1 | csak minPlayers=1 és intensity=1 kártya |
| 2 játékos, plafon 2 | mindkét minimum, kizárólag intensity<=2 |
| 8 játékos, 3 kör | pontosan 24 lezárt lépés után befejeződés |
| 1 játékos, 3 kör | pontosan 3 lépés; nincs hiányzó partner |
| Kész, majd Passz | mindkettő léptet; külön számlálók, összegük 2 |
| Nincs megfelelő kártya | startGame hiba, nincs üres játékképernyő |
| Pakli kimerül | új pakli, nincs azonnali ismétlés több kártyánál |
| Egyetlen megfelelő kártya | újrahúzható; nincs végtelen ciklus |
| Játék megszakítása | nyitott kártya nem számít, endReason=stopped |
| Már lezárt állapot léptetése | nincs további változás |
| Befagyasztott bemenetek | nem módosulnak a beállítások, kártyák, Game-tömbök |
| 2 játékos egymás után | index 0, 1, 0; kör 1, 1, 2 a képlet szerint |

Az újrakeverési teszt tudatosan állítson elő olyan sorrendet, ahol csere nélkül az előző kártya kerülne első helyre. Ne csak véletlenül sikeres futást ellenőrizz.

## Kész, ha

A célzott motortesztek és `npm run export` sikeresek. A felület számára minden szerződés szerinti export rendelkezésre áll.

**Átadás:** STATUS frissítése, majd 04.
