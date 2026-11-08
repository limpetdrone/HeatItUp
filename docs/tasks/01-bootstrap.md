# 01 – Expo projektváz

**Olvasd:** `docs/CONTRACTS.md` Technológia és fájlhatárok részét.
**Előfeltétel:** a felhasználó megvalósítást kér.

## Lépések

1. Ellenőrizd a helyi fájlokat és Node/npm verziót. A referenciaappok Expo SDK 57-et használtak a tervezéskor. Függőségeiket ne másold át: a kiválasztott template és Expo kompatibilitási ellenőrzése az irányadó.
2. Új, üres ideiglenes könyvtárba generálj: `npx create-expo-app@latest <üres-ideiglenes-könyvtár> --template blank --no-install --no-agents-md`. Ez a JavaScript alap, nem a routeres default. A kapott alkalmazásfájlokat másold a HeatItUp repóba; az itteni AGENTS/README/docs/STATUS és `.git` megőrzendő. `.gitignore` egyesítendő. Ha a scaffold saját `.git`-et hoz létre, azt ne másold át.
3. Név `HeatItUp`, slug/package név `heatitup`, `private: true`. `app.json`: Android/iOS/web platformok. Más appok bundle/package ID-ját és EAS projektazonosítóját ne másold. Most nem kell EAS-fiók vagy aláírás.
4. `npm install`, majd `npx expo install react-dom react-native-web @expo/metro-runtime react-native-safe-area-context`. Tesztek: `npx expo install jest-expo jest --dev`; package.json Jest preset: `jest-expo`. ESLint: `npx expo lint`. Lockfile megtartandó.
5. Scriptnevek: `start` → `expo start`; `android` → `expo start --android`; `ios` → `expo start --ios`; `web` → `expo start --web`; `lint` → `expo lint`; `test` → `jest --runInBand`; `export` → `expo export --platform all`.
6. Template belépési pontja marad. Gyökér App.js: SafeAreaProvider és src/App.js. Kezdetben csak HeatItUp felirat. A template ikonja maradhat; új grafika nem feladat. A webes export ugyanabból a React Native kódból készül.
7. README futtatási rész: npm install/start/android/ios/web/test/lint/export. Expo Go csak a telepített SDK-t támogató klienssel; eltérésnél dokumentált helyi development build. Ne váltogass SDK-t próbálgatásból.

## Kész, ha

`npm run lint`, `npm run export`, `npx expo-doctor` sikeres, a felirat weben megnyitható. A tényleges natív megnyitás állapotát külön rögzítsd, ne következtesd a bundle-exportból. Tesztfájl még nincs; ne állíts sikeres tesztfutást.

## Célzott hivatalos referenciák

- [Scaffold és blank sablon](https://docs.expo.dev/more/create-expo/)
- [Jest konfiguráció, JavaScriptnél típuscsomag nélkül](https://docs.expo.dev/develop/unit-testing/)
- [Expo lint](https://docs.expo.dev/guides/using-eslint/)
- [Web támogatás](https://docs.expo.dev/workflow/web/)
- [Expo CLI export](https://docs.expo.dev/more/expo-cli/)

A telepített SDK dokumentációját olvasd, csak a szükséges oldalt. **Átadás:** STATUS frissítése, majd 02.
