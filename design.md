I want to plan a Sudoku web app game:
1.  No ads, but a donation button.  Call it "Buy me a Diet Pepsi".  Paypal?  Venmo?
1.  A notes button
1.  The notes should populate in a 3x3 grid in each cell.
1.  If you enable or disable the notes button, then click a number, clicking any box will insert a note or the number and the number stays selected so you can click on more boxes without the need to select a number again.
1.  The primary game will be a 3x3 grid where each box is divided into a 3x3 grid
1.  Beginner, intermediate, and expert modes
1.  There should be  hard mode that does not give you any hint about the accuracy of your placement of a number until a "Submit" button is pressed.
1.  In easy mode, the submit button is not displayed as the player gets immediate feedback on the accuracy of the number placement.
1.  Each game should get 3 hints.  The hints are given by removing one of the incorrect notes from a cell.  
1.  Hints are used by clicking on a cell with at least one note, click the hint button, then one of the notes is removed.
1.  The game should be easily migrated to a mobile application
1.  The numbers that are pre-populated when the game starts are black on a light blue tile, but the numbers that are placed by the player, the numbers are a medium shade of blue on a light blue tile.
1.  When the player completes a row, column, or a 3x3 section, the tiles in the completed section change color in a gradient from a light color back to the normal tile (or from a dark color to the normal tile in light mode).
1.  When the game is completed, all tiles flash from the upper left to the lower right and the puzzle dissolves.
1.  I want to come up with a scoring mechanism based on the difficulty of the game, how many mistakes are made, and how quickly it is solved.
1.  Oauth2.0 needs to be implemented to store the score remotely
1.  When logged in, the user name should be a button that loads all of their statistics.
1.  If a user plays without logging in, the statistics are stored locally in that browser's cache
1.  If the user places a number (not a note) in a cell, all notes in that row, column, and 3x3 grid of the same number will be turned off
1.  If the player has completed a number (or has laid down 9 of a number in hard mode), then that number can no longer be placed as a note or as a tile
1.  The selected cell should have a border around it to make it clear where the cursor is located.  
1.  When someone changes the selected number or toggles the notes button, the seleted cell should become unselected and no number added automatically.
1.  It needs to be hosted at sudoku.chrisclark.net
1.  This needs to be hooked into github for deployment to azure
1.  Update readme file to document the build and deployment process
1.  Include a stamp at the bottom with the build number and build timestamp on it.  Something subtle, but usable for testing/debugging.  The version should be bumped for each commit with the following versioning rules:  PATCH (1.0.1 → 1.0.2): bug fixes, minor tweaks, MINOR (1.0.0 → 1.1.0): new features, MAJOR (1.0.0 → 2.0.0): breaking changes
1.  Include the cc.ico favicon
1.  When someone clicks on a number, with notes on or off, it should highlight all of the tiles with that number

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
