import { Entry, Golfer } from '../lib/types';

export const defaultGolfers: Golfer[] = [
  // Tier 1 - Top favorites
  { name: 'Scottie Scheffler', tier: 1 },
  { name: 'Rory McIlroy', tier: 1 },
  { name: 'Jon Rahm', tier: 1 },
  { name: 'Xander Schauffele', tier: 1 },
  { name: 'Collin Morikawa', tier: 1 },
  { name: 'Ludvig Åberg', tier: 1 },
  { name: 'Brooks Koepka', tier: 1 },
  { name: 'Viktor Hovland', tier: 1 },

  // Tier 2 - Strong contenders
  { name: 'Patrick Cantlay', tier: 2 },
  { name: 'Tommy Fleetwood', tier: 2 },
  { name: 'Hideki Matsuyama', tier: 2 },
  { name: 'Shane Lowry', tier: 2 },
  { name: 'Bryson DeChambeau', tier: 2 },
  { name: 'Justin Thomas', tier: 2 },
  { name: 'Cameron Smith', tier: 2 },
  { name: 'Tony Finau', tier: 2 },
  { name: 'Wyndham Clark', tier: 2 },
  { name: 'Sam Burns', tier: 2 },
  { name: 'Sahith Theegala', tier: 2 },
  { name: 'Sungjae Im', tier: 2 },

  // Tier 3 - Longshots and value picks
  { name: 'Jordan Spieth', tier: 3 },
  { name: 'Cameron Young', tier: 3 },
  { name: 'Joaquin Niemann', tier: 3 },
  { name: 'Russell Henley', tier: 3 },
  { name: 'Min Woo Lee', tier: 3 },
  { name: 'Corey Conners', tier: 3 },
  { name: 'Keegan Bradley', tier: 3 },
  { name: 'Brian Harman', tier: 3 },
  { name: 'Adam Scott', tier: 3 },
  { name: 'Jason Day', tier: 3 },
  { name: 'Tiger Woods', tier: 3 },
  { name: 'Dustin Johnson', tier: 3 },
  { name: 'Phil Mickelson', tier: 3 },
  { name: 'Matt Fitzpatrick', tier: 3 },
  { name: 'Will Zalatoris', tier: 3 },
  { name: 'Max Homa', tier: 3 },
];

export const sampleEntries: Entry[] = [
  {
    id: 'sample-1',
    userName: 'John Smith',
    entryName: 'John Smith - Entry 1',
    picks: {
      tier1: ['Scottie Scheffler', 'Rory McIlroy'],
      tier2: ['Patrick Cantlay', 'Tommy Fleetwood', 'Hideki Matsuyama'],
      tier3: ['Jordan Spieth', 'Cameron Young', 'Russell Henley', 'Tiger Woods'],
    },
    alternates: {
      tier1: 'Xander Schauffele',
      tier2: 'Justin Thomas',
      tier3: 'Adam Scott',
    },
    paid: true,
  },
  {
    id: 'sample-2',
    userName: 'Jane Doe',
    entryName: 'Jane Doe - Entry 1',
    picks: {
      tier1: ['Jon Rahm', 'Xander Schauffele'],
      tier2: ['Bryson DeChambeau', 'Sam Burns', 'Shane Lowry'],
      tier3: ['Corey Conners', 'Brian Harman', 'Matt Fitzpatrick', 'Max Homa'],
    },
    alternates: {
      tier1: 'Collin Morikawa',
      tier2: 'Tony Finau',
      tier3: 'Jason Day',
    },
    paid: true,
  },
  {
    id: 'sample-3',
    userName: 'Mike Johnson',
    entryName: 'Mike Johnson - Entry 1',
    picks: {
      tier1: ['Ludvig Åberg', 'Brooks Koepka'],
      tier2: ['Wyndham Clark', 'Sahith Theegala', 'Sungjae Im'],
      tier3: ['Keegan Bradley', 'Dustin Johnson', 'Phil Mickelson', 'Will Zalatoris'],
    },
    alternates: {
      tier1: 'Viktor Hovland',
      tier2: 'Cameron Smith',
      tier3: 'Min Woo Lee',
    },
    paid: false,
  },
];
