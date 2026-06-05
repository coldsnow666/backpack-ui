export type PetGroup = 'battle' | 'standby'

export type PetStats = {
  attack: number
  specialAttack: number
  defense: number
  specialDefense: number
  speed: number
  hp: number
}

export type Pet = {
  id: number
  name: string
  level: number
  serial: string
  nature: string
  trait?: string
  traitLevel?: number
  colorfulLevel: number
  requiredExp: number
  totalExp: number
  acquiredAt: string
  image: string
  avatarImage?: string
  listImageHeight?: number
  listImageOffsetX?: number
  listImageOffsetY?: number
  group: PetGroup
  isFollowing?: boolean
  learningPower: PetStats
  isEmpty?: boolean
}

export type SkillTone = 'fire' | 'water' | 'light'

export type Skill = {
  name: string
  power: number
  pp: string
  tone: SkillTone
}

export type GroupMeta = {
  title: string
  countLabel: string
}

export type BagAction = {
  id: number
  label: string
  icon: string
}

export type ActionTab = {
  id?: string
  label: string
  image: string
  activeImage?: string
}

export type PetDetailMeta = {
  evolutionLabel: string
  elementalIcon: string
  genderIcon: string
}
