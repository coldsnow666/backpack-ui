import type { Pet } from '../types'

export type WarehouseTypeMode = 'single' | 'dual'

export const allTypeId = 0

export const petTypeMap: Record<number, { label: string }> = {
  1: { label: '草' },
  2: { label: '水' },
  3: { label: '火' },
  4: { label: '飞行' },
  5: { label: '电' },
  6: { label: '机械' },
  7: { label: '地面' },
  8: { label: '普通' },
  9: { label: '冰' },
  10: { label: '超能' },
  11: { label: '战斗' },
  12: { label: '光' },
  13: { label: '暗影' },
  14: { label: '神秘' },
  15: { label: '龙' },
  16: { label: '圣灵' },
  17: { label: '次元' },
  18: { label: '远古' },
  19: { label: '邪灵' },
  20: { label: '自然' },
  221: { label: '王' },
  222: { label: '混沌' },
  223: { label: '神灵' },
  224: { label: '轮回' },
  225: { label: '虫' },
  226: { label: '虚空' },
}

export const singleTypeIds = [
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 16,
  17, 18, 19, 20,
]

export const dualTypeIds = Array.from({ length: 107 }, (_, index) => index + 21)

export const dualTypeMap: Record<number, [number, number]> = {
  21: [1, 10], 22: [1, 11], 23: [1, 13], 24: [2, 10], 25: [2, 13],
  26: [2, 15], 27: [3, 4], 28: [3, 15], 29: [3, 10], 30: [4, 10],
  31: [12, 4], 32: [4, 15], 33: [5, 3], 34: [5, 9], 35: [5, 11],
  36: [13, 5], 37: [6, 7], 38: [6, 10], 39: [6, 15], 40: [7, 15],
  41: [11, 7], 42: [7, 13], 43: [9, 15], 44: [9, 12], 45: [9, 13],
  46: [10, 9], 47: [11, 3], 48: [11, 13], 49: [12, 14], 50: [13, 14],
  51: [14, 10], 52: [16, 12], 53: [4, 14], 54: [7, 10], 55: [13, 15],
  56: [16, 13], 57: [18, 11], 58: [3, 14], 59: [12, 11], 60: [14, 11],
  61: [17, 11], 62: [19, 14], 63: [18, 15], 64: [12, 17], 65: [18, 16],
  66: [2, 11], 67: [5, 15], 68: [12, 3], 69: [12, 13], 70: [19, 15],
  71: [18, 14], 72: [6, 17], 73: [11, 15], 74: [11, 20], 75: [19, 6],
  76: [5, 17], 77: [18, 3], 78: [16, 11], 79: [16, 17], 80: [16, 5],
  81: [18, 7], 82: [18, 1], 83: [20, 15], 84: [9, 14], 85: [4, 13],
  86: [9, 3], 87: [9, 4], 88: [20, 16], 89: [222, 16], 90: [18, 19],
  91: [20, 9], 92: [222, 13], 93: [222, 11], 94: [222, 10], 95: [16, 10],
  96: [222, 7], 97: [13, 19], 98: [222, 18], 99: [222, 19], 100: [16, 7],
  101: [3, 13], 102: [12, 10], 103: [6, 11], 104: [4, 5], 105: [222, 4],
  106: [222, 15], 107: [222, 3], 108: [16, 3], 109: [7, 14], 110: [222, 17],
  111: [222, 9], 112: [20, 14], 113: [226, 19], 114: [226, 222], 115: [16, 224],
  116: [2, 17], 117: [16, 14], 118: [6, 14], 119: [2, 14], 120: [17, 15],
  121: [20, 10], 122: [5, 6], 123: [14, 224], 124: [2, 6], 125: [3, 6],
  126: [1, 6], 127: [18, 5],
}

export function petTypeIcon(typeId: number) {
  return `/backpack/elem/type-${typeId}.png`
}

export function petTypeLabel(typeId: number) {
  return petTypeMap[typeId]?.label ?? `#${typeId}`
}

export function petFilterTypeLabel(typeId: number, mode: WarehouseTypeMode) {
  if (mode === 'single') {
    return petTypeLabel(typeId)
  }

  const pair = dualTypeMap[typeId]

  return pair ? `${petTypeLabel(pair[0])}/${petTypeLabel(pair[1])}` : `#${typeId}`
}

export function splitPetTypes(typeId = 8) {
  return dualTypeMap[typeId] ?? [typeId, 0]
}

export function matchesPetTypeFilter(pet: Pet, mode: WarehouseTypeMode, typeId: number) {
  if (typeId === allTypeId) {
    return true
  }

  const [type1, type2] = splitPetTypes(pet.typeId)

  if (mode === 'single') {
    return pet.typeId === typeId || type1 === typeId || type2 === typeId
  }

  return pet.typeId === typeId
}
