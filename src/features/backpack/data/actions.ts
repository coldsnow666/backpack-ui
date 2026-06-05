import type { ActionTab, BagAction, PetDetailMeta } from '../types'

export const bottomTabs: ActionTab[] = [
  { id: 'follow', label: '身边跟随', image: '/backpack/icons/flow.png', activeImage: '/backpack/icons/flow_active.png' },
  { id: 'starter', label: '设为首发', image: '/backpack/icons/first.png', activeImage: '/backpack/icons/first_active.png' },
  { id: 'warehouse', label: '放回仓库', image: '/backpack/icons/warehouse.png' },
  { id: 'learningPower', label: '学习力分配', image: '/backpack/icons/pictorial.png' },
  { id: 'item', label: '道具', image: '/backpack/icons/prop.png' },
  { id: 'recover', label: '精灵恢复', image: '/backpack/icons/recover.png' },
]

export const topTabs: ActionTab[] = [
  { id: 'engraving', label: '精灵刻印', image: '/backpack/icons/engraving.png' },
  { id: 'pet_warehouse', label: '精灵仓库', image: '/backpack/icons/pet_warehouse.png' },
  { id: 'skill', label: '技能替换', image: '/backpack/icons/skill.png' },
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
