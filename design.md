I want to plan a Sudoku web app game:
1. No ads, but a donation button.  Call it "Buy me a Diet Pepsi".  PayPal?  Venmo?
2. A notes button
3. The notes should populate in a 3x3 grid in each cell.
4. If you enable or disable the notes button, then click a number, clicking any box will insert a note or the number and the number stays selected so you can click on more boxes without the need to select a number again.
5. The primary game will be a 3x3 grid where each box is divided into a 3x3 grid
6. Beginner, intermediate, and expert modes
7. There should be  hard mode that does not give you any hint about the accuracy of your placement of a number until a "Submit" button is pressed.
8. In easy mode, the submit button is not displayed as the player gets immediate feedback on the accuracy of the number placement.
9. Each game should get 3 hints.  The hints are given by removing one of the incorrect notes from a cell.  
10. Hints are used by clicking on a cell with at least one note, click the hint button, then one of the notes is removed.
11. The game should be easily migrated to a mobile application
12. The numbers that are pre-populated when the game starts are black on a light blue tile, but the numbers that are placed by the player, the numbers are a medium shade of blue on a light blue tile.
13. When the player completes a row, column, or a 3x3 section, the tiles in the completed section change color in a gradient from a light color back to the normal tile (or from a dark color to the normal tile in light mode).
14. When the game is completed, all tiles flash from the upper left to the lower right and the puzzle dissolves.
15. I want to come up with a scoring mechanism based on the difficulty of the game, how many mistakes are made, and how quickly it is solved.
16. Oauth2.0 needs to be implemented to store the score remotely
17. When logged in, the username should be a button that loads all of their statistics.
18. If a user plays without logging in, the statistics are stored locally in that browser's cache
19. If the user places a number (not a note) in a cell, all notes in that row, column, and 3x3 grid of the same number will be turned off
20. If the player has completed a number (or has laid down 9 of a number in hard mode), then that number can no longer be placed as a note or as a tile
21. The selected cell should have a border around it to make it clear where the cursor is located.  
22. When someone changes the selected number or toggles the notes button, the selected cell should become unselected and no number added automatically.
23. It needs to be hosted at sudoku.chrisclark.net
24. This needs to be hooked into GitHub for deployment to azure
25. Update readme file to document the build and deployment process
26. Include a stamp at the bottom with the build number and build timestamp on it.  Something subtle, but usable for testing/debugging.  The version should be bumped for each commit with the following versioning rules:  PATCH (1.0.1 → 1.0.2): bug fixes, minor tweaks, MINOR (1.0.0 → 1.1.0): new features, MAJOR (1.0.0 → 2.0.0): breaking changes
27. Include the cc.ico favicon
28. When someone clicks on a number, with notes on or off, it should highlight all of the tiles with that number
29. On mobile, I should see the game board above the numbers, above the notes, hint, erase buttons, above the timer, above the difficulty selector, above best scores, above the "Enjoying the Game" section.  This is during gameplay, the number buttons should be easily selectable.
30. On mobile, the Notes, hint, erase buttons, and number buttons should be shorter to reduce the amount of vertical space they take up
31. Oauth may not work in a private window
32. Make it an option to require clicking a number every time you want to place a tile or note.  Click a cell, then click a number, click a cell, click a number.  This, along with dark/light mode, can be moved into a preferences dialog.
33. Fix the links to the privacy and TOS documents 
34. We also want to make sure that the state of each game is continuously stored until complete, so if a user is on their phone, they can resume the game on the desktop. 
35. Put a hint button (a question mark in a circle) next to the "show daily challenge" toggle that explains what it is for. 
36. Put a banner at the top of the game screen that can mention new features.  It should only be enabled when there is a message. 
37. If the player clicks an X to hide the banner, you do not need to show it again.
38. This banner will also be reused for new feature announcements, but the specific messages can be hidden permanently. 
39. Don't start the timer or consider the game started until the first tile or note is placed.
40. If a tile is placed in the wrong spot, clicking on it again will not add another mistake.  Removing it and readding it in the same spot will add another mistake


## Abandoned monthly challenge design
1. I want to come up with a monthly challenge.  Complete 2 puzzles per day of random difficulties and the monthly challenge points are calculated with a fixed amount.  Maybe 100 for beginner, 200 for intermediate, etc. and the score will be doubled for perfect games with no errors and without using hints.
2. At the end of the first month, achievement of a reasonable score will grant the user one extra hint per day as long as they keep up a daily streak. 
3. If the streak is broken the daily hints stop, but after achieving the first month's minimum score, they will also get one automatic streak freeze that allows them to skip one day per month.
4. There should be a toggle to show the daily challenge status.  It should not interfere with the verticality of the game board as that is already very crowded.  Perhaps on one side of the board a small section for the daily challenge status.
5. By default, the user will not see it until they enable it in the preferences.



## Android App Migration Plan

There are three primary paths for turning this web application into a native Android app:

### 1. Capacitor (Recommended)
Wraps the existing web files into a native Android project.
- **Effort:** Low (15–30 minutes).
- **Steps:**
    1. Install Capacitor: `npm install @capacitor/core @capacitor/cli`
    2. Initialize: `npx cap init`
    3. Add Android: `npx cap add android`
    4. Copy `index.html`, `app.js`, etc., into the `www` folder.
    5. Run `npx cap copy` and build in Android Studio.
- **Pros:** Native feature access (vibration, splash screens), easy Play Store deployment.

### 2. Progressive Web App (PWA)
Make the website installable directly from the browser.
- **Effort:** Very Low (10 minutes).
- **Steps:**
    1. Create a `manifest.json`.
    2. Add a simple Service Worker for offline support.
    3. Link them in `index.html`.
- **Pros:** No app store approval needed.

### 3. Trusted Web Activity (TWA)
A middle ground for getting a PWA into the Google Play Store using tools like **Bubblewrap**.

---

### Key Technical Challenges

1. **Google Sign-In:** Standard WebViews often block the `gsi/client` script. For a native app, use the `@capacitor-community/google-auth` plugin to leverage native Android dialogs.
2. **Back Button Handling:** Map the Android physical back button to close modals or menus using Capacitor's `backbutton` listener or the History API.
3. **Data Persistence:** While `localStorage` works, Capacitor's `Preferences` plugin is more resilient to OS-level cache clearing.
4. **Haptics:** Add tactile feedback (vibration) on mistakes or completions using the Capacitor Haptics plugin to improve the "native" feel.

---

### Infrastructure Updates
- **2026-04-26:** Prepared project for Capacitor by moving all web assets into a `/www` directory and updating the Azure Static Web Apps workflow (`app_location: "/www"`). This allows native mobile code (Android/iOS) to live in the root directory without interfering with the web deployment.
- **2026-04-26:** Migrated authentication from Google Identity Services to **Firebase Authentication**. This provides better support for private browser windows and simplifies cross-platform identity management for the upcoming Android app.
- **2026-04-26:** Implemented **Cloud Firestore** for remote score storage. Scores now sync in real-time across all devices when a user is logged in. A local-first strategy ensures scores are backed up to the cloud automatically upon the next login if played offline.
- **2026-04-26:** Added **Real-time Game Persistence**. The state of the current board is saved to Firestore (`activeGames` collection) on every move, allowing users to switch devices seamlessly mid-game.
- **2026-04-26:** Implemented the **Monthly Challenge System**. Added a toggleable sidebar (via Preferences) that tracks daily goals (2 games), monthly points (10,000 goal), and streaks. Randomized daily challenges are generated uniquely for each user.
- **2026-04-26:** Improved timer and persistence logic. The game now waits for the first tile or note to be placed before starting the timer and enabling cloud saving, ensuring accurate solve times.

