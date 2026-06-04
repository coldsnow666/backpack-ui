import type { ActionTab, BagAction, PetDetailMeta } from '../types'

export const bottomTabs: ActionTab[] = [
  { label: '身边跟随', image: '/backpack/icons/flow.png' },
  { label: '设为首发', image: '/backpack/icons/first.png', activeImage: '/backpack/icons/first_active.png' },
  { label: '放回仓库', image: '/backpack/icons/warehouse.png' },
  { label: '精灵图鉴', image: '/backpack/icons/pictorial.png' },
  { label: '道具', image: '/backpack/icons/recover.png' },
  { label: '精灵恢复', image: '/backpack/icons/recover.png' },
]

export const topTabs: ActionTab[] = [
  { label: '身边跟随', image: '/backpack/icons/flow.png' },
  { label: '放回仓库', image: '/backpack/icons/warehouse.png' },
  { label: '精灵图鉴', image: '/backpack/icons/pictorial.png' },
  { label: '精灵恢复', image: '/backpack/icons/recover.png' },
]

export const bagActions: BagAction[] = Array.from({ length: 6 }, (_, index) => {
  const id = index + 1

  return {
    id,
    label: `功能 ${id}`,
    icon: `/backpack/icons/${id}.png`,
  }
})

export const petDetailMeta: PetDetailMeta = {
  evolutionLabel: '无法进化',
  elementalIcon: '/backpack/elem/shengling.png',
  genderIcon: '/backpack/elem/xingbie.png',
}
