I want to plan a Sudoku web app game:
1. No ads, but a donation button.  Call it "Buy me a Diet Pepsi".  Paypal?  Venmo?
2. A notes button
3.  The notes should populate in a 3x3 grid in each cell.
4.  If you enable or disable the notes button, then click a number, clicking any box will insert a note or the number and the number stays selected so you can click on more boxes without the need to select a number again.
5.  The primary game will be a 3x3 grid where each box is divided into a 3x3 grid
6.  Beginner, intermediate, and expert modes
7.  There should be  hard mode that does not give you any hint about the accuracy of your placement of a number until a "Submit" button is pressed.
8.  In easy mode, the submit button is not displayed as the player gets immediate feedback on the accuracy of the number placement.
9.  Each game should get 3 hints.  The hints are given by removing one of the incorrect notes from a cell.  
10.  Hints are used by clicking on a cell with at least one note, click the hint button, then one of the notes is removed.
11. The game should be easily migrated to a mobile application
12.  The numbers that are pre-populated when the game starts are black on a light blue tile, but the numbers that are placed by the player, the numbers are a medium shade of blue on a light blue tile.
13.  When the player completes a row, column, or a 3x3 section, the tiles in the completed section flash from 1 to 9.
14.  When the game is completed, all tiles flash from the upper left to the lower right and the puzzle dissolves.
15.  I want to come up with a scoring mechanism based on the difficulty of the game, how many mistakes are made, and how quickly it is solved.
16.  Oauth2.0 needs to be implemented to store the score remotely
