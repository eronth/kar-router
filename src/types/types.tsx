export type OldCourse
  = 'Floria  Fields' | 'Waveflow Waters' | 'Airtopia Ruins'
  | 'Crystalline Fissure' | 'Steamgust Forge' | 'Cavernous Corners'
  | 'Cyberion Highway' | 'Mount Amberfalls' | 'Galactic Nova';

export type NewCourse
  = 'Fantasy Meadows' | 'Celestial Valley' | 'Sky Sands'
  | 'Frozen Hillside' | 'Magma Flows' | 'Beanstalk Park'
  | 'Machien Passage' | 'Checker Knights' | 'Nebula Belt';

export type Course = OldCourse | NewCourse;

export type Rider
  = 'Kirby' | 'King Dedede' | 'Meta Knight' | 'Waddle Dee'
  | 'Bandana Waddle Dee' | 'Waddle Doo' | 'Chef Kawasaki'
  | 'Knuckle Joe' | 'Rick' | 'Gooey' | 'Cappy' | 'Rocky'
  | 'Scarfy' | 'Starman' | 'Lololo & Lalala' | 'Marx'
  | 'Daroach' | 'Magolor' | 'Taranza' | 'Susie'
  | 'Noir Dedede';

export type OldStar
  = 'Warp Star' | 'Compact Star' | 'Winged Star' | 'Shadow Star'
  | 'Wagon Star' | 'Slick Star' | 'Formula Star' | 'Bulk Star'
  | 'Rocket Star' | 'Swerve Star' | 'Turbo Star' | 'Jet Star'
  | 'Wheelie Bike' | 'Rex Wheelie' | 'Wheelie Scooter'
  | 'Flight Warp Star';

export type NewStar
  = 'Hop Star' | 'Vampire Star' | 'Paper Star' | 'Chariot'
  | 'Battle Chariot' | 'Tank Star' | 'Bull Tank'
  | 'Transform Star';

export type LegendaryStar
  = 'Dragoon' | 'Hydra' | 'Leo' | 'Gigantes';

export type Star = OldStar | NewStar | LegendaryStar;
