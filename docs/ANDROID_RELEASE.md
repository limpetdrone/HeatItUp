# Automatikus Android build és Google Play-feltöltés

Cél: `com.limpetdrone.heatitup`, EAS `production` build, Google Play **alpha / draft**. A draft feltöltést jelent, a tesztelőknek történő kiadás külön Play Console-művelet.

## Helyi használat

Az EAS CLI (ellenőrzött: 22.2.0), bejelentkezett Expo-fiók, beállított EAS Android aláírókulcs és a Google Play szolgáltatásfiók szükséges. A meglévő kulcs alapértelmezett helye `~/.private_keys/google-play-key.json`; más hely megadható a `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` környezeti változóval. A fájlnak a repón kívül kell lennie. A kulcs projektazonosítója nem az app package neve: a meglévő `kellesz-app` szolgáltatásfiók használható, ha a Play Console-ban ehhez az apphoz is jogosult.

```sh
npm run check:android:release
npm run release:android
```

A `check` helyben ellenőrzi a konfigurációt és az RSA-kulcs formátumát. Nem igazolja a Play Console-jogosultságokat. A `release` először ellenőrzi az Expo-bejelentkezést, lefuttatja a Jest-teszteket és a lintet, kivárja az új EAS Android-buildet, majd pontosan annak UUID-ját küldi be. A feltöltés eredményét is kivárja. Hiba esetén a folyamat leáll; nem választ automatikusan egy másik vagy régi buildet. A verziókód az EAS szerveren automatikusan nő. Az aláírókulcsnak előre rendelkezésre kell állnia: a build `--freeze-credentials` kapcsolója megakadályozza az interaktív kulcscserét.

Csak build, vagy meglévő csomag beküldése:

```sh
npm run build:android
npm run submit:android -- --path dist-android/HeatItUp-v1.0.0-build2.aab
npm run submit:android -- --id EAS_BUILD_UUID
```

A helyi fájlos példa a már meglevő régi AAB-ra mutat; csak akkor futtasd, ha tényleg azt szeretnéd feltölteni. Az új változásokhoz a `release:android` parancsot használd. A fájlos út a csomagszerkezetet is ellenőrzi, a build-ID-s út pedig a build platformját/állapotát és az elérhető projektazonosítóját. A Google Play végzi a package, aláírás és verziókód végső ellenőrzését.

## Google Play előfeltételek

- A Play Console-ban létrehozott alkalmazás a megfelelő package azonosítóval.
- Engedélyezett Android Developer API a szolgáltatásfiók Google Cloud-projektjében.
- A szolgáltatásfiók e-mail-címe meghívva a Play Console-ba, az apphoz szükséges megtekintési és tesztkiadási jogosultságokkal.
- Az EAS-ben tárolt Android aláírókulcs egyezzen a Play által elfogadott feltöltési kulccsal.
- A listázási és fiókbeállítási követelményeket a Play Console-ban kell rendezni. Jogosultsághibát vagy felhasznált verziókódot a pipeline nem kerül meg.

## GitHub Actions

Workflow: `.github/workflows/android-release.yml`, kézi **Run workflow** indítással. Üres `build_id`: az adott Git-refből új build és feltöltés; megadott UUID: csak az adott build feltöltése. A workflow nem fut automatikusan minden pushra.

A `google-play` GitHub Environmentben vagy a repó secretjei között szükséges:

- `EXPO_TOKEN`: az EAS-projekthez jogosult Expo hozzáférési token.
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: a teljes szolgáltatásfiók JSON-kulcs.

A workflow a kulcsot a runner ideiglenes mappájába, korlátozott jogosultsággal írja, átadja az EAS-nek és a végén eltávolítja. A kulcs nincs a gitben vagy a buildforrásban. Egyszerre egy alpha feltöltés futhat; az új indítás nem szakítja félbe a régit. Az Environmenthez opcionálisan a GitHubon beállítható reviewer, ezt a forrás nem követeli meg.

A workflow és a secret-beállítások csak a repóba való feltöltés, illetve a secretek létrehozása után használhatók. Ezeket ebben a munkamenetben nem aktiváltuk távolról.

## Ellenőrzés és aktuális korlát

- A valódi helyi szolgáltatásfiók-kulcs RSA-ellenőrzése sikeres.
- Az EAS saját konfigurációvalidátora elfogadta az alpha/draft profilt és a környezeti változóból feloldott kulcsútvonalat.
- `npm run test:release`: 10 teszt, hamis parancsfuttatóval, hibás build/kulcs/paraméter, sikertelen auth/teszt/lint/build, megfelelő build-ID és fájlos feltöltés ellenőrzésével.
- A valódi `npm run release:android` az `eas whoami` hívásnál `ENOTFOUND api.expo.dev` hibával megállt. Nem indult távoli build, és nem történt Google Play-feltöltés. Az élő jogosultságok és az end-to-end feltöltés még ellenőrzendők.

Forrás: [Expo Android submission](https://docs.expo.dev/submit/android/), [EAS-konfiguráció](https://docs.expo.dev/eas/json/).
