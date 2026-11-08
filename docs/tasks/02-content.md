# 02 – Típusok, validáció, kártyák

**Olvasd:** `docs/CONTRACTS.md`; `docs/PRODUCT.md` Játék és Adatok részei.
**Módosítható:** `src/domain/types.js`, `validation.js`, `validation.test.js`, `src/data/cards.js`, `cards.test.js`.

## Lépések

1. Írd meg a közös JSDoc-típusokat és `validateSettings`-et a szerződés szerint. A névellenőrzést egy helyen implementáld.
2. Exportálj `cards` néven pontosan 48 magyar kártyát. Mátrix: 3 intenzitás × 2 típus × 2 minPlayers érték × 4 kártya. Így minden kombinációban pontosan 4 van.
3. A kártyák legyenek rövidek, természetesek, egymástól tartalmilag különbözők. Nincsenek helyettesítendő sablonváltozók. A `minPlayers: 1` szöveg egyedül is értelmes; csoportban az aktuális játékosra vonatkozik. A `minPlayers: 2` szöveg maga jelzi a szabad partnerválasztást.
4. Hangulat: Szikra = könnyed ismerkedés; Flört = vonzalom és játékos bókok; Merész = intimebb érzések, vágyakról és határokról folytatott beszélgetés, grafikus részletek nélkül. A kihívásnak legyen konkrét, röviden végrehajtható feladata. Ne legyen iváskényszer, megszégyenítés, veszélyes feladat vagy visszautasítási büntetés.

## Stíluspéldák, nem külön kötelező készlet

| Szint | Típus / minimum | Példa |
| --- | --- | --- |
| 1 | question / 1 | Milyen tulajdonság kelti fel először az érdeklődésedet? |
| 1 | challenge / 1 | Fogalmazd meg három szóban, milyen hangulatot hozol ma. |
| 2 | question / 2 | Válassz valakit, aki szívesen válaszol: milyen bók esne most jól neki? |
| 2 | challenge / 2 | Mondj egy őszinte, személyes bókot egy önként jelentkező játékosnak. |
| 3 | question / 1 | Mitől érzed úgy, hogy szabadon beszélhetsz az intim vágyaidról? |
| 3 | challenge / 1 | Fejezd be a mondatot: „Akkor érzem magam igazán kívánatosnak, amikor…” |

## Kész, ha

- Célzott Jest-futás sikeres: validáció és kártyák.
- Validációs esetek: 0/1/8/9 játékos; üres/whitespace név; 20/21 kódpont; duplikátum körülvágás és magyar kisbetűsítés után; helyes névnormalizálás; hibás intenzitás/körszám. Kódponttesztben több UTF-16 egységből álló karakter is legyen.
- Adatteszt: pontos mátrix és darabszám; egyedi ID; nincs azonos kártyaszöveg; nem üres és legfeljebb 240 kódpontos szöveg; érvényes enumértékek.
- A szövegek kézi átolvasása is megtörtént: a teszt önmagában nem igazolja, hogy egy kártya egyedül játszható.
- `npm run export` sikeres. UI még nem része ennek a feladatnak.

**Átadás:** STATUS frissítése, majd 03. A későbbi feladatokhoz a teljes 48 kártya ismételt beolvasása nem szükséges.
