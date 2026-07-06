import type {
  Course, OldCourse, NewCourse,
  Rider,
  Star, OldStar, NewStar, LegendaryStar,
} from '../types/types'

import kirbyIcon from '../assets/riders/KARs_Kirby_icon.png'
import dededeIcon from '../assets/riders/KARs_King_Dedede_icon.png'
import metaKnightIcon from '../assets/riders/KARs_Meta_Knight_icon.png'
import waddleDeeIcon from '../assets/riders/KARs_Waddle_Dee_icon.png'
import bandanaWaddleDeeIcon from '../assets/riders/KARs_Bandana_Waddle_Dee_icon.png'
import waddleDooIcon from '../assets/riders/KARs_Waddle_Doo_icon.png'
import chefKawasakiIcon from '../assets/riders/KARs_Chef_Kawasaki_icon.png'
import knuckleJoeIcon from '../assets/riders/KARs_Knuckle_Joe_icon.png'
import rickIcon from '../assets/riders/KARs_Rick_icon.png'
import gooeyIcon from '../assets/riders/KARs_Gooey_icon.png'
import cappyIcon from '../assets/riders/KARs_Cappy_icon.png'
import rockyIcon from '../assets/riders/KARs_Rocky_icon.png'
import scarfyIcon from '../assets/riders/KARs_Scarfy_icon.png'
import starmanIcon from '../assets/riders/KARs_Starman_icon.png'
import lololoAndLalalaIcon from '../assets/riders/KARs_Lololo_&_Lalala_icon.png'
import marxIcon from '../assets/riders/KARs_Marx_icon.png'
import daroachIcon from '../assets/riders/KARs_Daroach_icon.png'
import magolorIcon from '../assets/riders/KARs_Magolor_icon.png'
import taranzaIcon from '../assets/riders/KARs_Taranza_icon.png'
import susieIcon from '../assets/riders/KARs_Susie_icon.png'
import noirDededeIcon from '../assets/riders/KARs_Noir_Dedede_icon.png'

import warpStarIcon from '../assets/stars/KARs_Warp_Star_Icon.png'
import compactStarIcon from '../assets/stars/KARs_Compact_Star_Icon.png'
import wingedStarIcon from '../assets/stars/KARs_Winged_Star_Icon.png'
import shadowStarIcon from '../assets/stars/KARs_Shadow_Star_Icon.png'
import wagonStarIcon from '../assets/stars/KARs_Wagon_Star_Icon.png'
import slickStarIcon from '../assets/stars/KARs_Slick_Star_Icon.png'
import formulaStarIcon from '../assets/stars/KARs_Formula_Star_Icon.png'
import bulkStarIcon from '../assets/stars/KARs_Bulk_Star_Icon.png'
import rocketStarIcon from '../assets/stars/KARs_Rocket_Star_Icon.png'
import swerveStarIcon from '../assets/stars/KARs_Swerve_Star_Icon.png'
import turboStarIcon from '../assets/stars/KARs_Turbo_Star_Icon.png'
import jetStarIcon from '../assets/stars/KARs_Jet_Star_Icon.png'
import wheelieBikeIcon from '../assets/stars/KARs_Wheelie_Bike_Icon.png'
import rexWheelieIcon from '../assets/stars/KARs_Rex_Wheelie_Icon.png'
import wheelieScooterIcon from '../assets/stars/KARs_Wheelie_Scooter_Icon.png'
import hopStarIcon from '../assets/stars/KARs_Hop_Star_Icon.png'
import vampireStarIcon from '../assets/stars/KARs_Vampire_Star_Icon.png'
import paperStarIcon from '../assets/stars/KARs_Paper_Star_Icon.png'
import chariotIcon from '../assets/stars/KARs_Chariot_Icon.png'
import battleChariotIcon from '../assets/stars/KARs_Battle_Chariot_Icon.png'
import tankStarIcon from '../assets/stars/KARs_Tank_Star_Icon.png'
import bullTankIcon from '../assets/stars/KARs_Bull_Tank_Icon.png'
import transformStarIcon from '../assets/stars/KARs_Transform_Star_Form_Icon.png'
import flightWarpStarIcon from '../assets/special stars/KARs_Flight_Warp_Star_Icon.png'
import dragoonIcon from '../assets/special stars/KARs_Dragoon_Icon.png'
import hydraIcon from '../assets/special stars/KARs_Hydra_Icon.png'
import leoIcon from '../assets/special stars/KARs_Leo_Icon.png'
import gigantesIcon from '../assets/special stars/KARs_Gigantes_Icon.png'

export const NEW_COURSES: NewCourse[] = [
  'Floria  Fields', 'Waveflow Waters', 'Airtopia Ruins',
  'Crystalline Fissure', 'Steamgust Forge', 'Cavernous Corners',
  'Cyberion Highway', 'Mount Amberfalls', 'Galactic Nova',
];

export const OLD_COURSES: OldCourse[] = [
  'Fantasy Meadows', 'Celestial Valley', 'Sky Sands',
  'Frozen Hillside', 'Magma Flows', 'Beanstalk Park',
  'Machine Passage', 'Checker Knights', 'Nebula Belt',
];

export const COURSES: Course[] = [...OLD_COURSES, ...NEW_COURSES];

export const RIDERS: Rider[] = [
  'Kirby', 'King Dedede', 'Meta Knight', 'Waddle Dee',
  'Bandana Waddle Dee', 'Waddle Doo', 'Chef Kawasaki',
  'Knuckle Joe', 'Rick', 'Gooey', 'Cappy', 'Rocky',
  'Scarfy', 'Starman', 'Lololo & Lalala', 'Marx',
  'Daroach', 'Magolor', 'Taranza', 'Susie',
  'Noir Dedede',
];

export const RIDER_ICONS: Record<Rider, string> = {
  'Kirby': kirbyIcon,
  'King Dedede': dededeIcon,
  'Meta Knight': metaKnightIcon,
  'Waddle Dee': waddleDeeIcon,
  'Bandana Waddle Dee': bandanaWaddleDeeIcon,
  'Waddle Doo': waddleDooIcon,
  'Chef Kawasaki': chefKawasakiIcon,
  'Knuckle Joe': knuckleJoeIcon,
  'Rick': rickIcon,
  'Gooey': gooeyIcon,
  'Cappy': cappyIcon,
  'Rocky': rockyIcon,
  'Scarfy': scarfyIcon,
  'Starman': starmanIcon,
  'Lololo & Lalala': lololoAndLalalaIcon,
  'Marx': marxIcon,
  'Daroach': daroachIcon,
  'Magolor': magolorIcon,
  'Taranza': taranzaIcon,
  'Susie': susieIcon,
  'Noir Dedede': noirDededeIcon,
};

export const OLD_STARS: OldStar[] = [
  'Warp Star', 'Compact Star', 'Winged Star', 'Shadow Star',
  'Wagon Star', 'Slick Star', 'Formula Star', 'Bulk Star',
  'Rocket Star', 'Swerve Star', 'Turbo Star', 'Jet Star',
  'Wheelie Bike', 'Rex Wheelie', 'Wheelie Scooter',
  'Flight Warp Star',
];

export const NEW_STARS: NewStar[] = [
  'Hop Star', 'Vampire Star', 'Paper Star', 'Chariot',
  'Battle Chariot', 'Tank Star', 'Bull Tank',
  'Transform Star',
];

export const LEGENDARY_STARS: LegendaryStar[] = [
  'Dragoon', 'Hydra', 'Leo', 'Gigantes',
];

export const STARS: Star[] = [...OLD_STARS, ...NEW_STARS, ...LEGENDARY_STARS];

export const STAR_ICONS: Record<Star, string> = {
  'Warp Star': warpStarIcon,
  'Compact Star': compactStarIcon,
  'Winged Star': wingedStarIcon,
  'Shadow Star': shadowStarIcon,
  'Wagon Star': wagonStarIcon,
  'Slick Star': slickStarIcon,
  'Formula Star': formulaStarIcon,
  'Bulk Star': bulkStarIcon,
  'Rocket Star': rocketStarIcon,
  'Swerve Star': swerveStarIcon,
  'Turbo Star': turboStarIcon,
  'Jet Star': jetStarIcon,
  'Wheelie Bike': wheelieBikeIcon,
  'Rex Wheelie': rexWheelieIcon,
  'Wheelie Scooter': wheelieScooterIcon,
  'Flight Warp Star': flightWarpStarIcon,
  'Hop Star': hopStarIcon,
  'Vampire Star': vampireStarIcon,
  'Paper Star': paperStarIcon,
  'Chariot': chariotIcon,
  'Battle Chariot': battleChariotIcon,
  'Tank Star': tankStarIcon,
  'Bull Tank': bullTankIcon,
  'Transform Star': transformStarIcon,
  'Dragoon': dragoonIcon,
  'Hydra': hydraIcon,
  'Leo': leoIcon,
  'Gigantes': gigantesIcon,
};

export interface StarGroup {
  label: string
  legendary: boolean
  stars: Star[]
};

export const STAR_GROUPS: StarGroup[] = [
  { label: 'Old Stars', legendary: false, stars: OLD_STARS },
  { label: 'New Stars', legendary: false, stars: NEW_STARS },
  { label: 'Legendary Stars', legendary: true, stars: LEGENDARY_STARS },
];
