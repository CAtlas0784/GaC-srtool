import { getCurrentLanguage } from './i18n.js';

export const PRESET_TELEPORTS = [
  {
    names: {
      th: "Astral Express - ขบวนรถไฟแอสทรัล (ห้องรับรอง)",
      en: "Astral Express - Parlor Car",
      "zh-CN": "星穹列车 - 观景车厢",
      "zh-TW": "星穹列車 - 觀景車廂",
      ja: "星穹列車 - 客室",
      ko: "은하열차 - 객실",
      ru: "Звёздный экспресс - Общий вагон"
    },
    plane_id: 20001,
    floor_id: 20001001,
    entry_id: 2000101,
    x: 0,
    y: 0,
    z: 0
  },
  {
    names: {
      th: "สถานีอวกาศ Herta - โซนควบคุมหลัก (Master Control Zone)",
      en: "Herta Space Station - Master Control Zone",
      "zh-CN": "空间站「黑塔」 - 主控舱段",
      "zh-TW": "太空站「黑塔」 - 主控艙段",
      ja: "宇宙ステーション「ヘルタ」 - 主制御部分",
      ko: "우주정거장 「헤르타」 - 메인 컨트롤 구역",
      ru: "Космическая станция «Герта» - Главная контрольная зона"
    },
    plane_id: 10001,
    floor_id: 10001001,
    entry_id: 1000101,
    x: 0,
    y: 0,
    z: 0
  },
  {
    names: {
      th: "Jarilo-VI (Belobog) - เขตการปกครอง (Administrative District)",
      en: "Jarilo-VI - Administrative District",
      "zh-CN": "雅利洛-VI - 行政区",
      "zh-TW": "雅利洛-VI - 行政區",
      ja: "ヤリーロ-VI - 行政区",
      ko: "야릴로-VI - 행정구역",
      ru: "Ярило-VI - Административный район"
    },
    plane_id: 10101,
    floor_id: 10101001,
    entry_id: 1010101,
    x: 10250,
    y: 51,
    z: 32670
  },
  {
    names: {
      th: "Jarilo-VI (Underworld) - เมือง Boulder (Boulder Town)",
      en: "Jarilo-VI - Boulder Town",
      "zh-CN": "雅利洛-VI - 磐岩镇",
      "zh-TW": "雅利洛-VI - 磐岩鎮",
      ja: "ヤリーロ-VI - ボルダータウン",
      ko: "야릴로-VI - 볼더 타운",
      ru: "Ярило-VI - Камнеград"
    },
    plane_id: 10102,
    floor_id: 10102001,
    entry_id: 1010201,
    x: -20560,
    y: -286,
    z: 57320
  },
  {
    names: {
      th: "Xianzhou Luofu - ท่าเรือเรือบินดาวกลาง (Central Starskiff Haven)",
      en: "Xianzhou Luofu - Central Starskiff Haven",
      "zh-CN": "仙舟「罗浮」 - 星槎海中枢",
      "zh-TW": "仙舟「羅浮」 - 星槎海中樞",
      ja: "仙舟「羅浮」 - 星槎海中枢",
      ko: "선주 「나부」 - 별뗏목 바다 중추",
      ru: "Сяньчжоу: Лофу - Центральная гавань Приюта звёздных яликов"
    },
    plane_id: 10202,
    floor_id: 10202001,
    entry_id: 1020201,
    x: 8320,
    y: -3486,
    z: -25080
  },
  {
    names: {
      th: "Penacony - The Reverie (Dreamscape Hotel)",
      en: "Penacony - The Reverie (Dreamscape)",
      "zh-CN": "匹诺康尼 - 「白日梦」酒店-梦境",
      "zh-TW": "匹諾康尼 - 「白日夢」飯店-夢境",
      ja: "ピノコニー - 「レバリー」ホテル-夢境",
      ko: "페나코니 - 「레버리」 호텔-꿈속",
      ru: "Пенакония - Отель «Грёзы» (Мир грёз)"
    },
    plane_id: 10301,
    floor_id: 10301001,
    entry_id: 1030101,
    x: 0,
    y: 0,
    z: 0
  },
  {
    names: {
      th: "Penacony - ชั่วโมงทอง (Golden Hour)",
      en: "Penacony - Golden Hour",
      "zh-CN": "匹诺康尼 - 黄金的时刻",
      "zh-TW": "匹諾康尼 - 黃金的時刻",
      ja: "ピノコニー - 黄金の刻",
      ko: "페나코니 - 황금의 순간",
      ru: "Пенакония - Золотой миг"
    },
    plane_id: 10302,
    floor_id: 10302001,
    entry_id: 1030201,
    x: -3556,
    y: 1539,
    z: -378220
  }
];

export function getTeleportName(preset, langOverride = null) {
  const lang = langOverride || getCurrentLanguage();
  return preset.names?.[lang] || preset.names?.en || preset.names?.th || "Teleport Point";
}
