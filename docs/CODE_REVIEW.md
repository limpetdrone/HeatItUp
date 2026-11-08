# Technikai kódreview – 2026-11-08

Kiinduló commit: `51685ff`. A felhasználó pontosítása alapján a szándékosan kivett funkciók visszaépítése nem része a javításnak. A kártyák tartalomfájlja változatlan.

## Javított hibák

| Prioritás | Hiba és következmény | Javítás |
| --- | --- | --- |
| P1 | Az összes testrész tiltása visszakapcsolta a tiltott választékot. A fogadó szerepű és párhuzamos feladatok néhány résztvevőjének tiltását a kerék kihagyta. | Közös szűrés az összes kijelölt résztvevőre; üres választéknál nincs ilyen kiosztás. A motor és a felület ugyanazt a listát használja. |
| P1 | Partnerkerék után a korábban automatikusan választott testrész az új résztvevőnél tiltott lehetett. | A partnereredményhez újra kiválasztott, megengedett testrész tartozik. |
| P1 | Ruhatárváltozáskor elég volt, hogy létezzen bármilyen legális párosítás; a ténylegesen megjelenített csoport érvénytelen maradhatott. Frissítés után a régi mentés is visszahozhatott tiltott kiosztást. | A konkrét kiosztás ellenőrzése állapotváltozáskor és visszatöltéskor. Érvénytelen kiosztás helyett új húzás/választás. |
| P2 | Az időzítő ±30/+60 másodperces gombjai nem változtattak semmit: az alkalmazás eldobta az eltérést, a motorban pedig hiányzott az `adjust`. | Végigvezetett módosítás, futó és szünetelő időzítő kezelése, 1–300 másodperces időtartamkorlát, elavult események elutasítása. |
| P2 | A pörgetés előtt passzolt lap kimaradt az előzményből, így ugyanaz a játékos újra megkaphatta. | A passz a megtekintett családot is rögzíti; a még ki nem sorsolt partnereket nem jelöli résztvevőnek. |
| P2 | A párhuzamos kiosztás csak az első megmaradt játékost próbálta adó szerepben, ezért megengedett fordított párok kimaradtak. | Mindkét szerepirány vizsgálata, közös testrészfeltételekkel és gyorsítótárazott részeredményekkel. |
| P2 | A meghosszabbított köröket a mentésellenőrzés elutasította; eltávozott játékos mellett a körlista szerkezete is eltért. Mindenki szüneteltetése a körhatáron befejezte a játékot. | A teljes névsorhoz tartozó körlista megőrzése, kibővült körszám validálása és visszatérési lehetőség. |
| P2 | A beállítások megnyitása lebontotta az adatlapot, így az el nem mentett nevek és az aktuális oldal elvesztek. | Beállítási modal, amely megőrzi az alatta levő szerkesztő állapotát. |
| P2 | A dinamikus testrész behelyettesítése angol/német felületen magyar címkét adhatott. | A behelyettesítés megőrzi a címke nyelvét; az ismeretlen nemhez tartozó általános címke is megmarad. |

Kiegészítő javítások: hibás mentési előzmény elutasítása; üres kerék indításának tiltása; hook függőségek és használaton kívüli importok rendezése. A módosított motorkód olvasható formázást kapott.

## Ellenőrzés

- Kiindulás: 84 teszt sikeres; lint 17 figyelmeztetéssel. Az első kilenc célzott regressziós teszt mind reprodukálta a hibáját a javítás előtt.
- Végállapot: **100/100 teszt**, 14 tesztcsomag; lint hiba és figyelmeztetés nélkül.
- Android, iOS és web Expo JS-export sikeres; `git diff --check` sikeres.
- A 16 új teszt a `src/domain/reviewRegression.test.js`, `src/App.test.js` és `src/domain/renderCard.test.js` fájlokban van.
- Nyolcfős párhuzamos húzás helyi mérése: 1. szint 68 ms, 3. szint 64 ms, 5. szint 28 ms. Ez asztali futtatási adat, nem telefonos mérés.

Ebben a review-ban nem futott aláírt natív build vagy valódi eszközös teszt. Az új beállítási modal, a kerék animációja, a hangjelzés, a háttérből visszatérés és a képernyőolvasó eszközös ellenőrzése marad hátra. A JS-export ezeket nem igazolja.
