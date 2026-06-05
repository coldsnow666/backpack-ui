export type BackpackItem = {
  id: number
  name: string
  image: string
  description: string
  count: number
}

const itemMeta = [
  {
    image: '/backpack/items/300025.png',
    name: '性格重塑胶囊',
    description: '在不影响精灵等级和其他属性的情况下，随机生成新的精灵性格。',
  },
  {
    image: '/backpack/items/300136.png',
    name: '全能性格转化剂',
    description: '将精灵改变为任意一种指定性格。',
  },
  {
    image: '/backpack/items/300684.png',
    name: '天赋改造药剂',
    description: '对精灵使用后可在不改变精灵等级、性格的情况下，随机生成新的个体值。',
  },
]

const itemCounts = [
  2699, 4519, 2107, 136, 2559, 2453, 432, 479, 412, 12, 52, 7,
  1180, 302, 980, 64, 1206, 719, 88, 501, 233, 17, 36, 9,
  620, 148, 2760, 94, 1314, 760, 25, 83, 415, 6, 42, 13,
  3000, 201, 1672, 45, 906, 333, 72, 109, 570, 4, 18, 11,
]

export const backpackItems: BackpackItem[] = itemCounts.map((count, index) => ({
  ...itemMeta[index % itemMeta.length],
  id: index + 1,
  count,
}))
