import { getCurrentLanguage, translateElement, translatePath } from './i18n.js';

export const AVATAR_METADATA = {
  "1001": {
    "names": {
      "en": "March 7th",
      "th": "มาร์ช 7th",
      "zh-CN": "三月七",
      "zh-TW": "三月七",
      "ja": "三月なのか",
      "ko": "March 7th",
      "ru": "Март 7"
    },
    "path": "Preservation",
    "element": "Ice",
    "rarity": 4,
    "hasExRank": false
  },
  "1002": {
    "names": {
      "en": "Dan Heng",
      "th": "ดันเฮง",
      "zh-CN": "丹恒",
      "zh-TW": "丹恆",
      "ja": "丹恒",
      "ko": "단항",
      "ru": "Дань Хэн"
    },
    "path": "Hunt",
    "element": "Wind",
    "rarity": 4,
    "hasExRank": false
  },
  "1003": {
    "names": {
      "en": "Himeko",
      "th": "ฮิเมโกะ",
      "zh-CN": "姬子",
      "zh-TW": "姬子",
      "ja": "姫子",
      "ko": "히메코",
      "ru": "Химеко"
    },
    "path": "Erudition",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1004": {
    "names": {
      "en": "Welt",
      "th": "เวิลต์",
      "zh-CN": "瓦尔特",
      "zh-TW": "瓦爾特",
      "ja": "ヴェルト",
      "ko": "웰트",
      "ru": "Вельт"
    },
    "path": "Nihility",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1005": {
    "names": {
      "en": "Kafka",
      "th": "คาฟกา",
      "zh-CN": "卡芙卡",
      "zh-TW": "卡芙卡",
      "ja": "カフカ",
      "ko": "카프카",
      "ru": "Кафка"
    },
    "path": "Nihility",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  },
  "1006": {
    "names": {
      "en": "Silver Wolf",
      "th": "ซิลเวอร์วูล์ฟ",
      "zh-CN": "银狼",
      "zh-TW": "銀狼",
      "ja": "銀狼",
      "ko": "은랑",
      "ru": "Серебряный Волк"
    },
    "path": "Nihility",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1008": {
    "names": {
      "en": "Arlan",
      "th": "อาร์ลัน",
      "zh-CN": "阿兰",
      "zh-TW": "阿蘭",
      "ja": "アーラン",
      "ko": "아를란",
      "ru": "Арлан"
    },
    "path": "Destruction",
    "element": "Lightning",
    "rarity": 4,
    "hasExRank": false
  },
  "1009": {
    "names": {
      "en": "Asta",
      "th": "แอสต้า",
      "zh-CN": "艾丝妲",
      "zh-TW": "艾絲妲",
      "ja": "アスター",
      "ko": "아스타",
      "ru": "Аста"
    },
    "path": "Harmony",
    "element": "Fire",
    "rarity": 4,
    "hasExRank": false
  },
  "1013": {
    "names": {
      "en": "Herta",
      "th": "เฮอร์ต้า",
      "zh-CN": "黑塔",
      "zh-TW": "黑塔",
      "ja": "ヘルタ",
      "ko": "헤르타",
      "ru": "Герта"
    },
    "path": "Erudition",
    "element": "Ice",
    "rarity": 4,
    "hasExRank": false
  },
  "1014": {
    "names": {
      "en": "Saber",
      "th": "เซเบอร์",
      "zh-CN": "阿尔托莉雅·潘德拉贡 (塞巴)",
      "zh-TW": "阿爾托莉雅·潘德拉貢",
      "ja": "セイバー",
      "ko": "세이버",
      "ru": "Сэйбер"
    },
    "path": "Destruction",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1015": {
    "names": {
      "en": "Archer",
      "th": "อาร์เชอร์",
      "zh-CN": "卫宫士郎 (红A/阿茶)",
      "zh-TW": "衛宮士郎 (紅A)",
      "ja": "アーチャー",
      "ko": "아처",
      "ru": "Арчер"
    },
    "path": "Hunt",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1101": {
    "names": {
      "en": "Bronya",
      "th": "โบรเนีย",
      "zh-CN": "布洛妮娅",
      "zh-TW": "布洛妮婭",
      "ja": "ブローニャ",
      "ko": "브로냐",
      "ru": "Броня"
    },
    "path": "Harmony",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1102": {
    "names": {
      "en": "Seele",
      "th": "เซเล่",
      "zh-CN": "希儿",
      "zh-TW": "希兒",
      "ja": "ゼーレ",
      "ko": "제레",
      "ru": "Зеле"
    },
    "path": "Hunt",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1103": {
    "names": {
      "en": "Serval",
      "th": "เซอวัล",
      "zh-CN": "希露瓦",
      "zh-TW": "希露瓦",
      "ja": "セーバル",
      "ko": "서벌",
      "ru": "Сервал"
    },
    "path": "Erudition",
    "element": "Lightning",
    "rarity": 4,
    "hasExRank": false
  },
  "1104": {
    "names": {
      "en": "Gepard",
      "th": "เกพาร์ด",
      "zh-CN": "杰帕德",
      "zh-TW": "傑帕德",
      "ja": "ジェパード",
      "ko": "게파드",
      "ru": "Гепард"
    },
    "path": "Preservation",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1105": {
    "names": {
      "en": "Natasha",
      "th": "นาตาชา",
      "zh-CN": "娜塔莎",
      "zh-TW": "娜塔莎",
      "ja": "ナターシャ",
      "ko": "나타샤",
      "ru": "Наташа"
    },
    "path": "Abundance",
    "element": "Physical",
    "rarity": 4,
    "hasExRank": false
  },
  "1106": {
    "names": {
      "en": "Pela",
      "th": "เพล่า",
      "zh-CN": "佩拉",
      "zh-TW": "佩拉",
      "ja": "ペラ",
      "ko": "페라",
      "ru": "Пела"
    },
    "path": "Nihility",
    "element": "Ice",
    "rarity": 4,
    "hasExRank": false
  },
  "1107": {
    "names": {
      "en": "Clara",
      "th": "คลารา",
      "zh-CN": "克拉拉",
      "zh-TW": "克拉拉",
      "ja": "クラーラ",
      "ko": "클라라",
      "ru": "Клара"
    },
    "path": "Destruction",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1108": {
    "names": {
      "en": "Sampo",
      "th": "ซัมโป",
      "zh-CN": "桑博",
      "zh-TW": "桑博",
      "ja": "サンポ",
      "ko": "삼포",
      "ru": "Сампо"
    },
    "path": "Nihility",
    "element": "Wind",
    "rarity": 4,
    "hasExRank": false
  },
  "1109": {
    "names": {
      "en": "Hook",
      "th": "ฮุค",
      "zh-CN": "虎克",
      "zh-TW": "虎克",
      "ja": "フック",
      "ko": "후크",
      "ru": "Хук"
    },
    "path": "Destruction",
    "element": "Fire",
    "rarity": 4,
    "hasExRank": false
  },
  "1110": {
    "names": {
      "en": "Lynx",
      "th": "ลิงซ์",
      "zh-CN": "玲可",
      "zh-TW": "玲可",
      "ja": "リンクス",
      "ko": "링크스",
      "ru": "Рысь"
    },
    "path": "Abundance",
    "element": "Quantum",
    "rarity": 4,
    "hasExRank": false
  },
  "1111": {
    "names": {
      "en": "Luka",
      "th": "ลูกา",
      "zh-CN": "卢卡",
      "zh-TW": "盧卡",
      "ja": "ルカ",
      "ko": "루카",
      "ru": "Лука"
    },
    "path": "Nihility",
    "element": "Physical",
    "rarity": 4,
    "hasExRank": false
  },
  "1112": {
    "names": {
      "en": "Topaz & Numby",
      "th": "โทพาซ & นัมบี้",
      "zh-CN": "托帕&账账",
      "zh-TW": "托帕&賬賬",
      "ja": "トパーズ&カブ",
      "ko": "토파즈&복순이",
      "ru": "Топаз и Счетовод"
    },
    "path": "Hunt",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1201": {
    "names": {
      "en": "Qingque",
      "th": "ชิงเชวี่ย",
      "zh-CN": "青雀",
      "zh-TW": "青雀",
      "ja": "青雀",
      "ko": "청작",
      "ru": "Цинцюэ"
    },
    "path": "Erudition",
    "element": "Quantum",
    "rarity": 4,
    "hasExRank": false
  },
  "1202": {
    "names": {
      "en": "Tingyun",
      "th": "ถิงหยุน",
      "zh-CN": "停云",
      "zh-TW": "停雲",
      "ja": "停雲",
      "ko": "정운",
      "ru": "Тинъюнь"
    },
    "path": "Harmony",
    "element": "Lightning",
    "rarity": 4,
    "hasExRank": false
  },
  "1203": {
    "names": {
      "en": "Luocha",
      "th": "หลัวชา",
      "zh-CN": "罗刹",
      "zh-TW": "羅剎",
      "ja": "羅刹",
      "ko": "나찰",
      "ru": "Лоча"
    },
    "path": "Abundance",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1204": {
    "names": {
      "en": "Jing Yuan",
      "th": "จิ่งหยวน",
      "zh-CN": "景元",
      "zh-TW": "景元",
      "ja": "景元",
      "ko": "경원",
      "ru": "Цзин Юань"
    },
    "path": "Erudition",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": true
  },
  "1205": {
    "names": {
      "en": "Blade",
      "th": "เบลด",
      "zh-CN": "刃",
      "zh-TW": "刃",
      "ja": "刃",
      "ko": "블레이드",
      "ru": "Блэйд"
    },
    "path": "Destruction",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1206": {
    "names": {
      "en": "Sushang",
      "th": "ซูซาง",
      "zh-CN": "素裳",
      "zh-TW": "素裳",
      "ja": "素裳",
      "ko": "소상",
      "ru": "Сушан"
    },
    "path": "Hunt",
    "element": "Physical",
    "rarity": 4,
    "hasExRank": false
  },
  "1207": {
    "names": {
      "en": "Yukong",
      "th": "อวี้คง",
      "zh-CN": "驭空",
      "zh-TW": "馭空",
      "ja": "御空",
      "ko": "어공",
      "ru": "Юйкун"
    },
    "path": "Harmony",
    "element": "Imaginary",
    "rarity": 4,
    "hasExRank": false
  },
  "1208": {
    "names": {
      "en": "Fu Xuan",
      "th": "ฟู่เสวียน",
      "zh-CN": "符玄",
      "zh-TW": "符玄",
      "ja": "符玄",
      "ko": "부현",
      "ru": "Фу Сюань"
    },
    "path": "Preservation",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1209": {
    "names": {
      "en": "Yanqing",
      "th": "เหยียนชิง",
      "zh-CN": "彦卿",
      "zh-TW": "彥卿",
      "ja": "彦卿",
      "ko": "연경",
      "ru": "Яньцин"
    },
    "path": "Hunt",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1210": {
    "names": {
      "en": "Guinaifen",
      "th": "กุ้ยหน่ายเฟิน",
      "zh-CN": "桂乃芬",
      "zh-TW": "桂乃芬",
      "ja": "桂乃芬",
      "ko": "계네빈",
      "ru": "Гуйнайфэнь"
    },
    "path": "Nihility",
    "element": "Fire",
    "rarity": 4,
    "hasExRank": false
  },
  "1211": {
    "names": {
      "en": "Bailu",
      "th": "ไป๋ลู่",
      "zh-CN": "白露",
      "zh-TW": "白露",
      "ja": "白露",
      "ko": "백로",
      "ru": "Байлу"
    },
    "path": "Abundance",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  },
  "1212": {
    "names": {
      "en": "Jingliu",
      "th": "จิ้งหลิว",
      "zh-CN": "镜流",
      "zh-TW": "鏡流",
      "ja": "鏡流",
      "ko": "경류",
      "ru": "Цзинлю"
    },
    "path": "Destruction",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1213": {
    "names": {
      "en": "Dan Heng • Imbibitor Lunae",
      "th": "ดันเฮง จ้าวยลจันทรา",
      "zh-CN": "丹恒·饮月",
      "zh-TW": "丹恆·飲月",
      "ja": "丹恒・飲月",
      "ko": "단항·음월",
      "ru": "Дань Хэн: Пожиратель Луны"
    },
    "path": "Destruction",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": true
  },
  "1214": {
    "names": {
      "en": "Xueyi",
      "th": "เสวียอี้",
      "zh-CN": "雪衣",
      "zh-TW": "雪衣",
      "ja": "雪衣",
      "ko": "설의",
      "ru": "Сюэи"
    },
    "path": "Destruction",
    "element": "Quantum",
    "rarity": 4,
    "hasExRank": false
  },
  "1215": {
    "names": {
      "en": "Hanya",
      "th": "ฮันย่า",
      "zh-CN": "寒鸦",
      "zh-TW": "寒鴉",
      "ja": "寒鴉",
      "ko": "한아",
      "ru": "Ханья"
    },
    "path": "Harmony",
    "element": "Physical",
    "rarity": 4,
    "hasExRank": false
  },
  "1217": {
    "names": {
      "en": "Huohuo",
      "th": "ฮัวฮัว",
      "zh-CN": "藿藿",
      "zh-TW": "藿藿",
      "ja": "フォフォ",
      "ko": "곽향",
      "ru": "Хохо"
    },
    "path": "Abundance",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1218": {
    "names": {
      "en": "Jiaoqiu",
      "th": "เจียวชิว",
      "zh-CN": "椒丘",
      "zh-TW": "椒丘",
      "ja": "椒丘",
      "ko": "초구",
      "ru": "Цзяоцю"
    },
    "path": "Nihility",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1220": {
    "names": {
      "en": "Feixiao",
      "th": "เฟยเซียว",
      "zh-CN": "飞霄",
      "zh-TW": "飛霄",
      "ja": "飛霄",
      "ko": "비소",
      "ru": "Фэйсяо"
    },
    "path": "Hunt",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1221": {
    "names": {
      "en": "Yunli",
      "th": "หยุนหลี่",
      "zh-CN": "云璃",
      "zh-TW": "雲璃",
      "ja": "雲璃",
      "ko": "운리",
      "ru": "Юньли"
    },
    "path": "Destruction",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1222": {
    "names": {
      "en": "Lingsha",
      "th": "หลิงซา",
      "zh-CN": "灵砂",
      "zh-TW": "靈砂",
      "ja": "霊砂",
      "ko": "영사",
      "ru": "Линша"
    },
    "path": "Abundance",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1223": {
    "names": {
      "en": "Moze",
      "th": "โม่เจ๋อ",
      "zh-CN": "貊泽",
      "zh-TW": "貊澤",
      "ja": "モゼ",
      "ko": "맥택",
      "ru": "Моцзэ"
    },
    "path": "Hunt",
    "element": "Lightning",
    "rarity": 4,
    "hasExRank": false
  },
  "1224": {
    "names": {
      "en": "March 7th • The Hunt",
      "th": "ล่าสังหาร",
      "zh-CN": "三月七·巡猎",
      "zh-TW": "三月七·巡獵",
      "ja": "三月なのか・巡狩",
      "ko": "March 7th·수렵",
      "ru": "Март 7 • Охота"
    },
    "path": "Hunt",
    "element": "Imaginary",
    "rarity": 4,
    "hasExRank": false
  },
  "1225": {
    "names": {
      "en": "Fugue",
      "th": "ฟิวก์",
      "zh-CN": "忘归人",
      "zh-TW": "忘歸人",
      "ja": "忘帰人",
      "ko": "망귀인",
      "ru": "Фуга"
    },
    "path": "Nihility",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1301": {
    "names": {
      "en": "Gallagher",
      "th": "กัลลาเกอร์",
      "zh-CN": "加拉赫",
      "zh-TW": "加拉赫",
      "ja": "ギャラガー",
      "ko": "갤러거",
      "ru": "Галлахер"
    },
    "path": "Abundance",
    "element": "Fire",
    "rarity": 4,
    "hasExRank": false
  },
  "1302": {
    "names": {
      "en": "Argenti",
      "th": "อาร์เจนติ",
      "zh-CN": "银枝",
      "zh-TW": "銀枝",
      "ja": "アルジェンティ",
      "ko": "아젠티",
      "ru": "Аргенти"
    },
    "path": "Erudition",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1303": {
    "names": {
      "en": "Ruan Mei",
      "th": "รวน เหมย",
      "zh-CN": "阮·梅",
      "zh-TW": "阮·梅",
      "ja": "ルアン・メェイ",
      "ko": "완·매",
      "ru": "Жуань Мэй"
    },
    "path": "Harmony",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1304": {
    "names": {
      "en": "Aventurine",
      "th": "อเวนทูรีน",
      "zh-CN": "砂金",
      "zh-TW": "砂金",
      "ja": "アベンチュリン",
      "ko": "어벤츄린",
      "ru": "Авантюрин"
    },
    "path": "Preservation",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1305": {
    "names": {
      "en": "Dr. Ratio",
      "th": "ดร. เรโช",
      "zh-CN": "真理医生",
      "zh-TW": "真理醫生",
      "ja": "Dr.レイシオ",
      "ko": "Dr. 레이시오",
      "ru": "Д-р Рацио"
    },
    "path": "Hunt",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1306": {
    "names": {
      "en": "Sparkle",
      "th": "สปาร์กเคิล",
      "zh-CN": "花火",
      "zh-TW": "花火",
      "ja": "花火",
      "ko": "스파클",
      "ru": "Искорка"
    },
    "path": "Harmony",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1307": {
    "names": {
      "en": "Black Swan",
      "th": "แบล็กสวอน",
      "zh-CN": "黑天鹅",
      "zh-TW": "黑天鵝",
      "ja": "ブラックスワン",
      "ko": "블랙 스완",
      "ru": "Черный Лебедь"
    },
    "path": "Nihility",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1308": {
    "names": {
      "en": "Acheron",
      "th": "อาเคอรอน",
      "zh-CN": "黄泉",
      "zh-TW": "黃泉",
      "ja": "黄泉",
      "ko": "아케론",
      "ru": "Ахерон"
    },
    "path": "Nihility",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": true
  },
  "1309": {
    "names": {
      "en": "Robin",
      "th": "โรบิน",
      "zh-CN": "知更鸟",
      "zh-TW": "知更鳥",
      "ja": "ロビン",
      "ko": "로빈",
      "ru": "Зарянка"
    },
    "path": "Harmony",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1310": {
    "names": {
      "en": "Firefly",
      "th": "ไฟร์ฟลาย",
      "zh-CN": "流萤",
      "zh-TW": "流螢",
      "ja": "ホタル",
      "ko": "반디",
      "ru": "Светлячок"
    },
    "path": "Destruction",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1312": {
    "names": {
      "en": "Misha",
      "th": "มิชา",
      "zh-CN": "米沙",
      "zh-TW": "米沙",
      "ja": "ミーシャ",
      "ko": "미샤",
      "ru": "Миша"
    },
    "path": "Destruction",
    "element": "Ice",
    "rarity": 4,
    "hasExRank": false
  },
  "1313": {
    "names": {
      "en": "Sunday",
      "th": "ซันเดย์",
      "zh-CN": "星期日",
      "zh-TW": "星期日",
      "ja": "サンデー",
      "ko": "선데이",
      "ru": "Воскресенье"
    },
    "path": "Harmony",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1314": {
    "names": {
      "en": "Jade",
      "th": "เจด",
      "zh-CN": "翡翠",
      "zh-TW": "翡翠",
      "ja": "ジェイド",
      "ko": "ジェイド",
      "ru": "Яшма"
    },
    "path": "Erudition",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1315": {
    "names": {
      "en": "Boothill",
      "th": "บูทฮิลล์",
      "zh-CN": "波提欧",
      "zh-TW": "波提歐",
      "ja": "ブートヒル",
      "ko": "부트힐",
      "ru": "Бутхилл"
    },
    "path": "Hunt",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1317": {
    "names": {
      "en": "Rappa",
      "th": "แรปปา",
      "zh-CN": "乱破",
      "zh-TW": "亂破",
      "ja": "乱破",
      "ko": "라파",
      "ru": "Раппа"
    },
    "path": "Erudition",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1321": {
    "names": {
      "en": "Dahlia",
      "th": "ดาเลีย",
      "zh-CN": "达莉亚",
      "zh-TW": "達莉亞",
      "ja": "ダリア",
      "ko": "달리아",
      "ru": "Далия"
    },
    "path": "Nihility",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1401": {
    "names": {
      "en": "The Herta",
      "th": "เดอะ เฮอร์ต้า",
      "zh-CN": "大黑塔",
      "zh-TW": "大黑塔",
      "ja": "ザ・ヘルタ",
      "ko": "더 헤르타",
      "ru": "Великая Герта"
    },
    "path": "Erudition",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1402": {
    "names": {
      "en": "Aglaea",
      "th": "อักเลีย",
      "zh-CN": "阿格莱雅",
      "zh-TW": "阿格萊雅",
      "ja": "アグラエア",
      "ko": "아글라이아",
      "ru": "Аглая"
    },
    "path": "Remembrance",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  },
  "1403": {
    "names": {
      "en": "Tribbie",
      "th": "ทริบบี้",
      "zh-CN": "提比",
      "zh-TW": "提比",
      "ja": "トリビー",
      "ko": "트리비",
      "ru": "Трибби"
    },
    "path": "Harmony",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1404": {
    "names": {
      "en": "Mydei",
      "th": "ไมเดย์",
      "zh-CN": "麦狄",
      "zh-TW": "麥狄",
      "ja": "マイディ",
      "ko": "마이데이",
      "ru": "Мидей"
    },
    "path": "Destruction",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1405": {
    "names": {
      "en": "Anaxa",
      "th": "อนากซา",
      "zh-CN": "阿那克萨",
      "zh-TW": "阿那克薩",
      "ja": "アナクサ",
      "ko": "아낙사",
      "ru": "Анакса"
    },
    "path": "Erudition",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1406": {
    "names": {
      "en": "Cipher",
      "th": "ไซเฟอร์",
      "zh-CN": "赛弗",
      "zh-TW": "賽弗",
      "ja": "サイファー",
      "ko": "사이퍼",
      "ru": "Сайфер"
    },
    "path": "Nihility",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1407": {
    "names": {
      "en": "Castorice",
      "th": "แคสโตริซ",
      "zh-CN": "遐蝶",
      "zh-TW": "遐蝶",
      "ja": "カストリセ",
      "ko": "카스토리체",
      "ru": "Касторисе"
    },
    "path": "Remembrance",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1408": {
    "names": {
      "en": "Phainon",
      "th": "ไฟนอน",
      "zh-CN": "法埃农",
      "zh-TW": "法埃農",
      "ja": "ファイノン",
      "ko": "파이논",
      "ru": "Файнон"
    },
    "path": "Destruction",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1409": {
    "names": {
      "en": "Hyacine",
      "th": "ไฮยาซีน",
      "zh-CN": "风信子",
      "zh-TW": "風信子",
      "ja": "ヒヤシンス",
      "ko": "히아신스",
      "ru": "Гиацинт"
    },
    "path": "Remembrance",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1410": {
    "names": {
      "en": "Hysilens",
      "th": "ไฮซิเลนส์",
      "zh-CN": "海西伦斯",
      "zh-TW": "海西倫斯",
      "ja": "ヒシレンス",
      "ko": "히실렌스",
      "ru": "Гисиленс"
    },
    "path": "Nihility",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1412": {
    "names": {
      "en": "Cerydra",
      "th": "เซอรีดรา",
      "zh-CN": "塞利德拉",
      "zh-TW": "塞利德拉",
      "ja": "セリドラ",
      "ko": "세리드라",
      "ru": "Серидра"
    },
    "path": "Harmony",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1413": {
    "names": {
      "en": "Evernight",
      "th": "เอเวอร์ไนท์",
      "zh-CN": "永夜",
      "zh-TW": "永夜",
      "ja": "エバーナイト",
      "ko": "에버나이트",
      "ru": "Эвернайт"
    },
    "path": "Remembrance",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1414": {
    "names": {
      "en": "Dan Heng • Permeating Thunder",
      "th": "ดันเฮงร่างใหม่",
      "zh-CN": "丹恒·行者",
      "zh-TW": "丹恆·行者",
      "ja": "丹恒・行者",
      "ko": "단항·행자",
      "ru": "Дань Хэн • Странник"
    },
    "path": "Preservation",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1415": {
    "names": {
      "en": "Cyrene",
      "th": "ไซรีน",
      "zh-CN": "赛琳",
      "zh-TW": "賽琳",
      "ja": "サイリーン",
      "ko": "키레네",
      "ru": "Кирена"
    },
    "path": "Remembrance",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1501": {
    "names": {
      "en": "Sparxie",
      "th": "สปาร์กซี่",
      "zh-CN": "斯帕克茜",
      "zh-TW": "斯帕克茜",
      "ja": "スパーキー",
      "ko": "스팍시",
      "ru": "Спаркси"
    },
    "path": "Elation",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1502": {
    "names": {
      "en": "Yaoguang",
      "th": "เย่ากวง",
      "zh-CN": "瑶光",
      "zh-TW": "瑤光",
      "ja": "瑤光",
      "ko": "요광",
      "ru": "Яогуан"
    },
    "path": "Elation",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1503": {
    "names": {
      "en": "Pearl",
      "th": "เพิร์ล",
      "zh-CN": "佩尔 (Pearl)",
      "zh-TW": "佩爾",
      "ja": "パール",
      "ko": "펄",
      "ru": "Перл"
    },
    "path": "Elation",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "1504": {
    "names": {
      "en": "Ashveil",
      "th": "แอชเวล",
      "zh-CN": "灰纱",
      "zh-TW": "灰紗",
      "ja": "アッシュヴェイル",
      "ko": "애쉬베일",
      "ru": "Эшвейл"
    },
    "path": "Hunt",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  },
  "1505": {
    "names": {
      "en": "Evanescia",
      "th": "เอวาเนสเซีย",
      "zh-CN": "埃瓦内西亚",
      "zh-TW": "埃瓦內西亞",
      "ja": "エヴァネシア",
      "ko": "에바네시아",
      "ru": "Эванесия"
    },
    "path": "Elation",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "1506": {
    "names": {
      "en": "Silver Wolf Lv.999",
      "th": "ซิลเวอร์วูล์ฟ Lv.999",
      "zh-CN": "银狼 Lv.999",
      "zh-TW": "銀狼 Lv.999",
      "ja": "銀狼 Lv.999",
      "ko": "은랑 Lv.999",
      "ru": "Серебряный Волк Lv.999"
    },
    "path": "Elation",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "1507": {
    "names": {
      "en": "Mortenax Blade",
      "th": "มอร์เทแนกซ์ เบลด",
      "zh-CN": "摩天之刃",
      "zh-TW": "摩天之刃",
      "ja": "摩天の刃",
      "ko": "모르테낙스 블레이드",
      "ru": "Мортенакс Блейд"
    },
    "path": "Nihility",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1508": {
    "names": {
      "en": "Tohsaka Rin",
      "th": "โทซากะ ริน",
      "zh-CN": "远坂凛",
      "zh-TW": "遠坂凜",
      "ja": "遠坂凛",
      "ko": "토오사카 린",
      "ru": "Рин Тосака"
    },
    "path": "Erudition",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1509": {
    "names": {
      "en": "Gilgamesh",
      "th": "กิลกาเมช",
      "zh-CN": "吉尔伽美什 (金闪闪)",
      "zh-TW": "吉爾伽美什",
      "ja": "ギルガメッシュ",
      "ko": "길가메시",
      "ru": "Гильгамеш"
    },
    "path": "Destruction",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  },
  "1510": {
    "names": {
      "en": "Himeko Nova",
      "th": "ฮิเมโกะ โนวา",
      "zh-CN": "姬子·新星",
      "zh-TW": "姬子·新星",
      "ja": "姫子・ノヴァ",
      "ko": "히메코 노바",
      "ru": "Химеко Нова"
    },
    "path": "Erudition",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "1511": {
    "names": {
      "en": "Nihilux",
      "th": "นิฮิลักซ์",
      "zh-CN": "虚无之神·尼希卢克斯",
      "zh-TW": "虛無之神·尼希盧克斯",
      "ja": "ニヒラックス",
      "ko": "니힐룩스",
      "ru": "Нихилюкс"
    },
    "path": "Elation",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "1512": {
    "names": {
      "en": "Robin • Summeretto",
      "th": "โรบิน ซัมเมอร์",
      "zh-CN": "知更鸟·夏日",
      "zh-TW": "知更鳥·夏日",
      "ja": "ロビン・サマー",
      "ko": "로빈·서머",
      "ru": "Зарянка • Лето"
    },
    "path": "Remembrance",
    "element": "Wind",
    "rarity": 5,
    "hasExRank": false
  },
  "1513": {
    "names": {
      "en": "Aventurine • Waveflair",
      "th": "อเวนทูรีน คลื่นทะเล",
      "zh-CN": "砂金·夏日浪潮",
      "zh-TW": "砂金·夏日浪潮",
      "ja": "アベンチュリン・サマー",
      "ko": "어벤츄린·웨이브",
      "ru": "Авантюрин • Волна"
    },
    "path": "Elation",
    "element": "Quantum",
    "rarity": 5,
    "hasExRank": false
  },
  "8001": {
    "names": {
      "en": "Trailblazer (Physical ♂)",
      "th": "ผู้บุกเบิก (กายภาพ ♂)",
      "zh-CN": "开拓者 (物理 ♂)",
      "zh-TW": "開拓者 (物理 ♂)",
      "ja": "開拓者 (物理 ♂)",
      "ko": "개척자 (물리 ♂)",
      "ru": "Первопроходец (Физ. ♂)"
    },
    "path": "Destruction",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "8002": {
    "names": {
      "en": "Trailblazer (Physical ♀)",
      "th": "ผู้บุกเบิก (กายภาพ ♀)",
      "zh-CN": "开拓者 (物理 ♀)",
      "zh-TW": "開拓者 (物理 ♀)",
      "ja": "開拓者 (物理 ♀)",
      "ko": "개척자 (물리 ♀)",
      "ru": "Первопроходец (Физ. ♀)"
    },
    "path": "Destruction",
    "element": "Physical",
    "rarity": 5,
    "hasExRank": false
  },
  "8003": {
    "names": {
      "en": "Trailblazer (Fire ♂)",
      "th": "ผู้บุกเบิก (ไฟ ♂)",
      "zh-CN": "开拓者 (火 ♂)",
      "zh-TW": "開拓者 (火 ♂)",
      "ja": "開拓者 (炎 ♂)",
      "ko": "개척자 (화염 ♂)",
      "ru": "Первопроходец (Огонь ♂)"
    },
    "path": "Preservation",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "8004": {
    "names": {
      "en": "Trailblazer (Fire ♀)",
      "th": "ผู้บุกเบิก (ไฟ ♀)",
      "zh-CN": "开拓者 (火 ♀)",
      "zh-TW": "開拓者 (火 ♀)",
      "ja": "開拓者 (炎 ♀)",
      "ko": "개척자 (화염 ♀)",
      "ru": "Первопроходец (Огонь ♀)"
    },
    "path": "Preservation",
    "element": "Fire",
    "rarity": 5,
    "hasExRank": false
  },
  "8005": {
    "names": {
      "en": "Trailblazer (Harmony ♂)",
      "th": "ผู้บุกเบิก (ประสาน ♂)",
      "zh-CN": "开拓者 (同谐 ♂)",
      "zh-TW": "開拓者 (同諧 ♂)",
      "ja": "開拓者 (調和 ♂)",
      "ko": "개척자 (화합 ♂)",
      "ru": "Первопроходец (Гармония ♂)"
    },
    "path": "Harmony",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "8006": {
    "names": {
      "en": "Trailblazer (Harmony ♀)",
      "th": "ผู้บุกเบิก (ประสาน ♀)",
      "zh-CN": "开拓者 (同谐 ♀)",
      "zh-TW": "開拓者 (同諧 ♀)",
      "ja": "開拓者 (調和 ♀)",
      "ko": "개척자 (화합 ♀)",
      "ru": "Первопроходец (Гармония ♀)"
    },
    "path": "Harmony",
    "element": "Imaginary",
    "rarity": 5,
    "hasExRank": false
  },
  "8007": {
    "names": {
      "en": "Trailblazer (Remembrance ♂)",
      "th": "ผู้บุกเบิก (ความทรงจำ ♂)",
      "zh-CN": "开拓者 (记忆 ♂)",
      "zh-TW": "開拓者 (記憶 ♂)",
      "ja": "開拓者 (記憶 ♂)",
      "ko": "개척자 (기억 ♂)",
      "ru": "Первопроходец (Память ♂)"
    },
    "path": "Remembrance",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "8008": {
    "names": {
      "en": "Trailblazer (Remembrance ♀)",
      "th": "ผู้บุกเบิก (ความทรงจำ ♀)",
      "zh-CN": "开拓者 (记忆 ♀)",
      "zh-TW": "開拓者 (記憶 ♀)",
      "ja": "開拓者 (記憶 ♀)",
      "ko": "개척자 (기억 ♀)",
      "ru": "Первопроходец (Память ♀)"
    },
    "path": "Remembrance",
    "element": "Ice",
    "rarity": 5,
    "hasExRank": false
  },
  "8009": {
    "names": {
      "en": "Trailblazer (Elation ♂)",
      "th": "ผู้บุกเบิก (ปีติ ♂)",
      "zh-CN": "开拓者 (欢愉 ♂)",
      "zh-TW": "開拓者 (歡愉 ♂)",
      "ja": "開拓者 (愉悦 ♂)",
      "ko": "개척자 (환락 ♂)",
      "ru": "Первопроходец (Радость ♂)"
    },
    "path": "Elation",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  },
  "8010": {
    "names": {
      "en": "Trailblazer (Elation ♀)",
      "th": "ผู้บุกเบิก (ปีติ ♀)",
      "zh-CN": "开拓者 (欢愉 ♀)",
      "zh-TW": "開拓者 (歡愉 ♀)",
      "ja": "開拓者 (愉悦 ♀)",
      "ko": "개척자 (환락 ♀)",
      "ru": "Первопроходец (Радость ♀)"
    },
    "path": "Elation",
    "element": "Lightning",
    "rarity": 5,
    "hasExRank": false
  }
};

export function getAvatarInfo(avatarId, langOverride = null) {
  const lang = langOverride || getCurrentLanguage();
  const meta = AVATAR_METADATA[avatarId];

  if (!meta) {
    return {
      name: `Avatar ${avatarId}`,
      path: translatePath("Unknown"),
      element: translateElement("Unknown"),
      rarity: 4,
      hasExRank: false
    };
  }

  const localizedName = meta.names?.[lang] || meta.names?.th || meta.names?.en || `Avatar ${avatarId}`;

  return {
    name: localizedName,
    path: translatePath(meta.path),
    element: translateElement(meta.element),
    rarity: meta.rarity,
    hasExRank: !!meta.hasExRank
  };
}
