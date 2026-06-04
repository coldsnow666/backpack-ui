import type { Skill } from '../types'

export const skillBook: Record<string, Skill[]> = {
  谱尼: [
    { name: '千烈虚光闪', power: 140, pp: '10/10', tone: 'light' },
    { name: '虚无', power: 0, pp: '1/1', tone: 'water' },
    { name: '圣灵魔闪光', power: 160, pp: '5/5', tone: 'light' },
    { name: '灵魂干涉', power: 0, pp: '20/20', tone: 'water' },
  ],
  雷伊: [
    { name: '惊雷切', power: 95, pp: '25/25', tone: 'light' },
    { name: '雷祭', power: 0, pp: '5/5', tone: 'water' },
    { name: '霹雳风暴', power: 150, pp: '10/10', tone: 'light' },
    { name: '瞬雷天闪', power: 0, pp: '20/20', tone: 'water' },
  ],
  盖亚: [
    { name: '破元闪', power: 120, pp: '10/10', tone: 'fire' },
    { name: '返璞归真', power: 0, pp: '5/5', tone: 'water' },
    { name: '日月皆伤', power: 140, pp: '10/10', tone: 'fire' },
    { name: '战神狂怒', power: 0, pp: '20/20', tone: 'water' },
  ],
}

export const fallbackSkills: Skill[] = [
  { name: '火环', power: 55, pp: '35/35', tone: 'fire' },
  { name: '凝目而视', power: 0, pp: '15/15', tone: 'water' },
  { name: '猛击', power: 60, pp: '30/30', tone: 'fire' },
  { name: '极速', power: 0, pp: '30/30', tone: 'water' },
]
