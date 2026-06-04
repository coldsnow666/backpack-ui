import type { GroupMeta, PetGroup } from '../types'

export const petGroups: PetGroup[] = ['battle', 'standby']

export const groupMeta: Record<PetGroup, GroupMeta> = {
  battle: {
    title: '出战精灵',
    countLabel: '首发阵容',
  },
  standby: {
    title: '备战精灵',
    countLabel: '候补队列',
  },
}
