# 1.0 – Zenevezérlés és feladathoz választott dal

## Beállítások és felhasználói működés

```text
MusicSettings = {
  mode: 'off' | 'manual' | 'task',                // alap: off
  matchStyle: 'mood' | 'lyric_joke' | 'mixed',   // alap: mixed
  provider: 'youtube' | 'youtube_music' | 'spotify',
  autoStart: boolean,                           // alap: false
  allowExplicitTracks: boolean                  // alap: false
}
```

- **Kikapcsolva:** a játék nem kezdeményez zenei hálózati kérést.
- **Kézi:** a felhasználó az előre szerkesztett dalválasztóból indít; a kártyaváltás nem vált számot.
- **Feladathoz:** minden új nyitott kártyához helyben kiválasztott dalajánlat. AutoStart nélkül a „Dal indítása” gombbal indul; bekapcsolva csak képes szolgáltatón és a platform engedélyével indul automatikusan. Tiltott autoplay esetén látható indítógomb, nem ismételt próbálkozás.
- **Hangulat:** a feladat érzelmi tónusához illő szám. **Dalszövegi poén:** a dal szövegének jelentése ad vicces párhuzamot vagy ellentétet. **Vegyes:** felváltva a két típus, ha mindkettő rendelkezésre áll.

Példa a szerkesztői gondolkodásra: félénk bemutatkozáshoz túlzó magabiztosságról szóló dal; önmagadnak mondott bókhoz önszeretetről szóló szám. A kapcsolatot a dal meghallgatásával kell igazolni, nem a címéből kitalálni. Ezek tartalmi irányok, nem ellenőrzött konkrét dalpárosítások.

Zenepanel: dal/előadó/szolgáltató, indítás/szünet, másik ajánlat, megnyitás a szolgáltatónál. Előző/következő, hangerő és tekerés csak igazoltan támogatott képességgel. „Másik ajánlat” a saját katalógus új jelöltje, nem a szolgáltató lejátszási sorának önkényes léptetése. A dalszövegi poén magyarázata opcionálisan felfedhető.

Játékbefejezéskor és a játék egészének waiting állapotában az app által indított, ténylegesen vezérelhető lejátszás megáll/szünetel. Külső linkes app lejátszását nem tudjuk megbízhatóan megállítani, erre nem mutatunk hamis állapotot. Kézi zenei szünet után a következő kártya nem indíthat újra magától: a felhasználónak újra engedélyeznie kell az automatikus indítást.

## Szolgáltatói képességek, ellenőrizve 2026-11-08

| Út | Tervezett működés | Kiadási állapot |
| --- | --- | --- |
| YouTube beágyazott lejátszó | Látható videó, play/pause, kártyához választott videó betöltése. | Megvalósítható irány, platformteszt szükséges. |
| YouTube Music külső app | Ellenőrzött dal-link kézi megnyitása. | Nem teljes távirányítás; visszaadott playback állapot nincs. |
| Spotify API / SDK | Kért play/pause és feladatfüggő dalindítás. | Jelenleg blokkolt szolgáltatói felhasználási feltétel; nem alapértelmezett fejlesztési feladat. |

**YouTube:** a hivatalos IFrame API vezérli a beágyazott videót. A lejátszó legyen látható, legalább 200×200 képpont; nem készül rejtett, csak hangot kinyerő háttérlejátszó. Elgörgetés, appháttér vagy más képernyő esetén szüneteljen, ha a player már nem látható. Reklám és szolgáltatói vezérlőelem nem takarható el. Web: IFrame; natív: megfelelő origin/azonosítás mellett WebView-ba ágyazott hivatalos player, eszközteszttel. [IFrame API](https://developers.google.com/youtube/iframe_api_reference), [méret és paraméterek](https://developers.google.com/youtube/player_parameters), [lejátszási szabályok](https://developers.google.com/youtube/terms/developer-policies).

**YouTube Music:** a hivatalos [YouTube API-k áttekintésében](https://developers.google.com/youtube) nem igazoltunk a külön Music apphoz általános vezérlő-API-t. Ezt nem pótolja a Data API: az nem távirányító. Privát endpoint, cookie-import, scraping vagy más app képernyőjének automatizálása nem kerül az architektúrába. A konkrét külső Music-linket platformonként ellenőrizni kell; sikertelen megnyitásnál normál YouTube-link ajánlható.

**Spotify:** a [Developer Policy III.2](https://developer.spotify.com/policy) kizárja a játékokat, a III.5 pedig más szolgáltatásokkal integrált tartalmat érint. A teljes HeatItUp-felhasználási eset megengedhetőségének rendezéséig nem tervezünk működőnek tekintett API/SDK adaptert. Külső kézi link csak külön megvizsgált, csökkentett funkciójú alternatíva, nem a tiltás megkerülése és nem a vezérlési igény teljesítése.

Ha a konkrét Spotify-felhasználás engedélyezetté válik, külön ellenőrzendő az OAuth PKCE, az aktuális SDK-k és a lejátszóeszköz-kezelés. A Web API dalindítása Premiumot igényel; a fejlesztői hozzáférés nem egyenlő a nyilvános hozzáféréssel. [Playback API](https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback), [hozzáférési módok](https://developer.spotify.com/documentation/web-api/concepts/quota-modes). Token/secret nem kerül presetbe, sessionmentésbe vagy kliensforrásba.

## Szerkesztett zenei katalógus, 0 futásidejű LLM-token

```text
Track = { id, title, artist, explicit: boolean,
          youtubeVideoId?: string, youtubeMusicUrl?: string,
          spotifyUrl?: string, checkedAt: string }
CardMusicLink = { cardId, trackId, kind: 'mood'|'lyric_joke',
                  reason: string, reviewed: boolean, cueSeconds?: number }
```

`reason` saját szerkesztői megfogalmazás; nem bemásolt dalszöveg. A katalógus nem tartalmaz teljes dalszöveget, hangfájlt vagy szolgáltatóból exportált szövegkorpuszt. A dalszöveg megjelenítése külön, jogosított tartalomforrást igénylő későbbi funkció lenne; a zenei poénhoz most nem kell.

Mind a 48 kiadási kártyához legalább egy meghallgatással ellenőrzött hangulati és egy dalszövegi kapcsolat: legalább 96 kapcsolat, nem feltétlenül 96 külön dal. Valódi azonosítók és elérhető videók, nulla kitalált API-ID. `cueSeconds` csak szerkesztő által ellenőrzött időpont; „Ugrás a poénhoz” kézi lehetőség, ha a provider támogatja a tekerést. Nincs vágott vagy letöltött hangrészlet.

Kiválasztás: kártya → reviewed kapcsolatok → választott szolgáltatón elérhető referenciák → explicit szűrő → kívánt kapcsolatfajta. Vegyes módban a sessionön belüli ajánlatszám párossága váltja a stílust. A kiválasztás session seed + turn ID alapján stabil, ismételt render nem hív RNG-t vagy API-t. Az utolsó öt ajánlott dalt lehetőleg kerülje; ha ez kiüríti a készletet, ez a feltétel lazítható.

Ha a dalszövegi listában nincs találat, az UI ezt jelzi és külön hangulati ajánlatot adhat; nem címkéz hangulati egyezést dalszövegi poénnak. Elérhetetlen videónál legfeljebb egy másik helyi jelölt próbálható, utána kézi választás. Normál játék során nincs élő katalóguskeresés vagy AI-elemzés. Nevek, feladatszövegek és presetek nem kerülnek a zeneszolgáltatóhoz.

## Adapter és aszinkron szerződés

```text
Capabilities = { load: boolean, play: boolean, pause: boolean,
                 seek: boolean, volume: boolean, externalOnly: boolean }
MusicAdapter = { capabilities, load(track), play(), pause(), openExternal(track),
                 subscribe(listener), dispose() }
Playback = { state: 'idle'|'loading'|'ready'|'playing'|'paused'|'needs_gesture'|'external'|'error',
             trackId: string|null, errorCode?: string }
MusicRequestKey = sessionId + turnId + cardRevision + settingsRevision
```

A csak külső megnyitásra képes adapter `play=false`, `pause=false`, `externalOnly=true`; nem szimulál lejátszási státuszt. A UI a képességek alapján mutat vezérlőket. A tényleges playing állapotot a player eseménye igazolja, nem egy sikeresen elküldött parancs.

A játékmotor csak kártya-/sessionállapotot ad; nincs zenei SDK-import. `music/controller.js` figyeli a kulcsot, lemondja/érvényteleníti az előző kérést, sorba rendezi a vezérlést, és eldobja a régi callbackeket. Új kártya, létszám miatti kártyacsere, kilépés, provider- vagy módváltás érvényteleníti az előző kulcsot. Gyors Passz–Passz után nem szólalhat meg egy régi feladat zenéje.

Fájlok: `data/tracks.js`, `data/cardMusicLinks.js`, `music/selectTrack.js`, `music/controller.js`, `music/adapters/youtube.web.js`, `youtube.native.js`, `externalLinks.js`; `components/MusicPanel.js`, `screens/MusicSettingsScreen.js`. A Spotify adapter csak a feltétel rendezése után külön feladat. Az új csomagokat csak az adott feladatban telepítsd.

## Ellenőrzés

Helyi kiválasztás determinisztikus; mindkét kapcsolattípus igazolt; explicit szűrés; hiányzó találat; elavult callback; autoplay tiltása; reklám/bufferelés; régió vagy embed miatt nem elérhető videó; offline állapot; provider-váltás; kézi pause; game waiting; képernyőváltás és háttérbe küldés; külső appból visszatérés. Dalváltás vagy lejátszási hiba soha nem fogyaszt turnt.
