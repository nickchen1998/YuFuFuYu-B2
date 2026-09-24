import type { Component } from 'vue'
import {
  AirVent, Archive, Armchair, Bath, BedDouble, Box, BrushCleaning, Circle, CookingPot, Fan, Laptop, Library, LampFloor, Microwave, Monitor,
  RectangleHorizontal, Refrigerator, Rows3, Shirt, ShowerHead, Sofa, Sprout, Square, Table2, Toilet, Tv,
  WashingMachine,
} from '@lucide/vue'

/** 家具種類 → 圖示 */
const map: Record<string, Component> = {
  bed: BedDouble,
  wardrobe: Shirt,
  nightstand: Archive,
  desk: Monitor,
  chair: Armchair,
  bookshelf: Library,
  sofa: Sofa,
  coffeetable: RectangleHorizontal,
  tvstand: Rows3,
  tv: Tv,
  rug: Square,
  plant: Sprout,
  lamp: LampFloor,
  table: Table2,
  diningisland: Table2,
  windowisland: Table2,
  vacuum: BrushCleaning,
  roundtable: Circle,
  fridge: Refrigerator,
  cabinet: Archive,
  island: CookingPot,
  kitchen: CookingPot,
  washer: WashingMachine,
  toilet: Toilet,
  vanity: Bath,
  shower: ShowerHead,
  acunit: Fan,
  acindoor: AirVent,
  standingdesk: Laptop,
  massagechair: Armchair,
  microwave: Microwave,
  airfryer: CookingPot,
  ricecooker: CookingPot,
  box: Box,
}

export function furnitureIcon(type: string): Component {
  return map[type] ?? Box
}
