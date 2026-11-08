# Technikai szerződések

MVP-szerződések. Az 1.0 fejlesztésekor a névsor/session és a zene módosításaihoz a [végleges verzió tervéből](RELEASE_PLAN.md) hivatkozott funkcióspecifikáció az irányadó; a meglévő kód még az alábbi MVP-modellt használja.

Ez a fájl a típusok és a játékmotor egyetlen specifikációja. A példák tervezett interfészek, még nem létező kód.

## Technológia és fájlhatárok

Expo + React Native + JavaScript/JSDoc; npm; StyleSheet; Jest `jest-expo` presettel. Android, iOS és web ugyanazt a kódot használja. A választott kompatibilis függőségeket a `package-lock.json` rögzíti. Nincs router vagy külön állapotkezelő. A pontos telepítés az 01 feladatban.

```text
App.js                    # vékony Expo gyökér, SafeAreaProvider
index.js                  # Expo template belépési pontja
app.json
src/
  App.js                  # képernyők és motorhívások összekötése
  theme.js                # közös színek és térközök
  components/
    ScreenShell.js        # safe area, görgetés, közös szélesség
    ActionButton.js       # közös Pressable és állapotai
  domain/
    types.js              # alábbi típusok
    validation.js         # nevek és beállítások
    validation.test.js
    engine.js             # keverés, húzás, körváltás
    engine.test.js
  data/
    cards.js              # csak statikus kártyaadat
    cards.test.js         # adatminőség, lefedettség
  screens/
    WelcomeScreen.js
    SetupScreen.js
    GameScreen.js
    SummaryScreen.js
```

`types` → `validation`, `engine`, `cards` → `App` → képernyő-propok. A képernyők ne importálják a teljes kártyakészletet vagy a motort. További komponens csak tényleges ismétlődéshez.

## Adatmodell

```js
/** @typedef {1 | 2 | 3} Intensity */
/** @typedef {'question' | 'challenge'} CardKind */
/**
 * @typedef {Object} Card
 * @property {string} id Stabil, egyedi, pl. spark-q-solo-01
 * @property {string} text Magyar, legfeljebb 240 kódpont
 * @property {CardKind} kind
 * @property {Intensity} intensity
 * @property {1 | 2} minPlayers 1 = egyedül és csoportban is használható
 */
/**
 * @typedef {Object} Settings
 * @property {string[]} players Normalizált nevek a validáció után
 * @property {Intensity} maxIntensity
 * @property {3 | 5 | 10} rounds
 */
/** @typedef {{ok: true, settings: Settings} | {ok: false, errors: string[]}} SetupResult */
/** @typedef {'completed' | 'passed'} Outcome */
/**
 * @typedef {Object} Game
 * @property {Settings} settings
 * @property {number} resolvedTurns Mindig completed + passed
 * @property {number} completed
 * @property {number} passed
 * @property {string | null} currentCardId
 * @property {string[]} remainingCardIds
 * @property {null | 'rounds' | 'stopped'} endReason
 */
/** @typedef {{ok: true, game: Game} | {ok: false, error: string}} StartResult */
/** @typedef {() => number} Rng 0 <= érték < 1 */
/** @typedef {{screen: 'welcome'} | {screen: 'setup', draft: Settings} | {screen: 'game', game: Game} | {screen: 'summary', game: Game}} AppState */
export {};
```

A beállítás draftja tartalmazhat hibás neveket; `validateSettings` nélkül nem kerülhet a motorba. Számolt értéket ne tárolj újra: `totalTurns = players.length * rounds`; aktív index `resolvedTurns % players.length`; kör `floor(resolvedTurns / players.length) + 1`. Utóbbiak csak aktív játékban jelennek meg.

## Exportok és működés

Az alábbi aláírások jelölések, nem JavaScript forrás. Az implementációban JSDoc `@param` / `@returns`, típushivatkozás például `import('./types').Game`; nincs runtime típusimport.

```text
validateSettings(input: Settings): SetupResult
eligibleCards(cards: readonly Card[], settings: Settings): Card[]
startGame(settings: Settings, cards: readonly Card[], rng?: Rng): StartResult
resolveTurn(game: Game, outcome: Outcome,
  cards: readonly Card[], rng?: Rng): Game
stopGame(game: Game): Game
```

- `validateSettings`: PRODUCT névszabályai; létszám és enumok ellenőrzése; siker esetén új, tisztított Settings. Kódpontszám: `Array.from(name).length`. Nem üres, mezőt azonosító magyar hibák. Bemenet nem változhat.
- `eligibleCards`: `intensity <= maxIntensity` ÉS `minPlayers <= players.length`. Nincs nemi vagy más rejtett szűrő.
- `startGame`: validál, szűr, üres paklinál magyar hibát ad; egyébként Fisher–Yates keverés, első kártya húzása, nulla számlálók. A settings és a tömbök másolatok.
- `resolveTurn`: lezárt játéknál változtatás nélkül visszaadja azt. Egyébként növeli a megfelelő számlálót és `resolvedTurns`-t. Ha elérte a célt: `endReason='rounds'`, `currentCardId=null`, nincs új húzás. Különben a következő kártyát húzza.
- Húzás: a `remainingCardIds` első eleme az új kártya, a többi marad. Ha üres, az összes megfelelő kártya újrakeverendő. Ha az első az előző kártya és a pakli legalább kételemű, cseréld az elsőt a másodikkal. Egyetlen kártyával ismétlés megengedett. Üres pakli csak induláskor kezelendő: a kártyakészlet és beállítások játék közben nem változnak.
- `stopGame`: lezárt játéknál nincs változás; máskor új Game `endReason='stopped'`, `currentCardId=null`, a számlálók megtartásával.
- A keverő belső segédfüggvény; véletlen alapérték `Math.random`. Tesztben átadott, determinisztikus RNG. Nincs végtelen újrahúzás vagy `sort(() => Math.random() - .5)`.
- Minden függvény tiszta a paraméterként kapott RNG-től eltekintve. Nincs DOM, időzítő, tároló, hálózat vagy helyben tömbmódosítás a bemeneteken.

## UI-integráció

`App` tartja az AppState-et és kezeli a képernyőváltásokat. A 18+ nyilatkozat a Welcome belső állapota. A Setup saját draftot szerkeszt; a motor csak sikeres validáció után indul. A hibás indítás a Setup képernyőn marad olvasható hibával.

A képernyők megkapják a szükséges adatot és callbackeket. `GameScreen` megkapja a feloldott aktuális Card-ot; véletlenhúzás kizárólag eseménykezelőből történik, soha renderből, effectből vagy React funkcionális state-updaterből. Az eseménykezelő számolja ki az új állapotot, majd állítsa be. A gyors dupla művelet ellen a Kész/Passz közös, 300 ms-os zára szolgáljon, kilépéskor takarítva az időzítőt.

Felhasználói neveket `Text` komponensben jeleníts meg. A summary adatai a motor számlálói, nem újraszámolt UI-előzmény.

Közös UI: View, Text, Pressable, TextInput, ScrollView, Switch, KeyboardAvoidingView; nem HTML-elemek. Safe area: `react-native-safe-area-context`. Android-vissza a PRODUCT szerint, BackHandler-feliratkozás takarításával. A folyamat újraindulása welcome állapotot jelent.
