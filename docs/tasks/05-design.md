# 05 – Megjelenés és hozzáférhetőség

**Olvasd:** `docs/PRODUCT.md` Képernyők; képernyő JSX-ek, `theme.js`, közös komponensek.
**Módosítható:** megjelenés és hozzáférhetőség. Játékszabályt ne változtass.

## Vizuális döntések

- Sötét, letisztult, felnőtt hangulat; feliratlogó. Nincs képgenerálás, stock fotó, külső font vagy ikoncsomag.
- `theme.js`: háttér `#130D18`, felület `#23172C`, szöveg `#FFF7FA`, másodlagos szöveg `#C9B8C8`, akcentus `#FF7A90`, akcentuson sötét szöveg `#130D18`, fókusz `#FFC56E`.
- Rendszerbetűk; tartalom legfeljebb 560 logikai egység széles, középre igazítva. Oldalsó padding 16, tág képernyőn 24. Alapszöveg 16, lineHeight 24. React Native StyleSheet; nincs külön webes CSS-rendszer.
- Kártya: 24 padding, 20 borderRadius. Érintési cél legalább 44×44 logikai egység. Passz mindig jól látható. Intenzitás felirattal és számmal is, nem csak színnel.

## Viselkedés

1. 320 logikai egység szélességtől nincs vízszintes túlcsordulás. Hosszú név és kártyaszöveg törhet. ScreenShell kezeli a safe areát és a görgetést. A billentyűzet nem takarhatja el a szerkesztett névmezőt vagy az indítást 8 névnél sem.
2. ActionButton közös Pressable; szerep, label, disabled állapot és webes fókuszjelzés. Névmezőhöz látható Text címke és accessibilityLabel. Intenzitás/körszám: Pressable választógombok kijelölési állapottal; nincs HTML select.
3. Hibaüzenet felolvasása; képernyő/kártyaváltás akadálymentes jelzése a telepített RN API-jával. Android, iOS és web külön ellenőrzendő, egy API hatását ne feltételezd mindhárom platformon. [React Native hozzáférhetőség](https://reactnative.dev/docs/accessibility).
4. MVP-ben nincs animáció, automatikus lapozás vagy hang. A rendszer betűméret-nagyítását ne tiltsd le; hosszú szövegnél görgetés, ne levágás.
5. Normál szövegnél cél legalább 4.5:1 kontraszt. Ne tegyél halvány szöveget az akcentusszínre.

## Kész, ha

Weben 320×568, 390×844 és 1280×800 méretben, natívan elérhető kis képernyőn nincs levágott funkció. Weben billentyűzettel és 200% nagyítással is használható; natívan nagy rendszerbetűvel és képernyőolvasóval ellenőrzött. A nem elérhető eszköz ellenőrzése „nem ellenőrzött”. `npm run export` és `npm run lint` sikeres.

**Átadás:** STATUS frissítése, majd 06.
