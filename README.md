# Firebase Leaderboard
Leaderboard webapp utilising Firebase Database

## How to access

To access the hosted leaderboard go to:... https://fooseball-a0b25.firebaseapp.com/

## Structure
```
https://github.com/sushant40/firebase-leaderboard
├── README.md
├── firebase.json
└── public
    ├── 404.html
    ├── dashboard.css
    ├── index.html
    ├── leaderChart.js
    └── script.js
```

The public folder can be statically deployed and used to serve up the webapp.

## How to setup with your own Firebase

1. Start by creating a HTML project on the Google Firebase console... https://console.firebase.google.com
2. in /public/index.html -> Update the 'config' object that is used to initilise Firebase with your own project... search for 'firebase.initializeApp'

Once you start 'using' the webapp it automatically create the necssary matches and players nodes/tables in the database. If you have any issues in the future just delete these two nodes from the Firebase database console

## Running locally

Run locally by using something like browser sync...

```
cd public
browser-sync start --server --files "*.css" "*.html" "*.js"
```

Be sure to install browsersync...
```
npm install -g browser-sync
```

## How points are calculated

Forumula used to calculate points per winner:...
```
pointsPerWinner = (1/numberOfWinners) * numberOfLoosers
```

Points are allocated as follows:...

Players | Winners | Points
------------ | ------------- | ----
A vs B | A | A gets 1 point
AB vs CD | AB | A and B get 1 point each
AB vs C | AB | A and B get 0.5 points each (2 vs 1 is **unfair**)
AB vs C | C  | C gets 2 points (C defied the oods and won - gets extra points)


## Known issues

1. The list of players on the left (**PLAYERS**) is initially loaded showing with the top 3 players by points. These points are updated - as are the number of won / lost games. However the ranking of the players does not change.
