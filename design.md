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
1.  When the player completes a row, column, or a 3x3 section, the tiles in the completed section flash from 1 to 9.
1.  When the game is completed, all tiles flash from the upper left to the lower right and the puzzle dissolves.
1.  I want to come up with a scoring mechanism based on the difficulty of the game, how many mistakes are made, and how quickly it is solved.
1.  Oauth2.0 needs to be implemented to store the score remotely
1.  If a user plays without logging in, the statistics are stored locally in that browser's cache
1.  It needs to be hosted at sudoku.chrisclark.net
1.  This needs to be hooked into github for deployment to azure
1.  Update readme file to document the build and deployment process