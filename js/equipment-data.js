import { getCurrentLanguage, translatePath } from "./i18n.js";

export const LIGHTCONE_METADATA = {
  "20000": {
    "names": {
      "th": "Arrows",
      "en": "Arrows",
      "zh-CN": "锋镝",
      "zh-TW": "鋒鏑",
      "ja": "矢じり",
      "ko": "화살촉",
      "ru": "Стрелы",
      "vi": "Mũi Tên",
      "id": "Arrows",
      "es": "Flechas",
      "fr": "Flèches",
      "de": "Pfeile",
      "pt": "Flechas"
    },
    "rarity": 3,
    "path": "Hunt"
  },
  "20001": {
    "names": {
      "th": "Cornucopia",
      "en": "Cornucopia",
      "zh-CN": "物穰",
      "zh-TW": "物穰",
      "ja": "物穣",
      "ko": "풍작",
      "ru": "Рог изобилия",
      "vi": "Dồi Dào",
      "id": "Cornucopia",
      "es": "Cornucopia",
      "fr": "Corne d'abondance",
      "de": "Füllhorn",
      "pt": "Cornucópia"
    },
    "rarity": 3,
    "path": "Abundance"
  },
  "20002": {
    "names": {
      "th": "Collapsing Sky",
      "en": "Collapsing Sky",
      "zh-CN": "天倾",
      "zh-TW": "天傾",
      "ja": "天傾",
      "ko": "천경",
      "ru": "Падение небес",
      "vi": "Trời Sập",
      "id": "Collapsing Sky",
      "es": "Colapso celeste",
      "fr": "Effondrement céleste",
      "de": "Zusammenbruch des Himmels",
      "pt": "Céu Colapsado"
    },
    "rarity": 3,
    "path": "Destruction"
  },
  "20003": {
    "names": {
      "th": "Amber",
      "en": "Amber",
      "zh-CN": "琥珀",
      "zh-TW": "琥珀",
      "ja": "琥珀",
      "ko": "앰버",
      "ru": "Янтарь",
      "vi": "Hổ Phách",
      "id": "Amber",
      "es": "Ámbar",
      "fr": "Ambre",
      "de": "Bernstein",
      "pt": "Âmbar"
    },
    "rarity": 3,
    "path": "Preservation"
  },
  "20004": {
    "names": {
      "th": "Void",
      "en": "Void",
      "zh-CN": "幽邃",
      "zh-TW": "幽邃",
      "ja": "幽邃",
      "ko": "그윽",
      "ru": "Пустота",
      "vi": "Tĩnh Mịch",
      "id": "Void",
      "es": "Vacío",
      "fr": "Néant",
      "de": "Leere",
      "pt": "Vazio"
    },
    "rarity": 3,
    "path": "Nihility"
  },
  "20005": {
    "names": {
      "th": "Chorus",
      "en": "Chorus",
      "zh-CN": "齐颂",
      "zh-TW": "齊頌",
      "ja": "斉頌",
      "ko": "합창",
      "ru": "Хор",
      "vi": "Điệp Khúc",
      "id": "Chorus",
      "es": "Coro",
      "fr": "Chœur",
      "de": "Chor",
      "pt": "Refrão"
    },
    "rarity": 3,
    "path": "Harmony"
  },
  "20006": {
    "names": {
      "th": "Data Bank",
      "en": "Data Bank",
      "zh-CN": "智库",
      "zh-TW": "智庫",
      "ja": "アーカイブ",
      "ko": "아카이브",
      "ru": "База данных",
      "vi": "Kho Lưu Trữ",
      "id": "Data Bank",
      "es": "Archivos",
      "fr": "Banque de données",
      "de": "Datenbank",
      "pt": "Banco de Dados"
    },
    "rarity": 3,
    "path": "Erudition"
  },
  "20007": {
    "names": {
      "th": "Darting Arrow",
      "en": "Darting Arrow",
      "zh-CN": "离弦",
      "zh-TW": "離弦",
      "ja": "離弦",
      "ko": "시위를 떠난 화살",
      "ru": "Выпущенная стрела",
      "vi": "Tên Bắn",
      "id": "Darting Arrow",
      "es": "Flecha voladora",
      "fr": "Flèche plongeante",
      "de": "Wurfpfeil",
      "pt": "Flecha Veloz"
    },
    "rarity": 3,
    "path": "Hunt"
  },
  "20008": {
    "names": {
      "th": "Fine Fruit",
      "en": "Fine Fruit",
      "zh-CN": "嘉果",
      "zh-TW": "嘉果",
      "ja": "嘉果",
      "ko": "알찬 열매",
      "ru": "Спелый плод",
      "vi": "Trái Ngọt",
      "id": "Fine Fruit",
      "es": "Fruto excelente",
      "fr": "Fruit délicat",
      "de": "Feines Obst",
      "pt": "Fruta Delicada"
    },
    "rarity": 3,
    "path": "Abundance"
  },
  "20009": {
    "names": {
      "th": "Shattered Home",
      "en": "Shattered Home",
      "zh-CN": "乐圮",
      "zh-TW": "樂圮",
      "ja": "楽壊",
      "ko": "무너진 행복",
      "ru": "Расколовшийся дом",
      "vi": "Đổ Nát",
      "id": "Shattered Home",
      "es": "Hogar destrozado",
      "fr": "Demeure brisée",
      "de": "Zerstörtes Zuhause",
      "pt": "Casa Destruída"
    },
    "rarity": 3,
    "path": "Destruction"
  },
  "20010": {
    "names": {
      "th": "Defense",
      "en": "Defense",
      "zh-CN": "戍御",
      "zh-TW": "戍禦",
      "ja": "防衛",
      "ko": "수비",
      "ru": "Оборона",
      "vi": "Phòng Thủ",
      "id": "Defense",
      "es": "Blindaje",
      "fr": "Défense",
      "de": "Verteidigung",
      "pt": "Defesa"
    },
    "rarity": 3,
    "path": "Preservation"
  },
  "20011": {
    "names": {
      "th": "Loop",
      "en": "Loop",
      "zh-CN": "渊环",
      "zh-TW": "淵環",
      "ja": "淵環",
      "ko": "심연의 고리",
      "ru": "Петля",
      "vi": "Xoáy Ốc",
      "id": "Loop",
      "es": "Bucle",
      "fr": "Boucle",
      "de": "Schleife",
      "pt": "Loop"
    },
    "rarity": 3,
    "path": "Nihility"
  },
  "20012": {
    "names": {
      "th": "Meshing Cogs",
      "en": "Meshing Cogs",
      "zh-CN": "轮契",
      "zh-TW": "輪契",
      "ja": "輪契",
      "ko": "맞물린 톱니",
      "ru": "Сцепленные шестерни",
      "vi": "Luân Hồi",
      "id": "Meshing Cogs",
      "es": "Rueda mecánica",
      "fr": "Roues d'engrenage",
      "de": "Einklang der Zahnräder",
      "pt": "Rede de Engrenagens"
    },
    "rarity": 3,
    "path": "Harmony"
  },
  "20013": {
    "names": {
      "th": "Passkey",
      "en": "Passkey",
      "zh-CN": "灵钥",
      "zh-TW": "靈鑰",
      "ja": "霊鍵",
      "ko": "영험한 열쇠",
      "ru": "Ключ от всех дверей",
      "vi": "Chìa Khóa Linh Hồn",
      "id": "Passkey",
      "es": "Llave maestra",
      "fr": "Clé du savoir",
      "de": "Generalschlüssel",
      "pt": "Chave Mestra"
    },
    "rarity": 3,
    "path": "Erudition"
  },
  "20014": {
    "names": {
      "th": "Adversarial",
      "en": "Adversarial",
      "zh-CN": "相抗",
      "zh-TW": "相抗",
      "ja": "相抗",
      "ko": "대립",
      "ru": "Противостояние",
      "vi": "Đối Kháng",
      "id": "Adversarial",
      "es": "Antagonista",
      "fr": "Résistance",
      "de": "Gegensätzliches",
      "pt": "Antagonista"
    },
    "rarity": 3,
    "path": "Hunt"
  },
  "20015": {
    "names": {
      "th": "Multiplication",
      "en": "Multiplication",
      "zh-CN": "蕃息",
      "zh-TW": "蕃息",
      "ja": "蕃殖",
      "ko": "증식",
      "ru": "Размножение",
      "vi": "Sinh Sôi",
      "id": "Multiplication",
      "es": "Multiplicación",
      "fr": "Démultiplication",
      "de": "Aufschwung",
      "pt": "Multiplicação"
    },
    "rarity": 3,
    "path": "Abundance"
  },
  "20016": {
    "names": {
      "th": "Mutual Demise",
      "en": "Mutual Demise",
      "zh-CN": "俱殁",
      "zh-TW": "俱歿",
      "ja": "倶歿",
      "ko": "전멸",
      "ru": "Совместная гибель",
      "vi": "Hủy Diệt Tất Cả",
      "id": "Mutual Demise",
      "es": "Final mutuo",
      "fr": "Destruction mutuelle",
      "de": "Gemeinsamer Untergang",
      "pt": "Morte Mútua"
    },
    "rarity": 3,
    "path": "Destruction"
  },
  "20017": {
    "names": {
      "th": "Pioneering",
      "en": "Pioneering",
      "zh-CN": "开疆",
      "zh-TW": "開疆",
      "ja": "新天地",
      "ko": "강토 개척",
      "ru": "Новые горизонты",
      "vi": "Mở Rộng",
      "id": "Pioneering",
      "es": "Colonización",
      "fr": "Expansion",
      "de": "Pionierarbeit",
      "pt": "Pioneirismo"
    },
    "rarity": 3,
    "path": "Preservation"
  },
  "20018": {
    "names": {
      "th": "Hidden Shadow",
      "en": "Hidden Shadow",
      "zh-CN": "匿影",
      "zh-TW": "匿影",
      "ja": "匿影",
      "ko": "숨은 그림자",
      "ru": "Скрытая тень",
      "vi": "Bóng Ẩn",
      "id": "Hidden Shadow",
      "es": "Sombra oculta",
      "fr": "Ombre cachée",
      "de": "Verborgener Schatten",
      "pt": "Sombra Oculta"
    },
    "rarity": 3,
    "path": "Nihility"
  },
  "20019": {
    "names": {
      "th": "Mediation",
      "en": "Mediation",
      "zh-CN": "调和",
      "zh-TW": "調和",
      "ja": "同調",
      "ko": "어울림",
      "ru": "Созвучие",
      "vi": "Hài Hòa",
      "id": "Mediation",
      "es": "Mediación",
      "fr": "Harmonisation",
      "de": "Vermittlung",
      "pt": "Mediação"
    },
    "rarity": 3,
    "path": "Harmony"
  },
  "20020": {
    "names": {
      "th": "Sagacity",
      "en": "Sagacity",
      "zh-CN": "睿见",
      "zh-TW": "睿見",
      "ja": "見識",
      "ko": "식견",
      "ru": "Проницательность",
      "vi": "Thông Tuệ",
      "id": "Sagacity",
      "es": "Sagacidad",
      "fr": "Sagacité",
      "de": "Weisheit",
      "pt": "Sagacidade"
    },
    "rarity": 3,
    "path": "Erudition"
  },
  "20021": {
    "names": {
      "th": "Shadowburn",
      "en": "Shadowburn",
      "zh-CN": "焚影",
      "zh-TW": "焚影",
      "ja": "燃ゆる影",
      "ko": "불타는 그림자",
      "ru": "Выжженные тени",
      "vi": "Thiêu Đốt Ảo Ảnh",
      "id": "Shadowburn",
      "es": "Imágenes quemadas",
      "fr": "Brûlombre",
      "de": "Brennender Schatten",
      "pt": "Queimada"
    },
    "rarity": 3,
    "path": "Remembrance"
  },
  "20022": {
    "names": {
      "th": "Reminiscence",
      "en": "Reminiscence",
      "zh-CN": "溯忆",
      "zh-TW": "溯憶",
      "ja": "辿る記憶",
      "ko": "추억 회상",
      "ru": "Образ прошлого",
      "vi": "Tìm Về Ký Ức",
      "id": "Reminiscence",
      "es": "Retrospección",
      "fr": "Réminiscence",
      "de": "Rückblick",
      "pt": "Reminiscência"
    },
    "rarity": 3,
    "path": "Remembrance"
  },
  "20023": {
    "names": {
      "th": "Sneering",
      "en": "Sneering",
      "zh-CN": "嗤笑",
      "zh-TW": "嗤笑",
      "ja": "嗤笑",
      "ko": "비웃음",
      "ru": "Насмешка",
      "vi": "Cười Nhạo",
      "id": "Sneering",
      "es": "Risita burlona",
      "fr": "Ricanement",
      "de": "Höhnisches Lachen",
      "pt": "Zombaria"
    },
    "rarity": 3,
    "path": "Elation"
  },
  "20024": {
    "names": {
      "th": "Lingering Tear",
      "en": "Lingering Tear",
      "zh-CN": "残泪",
      "zh-TW": "殘淚",
      "ja": "残涙",
      "ko": "눈물의 흔적",
      "ru": "Безудержные слёзы",
      "vi": "Lệ Tàn",
      "id": "Lingering Tears",
      "es": "Las lágrimas que quedan",
      "fr": "Larmes persistantes",
      "de": "Verweilende Träne",
      "pt": "Lágrima Persistente"
    },
    "rarity": 3,
    "path": "Elation"
  },
  "21000": {
    "names": {
      "th": "Post-Op Conversation",
      "en": "Post-Op Conversation",
      "zh-CN": "一场术后对话",
      "zh-TW": "一場術後對話",
      "ja": "手術後の会話",
      "ko": "수술 후의 대화",
      "ru": "Беседа после операции",
      "vi": "Buổi Trò Chuyện Hậu Phẫu",
      "id": "Post-Op Conversation",
      "es": "Conversación en el postoperatorio",
      "fr": "Conversation post-opératoire",
      "de": "Ein Gespräch nach der OP",
      "pt": "Conversa Pós-Operatória"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21001": {
    "names": {
      "th": "Good Night and Sleep Well",
      "en": "Good Night and Sleep Well",
      "zh-CN": "晚安与睡颜",
      "zh-TW": "晚安與睡顏",
      "ja": "おやすみなさいと寝顔",
      "ko": "밤 인사와 잠든 얼굴",
      "ru": "Спокойной ночи и мирного сна",
      "vi": "Chúc Ngủ Ngon",
      "id": "Good Night and Sleep Well",
      "es": "Buenas noches, que duermas bien",
      "fr": "Bonne nuit et dors bien",
      "de": "Gute Nacht, schlaf schön",
      "pt": "Boa Noite e Durma Bem"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21002": {
    "names": {
      "th": "Day One of My New Life",
      "en": "Day One of My New Life",
      "zh-CN": "余生的第一天",
      "zh-TW": "餘生的第一天",
      "ja": "余生の初日",
      "ko": "여생의 첫날",
      "ru": "Первый день моей новой жизни",
      "vi": "Ngày Đầu Tiên",
      "id": "Day One of My New Life",
      "es": "El primer día del resto de mi vida",
      "fr": "Premier jour de ma nouvelle vie",
      "de": "Der erste Tag meines neuen Lebens",
      "pt": "Primeiro Dia da Minha Vida Nova"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21003": {
    "names": {
      "th": "Only Silence Remains",
      "en": "Only Silence Remains",
      "zh-CN": "唯有沉默",
      "zh-TW": "唯有沉默",
      "ja": "沈黙のみ",
      "ko": "침묵만이",
      "ru": "Остаётся лишь тишина",
      "vi": "Sự Trầm Mặc Duy Nhất",
      "id": "Only Silence Remains",
      "es": "Solo queda silencio",
      "fr": "Seul le silence subsiste",
      "de": "Nur die Stille bleibt",
      "pt": "Apenas o Silêncio Sobrou"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21004": {
    "names": {
      "th": "Memories of the Past",
      "en": "Memories of the Past",
      "zh-CN": "记忆中的模样",
      "zh-TW": "記憶中的模樣",
      "ja": "記憶の中の姿",
      "ko": "기억 속 모습",
      "ru": "Воспоминания о прошлом",
      "vi": "Dáng Hình Trong Ký Ức",
      "id": "Memories of the Past",
      "es": "Imagen en el recuerdo",
      "fr": "Souvenirs du passé",
      "de": "Erinnerungen an die Vergangenheit",
      "pt": "Memórias do Passado"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21005": {
    "names": {
      "th": "The Moles Welcome You",
      "en": "The Moles Welcome You",
      "zh-CN": "鼹鼠党欢迎你",
      "zh-TW": "鼴鼠黨歡迎你",
      "ja": "モグラ党へようこそ",
      "ko": "두더지파가 환영해",
      "ru": "Кроты приветствуют тебя",
      "vi": "Băng Chuột Chũi Hoan Nghênh",
      "id": "The Moles Welcome You",
      "es": "Los Topos te dan la bienvenida",
      "fr": "Bienvenue chez les Taupes",
      "de": "Die Maulwürfe heißen dich willkommen",
      "pt": "As Toupeiras Te Dão Boas-vindas"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21006": {
    "names": {
      "th": "The Birth of the Self",
      "en": "The Birth of the Self",
      "zh-CN": "「我」的诞生",
      "zh-TW": "「我」的誕生",
      "ja": "「私」の誕生",
      "ko": "「나」의 탄생",
      "ru": "Зарождение себя",
      "vi": "Sự Ra Đời Của \"Tôi\"",
      "id": "The Birth of the Self",
      "es": "El nacimiento del yo",
      "fr": "La naissance du moi",
      "de": "Die Geburt des Selbst",
      "pt": "Meu Próprio Nascimento"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21007": {
    "names": {
      "th": "Shared Feeling",
      "en": "Shared Feeling",
      "zh-CN": "同一种心情",
      "zh-TW": "同一種心情",
      "ja": "同じ気持ち",
      "ko": "같은 심정",
      "ru": "Общие чувства",
      "vi": "Cùng Một Tâm Trạng",
      "id": "Shared Feeling",
      "es": "Sentimiento compartido",
      "fr": "Sentiment partagé",
      "de": "Gefühl der Gemeinsamkeit",
      "pt": "Sentimento Compartilhado"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21008": {
    "names": {
      "th": "Eyes of the Prey",
      "en": "Eyes of the Prey",
      "zh-CN": "猎物的视线",
      "zh-TW": "獵物的視線",
      "ja": "獲物の視線",
      "ko": "사냥감의 시선",
      "ru": "Взгляд жертвы",
      "vi": "Tầm Mắt Của Con Mồi",
      "id": "Eyes of the Prey",
      "es": "Visión de presa",
      "fr": "Les yeux de la proie",
      "de": "Die Augen der Beute",
      "pt": "Olhos da Presa"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21009": {
    "names": {
      "th": "Landau's Choice",
      "en": "Landau's Choice",
      "zh-CN": "朗道的选择",
      "zh-TW": "朗道的選擇",
      "ja": "ランドゥーの選択",
      "ko": "랜도의 선택",
      "ru": "Выбор Ландау",
      "vi": "Sự Lựa Chọn Của Landau",
      "id": "Landau's Choice",
      "es": "La elección de Landau",
      "fr": "Le choix de Landau",
      "de": "Landaus Wahl",
      "pt": "A Escolha dos Landau"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21010": {
    "names": {
      "th": "Swordplay",
      "en": "Swordplay",
      "zh-CN": "论剑",
      "zh-TW": "論劍",
      "ja": "論剣",
      "ko": "논검",
      "ru": "Фехтование",
      "vi": "Luận Kiếm",
      "id": "Swordplay",
      "es": "Juego de espadas",
      "fr": "Jeu d'épée",
      "de": "Schwertkampf",
      "pt": "Jogo de Espadas"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21011": {
    "names": {
      "th": "Planetary Rendezvous",
      "en": "Planetary Rendezvous",
      "zh-CN": "与行星相会",
      "zh-TW": "與行星相會",
      "ja": "惑星との出会い",
      "ko": "행성과의 만남",
      "ru": "Свидание со звёздами",
      "vi": "Điểm Hẹn Hành Tinh",
      "id": "Planetary Rendezvous",
      "es": "Encuentro planetario",
      "fr": "Rendez-vous avec les planètes",
      "de": "Planetarisches Rendezvous",
      "pt": "Encontro Planetário"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21012": {
    "names": {
      "th": "A Secret Vow",
      "en": "A Secret Vow",
      "zh-CN": "秘密誓心",
      "zh-TW": "秘密誓心",
      "ja": "秘密の誓い",
      "ko": "비밀 맹세",
      "ru": "Тайная клятва",
      "vi": "Lời Thề Bí Mật",
      "id": "A Secret Vow",
      "es": "Juramento secreto",
      "fr": "Vœu secret",
      "de": "Ein geheimes Gelübde",
      "pt": "Um Voto Secreto"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21013": {
    "names": {
      "th": "Make the World Clamor",
      "en": "Make the World Clamor",
      "zh-CN": "别让世界静下来",
      "zh-TW": "別讓世界靜下來",
      "ja": "この世界に喧噪を",
      "ko": "세상을 진정시키지 마",
      "ru": "Пусть мир не стихает",
      "vi": "Đừng Để Thế Giới Lạnh Lẽo",
      "id": "Make the World Clamor",
      "es": "Que el mundo clame",
      "fr": "Clameur du monde",
      "de": "Die Welt in Aufruhr versetzen",
      "pt": "Faça o Mundo Clamar"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21014": {
    "names": {
      "th": "Perfect Timing",
      "en": "Perfect Timing",
      "zh-CN": "此时恰好",
      "zh-TW": "此時恰好",
      "ja": "今が丁度",
      "ko": "알맞은 타이밍",
      "ru": "Идеальное время",
      "vi": "Vừa Đúng Lúc",
      "id": "Perfect Timing",
      "es": "El momento oportuno",
      "fr": "Timing parfait",
      "de": "Perfektes Timing",
      "pt": "Momento Perfeito"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21015": {
    "names": {
      "th": "Resolution Shines As Pearls of Sweat",
      "en": "Resolution Shines As Pearls of Sweat",
      "zh-CN": "决心如汗珠般闪耀",
      "zh-TW": "決心如汗珠般閃耀",
      "ja": "決意は汗のように輝く",
      "ko": "땀방울처럼 빛나는 결심",
      "ru": "Решимость блестит подобно жемчужинам пота",
      "vi": "Sự Quyết Tâm Như Giọt Mồ Hôi Lấp Lánh",
      "id": "Resolution Shines As Pearls of Sweat",
      "es": "Determinación reluciente",
      "fr": "Résolution brillante",
      "de": "Die Entschlusskraft glitzert als Schweißperlen",
      "pt": "A Determinação Brilha Como Gotas de Suor"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21016": {
    "names": {
      "th": "Trend of the Universal Market",
      "en": "Trend of the Universal Market",
      "zh-CN": "宇宙市场趋势",
      "zh-TW": "宇宙市場趨勢",
      "ja": "星間市場のトレンド",
      "ko": "우주 시장 동향",
      "ru": "Тренд галактического рынка",
      "vi": "Xu Hướng Thị Trường Vũ Trụ",
      "id": "Trend of the Universal Market",
      "es": "Tendencias del mercado universal",
      "fr": "Tendance du marché cosmique",
      "de": "Trend des universellen Markts",
      "pt": "Tendência do Mercado Universal"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21017": {
    "names": {
      "th": "Subscribe for More!",
      "en": "Subscribe for More!",
      "zh-CN": "点个关注吧！",
      "zh-TW": "按個追蹤吧！",
      "ja": "フォローして！",
      "ko": "팔로우를 부탁해!",
      "ru": "Больше подписок!",
      "vi": "Hãy Theo Dõi Nào!",
      "id": "Subscribe for More!",
      "es": "¡Suscríbanse a mi canal!",
      "fr": "Abonnez-vous !",
      "de": "Abonniere für mehr!",
      "pt": "Inscreva-se Para Mais!"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21018": {
    "names": {
      "th": "Dance! Dance! Dance!",
      "en": "Dance! Dance! Dance!",
      "zh-CN": "舞！舞！舞！",
      "zh-TW": "舞！舞！舞！",
      "ja": "ダンス！ダンス！ダンス！",
      "ko": "댄스! 댄스! 댄스!",
      "ru": "Танцуй! Танцуй! Танцуй!",
      "vi": "Múa! Múa! Múa!",
      "id": "Dance! Dance! Dance!",
      "es": "¡A bailar!",
      "fr": "Ça n'arrête pas de danser !",
      "de": "Tanz! Tanz! Tanz!",
      "pt": "Dance! Dance! Dance!"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21019": {
    "names": {
      "th": "Under the Blue Sky",
      "en": "Under the Blue Sky",
      "zh-CN": "在蓝天下",
      "zh-TW": "在藍天下",
      "ja": "青空の下で",
      "ko": "푸른 하늘 아래",
      "ru": "Под голубым небом",
      "vi": "Dưới Bầu Trời Xanh",
      "id": "Under the Blue Sky",
      "es": "Bajo el cielo azul",
      "fr": "Sous le ciel bleu",
      "de": "Unter dem blauen Himmel",
      "pt": "Sob o Céu Azul"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21020": {
    "names": {
      "th": "Geniuses' Repose",
      "en": "Geniuses' Repose",
      "zh-CN": "天才们的休憩",
      "zh-TW": "天才們的休憩",
      "ja": "天才たちの休息",
      "ko": "천재들의 휴식",
      "ru": "Отдых гениев",
      "vi": "Sự Nghỉ Ngơi Của Thiên Tài",
      "id": "Geniuses' Repose",
      "es": "El reposo de los genios",
      "fr": "Repos des génies",
      "de": "Die Rast der Genies",
      "pt": "Repouso dos Gênios"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21021": {
    "names": {
      "th": "Quid Pro Quo",
      "en": "Quid Pro Quo",
      "zh-CN": "等价交换",
      "zh-TW": "等價交換",
      "ja": "等価交換",
      "ko": "등가교환",
      "ru": "Равноценный обмен",
      "vi": "Đổi Ngang Giá",
      "id": "Quid Pro Quo",
      "es": "Intercambio equivalente",
      "fr": "Échange de bons procédés",
      "de": "Quid pro quo",
      "pt": "Quid Pro Quo"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21022": {
    "names": {
      "th": "Fermata",
      "en": "Fermata",
      "zh-CN": "延长记号",
      "zh-TW": "延長記號",
      "ja": "フェルマータ",
      "ko": "페르마타",
      "ru": "Фермата",
      "vi": "Ký Hiệu Kéo Dài",
      "id": "Fermata",
      "es": "Calderón",
      "fr": "Point d'orgue",
      "de": "Fermate",
      "pt": "Fermata"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21023": {
    "names": {
      "th": "We Are Wildfire",
      "en": "We Are Wildfire",
      "zh-CN": "我们是地火",
      "zh-TW": "我們是地火",
      "ja": "我ら地炎",
      "ko": "우리는 와일드 파이어",
      "ru": "Мы - Дикий Огонь",
      "vi": "Chúng Ta Là Lửa Ngầm",
      "id": "We Are Wildfire",
      "es": "Somos Llamarada",
      "fr": "On est les Feux sauvages",
      "de": "Wir sind Wildfeuer",
      "pt": "Somos Fogo Vivo"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21024": {
    "names": {
      "th": "River Flows in Spring",
      "en": "River Flows in Spring",
      "zh-CN": "春水初生",
      "zh-TW": "春水初生",
      "ja": "春水に初生する",
      "ko": "움트는 봄물",
      "ru": "Весенние потоки рек",
      "vi": "Làn Nước Xuân Xuất Hiện",
      "id": "River Flows in Spring",
      "es": "El río nace en primavera",
      "fr": "Une rivière au printemps",
      "de": "Flüsse plätschern im Frühling",
      "pt": "O Rio Corre na Primavera"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21025": {
    "names": {
      "th": "Past and Future",
      "en": "Past and Future",
      "zh-CN": "过往未来",
      "zh-TW": "過往未來",
      "ja": "過去と未来",
      "ko": "과거와 미래",
      "ru": "Прошлое и будущее",
      "vi": "Quá Khứ Tương Lai",
      "id": "Past and Future",
      "es": "El pasado y el futuro",
      "fr": "Passé et futur",
      "de": "Vergangenheit und Zukunft",
      "pt": "Passado e Futuro"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21026": {
    "names": {
      "th": "Woof! Walk Time!",
      "en": "Woof! Walk Time!",
      "zh-CN": "汪！散步时间！",
      "zh-TW": "汪！散步時間！",
      "ja": "ワン！散歩の時間！",
      "ko": "멍! 산책 시간!",
      "ru": "Гав! Время прогулок!",
      "vi": "Gâu! Thời Gian Tản Bộ",
      "id": "Woof! Walk Time!",
      "es": "¡Guau! ¡Hora de pasear!",
      "fr": "Ouaf ! C'est l'heure de la promenade !",
      "de": "Wuff! Zeit zum Laufen!",
      "pt": "Au! Hora de Passear!"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21027": {
    "names": {
      "th": "The Seriousness of Breakfast",
      "en": "The Seriousness of Breakfast",
      "zh-CN": "早餐的仪式感",
      "zh-TW": "早餐的儀式感",
      "ja": "朝食の儀式感",
      "ko": "느낌 있는 아침 식사 루틴",
      "ru": "Важность завтрака",
      "vi": "Bữa Sáng Đúng Điệu",
      "id": "The Seriousness of Breakfast",
      "es": "La solemnidad del desayuno",
      "fr": "Le petit-déjeuner, c'est sacré",
      "de": "Die Ernsthaftigkeit des Frühstücks",
      "pt": "A Solenidade do Café da Manhã"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21028": {
    "names": {
      "th": "Warmth Shortens Cold Nights",
      "en": "Warmth Shortens Cold Nights",
      "zh-CN": "暖夜不会漫长",
      "zh-TW": "暖夜不會漫長",
      "ja": "暖かい夜は長くない",
      "ko": "따듯한 밤은 길지 않고",
      "ru": "Холодные ночи короче, когда ты рядом",
      "vi": "Đêm Ấm Sẽ Chóng Qua",
      "id": "Warmth Shortens Cold Nights",
      "es": "Las noches cálidas no duran",
      "fr": "Chaleur au cœur de la nuit froide",
      "de": "Warme Nächte dauern nicht lange",
      "pt": "O Calor Encurta as Noites Geladas"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21029": {
    "names": {
      "th": "We Will Meet Again",
      "en": "We Will Meet Again",
      "zh-CN": "后会有期",
      "zh-TW": "後會有期",
      "ja": "またお会いしましょう",
      "ko": "훗날 기약",
      "ru": "Мы ещё встретимся",
      "vi": "Hẹn Gặp Lại",
      "id": "We Will Meet Again",
      "es": "Volveremos a encontrarnos",
      "fr": "Ce n'est que partie remise",
      "de": "Wir werden uns wiedersehen",
      "pt": "Ainda nos Veremos de Novo"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21030": {
    "names": {
      "th": "This Is Me!",
      "en": "This Is Me!",
      "zh-CN": "这就是我啦！",
      "zh-TW": "這就是我啦！",
      "ja": "これがウチだよ！",
      "ko": "이게 바로 나야!",
      "ru": "Это я!",
      "vi": "Đó Chính Là Tôi!",
      "id": "This Is Me!",
      "es": "¡Así soy yo!",
      "fr": "C'est moi !",
      "de": "Das bin ich!",
      "pt": "Essa Sou Eu!"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21031": {
    "names": {
      "th": "Return to Darkness",
      "en": "Return to Darkness",
      "zh-CN": "重返幽冥",
      "zh-TW": "重返幽冥",
      "ja": "幽冥に帰す",
      "ko": "또다시 저승으로",
      "ru": "Назад во тьму",
      "vi": "U Tối Trở Lại",
      "id": "Return to Darkness",
      "es": "Regreso a la oscuridad",
      "fr": "Retour aux ténèbres",
      "de": "Rückkehr in die Dunkelheit",
      "pt": "Retorno à Escuridão"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21032": {
    "names": {
      "th": "Carve the Moon, Weave the Clouds",
      "en": "Carve the Moon, Weave the Clouds",
      "zh-CN": "镂月裁云之意",
      "zh-TW": "鏤月裁雲之意",
      "ja": "彫月裁雲の意",
      "ko": "누월재운의 뜻",
      "ru": "Вырезать луну и кроить облака",
      "vi": "Khắc Lên Ánh Trăng",
      "id": "Carve the Moon, Weave the Clouds",
      "es": "Esculpir la luna y tejer las nubes",
      "fr": "Nuages taillés dans la lune",
      "de": "Den Mond schnitzen, die Wolken weben",
      "pt": "Esculpindo a Lua, Tecendo as Nuvens"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21033": {
    "names": {
      "th": "Nowhere to Run",
      "en": "Nowhere to Run",
      "zh-CN": "无处可逃",
      "zh-TW": "無處可逃",
      "ja": "逃げ場なし",
      "ko": "도망칠 곳은 없다",
      "ru": "Бежать некуда",
      "vi": "Không Nơi Ẩn Náu",
      "id": "Nowhere to Run",
      "es": "Sin escapatoria",
      "fr": "Sans échappatoire",
      "de": "Nirgends zu fliehen",
      "pt": "Sem Escapatória"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21034": {
    "names": {
      "th": "Today Is Another Peaceful Day",
      "en": "Today Is Another Peaceful Day",
      "zh-CN": "今日亦是和平的一日",
      "zh-TW": "今日亦是和平的一日",
      "ja": "今日も平和な一日",
      "ko": "오늘도 평화로운 하루",
      "ru": "Сегодня тоже мирный день",
      "vi": "Hôm Nay Là Ngày Yên Lành",
      "id": "Today Is Another Peaceful Day",
      "es": "Hoy es otro día tranquilo",
      "fr": "Encore une belle journée qui s'annonce",
      "de": "Heute ist wieder ein friedlicher Tag",
      "pt": "Hoje é Mais um Dia de Paz"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21035": {
    "names": {
      "th": "What Is Real?",
      "en": "What Is Real?",
      "zh-CN": "何物为真",
      "zh-TW": "何物為真",
      "ja": "何が真か",
      "ko": "무엇이 진실인가",
      "ru": "Что есть реальность?",
      "vi": "Đâu Là Thật?",
      "id": "What Is Real?",
      "es": "Cuestión de verdad",
      "fr": "Réalité et faux-semblants",
      "de": "Sache der Wahrheit",
      "pt": "O Que É Real?"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21036": {
    "names": {
      "th": "Dreamville Adventure",
      "en": "Dreamville Adventure",
      "zh-CN": "美梦小镇大冒险",
      "zh-TW": "美夢小鎮大冒險",
      "ja": "ドリームタウンの大冒険",
      "ko": "좋은꿈 마을 대모험",
      "ru": "Приключения Грёзавиля",
      "vi": "Chuyến Thám Hiểm Thị Trấn Mộng Đẹp",
      "id": "Dreamville Adventure",
      "es": "Aventuras en Villa Ensueño",
      "fr": "Aventure à Rêvopolis",
      "de": "Abenteuer in Traumstadt",
      "pt": "Aventura de Sonhópolis"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21037": {
    "names": {
      "th": "Final Victor",
      "en": "Final Victor",
      "zh-CN": "最后的赢家",
      "zh-TW": "最後的贏家",
      "ja": "最後の勝者",
      "ko": "최후의 승자",
      "ru": "Единственный победитель",
      "vi": "Người Chiến Thắng Cuối Cùng",
      "id": "Final Victor",
      "es": "Ganador final",
      "fr": "Pari gagnant",
      "de": "Endgültiger Sieger",
      "pt": "O Último Vencedor"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21038": {
    "names": {
      "th": "Flames Afar",
      "en": "Flames Afar",
      "zh-CN": "在火的远处",
      "zh-TW": "在火的遠處",
      "ja": "烈火の彼方",
      "ko": "불의 먼 곳에서",
      "ru": "Вдали от огня",
      "vi": "Ở Nơi Xa Ngọn Lửa",
      "id": "Flames Afar",
      "es": "Lejos del fuego",
      "fr": "Flammes lointaines",
      "de": "Feuer in der Ferne",
      "pt": "Chamas Distantes"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21039": {
    "names": {
      "th": "Destiny's Threads Forewoven",
      "en": "Destiny's Threads Forewoven",
      "zh-CN": "织造命运之线",
      "zh-TW": "織造命運之線",
      "ja": "運命を紡ぐ糸",
      "ko": "운명의 실을 엮다",
      "ru": "Плетение нитей судьбы",
      "vi": "Dây Thêu Dệt Vận Mệnh",
      "id": "Destiny's Threads Forewoven",
      "es": "Los hilos del destino",
      "fr": "Fils du destin",
      "de": "Schicksalsfaden",
      "pt": "Fios Forjados do Destino"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21040": {
    "names": {
      "th": "The Day The Cosmos Fell",
      "en": "The Day The Cosmos Fell",
      "zh-CN": "银河沦陷日",
      "zh-TW": "銀河淪陷日",
      "ja": "銀河が陥落した日",
      "ko": "은하 함락의 날",
      "ru": "День падения вселенной",
      "vi": "Ngày Ngân Hà Sụp Đổ",
      "id": "The Day The Cosmos Fell",
      "es": "Día del colapso cósmico",
      "fr": "Le jour de l'effondrement du cosmos",
      "de": "Tag des kosmischen Kollapses",
      "pt": "O Dia em que o Cosmos Caiu"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21041": {
    "names": {
      "th": "It's Showtime",
      "en": "It's Showtime",
      "zh-CN": "好戏开演",
      "zh-TW": "好戲開演",
      "ja": "ショーの始まり",
      "ko": "쇼타임",
      "ru": "Шоу начинается",
      "vi": "Vai Diễn Bắt Đầu",
      "id": "It's Showtime",
      "es": "Arriba el telón",
      "fr": "Que le spectacle commence",
      "de": "Vorhang auf",
      "pt": "É Hora do Show"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21042": {
    "names": {
      "th": "Indelible Promise",
      "en": "Indelible Promise",
      "zh-CN": "铭记于心的约定",
      "zh-TW": "銘記於心的約定",
      "ja": "心に刻まれた約束",
      "ko": "마음에 새긴 약속",
      "ru": "Хранящееся в сердце обещание",
      "vi": "Ước Hẹn Khắc Ghi",
      "id": "Indelible Promise",
      "es": "Promesa grabada",
      "fr": "Promesse indélébile",
      "de": "Verewigtes Versprechen",
      "pt": "Promessa Indelével"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21043": {
    "names": {
      "th": "Concert for Two",
      "en": "Concert for Two",
      "zh-CN": "两个人的演唱会",
      "zh-TW": "兩個人的演唱會",
      "ja": "二人だけのコンサート",
      "ko": "두 사람의 콘서트",
      "ru": "Концерт для двоих",
      "vi": "Buổi Hòa Nhạc Hai Người",
      "id": "Concert for Two",
      "es": "Concierto para dos",
      "fr": "Concert pour deux",
      "de": "Konzert für zwei",
      "pt": "Concerto para Dois"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21044": {
    "names": {
      "th": "Boundless Choreo",
      "en": "Boundless Choreo",
      "zh-CN": "无边曼舞",
      "zh-TW": "無邊曼舞",
      "ja": "終わりなき舞踏",
      "ko": "끝없는 춤",
      "ru": "Безграничный танец",
      "vi": "Vũ Điệu Vô Biên",
      "id": "Boundless Choreo",
      "es": "Tango ilimitado",
      "fr": "Danse endiablée",
      "de": "Grenzenloser Tanz",
      "pt": "Dança Ilimitada"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21045": {
    "names": {
      "th": "After the Charmony Fall",
      "en": "After the Charmony Fall",
      "zh-CN": "谐乐静默之后",
      "zh-TW": "諧樂靜默之後",
      "ja": "調和が沈黙した後",
      "ko": "조화가 침묵한 후",
      "ru": "После затишья Гармонии",
      "vi": "Sau Sự Im Lặng Hài Hòa",
      "id": "After the Charmony Fall",
      "es": "Tras el silencio de La Armonía",
      "fr": "Après la chute",
      "de": "Nach dem Fall der Harmonie",
      "pt": "Depois que a Harmonia se Dissipa"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21046": {
    "names": {
      "th": "Poised to Bloom",
      "en": "Poised to Bloom",
      "zh-CN": "芳华待灼",
      "zh-TW": "芳華待灼",
      "ja": "美しき華よ今咲かん",
      "ko": "피어나길 기다리는 꽃",
      "ru": "Расцвет юности",
      "vi": "Tuổi Hoa Chờ Nở Rộ",
      "id": "Poised to Bloom",
      "es": "Juventud por florecer",
      "fr": "Portrait de la jeune fille en fleurs",
      "de": "Jugend in Erwartung der Entflammung",
      "pt": "Prestes a Florescer"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21047": {
    "names": {
      "th": "Shadowed by Night",
      "en": "Shadowed by Night",
      "zh-CN": "黑夜如影随行",
      "zh-TW": "黑夜如影隨行",
      "ja": "夜は影のように付き纏う",
      "ko": "그림자처럼 뒤따르는 밤",
      "ru": "Скрытый в ночной тени",
      "vi": "Bóng Tối Đồng Hành",
      "id": "Shadowed by Night",
      "es": "La sombra de la noche",
      "fr": "Nuit des ombres",
      "de": "Die Nacht der langen Schatten",
      "pt": "Sombreado pela Noite"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21048": {
    "names": {
      "th": "Dream's Montage",
      "en": "Dream's Montage",
      "zh-CN": "梦的蒙太奇",
      "zh-TW": "夢的蒙太奇",
      "ja": "夢のモンタージュ",
      "ko": "꿈의 몽타주",
      "ru": "Монтаж грёз",
      "vi": "Dựng Phim Trong Mơ",
      "id": "Dream's Montage",
      "es": "Montaje de sueños",
      "fr": "Montage du rêve",
      "de": "Traummontage",
      "pt": "Montagem do Sonho"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21050": {
    "names": {
      "th": "Victory In a Blink",
      "en": "Victory In a Blink",
      "zh-CN": "胜利只在朝夕间",
      "zh-TW": "勝利只在朝夕間",
      "ja": "瞬刻の勝機",
      "ko": "찰나에 결정되는 승리",
      "ru": "Скорая победа",
      "vi": "Chiến Thắng Trong Chớp Mắt",
      "id": "Victory In a Blink",
      "es": "Victoria disputada",
      "fr": "Victoire éclair",
      "de": "Sieg im Handumdrehen",
      "pt": "Vitória em Um Piscar de Olhos"
    },
    "rarity": 4,
    "path": "Remembrance"
  },
  "21051": {
    "names": {
      "th": "Geniuses' Greetings",
      "en": "Geniuses' Greetings",
      "zh-CN": "天才们的问候",
      "zh-TW": "天才們的問候",
      "ja": "天才たちの「挨拶」",
      "ko": "천재들의 안부 인사",
      "ru": "Привет от гениев",
      "vi": "Lời Chào Hỏi Của Thiên Tài",
      "id": "Geniuses' Greetings",
      "es": "Saludo entre genios",
      "fr": "Salutation des génies",
      "de": "Der Gruß der Genies",
      "pt": "Saudações dos Gênios"
    },
    "rarity": 4,
    "path": "Remembrance"
  },
  "21052": {
    "names": {
      "th": "Sweat Now, Cry Less",
      "en": "Sweat Now, Cry Less",
      "zh-CN": "多流汗，少流泪",
      "zh-TW": "多流汗，少流淚",
      "ja": "流すなら涙より汗",
      "ko": "땀은 많이, 눈물은 적게",
      "ru": "Больше пота, меньше слёз",
      "vi": "Đổ Mồ Hôi Nhiều, Rơi Nước Mắt Ít",
      "id": "Sweat Now, Cry Less",
      "es": "Más sudor y menos lágrimas",
      "fr": "Transpire, tu pleureras moins",
      "de": "Mehr Schwitzen, weniger Weinen",
      "pt": "Suar Para Não Chorar"
    },
    "rarity": 4,
    "path": "Remembrance"
  },
  "21053": {
    "names": {
      "th": "Journey, Forever Peaceful",
      "en": "Journey, Forever Peaceful",
      "zh-CN": "愿旅途永远坦然",
      "zh-TW": "願旅途永遠坦然",
      "ja": "旅が平穏であるように",
      "ko": "언제나 여정이 평탄하기를",
      "ru": "Пусть твой путь всегда будет мирным",
      "vi": "Mong Hành Trình Mãi Mãi Bình An",
      "id": "Journey, Forever Peaceful",
      "es": "Que tu viaje sea siempre pacífico",
      "fr": "Une route à jamais paisible",
      "de": "Mögen Reisen für immer friedlich sein",
      "pt": "Jornada, Eternamente Pacífica"
    },
    "rarity": 4,
    "path": "Preservation"
  },
  "21054": {
    "names": {
      "th": "The Story's Next Page",
      "en": "The Story's Next Page",
      "zh-CN": "故事的下一页",
      "zh-TW": "故事的下一頁",
      "ja": "物語をめくって",
      "ko": "이야기의 다음 페이지",
      "ru": "Следующая страница истории",
      "vi": "Trang Tiếp Theo Của Câu Chuyện",
      "id": "The Story's Next Page",
      "es": "La siguiente página de la historia",
      "fr": "Le prochain chapitre",
      "de": "Die nächste Seite der Geschichte",
      "pt": "A Próxima Página da História"
    },
    "rarity": 4,
    "path": "Remembrance"
  },
  "21055": {
    "names": {
      "th": "Unto Tomorrow's Morrow",
      "en": "Unto Tomorrow's Morrow",
      "zh-CN": "直到明天的明天",
      "zh-TW": "直到明天的明天",
      "ja": "明日の明日まで",
      "ko": "내일의 내일이 올 때까지",
      "ru": "Пока не наступит послезавтра",
      "vi": "Cho Đến Ngày Mai Của Ngày Mai",
      "id": "Unto Tomorrow's Morrow",
      "es": "Hasta pasado mañana",
      "fr": "Jusqu'au lendemain",
      "de": "Bis zum Übermorgen",
      "pt": "Até o Amanhã do Amanhã"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "21056": {
    "names": {
      "th": "In Pursuit of the Wind",
      "en": "In Pursuit of the Wind",
      "zh-CN": "追逐风的时候",
      "zh-TW": "追逐風的時候",
      "ja": "風を追う時",
      "ko": "바람을 쫓을 때",
      "ru": "Гоняясь за ветром",
      "vi": "Khi Đuổi Theo Gió",
      "id": "In Pursuit of the Wind",
      "es": "Al perseguir el viento",
      "fr": "Poursuite du vent",
      "de": "Bei der Jagd nach dem Wind",
      "pt": "Em Busca do Vento"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "21057": {
    "names": {
      "th": "The Flower Remembers",
      "en": "The Flower Remembers",
      "zh-CN": "花儿不会忘记",
      "zh-TW": "花兒不會忘記",
      "ja": "花は忘れない",
      "ko": "꽃은 잊지 않는다",
      "ru": "Цветы не забывают",
      "vi": "Hoa Sẽ Không Quên",
      "id": "The Flower Remembers",
      "es": "Las flores nunca olvidan",
      "fr": "Les fleurs n'oublient pas",
      "de": "Die Blumen werden nicht vergessen",
      "pt": "A Flor se Recorda"
    },
    "rarity": 4,
    "path": "Remembrance"
  },
  "21058": {
    "names": {
      "th": "A Trail of Bygone Blood",
      "en": "A Trail of Bygone Blood",
      "zh-CN": "一行往日的血",
      "zh-TW": "一行往日的血",
      "ja": "古より受け継がれる血",
      "ko": "과거의 핏자국",
      "ru": "Кровь прошлого",
      "vi": "Vệt Máu Ngày Cũ",
      "id": "A Trail of Bygone Blood",
      "es": "Sangre del pasado",
      "fr": "Trace de sang du passé",
      "de": "Blutzeichen aus der Vergangenheit",
      "pt": "Um Rastro de Sangue do Passado"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "21060": {
    "names": {
      "th": "A Dream Scented in Wheat",
      "en": "A Dream Scented in Wheat",
      "zh-CN": "氤氲麦香的梦",
      "zh-TW": "氤氳麥香的夢",
      "ja": "麦の香り漂う夢",
      "ko": "밀 내음이 가득한 꿈",
      "ru": "Пшеничные мечты",
      "vi": "Giấc Mơ Vấn Vương Hương Lúa",
      "id": "A Dream Scented in Wheat",
      "es": "Sueños de trigo fragante",
      "fr": "Rêve au parfum de blé",
      "de": "Träume von duftendem Weizen",
      "pt": "Um Sonho Perfumado de Trigo"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "21061": {
    "names": {
      "th": "Holiday Thermae Escapade",
      "en": "Holiday Thermae Escapade",
      "zh-CN": "假日浴场大冒险",
      "zh-TW": "假日浴場大冒險",
      "ja": "休日のバルネア大冒険",
      "ko": "휴일의 목욕탕 대모험",
      "ru": "Приключения в купальне",
      "vi": "Kỳ Nghỉ Phiêu Lưu Nhà Tắm Hơi",
      "id": "Holiday Thermae Escapade",
      "es": "Vacaciones en las termas",
      "fr": "Virée festive aux thermes",
      "de": "Abenteuer der Urlaubsbäder",
      "pt": "Fuga Termal de Férias"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "21062": {
    "names": {
      "th": "See You at the End",
      "en": "See You at the End",
      "zh-CN": "于那终点再见",
      "zh-TW": "於那終點再見",
      "ja": "終点でまた会おう",
      "ko": "그 종착지에서 다시 만나자",
      "ru": "Встреча в конце пути",
      "vi": "Gặp Lại Ở Điểm Cuối Cùng",
      "id": "See You at the End",
      "es": "Nos vemos al final",
      "fr": "Retrouvons-nous à la fin",
      "de": "Wiedersehen an der Ziellinie",
      "pt": "Te Vejo no Fim"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "21064": {
    "names": {
      "th": "Mushy Shroomy's Adventures",
      "en": "Mushy Shroomy's Adventures",
      "zh-CN": "菇菇嘎嘎历险记",
      "zh-TW": "菇菇嘎嘎歷險記",
      "ja": "タケタケ冒険記",
      "ko": "슈룸 모험기",
      "ru": "Приключения грибочков",
      "vi": "Cuộc Phiêu Lưu Của Nấm Núng Nính",
      "id": "Mushy Shroomy's Adventures",
      "es": "Las aventuras de Champigaga",
      "fr": "L'Odyssée de Champi",
      "de": "Die Abenteuer des pilzigen Pilzes",
      "pt": "As Aventuras do Cogumelinho Fofinho"
    },
    "rarity": 4,
    "path": "Elation"
  },
  "21065": {
    "names": {
      "th": "Today's Good Luck",
      "en": "Today's Good Luck",
      "zh-CN": "今日好手气",
      "zh-TW": "今日好手氣",
      "ja": "今日は好運",
      "ko": "오늘의 행운",
      "ru": "Благоприятный день",
      "vi": "Hôm Nay May Mắn Đấy",
      "id": "Today's Good Luck",
      "es": "La buena suerte de hoy",
      "fr": "Un jour de chance",
      "de": "Glück des Tages",
      "pt": "Boa Sorte de Hoje"
    },
    "rarity": 4,
    "path": "Elation"
  },
  "21066": {
    "names": {
      "th": "A Little Getaway",
      "en": "A Little Getaway",
      "zh-CN": "放个短假",
      "zh-TW": "放個小假",
      "ja": "バカンスのひと時",
      "ko": "짧은 휴가",
      "ru": "Короткий отпуск",
      "vi": "Kỳ Nghỉ Ngắn Ngủi",
      "id": "A Little Getaway",
      "es": "Un breve descanso",
      "fr": "Une pause bien méritée",
      "de": "Kleiner Kurzurlaub",
      "pt": "Um Breve Descanso"
    },
    "rarity": 4,
    "path": "Elation"
  },
  "22000": {
    "names": {
      "th": "Before the Tutorial Mission Starts",
      "en": "Before the Tutorial Mission Starts",
      "zh-CN": "新手任务开始前",
      "zh-TW": "新手任務開始前",
      "ja": "初めてのクエストの前に",
      "ko": "초보자 임무 시작 전",
      "ru": "Перед началом тренировочной миссии",
      "vi": "Trước Khi Bắt Đầu Nhiệm Vụ Tân Thủ",
      "id": "Before the Tutorial Mission Starts",
      "es": "Antes de que comience la misión del tutorial",
      "fr": "Avant que le tutoriel ne commence",
      "de": "Bevor das Tutorial beginnt",
      "pt": "Antes do Início da Missão do Tutorial"
    },
    "rarity": 4,
    "path": "Nihility"
  },
  "22001": {
    "names": {
      "th": "Hey, Over Here",
      "en": "Hey, Over Here",
      "zh-CN": "嘿，我在这儿",
      "zh-TW": "嘿，我在這裡",
      "ja": "よぉ、ここにいるぜ",
      "ko": "저기, 나 여기 있어",
      "ru": "Эй, я здесь",
      "vi": "Hi, Tôi Ở Đây",
      "id": "Hey, Over Here",
      "es": "Ey, estoy aquí",
      "fr": "Hé, par ici !",
      "de": "Hey, ich bin hier",
      "pt": "Ei, Estou Aqui!"
    },
    "rarity": 4,
    "path": "Abundance"
  },
  "22002": {
    "names": {
      "th": "For Tomorrow's Journey",
      "en": "For Tomorrow's Journey",
      "zh-CN": "为了明日的旅途",
      "zh-TW": "為了明日的旅途",
      "ja": "明日のための旅",
      "ko": "내일을 위한 여정",
      "ru": "За завтрашнее путешествие",
      "vi": "Vì Hành Trình Ngày Mai",
      "id": "For Tomorrow's Journey",
      "es": "Para el viaje de mañana",
      "fr": "Au nom du voyage de demain",
      "de": "Für die Reise von morgen",
      "pt": "Pela Jornada do Amanhã"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "22003": {
    "names": {
      "th": "Ninja Record: Sound Hunt",
      "en": "Ninja Record: Sound Hunt",
      "zh-CN": "忍事录•音律狩猎",
      "zh-TW": "忍事錄•音律狩獵",
      "ja": "忍事録・音律狩猟",
      "ko": "인사록•음률 사냥",
      "ru": "Запись ниндзя: Музыкальная охота",
      "vi": "Nhẫn Sự Lục-Săn Bắn Âm Luật",
      "id": "Ninja Record: Sound Hunt",
      "es": "Grabación ninja: Cacería del Sonido",
      "fr": "Registre ninja : Chasse au son",
      "de": "Ninja-Aufzeichnung: Klangjagd",
      "pt": "Registro Ninja: Caça ao Som"
    },
    "rarity": 4,
    "path": "Destruction"
  },
  "22004": {
    "names": {
      "th": "The Great Cosmic Enterprise",
      "en": "The Great Cosmic Enterprise",
      "zh-CN": "宇宙大生意",
      "zh-TW": "宇宙大生意",
      "ja": "宇宙一の大商い！",
      "ko": "우주 대사업",
      "ru": "Бизнес космических масштабов",
      "vi": "Kinh Doanh Tầm Cỡ Vũ Trụ",
      "id": "The Great Cosmic Enterprise",
      "es": "El gran negocio cósmico",
      "fr": "La grande entreprise cosmique",
      "de": "Das große kosmische Geschäft",
      "pt": "O Grande Empreendimento Cósmico"
    },
    "rarity": 4,
    "path": "Erudition"
  },
  "22005": {
    "names": {
      "th": "The Forever Victual",
      "en": "The Forever Victual",
      "zh-CN": "永远的迷境饭",
      "zh-TW": "永遠的迷境飯",
      "ja": "永遠の迷境ごはん",
      "ko": "영원한 미궁의 식사",
      "ru": "Вечный ресторан лабиринта",
      "vi": "Món Ăn Vĩnh Hằng",
      "id": "The Forever Victual",
      "es": "Viandas sin fin",
      "fr": "Un goût d'éternité",
      "de": "Wirrgarten-Restaurant für immer",
      "pt": "O Víveres Eterno"
    },
    "rarity": 4,
    "path": "Harmony"
  },
  "22006": {
    "names": {
      "th": "Fly Into a Pink Tomorrow",
      "en": "Fly Into a Pink Tomorrow",
      "zh-CN": "飞向粉色的明天",
      "zh-TW": "飛向粉紅色的明天",
      "ja": "ピンク色の明日へ",
      "ko": "핑크빛 내일을 향해",
      "ru": "Полёт к розовому завтра",
      "vi": "Bay Đến Ngày Mai Màu Hồng",
      "id": "Fly Into a Pink Tomorrow",
      "es": "Volando hacia un mañana rosado",
      "fr": "Envol vers un lendemain rosé",
      "de": "Flug in einen rosaroten Morgen",
      "pt": "Rumo ao Amanhã Cor-de-Rosa"
    },
    "rarity": 4,
    "path": "Remembrance"
  },
  "22007": {
    "names": {
      "th": "Tomorrow, Together",
      "en": "Tomorrow, Together",
      "zh-CN": "未来，有我们一起",
      "zh-TW": "未來，有我們一起",
      "ja": "みんなで一緒に未来へ",
      "ko": "미래엔 우리가 함께할 거야",
      "ru": "Будущее вместе",
      "vi": "Tương Lai, Có Chúng Ta Cùng Nhau",
      "id": "Tomorrow, Together",
      "es": "Juntos hacia el futuro",
      "fr": "L'avenir nous verra réunis",
      "de": "Gemeinsam in die Zukunft",
      "pt": "Juntos no Futuro"
    },
    "rarity": 4,
    "path": "Elation"
  },
  "22008": {
    "names": {
      "th": "Race to the Horizon",
      "en": "Race to the Horizon",
      "zh-CN": "向着地平线的终点",
      "zh-TW": "向著地平線的終點",
      "ja": "地平線のゴールへ",
      "ko": "지평선의 끝을 향해",
      "ru": "Гонка к горизонту",
      "vi": "Hướng Tới Tận Cùng Đường Chân Trời",
      "id": "Race to the Horizon",
      "es": "Hacia el final del horizonte",
      "fr": "Course vers l'horizon",
      "de": "Wettrennen zum Horizont",
      "pt": "Corrida ao Horizonte"
    },
    "rarity": 4,
    "path": "Hunt"
  },
  "23000": {
    "names": {
      "th": "Night on the Milky Way",
      "en": "Night on the Milky Way",
      "zh-CN": "银河铁道之夜",
      "zh-TW": "銀河鐵道之夜",
      "ja": "銀河鉄道の夜",
      "ko": "은하철도의 밤",
      "ru": "Ночь на Млечном Пути",
      "vi": "Chuyến Tàu Đêm Trên Dải Ngân Hà",
      "id": "Night on the Milky Way",
      "es": "Noche en la Vía Láctea",
      "fr": "Nuit sur la voie lactée",
      "de": "Nacht auf der Milchstraße",
      "pt": "Noite na Via Láctea"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23001": {
    "names": {
      "th": "In the Night",
      "en": "In the Night",
      "zh-CN": "于夜色中",
      "zh-TW": "於夜色中",
      "ja": "夜の帳の中で",
      "ko": "야경 속에서",
      "ru": "В ночи",
      "vi": "Trong Đêm Tối",
      "id": "In the Night",
      "es": "En la noche",
      "fr": "Dans la nuit",
      "de": "In der Nacht",
      "pt": "Na Noite"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23002": {
    "names": {
      "th": "Something Irreplaceable",
      "en": "Something Irreplaceable",
      "zh-CN": "无可取代的东西",
      "zh-TW": "無可取代的東西",
      "ja": "かけがえのないもの",
      "ko": "대체할 수 없는 것",
      "ru": "Что-то незаменимое",
      "vi": "Vật Không Thể Thay Thế",
      "id": "Something Irreplaceable",
      "es": "Algo insustituible",
      "fr": "Quelque chose d'irremplaçable",
      "de": "Etwas Unersetzliches",
      "pt": "Algo Insubstituível"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23003": {
    "names": {
      "th": "But the Battle Isn't Over",
      "en": "But the Battle Isn't Over",
      "zh-CN": "但战斗还未结束",
      "zh-TW": "但戰鬥還未結束",
      "ja": "だが戦争は終わらない",
      "ko": "아직 전투는 끝나지 않았다",
      "ru": "Битва не окончена",
      "vi": "Cuộc Chiến Chưa Nguôi",
      "id": "But the Battle Isn't Over",
      "es": "La batalla no ha terminado",
      "fr": "Le combat n'est pas terminé",
      "de": "Der Kampf ist nicht vorbei",
      "pt": "Mas a Batalha Não Acabou"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23004": {
    "names": {
      "th": "In the Name of the World",
      "en": "In the Name of the World",
      "zh-CN": "以世界之名",
      "zh-TW": "以世界之名",
      "ja": "世界の名を以て",
      "ko": "세계의 이름으로",
      "ru": "Во имя мира",
      "vi": "Nhân Danh Thế Giới",
      "id": "In the Name of the World",
      "es": "En nombre del mundo",
      "fr": "Au nom du monde",
      "de": "Im Namen der Welt",
      "pt": "Em Nome do Mundo"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23005": {
    "names": {
      "th": "Moment of Victory",
      "en": "Moment of Victory",
      "zh-CN": "制胜的瞬间",
      "zh-TW": "制勝的瞬間",
      "ja": "勝利の刹那",
      "ko": "승리의 순간",
      "ru": "Момент победы",
      "vi": "Giây Phút Thắng Lợi",
      "id": "Moment of Victory",
      "es": "El momento de la victoria",
      "fr": "Moment de victoire",
      "de": "Moment des Sieges",
      "pt": "Momento de Vitória"
    },
    "rarity": 5,
    "path": "Preservation"
  },
  "23006": {
    "names": {
      "th": "Patience Is All You Need",
      "en": "Patience Is All You Need",
      "zh-CN": "只需等待",
      "zh-TW": "只需等待",
      "ja": "待つのみ",
      "ko": "필요한 건 기다림뿐",
      "ru": "Просто надо подождать",
      "vi": "Chỉ Cần Chờ Đợi",
      "id": "Patience Is All You Need",
      "es": "Solo hay que esperar",
      "fr": "Juste de la patience",
      "de": "Nur Geduld",
      "pt": "Você Só Precisa de Paciência"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23007": {
    "names": {
      "th": "Incessant Rain",
      "en": "Incessant Rain",
      "zh-CN": "雨一直下",
      "zh-TW": "雨一直下",
      "ja": "降りやまぬ雨",
      "ko": "계속 내리는 비",
      "ru": "Непрекращающийся дождь",
      "vi": "Cơn Mưa Tầm Tã",
      "id": "Incessant Rain",
      "es": "Lluvia incesante",
      "fr": "Pluie incessante",
      "de": "Unaufhörlicher Regen",
      "pt": "Chuva Constante"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23008": {
    "names": {
      "th": "Echoes of the Coffin",
      "en": "Echoes of the Coffin",
      "zh-CN": "棺的回响",
      "zh-TW": "棺的迴響",
      "ja": "棺のこだま",
      "ko": "관의 울림",
      "ru": "Эхо из гроба",
      "vi": "Tiếng Vọng Của Quan Tài",
      "id": "Echoes of the Coffin",
      "es": "Ecos del ataúd",
      "fr": "Échos du cercueil",
      "de": "Echos des Sarges",
      "pt": "Ecos do Caixão"
    },
    "rarity": 5,
    "path": "Abundance"
  },
  "23009": {
    "names": {
      "th": "The Unreachable Side",
      "en": "The Unreachable Side",
      "zh-CN": "到不了的彼岸",
      "zh-TW": "到不了的彼岸",
      "ja": "着かない彼岸",
      "ko": "닿을 수 없는 저편",
      "ru": "Недоступная сторона",
      "vi": "Bến Bờ Xa Diệu Vợi",
      "id": "The Unreachable Side",
      "es": "Orilla inalcanzable",
      "fr": "Traversée impossible",
      "de": "Unerreichbares Jenseits",
      "pt": "O Lado Inacessível"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23010": {
    "names": {
      "th": "Before Dawn",
      "en": "Before Dawn",
      "zh-CN": "拂晓之前",
      "zh-TW": "拂曉之前",
      "ja": "夜明け前",
      "ko": "동트기 전",
      "ru": "До рассвета",
      "vi": "Trước Buổi Bình Minh",
      "id": "Before Dawn",
      "es": "Antes del amanecer",
      "fr": "Avant l'aube",
      "de": "Vor der Dämmerung",
      "pt": "Antes do Amanhecer"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23011": {
    "names": {
      "th": "She Already Shut Her Eyes",
      "en": "She Already Shut Her Eyes",
      "zh-CN": "她已闭上双眼",
      "zh-TW": "她已閉上雙眼",
      "ja": "閉ざした瞳",
      "ko": "그녀는 두 눈을 감았네",
      "ru": "Она закрыла глаза",
      "vi": "Đôi Mắt Đã Nhắm Lại",
      "id": "She Already Shut Her Eyes",
      "es": "Ya ha cerrado los ojos",
      "fr": "Elle a déjà fermé les yeux",
      "de": "Ihre Augen sind bereits geschlossen",
      "pt": "Ela Já Fechou Seus Olhos"
    },
    "rarity": 5,
    "path": "Preservation"
  },
  "23012": {
    "names": {
      "th": "Sleep Like the Dead",
      "en": "Sleep Like the Dead",
      "zh-CN": "如泥酣眠",
      "zh-TW": "如泥酣眠",
      "ja": "泥の如き眠り",
      "ko": "깊게 든 단잠",
      "ru": "Мертвецкий сон",
      "vi": "Giấc Ngủ Say Mềm",
      "id": "Sleep Like the Dead",
      "es": "Dormir como un tronco",
      "fr": "D'un sommeil de mort",
      "de": "Schlafen wie die Toten",
      "pt": "Sono Profundo"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23013": {
    "names": {
      "th": "Time Waits for No One",
      "en": "Time Waits for No One",
      "zh-CN": "时节不居",
      "zh-TW": "時節不居",
      "ja": "時節は居らず",
      "ko": "세월은 흐를 뿐",
      "ru": "Время никого не ждёт",
      "vi": "Thời Gian Không Ngừng Lại",
      "id": "Time Waits for No One",
      "es": "El tiempo no espera",
      "fr": "Le temps n'attend pas",
      "de": "Die Zeit wartet auf niemanden",
      "pt": "O Tempo Não Espera por Ninguém"
    },
    "rarity": 5,
    "path": "Abundance"
  },
  "23014": {
    "names": {
      "th": "I Shall Be My Own Sword",
      "en": "I Shall Be My Own Sword",
      "zh-CN": "此身为剑",
      "zh-TW": "此身為劍",
      "ja": "この身は剣なり",
      "ko": "이 몸이 검이니",
      "ru": "Отныне я сама буду мечом",
      "vi": "Thân Này Là Kiếm",
      "id": "I Shall Be My Own Sword",
      "es": "Yo seré mi propia espada",
      "fr": "Ma propre épée, je serai",
      "de": "Eins mit dem Schwert",
      "pt": "Eu Serei Minha Própria Espada"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23015": {
    "names": {
      "th": "Brighter Than the Sun",
      "en": "Brighter Than the Sun",
      "zh-CN": "比阳光更明亮的",
      "zh-TW": "比陽光更明亮的",
      "ja": "陽光より輝くもの",
      "ko": "태양보다 밝게 빛나는 것",
      "ru": "Ярче солнца",
      "vi": "Rực Rỡ Hơn Mặt Trời",
      "id": "Brighter Than the Sun",
      "es": "Más brillante que el sol",
      "fr": "Plus brillant que le soleil",
      "de": "Heller als die Sonne",
      "pt": "Mais Claro do que o Sol"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23016": {
    "names": {
      "th": "Worrisome, Blissful",
      "en": "Worrisome, Blissful",
      "zh-CN": "烦恼着，幸福着",
      "zh-TW": "煩惱著，幸福著",
      "ja": "悩んで笑って",
      "ko": "고민, 그리고 행복",
      "ru": "Тревога и блаженство",
      "vi": "Phiền Não, Hạnh Phúc",
      "id": "Worrisome, Blissful",
      "es": "Preocupaciones y felicidad",
      "fr": "Inquiétude et soulagement",
      "de": "Besorgt doch glückselig",
      "pt": "Inquietante, Extasiante"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23017": {
    "names": {
      "th": "Night of Fright",
      "en": "Night of Fright",
      "zh-CN": "惊魂夜",
      "zh-TW": "驚魂夜",
      "ja": "驚魂の夜",
      "ko": "섬뜩한 밤",
      "ru": "Ночь страха",
      "vi": "Đêm Kinh Hoàng",
      "id": "Night of Fright",
      "es": "Noche terrorífica",
      "fr": "Nuit de l'épouvante",
      "de": "Nacht der Angst",
      "pt": "Noite Aterrorizante"
    },
    "rarity": 5,
    "path": "Abundance"
  },
  "23018": {
    "names": {
      "th": "An Instant Before A Gaze",
      "en": "An Instant Before A Gaze",
      "zh-CN": "片刻，留在眼底",
      "zh-TW": "片刻，留在眼底",
      "ja": "その一刻、目に焼き付けて",
      "ko": "눈에 담긴 순간",
      "ru": "Остановись, мгновенье",
      "vi": "Khoảnh Khắc Nơi Đáy Mắt",
      "id": "An Instant Before A Gaze",
      "es": "Instante grabado a fuego",
      "fr": "Moment de grâce",
      "de": "Ein unvergesslicher Augenblick",
      "pt": "Um Instante Eternamente Adorado"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23019": {
    "names": {
      "th": "Past Self in Mirror",
      "en": "Past Self in Mirror",
      "zh-CN": "镜中故我",
      "zh-TW": "鏡中故我",
      "ja": "鏡の中の私",
      "ko": "거울 속 지난날의 나",
      "ru": "Отражение прошлой меня",
      "vi": "Tôi Trong Gương Ngày Ấy",
      "id": "Past Self in Mirror",
      "es": "Mi pasado en el espejo",
      "fr": "Reflet du passé",
      "de": "Das Ich im Spiegel",
      "pt": "Meu Passado no Espelho"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23020": {
    "names": {
      "th": "Baptism of Pure Thought",
      "en": "Baptism of Pure Thought",
      "zh-CN": "纯粹思维的洗礼",
      "zh-TW": "純粹思維的洗禮",
      "ja": "純粋なる思惟の洗礼",
      "ko": "순수 사유의 세례",
      "ru": "Крещение чистой мысли",
      "vi": "Lễ Rửa Tội Thuần Khiết",
      "id": "Baptism of Pure Thought",
      "es": "El bautismo del pensamiento puro",
      "fr": "Baptême de pure réflexion",
      "de": "Taufe des reinen Denkens",
      "pt": "O Batismo de Pensamento Puro"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23021": {
    "names": {
      "th": "Earthly Escapade",
      "en": "Earthly Escapade",
      "zh-CN": "游戏尘寰",
      "zh-TW": "遊戲塵寰",
      "ja": "人生は遊び",
      "ko": "속세에서의 유희",
      "ru": "Мирские шалости",
      "vi": "Trò Đùa Trần Thế",
      "id": "Earthly Escapade",
      "es": "Mundo de juegos",
      "fr": "Escapade terrestre",
      "de": "Eskapade auf Erden",
      "pt": "Fuga Terrena"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23022": {
    "names": {
      "th": "Reforged Remembrance",
      "en": "Reforged Remembrance",
      "zh-CN": "重塑时光之忆",
      "zh-TW": "重塑時光之憶",
      "ja": "時間の記憶を再構築して",
      "ko": "시간의 기억에 대한 재구성",
      "ru": "Изменённые воспоминания",
      "vi": "Hun Đúc Ký Ức Thời Gian",
      "id": "Reforged Remembrance",
      "es": "Recuerdos reconstruidos",
      "fr": "Souvenirs refaçonnés",
      "de": "Restaurierte Erinnerung",
      "pt": "Recordação Reforjada"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23023": {
    "names": {
      "th": "Inherently Unjust Destiny",
      "en": "Inherently Unjust Destiny",
      "zh-CN": "命运从未公平",
      "zh-TW": "命運從未公平",
      "ja": "運命は常に不公平",
      "ko": "언제나 불공평한 운명",
      "ru": "Несправедливая судьба",
      "vi": "Vận Mệnh Chưa Từng Công Bằng",
      "id": "Inherently Unjust Destiny",
      "es": "El destino nunca es justo",
      "fr": "Destin injuste",
      "de": "Ungerechtes Schicksal",
      "pt": "Destino Inerentemente Injusto"
    },
    "rarity": 5,
    "path": "Preservation"
  },
  "23024": {
    "names": {
      "th": "Along the Passing Shore",
      "en": "Along the Passing Shore",
      "zh-CN": "行于流逝的岸",
      "zh-TW": "行於流逝的岸",
      "ja": "流れ逝く岸を歩いて",
      "ko": "흘러가는 강가를 따라",
      "ru": "Вдоль уходящего берега",
      "vi": "Bước Theo Bến Bờ Thời Gian",
      "id": "Along the Passing Shore",
      "es": "En las orillas transitorias",
      "fr": "Le long de la rive",
      "de": "Entlang am vorbeiziehenden Ufer",
      "pt": "Ao Longo da Margem Transitória"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23025": {
    "names": {
      "th": "Whereabouts Should Dreams Rest",
      "en": "Whereabouts Should Dreams Rest",
      "zh-CN": "梦应归于何处",
      "zh-TW": "夢應歸於何處",
      "ja": "夢が帰り着く場所",
      "ko": "꿈은 어디로 돌아가야 하는가",
      "ru": "Куда возвращаются сны",
      "vi": "Giấc Mộng Sẽ Đi Về Đâu",
      "id": "Whereabouts Should Dreams Rest",
      "es": "A donde regresan los sueños",
      "fr": "Là où les rêves se reposent",
      "de": "Wohin sollen die Träume gehen",
      "pt": "Onde os Sonhos Deveriam Repousar"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23026": {
    "names": {
      "th": "Flowing Nightglow",
      "en": "Flowing Nightglow",
      "zh-CN": "夜色流光溢彩",
      "zh-TW": "夜色流光溢彩",
      "ja": "光あふれる夜",
      "ko": "찬란하게 빛나는 밤",
      "ru": "Мимолётные ночные огни",
      "vi": "Sắc Đêm Rực Sáng",
      "id": "Flowing Nightglow",
      "es": "Luces de la noche",
      "fr": "Lumières nocturnes",
      "de": "Schillernde Nacht",
      "pt": "Luzes Noturnas"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23027": {
    "names": {
      "th": "Sailing Towards a Second Life",
      "en": "Sailing Towards a Second Life",
      "zh-CN": "驶向第二次生命",
      "zh-TW": "駛向第二次生命",
      "ja": "二度目の生に向かって",
      "ko": "두 번째 생명을 향해",
      "ru": "Отплытие ко второй жизни",
      "vi": "Hướng Đến Sinh Mệnh Thứ Hai",
      "id": "Sailing Towards a Second Life",
      "es": "Hacia una segunda vida",
      "fr": "Le début d'une seconde vie",
      "de": "Auf zu einem zweiten Leben",
      "pt": "Velejando em Direção a uma Segunda Vida"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23028": {
    "names": {
      "th": "Yet Hope Is Priceless",
      "en": "Yet Hope Is Priceless",
      "zh-CN": "偏偏希望无价",
      "zh-TW": "偏偏希望無價",
      "ja": "されど希望の銘は無価",
      "ko": "값을 매길 수 없는 건 희망뿐",
      "ru": "Но надежда бесценна",
      "vi": "Hi Vọng Là Vô Giá",
      "id": "Yet Hope Is Priceless",
      "es": "La esperanza no tiene precio",
      "fr": "L'espoir n'a pas de prix",
      "de": "Doch Hoffnung ist unbezahlbar",
      "pt": "A Esperança é Inestimável"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23029": {
    "names": {
      "th": "Those Many Springs",
      "en": "Those Many Springs",
      "zh-CN": "那无数个春天",
      "zh-TW": "那無數個春天",
      "ja": "幾度目かの春",
      "ko": "그 무수한 봄날",
      "ru": "Бесчисленные весенние дни",
      "vi": "Vô Số Mùa Xuân Ấy",
      "id": "Those Many Springs",
      "es": "Esas incontables primaveras",
      "fr": "Le temps du printemps",
      "de": "Jene unzähligen Frühlinge",
      "pt": "Aquelas Incontáveis Primaveras"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23030": {
    "names": {
      "th": "Dance at Sunset",
      "en": "Dance at Sunset",
      "zh-CN": "落日时起舞",
      "zh-TW": "落日時起舞",
      "ja": "夕日に舞う",
      "ko": "해 질 무렵 시작되는 춤",
      "ru": "Танец на закате",
      "vi": "Điệu Múa Dưới Hoàng Hôn",
      "id": "Dance at Sunset",
      "es": "Danza crepuscular",
      "fr": "Danse au crépuscule",
      "de": "Tanz im Sonnenuntergang",
      "pt": "Dança ao Pôr do Sol"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23031": {
    "names": {
      "th": "I Venture Forth to Hunt",
      "en": "I Venture Forth to Hunt",
      "zh-CN": "我将，巡征追猎",
      "zh-TW": "我將，巡徵追獵",
      "ja": "我が征く巡狩の道",
      "ko": "정복하고 사냥하리",
      "ru": "Я отправляюсь на охоту",
      "vi": "Ta Sẽ, Tuần Tra Săn Bắn",
      "id": "I Venture Forth to Hunt",
      "es": "Me voy de caza",
      "fr": "La chasse est ouverte",
      "de": "Ich wage die Jagd",
      "pt": "Eu Me Aventuro para Caçar"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23032": {
    "names": {
      "th": "Scent Alone Stays True",
      "en": "Scent Alone Stays True",
      "zh-CN": "唯有香如故",
      "zh-TW": "唯有香如故",
      "ja": "昔日の香りは今も猶",
      "ko": "오직 향만이 변함없이",
      "ru": "Останется лишь аромат",
      "vi": "Mùi Hương Vẹn Nguyên",
      "id": "Scent Alone Stays True",
      "es": "Solo la fragancia perdura",
      "fr": "Essence de l'encens",
      "de": "Nur ein Duft bleibt zurück",
      "pt": "Só a Fragrância Permanece"
    },
    "rarity": 5,
    "path": "Abundance"
  },
  "23033": {
    "names": {
      "th": "Ninjutsu Inscription: Dazzling Evilbreaker",
      "en": "Ninjutsu Inscription: Dazzling Evilbreaker",
      "zh-CN": "忍法帖•缭乱破魔",
      "zh-TW": "忍法帖•繚亂破魔",
      "ja": "忍法帖・繚乱破魔",
      "ko": "인법첩•요란 파마",
      "ru": "Свиток ниндзя: Очищение хаосом",
      "vi": "Bí Kíp Nhẫn Pháp-Dazzling Phá Ma",
      "id": "Ninjutsu Inscription: Dazzling Evilbreaker",
      "es": "Pergamino ninja: Azote deslumbrante del mal",
      "fr": "Écritures ninjutsu : Justice éblouissante",
      "de": "Ninja-Kodex: Blendender Schattenbrecher",
      "pt": "Inscrição do Ninjutsu: Destruição Deslumbrante do Mal"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23034": {
    "names": {
      "th": "A Grounded Ascent",
      "en": "A Grounded Ascent",
      "zh-CN": "回到大地的飞行",
      "zh-TW": "回到大地的飛行",
      "ja": "大地より天を目指して",
      "ko": "대지로 돌아온 비행",
      "ru": "Приземлённый полёт",
      "vi": "Chuyến Bay Trở Về Mặt Đất",
      "id": "A Grounded Ascent",
      "es": "De vuelta a la tierra",
      "fr": "Ascension terrestre",
      "de": "Flug zurück zur Erde",
      "pt": "Uma Ascensão Aterrada"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23035": {
    "names": {
      "th": "Long Road Leads Home",
      "en": "Long Road Leads Home",
      "zh-CN": "长路终有归途",
      "zh-TW": "長路終有歸途",
      "ja": "長途はやがて帰途へと続く",
      "ko": "먼 길 끝의 귀로",
      "ru": "Дом в конце долгого пути",
      "vi": "Đường Dài Vẫn Có Lối Về",
      "id": "Long Road Leads Home",
      "es": "El largo camino a casa",
      "fr": "Long est le chemin retour",
      "de": "Rückkehr auf langem Wege",
      "pt": "A Longa Estrada Leva para Casa"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23036": {
    "names": {
      "th": "Time Woven Into Gold",
      "en": "Time Woven Into Gold",
      "zh-CN": "将光阴织成黄金",
      "zh-TW": "將光陰織成黃金",
      "ja": "光陰を織り黄金と成す",
      "ko": "시간을 황금으로 엮어",
      "ru": "Вплетённое в золото время",
      "vi": "Dệt Thời Gian Thành Vàng",
      "id": "Time Woven Into Gold",
      "es": "Tiempo urdido en oro",
      "fr": "Doré est le fil du temps",
      "de": "In Gold gewebte Zeit",
      "pt": "Tempo Tecido em Ouro"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "23037": {
    "names": {
      "th": "Into the Unreachable Veil",
      "en": "Into the Unreachable Veil",
      "zh-CN": "向着不可追问处",
      "zh-TW": "向著不可追問處",
      "ja": "触れてはならぬ領域へ",
      "ko": "추궁할 수 없는 곳을 향해",
      "ru": "Навстречу неоспоримому",
      "vi": "Hướng Về Điều Không Thể Truy Hỏi",
      "id": "Into the Unreachable Veil",
      "es": "Hacia lo inescrutable",
      "fr": "L'impénétrable à portée de main",
      "de": "Auf zu unerklärlichen Orten",
      "pt": "Ao Véu Inalcançável"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23038": {
    "names": {
      "th": "If Time Were a Flower",
      "en": "If Time Were a Flower",
      "zh-CN": "如果时间是一朵花",
      "zh-TW": "如果時間是一朵花",
      "ja": "もしも時が花だったら",
      "ko": "시간이 한 송이 꽃이라면",
      "ru": "Если бы время было цветком",
      "vi": "Nếu Thời Gian Là Một Đóa Hoa",
      "id": "If Time Were a Flower",
      "es": "Si el tiempo fuera una flor",
      "fr": "Si le temps était une fleur",
      "de": "Wenn Zeit eine Blume wäre",
      "pt": "Se o Tempo Fosse Uma Flor"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23039": {
    "names": {
      "th": "Flame of Blood, Blaze My Path",
      "en": "Flame of Blood, Blaze My Path",
      "zh-CN": "血火啊，燃烧前路",
      "zh-TW": "血火啊，燃燒前路",
      "ja": "前途燃やす血の如き炎",
      "ko": "피의 불꽃이여, 앞길을 태워라",
      "ru": "Огонь крови, воспламени мой путь",
      "vi": "Huyết Hỏa, Hãy Thiêu Đốt Con Đường Phía Trước",
      "id": "Flame of Blood, Blaze My Path",
      "es": "Sangre y fuego, abran camino",
      "fr": "Flamme de sang, illumine mon chemin",
      "de": "Flamme des Blutes, entzünde meinen Pfad",
      "pt": "Chamas de Sangue, Incendeiem o Meu Caminho"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23040": {
    "names": {
      "th": "Make Farewells More Beautiful",
      "en": "Make Farewells More Beautiful",
      "zh-CN": "让告别，更美一些",
      "zh-TW": "讓告別，更美一點",
      "ja": "永訣よ美しくあれ",
      "ko": "이별이 더 아름답도록",
      "ru": "Пусть прощание будет прекрасным",
      "vi": "Để Lời Từ Biệt Đẹp Đẽ Hơn",
      "id": "Make Farewells More Beautiful",
      "es": "Despedidas más bellas",
      "fr": "Des adieux encore plus beaux",
      "de": "Ein noch schönerer Abschied",
      "pt": "O Adeus Mais Belo"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "23041": {
    "names": {
      "th": "Life Should Be Cast to Flames",
      "en": "Life Should Be Cast to Flames",
      "zh-CN": "生命当付之一炬",
      "zh-TW": "生命當付之一炬",
      "ja": "生命、焼滅すべし",
      "ko": "생명은 불태워야 하는 것",
      "ru": "Брошенная в пламя жизнь",
      "vi": "Sinh Mệnh Đáng Bị Thiêu Rụi",
      "id": "Life Should Be Cast to Flames",
      "es": "La vida en llamas",
      "fr": "Une vie forgée dans les flammes",
      "de": "Das Leben sollte in Flammen aufgehen",
      "pt": "A Vida Forjada em Chamas"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23042": {
    "names": {
      "th": "Long May Rainbows Adorn the Sky",
      "en": "Long May Rainbows Adorn the Sky",
      "zh-CN": "愿虹光永驻天空",
      "zh-TW": "願虹光永駐天空",
      "ja": "空の虹が消えぬように",
      "ko": "무지개가 영원히 하늘에 머물길",
      "ru": "Пусть радуга сияет вечно",
      "vi": "Mong Cầu Vồng Mãi Ở Trên Bầu Trời",
      "id": "Long May Rainbows Adorn the Sky",
      "es": "Que el arcoíris siempre esté en el cielo",
      "fr": "Éternels soient les arcs-en-ciel",
      "de": "Mögen Regenbögen am Himmel bleiben",
      "pt": "Que o Arco-Íris Permaneça no Céu"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "23043": {
    "names": {
      "th": "Lies Dance on the Breeze",
      "en": "Lies Dance on the Breeze",
      "zh-CN": "谎言在风中飘扬",
      "zh-TW": "謊言在風中飄揚",
      "ja": "風に揺蕩う虚言",
      "ko": "바람에 흩날리는 거짓말",
      "ru": "Летящая по ветру ложь",
      "vi": "Lời Nói Dối Bay Trong Gió",
      "id": "Lies Dance on the Breeze",
      "es": "Mentiras que vuelan en el viento",
      "fr": "Mensonges au gré du vent",
      "de": "Vom Winde verwehte Lügen",
      "pt": "Mentiras Dançando ao Vento"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23044": {
    "names": {
      "th": "Thus Burns the Dawn",
      "en": "Thus Burns the Dawn",
      "zh-CN": "黎明恰如此燃烧",
      "zh-TW": "黎明恰如此燃燒",
      "ja": "燃え盛る黎明のように",
      "ko": "이와 같이 타오르는 여명",
      "ru": "Так сгорает рассвет",
      "vi": "Bình Minh Rực Cháy",
      "id": "Thus Burns the Dawn",
      "es": "Que arda el alba",
      "fr": "Ainsi s'embrase l'aurore",
      "de": "Wie die Morgendämmerung brennt",
      "pt": "Assim Arde a Alvorada"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23045": {
    "names": {
      "th": "A Thankless Coronation",
      "en": "A Thankless Coronation",
      "zh-CN": "没有回报的加冕",
      "zh-TW": "沒有回報的加冕",
      "ja": "報われぬ戴冠",
      "ko": "보답 없는 왕관",
      "ru": "Коронация без воздаяния",
      "vi": "Lễ Đăng Quang Không Hồi Đáp",
      "id": "A Thankless Coronation",
      "es": "Coronación sin agradecimiento",
      "fr": "Un couronnement sans joie",
      "de": "Eine Krönung ohne Dank",
      "pt": "Uma Coroação Sem Gratidão"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23046": {
    "names": {
      "th": "The Hell Where Ideals Burn",
      "en": "The Hell Where Ideals Burn",
      "zh-CN": "理想燃烧的地狱",
      "zh-TW": "理想燃燒的地獄",
      "ja": "理想を焼く奈落で",
      "ko": "이상이 불타는 지옥",
      "ru": "Ад горящих идеалов",
      "vi": "Địa Ngục Thiêu Đốt Lý Tưởng",
      "id": "The Hell Where Ideals Burn",
      "es": "Infierno donde arden los ideales",
      "fr": "L'Enfer où brûlent les idéaux",
      "de": "Hölle der brennenden Ideale",
      "pt": "O Inferno Onde os Ideais Ardem"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23047": {
    "names": {
      "th": "Why Does the Ocean Sing",
      "en": "Why Does the Ocean Sing",
      "zh-CN": "海洋为何而歌",
      "zh-TW": "海洋為何而歌",
      "ja": "海の歌は何がため",
      "ko": "바다는 왜 노래하는가",
      "ru": "Почему поёт океан",
      "vi": "Vì Sao Biển Cả Ca Vang",
      "id": "Why Does the Ocean Sing",
      "es": "Por qué canta el océano",
      "fr": "Ce pourquoi chantent les océans",
      "de": "Warum singt der Ozean",
      "pt": "Por que o Oceano Canta?"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23048": {
    "names": {
      "th": "Epoch Etched in Golden Blood",
      "en": "Epoch Etched in Golden Blood",
      "zh-CN": "金血铭刻的时代",
      "zh-TW": "金血銘刻的時代",
      "ja": "黄金の血で刻む時代",
      "ko": "황금 피가 새긴 시대",
      "ru": "Эпоха золотой крови",
      "vi": "Thời Đại Máu Vàng Khắc Ghi",
      "id": "Epoch Etched in Golden Blood",
      "es": "Era grabada en sangre dorada",
      "fr": "Une ère gravée dans le sang doré",
      "de": "Zeitalter des goldenen Blutes",
      "pt": "Era Gravada pelo Sangue Dourado"
    },
    "rarity": 5,
    "path": "Harmony"
  },
  "23049": {
    "names": {
      "th": "To Evernight's Stars",
      "en": "To Evernight's Stars",
      "zh-CN": "致长夜的星光",
      "zh-TW": "致長夜的星光",
      "ja": "長き夜に輝く星へ",
      "ko": "긴 밤의 별빛에게",
      "ru": "Звёздному свету во тьме",
      "vi": "Gửi Ánh Sao Của Đêm Dài",
      "id": "To Evernight's Stars",
      "es": "A la estrella de la larga noche",
      "fr": "Jusqu'aux étoiles de l'Éternuitée",
      "de": "Auf das Sternenlicht der langen Nacht",
      "pt": "Ao Brilho Estelar da Noite Eterna"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "23050": {
    "names": {
      "th": "Never Forget Her Flame",
      "en": "Never Forget Her Flame",
      "zh-CN": "勿忘她的火焰",
      "zh-TW": "勿忘她的火焰",
      "ja": "彼女の炎を忘れずに",
      "ko": "그녀의 불꽃을 잊지 말라",
      "ru": "Не забывай её пламя",
      "vi": "Đừng Quên Ngọn Lửa Của Cô Ấy",
      "id": "Never Forget Her Flame",
      "es": "No olvides su fuego",
      "fr": "Une flamme à graver",
      "de": "Vergiss ihre Flamme niemals",
      "pt": "Nunca Esqueça Sua Chama"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23051": {
    "names": {
      "th": "Though Worlds Apart",
      "en": "Though Worlds Apart",
      "zh-CN": "纵然山河万程",
      "zh-TW": "縱然山河萬程",
      "ja": "万里の山河を越えて",
      "ko": "끝없는 산과 강을 거치더라도",
      "ru": "Пусть простор бескраен",
      "vi": "Dù Núi Sông Vạn Dặm",
      "id": "Though Worlds Apart",
      "es": "A través de montañas y ríos",
      "fr": "Par-delà les paysages infinis",
      "de": "Selbst über endlose Lande",
      "pt": "Ainda que o Caminho Seja Longo"
    },
    "rarity": 5,
    "path": "Preservation"
  },
  "23052": {
    "names": {
      "th": "This Love, Forever",
      "en": "This Love, Forever",
      "zh-CN": "爱如此刻永恒",
      "zh-TW": "愛如此刻永恆",
      "ja": "愛はいま永遠に",
      "ko": "이 순간처럼 영원한 사랑",
      "ru": "Как этот миг вечна любовь",
      "vi": "Nguyện Yêu Như Lúc Này, Mãi Mãi",
      "id": "This Love, Forever",
      "es": "Amor eterno como este momento",
      "fr": "Éternel amour",
      "de": "Liebe, so ewig wie dieser Moment",
      "pt": "Instante de Eterno Amor"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "23053": {
    "names": {
      "th": "Dazzled by a Flowery World",
      "en": "Dazzled by a Flowery World",
      "zh-CN": "花花世界迷人眼",
      "zh-TW": "花花世界迷人眼",
      "ja": "きらびやかな世界",
      "ko": "눈부신 파키의 세상",
      "ru": "Зачарованные царством огоньков",
      "vi": "Thế Giới Hoa Lệ Choáng Ngợp",
      "id": "Dazzled by a Flowery World",
      "es": "El cautivador mundochispa",
      "fr": "Écran d'artifice",
      "de": "Bezaubert von einer blumigen Welt",
      "pt": "Deslumbramento Por Um Mundo Florido"
    },
    "rarity": 5,
    "path": "Elation"
  },
  "23054": {
    "names": {
      "th": "When She Decided to See",
      "en": "When She Decided to See",
      "zh-CN": "当她决定看见",
      "zh-TW": "當她決定看見",
      "ja": "彼女が視ると決めた時",
      "ko": "그녀가 보기로 결심했을 때",
      "ru": "Когда она решилась увидеть",
      "vi": "Khi Cô Ấy Quyết Định Nhìn Thấy",
      "id": "When She Decided to See",
      "es": "Cuando se decidió a ver",
      "fr": "Lorsqu'elle décida de voir",
      "de": "Der Entschluss zu sehen",
      "pt": "Quando Ela Decidiu Ver"
    },
    "rarity": 5,
    "path": "Elation"
  },
  "23055": {
    "names": {
      "th": "Colors for Tomorrow",
      "en": "Colors for Tomorrow",
      "zh-CN": "献给明日的色彩",
      "zh-TW": "獻給明日的色彩",
      "ja": "明日に捧げる色",
      "ko": "내일에 바치는 색채",
      "ru": "Цвета для завтрашнего дня",
      "vi": "Sắc Màu Dành Tặng Cho Ngày Mai",
      "id": "Colors for Tomorrow",
      "es": "Colores para el mañana",
      "fr": "Couleurs dédiées au lendemain",
      "de": "Farben für morgen",
      "pt": "Cores para o Amanhã"
    },
    "rarity": 5,
    "path": "Elation"
  },
  "23056": {
    "names": {
      "th": "The Finale of a Lie",
      "en": "The Finale of a Lie",
      "zh-CN": "一场谎言的终幕",
      "zh-TW": "一場謊言的終幕",
      "ja": "或る嘘の終幕",
      "ko": "거짓말의 종막",
      "ru": "Эпилог лжи",
      "vi": "Màn Kết Của Một Lời Nói Dối",
      "id": "The Finale of a Lie",
      "es": "El final de una mentira",
      "fr": "Bas les masques",
      "de": "Das Finale einer Lüge",
      "pt": "O Fim de uma Mentira"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "23057": {
    "names": {
      "th": "Welcome to the Cosmic City",
      "en": "Welcome to the Cosmic City",
      "zh-CN": "欢迎来到银河城",
      "zh-TW": "歡迎來到銀河城",
      "ja": "銀河シティへようこそ",
      "ko": "갤럭시 시티에 오신 것을 환영합니다",
      "ru": "Добро пожаловать в космический город",
      "vi": "Chào Mừng Đến Với Thành Phố Vũ Trụ",
      "id": "Welcome to the Cosmic City",
      "es": "Bienvenidos a la ciudad cósmica",
      "fr": "Terrain de jeu universel",
      "de": "Willkommen in der kosmischen Stadt",
      "pt": "Bem-vindo à Cidade Cósmica"
    },
    "rarity": 5,
    "path": "Elation"
  },
  "23058": {
    "names": {
      "th": "Until the Flowers Bloom Again",
      "en": "Until the Flowers Bloom Again",
      "zh-CN": "邂逅于下一个花季",
      "zh-TW": "邂逅於下一個花季",
      "ja": "再び花が咲く季節に",
      "ko": "다음 꽃피는 계절의 만남",
      "ru": "Пока не распустятся цветы",
      "vi": "Hẹn Gặp Mùa Hoa Tới",
      "id": "Until the Flowers Bloom Again",
      "es": "Encuentro en la próxima primavera",
      "fr": "Printemps des retrouvailles",
      "de": "Begegnung in der nächsten Blütezeit",
      "pt": "Um Encontro na Próxima Primavera"
    },
    "rarity": 5,
    "path": "Elation"
  },
  "23059": {
    "names": {
      "th": "Reforged in Hellfire",
      "en": "Reforged in Hellfire",
      "zh-CN": "灼尽炼狱的新骸",
      "zh-TW": "灼盡煉獄的新骸",
      "ja": "煉獄に焼かれし新身",
      "ko": "연옥을 불사른 새로운 몸",
      "ru": "Перерождённый в пламени",
      "vi": "Hình Hài Tái Sinh Từ Hỏa Ngục",
      "id": "Reforged in Hellfire",
      "es": "Nuevo cuerpo del averno ardiente",
      "fr": "Refonte infernale",
      "de": "Neue Überreste des versengenden Fegefeuers",
      "pt": "Reforjado nas Chamas do Inferno"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "23060": {
    "names": {
      "th": "A Star That Lights the Night",
      "en": "A Star That Lights the Night",
      "zh-CN": "当一颗星照亮夜空",
      "zh-TW": "當一顆星照亮夜空",
      "ja": "夜を照らす導きの星",
      "ko": "별이 밤하늘을 밝힐 때",
      "ru": "Когда звезда озаряет ночное небо",
      "vi": "Khi Một Vì Sao Chiếu Sáng Trời Đêm",
      "id": "A Star That Lights the Night",
      "es": "Cuando una estrella ilumina la noche",
      "fr": "Une étoile illuminant la nuit",
      "de": "Wenn ein Stern den Nachthimmel erhellt",
      "pt": "Quando uma Estrela Ilumina o Céu Noturno"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23061": {
    "names": {
      "th": "Flickering Stars",
      "en": "Flickering Stars",
      "zh-CN": "星火悄然闪耀",
      "zh-TW": "星火悄然閃耀",
      "ja": "静かに瞬く小さな火",
      "ko": "고요히 빛나는 불티",
      "ru": "Мерцающие звёзды",
      "vi": "Ngọn Lửa Nhỏ Thầm Lặng Tỏa Sáng",
      "id": "Flickering Stars",
      "es": "Destelleos silentes",
      "fr": "Étoiles scintillantes",
      "de": "Die leise flackernde Sternenflamme",
      "pt": "Estrelas Cintilantes"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "23062": {
    "names": {
      "th": "I Am As You Behold",
      "en": "I Am As You Behold",
      "zh-CN": "所见即我",
      "zh-TW": "所見即我",
      "ja": "在るがままの我",
      "ko": "보이는 것이 곧 나",
      "ru": "Я - всё, что пред взором",
      "vi": "Ngươi Thấy Chính Là Ta",
      "id": "I Am As You Behold",
      "es": "Soy lo que ves",
      "fr": "Je suis tel que tu me vois",
      "de": "Ich bin, wie du mich siehst",
      "pt": "Eu Sou Como Tu Me Vês"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "23063": {
    "names": {
      "th": "Rise and Sing",
      "en": "Rise and Sing",
      "zh-CN": "你将起身歌唱",
      "zh-TW": "你將起身歌唱",
      "ja": "立ち上がり高らかな歌を",
      "ko": "그대는 나아가 노래하리니",
      "ru": "Встань и пой",
      "vi": "Bạn Sẽ Đứng Dậy Cất Tiếng Hát",
      "id": "Rise and Sing",
      "es": "Levántate y canta",
      "fr": "À vous !",
      "de": "Steh auf und sing",
      "pt": "Levanta e Canta"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "23064": {
    "names": {
      "th": "Summer Rides the Surf",
      "en": "Summer Rides the Surf",
      "zh-CN": "向浪花掷下盛夏",
      "zh-TW": "向浪花擲下盛夏",
      "ja": "波しぶきが躍る夏へ",
      "ko": "파도에 내던진 한여름",
      "ru": "Лето в волнах",
      "vi": "Ném Mùa Hè Vào Bọt Sóng",
      "id": "Summer Rides the Surf",
      "es": "Verano entre olas",
      "fr": "Un déferlement d'été",
      "de": "Hochsommer auf den Wellen",
      "pt": "Surfando a Onda do Verão"
    },
    "rarity": 5,
    "path": "Elation"
  },
  "23065": {
    "names": {
      "th": "เสียงสะท้อนแรกของ \"Aha\"",
      "en": "Upon the First Echo of \"Aha\"",
      "zh-CN": "「阿哈」最初的啼鸣",
      "zh-TW": "「阿哈」最初的啼鳴",
      "ja": "「アハ」最初の啼き声",
      "ko": "「아하」 최초의 울음소리",
      "ru": "При первом эхе Ахи",
      "vi": "Tiếng Vọng Đầu Tiên Của \"Aha\"",
      "id": "Upon the First Echo of \"Aha\"",
      "es": "Tras el primer eco de Aha",
      "fr": "Au premier écho d'Aha",
      "de": "Beim ersten Echo von Aha",
      "pt": "No Primeiro Eco de Aha"
    },
    "rarity": 5,
    "path": "Elation",
    "hp": 952,
    "atk": 582,
    "def": 529,
    "skill_name": "IMPROV TOUR",
    "desc": "เพิ่มความเร็วพื้นฐานของผู้สวมใส่ 12 เมื่อใช้สกิลการต่อสู้กับเป้าหมายฝ่ายเรา 1 ตัว จะได้รับ \"Punchline\" 10 แต้ม เอฟเฟกต์นี้เกิดขึ้นได้มากสุด 1 ครั้งในทุก 1 เทิร์น จากนั้นจะทำให้ฝ่ายเราทั้งหมดเพิกเฉยต่อ DEF ของเป้าหมายศัตรู 16% เมื่อสร้าง DMG ในการต่อสู้นี้ โดยเอฟเฟกต์นี้ไม่สามารถซ้อนทับได้",
    "desc_en": "Increases the wearer's base Speed by 12. When using a Skill on one other ally, gains 10 Punchline. This effect can trigger at most once every interval of 1 turn(s). Then, causes all allies to ignore 16% of the enemy target's DEF when dealing DMG during this combat. This effect cannot be stacked."
  },
  "24000": {
    "names": {
      "th": "On the Fall of an Aeon",
      "en": "On the Fall of an Aeon",
      "zh-CN": "记一位星神的陨落",
      "zh-TW": "記一位星神的殞落",
      "ja": "とある星神の殞落を記す",
      "ko": "어떤 에이언즈의 몰락",
      "ru": "О падении Эона",
      "vi": "Sự Sụp Đổ Của Aeon",
      "id": "On the Fall of an Aeon",
      "es": "Sobre la caída de un Eón",
      "fr": "La chute d'un Aiôn",
      "de": "Der Niedergang eines Äons",
      "pt": "Na Queda de Um Aeon"
    },
    "rarity": 5,
    "path": "Destruction"
  },
  "24001": {
    "names": {
      "th": "Cruising in the Stellar Sea",
      "en": "Cruising in the Stellar Sea",
      "zh-CN": "星海巡航",
      "zh-TW": "星海巡航",
      "ja": "星海巡航",
      "ko": "별바다 순항",
      "ru": "Круиз по галактике",
      "vi": "Du Hành Trên Biển Sao",
      "id": "Cruising in the Stellar Sea",
      "es": "Crucero estelar",
      "fr": "Exploration de la mer stellaire",
      "de": "Fahrt durch das Sternenmeer",
      "pt": "Percorrendo o Mar Estelar"
    },
    "rarity": 5,
    "path": "Hunt"
  },
  "24002": {
    "names": {
      "th": "Texture of Memories",
      "en": "Texture of Memories",
      "zh-CN": "记忆的质料",
      "zh-TW": "記憶的質料",
      "ja": "記憶の素材",
      "ko": "기억의 소재",
      "ru": "Материя памяти",
      "vi": "Chất Liệu Ký Ức",
      "id": "Texture of Memories",
      "es": "La textura de los recuerdos",
      "fr": "Texture des Mémoires",
      "de": "Textur der Erinnerungen",
      "pt": "Textura de Memórias"
    },
    "rarity": 5,
    "path": "Preservation"
  },
  "24003": {
    "names": {
      "th": "Solitary Healing",
      "en": "Solitary Healing",
      "zh-CN": "孤独的疗愈",
      "zh-TW": "孤獨的療癒",
      "ja": "孤独の癒し",
      "ko": "고독의 치유",
      "ru": "Одинокое исцеление",
      "vi": "Một Mình Chữa Trị",
      "id": "Solitary Healing",
      "es": "Sanación solitaria",
      "fr": "Remède à la solitude",
      "de": "Einzelne Heilung",
      "pt": "Cura Solitária"
    },
    "rarity": 5,
    "path": "Nihility"
  },
  "24004": {
    "names": {
      "th": "Eternal Calculus",
      "en": "Eternal Calculus",
      "zh-CN": "不息的演算",
      "zh-TW": "不息的演算",
      "ja": "絶え間ない演算",
      "ko": "멈추지 않는 연산",
      "ru": "Беспрерывные вычисления",
      "vi": "Ngoại Suy Vô Tận",
      "id": "Eternal Calculus",
      "es": "Cálculo interminable",
      "fr": "Calcul éternel",
      "de": "Unermüdliche Berechnung",
      "pt": "Cálculo Ininterrupto"
    },
    "rarity": 5,
    "path": "Erudition"
  },
  "24005": {
    "names": {
      "th": "Memory's Curtain Never Falls",
      "en": "Memory's Curtain Never Falls",
      "zh-CN": "记忆永不落幕",
      "zh-TW": "記憶永不落幕",
      "ja": "尽きぬ追憶",
      "ko": "기억은 영원히 막을 내리지 않는다",
      "ru": "Не падёт занавес памяти",
      "vi": "Ký Ức Không Bao Giờ Hạ Màn",
      "id": "Memory's Curtain Never Falls",
      "es": "Sobre los recuerdos nunca cae el telón",
      "fr": "Le rideau de la mémoire ne tombe jamais",
      "de": "Der Vorhang der Erinnerung fällt nie",
      "pt": "As Cortinas da Memória Nunca Caem"
    },
    "rarity": 5,
    "path": "Remembrance"
  },
  "24006": {
    "names": {
      "th": "Elation Brimming With Blessings",
      "en": "Elation Brimming With Blessings",
      "zh-CN": "欢愉满溢祝福",
      "zh-TW": "歡愉滿溢祝福",
      "ja": "愉悦溢れる祝福",
      "ko": "넘치는 환락의 축복",
      "ru": "Переполненная благословением Радость",
      "vi": "Chúc Phúc Tràn Đầy Vui Vẻ",
      "id": "Elation Brimming With Blessings",
      "es": "Exultación desbordante de bendiciones",
      "fr": "Eau bénite de l'Allégresse",
      "de": "Hochgefühl voller Segen",
      "pt": "Euforia Repleta de Bênçãos"
    },
    "rarity": 5,
    "path": "Elation"
  }
};

export const RELIC_SET_METADATA = {
  "101": {
    "names": {
      "th": "Passerby of Wandering Cloud",
      "en": "Passerby of Wandering Cloud",
      "zh-CN": "云无留迹的过客",
      "zh-TW": "雲無留跡的過客",
      "ja": "流雲無痕の過客",
      "ko": "흔적을 남기지 않은 과객",
      "ru": "Скиталец блуждающего облака",
      "vi": "Lãng Khách Âm Thầm",
      "id": "Passerby of Wandering Cloud",
      "es": "Transeúnte de la nube pasajera",
      "fr": "Vagabond foulenuage",
      "de": "Wanderer der vorbeiziehenden Wolke",
      "pt": "Transeunte da Nuvem Errante"
    }
  },
  "102": {
    "names": {
      "th": "Musketeer of Wild Wheat",
      "en": "Musketeer of Wild Wheat",
      "zh-CN": "野穗伴行的快枪手",
      "zh-TW": "野穗伴行的快槍手",
      "ja": "草の穂ガンマン",
      "ko": "들이삭과 동행하는 거너",
      "ru": "Стрелок дикой пшеницы",
      "vi": "Thiện Xạ Bông Lúa",
      "id": "Musketeer of Wild Wheat",
      "es": "Pistolera de la espiga silvestre",
      "fr": "Mousquetaire du blé sauvage",
      "de": "Musketierin des wilden Weizens",
      "pt": "Mosqueteira do Trigo Selvagem"
    }
  },
  "103": {
    "names": {
      "th": "Knight of Purity Palace",
      "en": "Knight of Purity Palace",
      "zh-CN": "净庭教宗的圣骑士",
      "zh-TW": "淨庭教宗的聖騎士",
      "ja": "純庭教会の聖騎士",
      "ko": "정토 교황의 팔라딘",
      "ru": "Рыцарь дворца чистоты",
      "vi": "Thánh Kỵ Sĩ Giáo Hoàng Tịnh Đình",
      "id": "Knight of Purity Palace",
      "es": "Paladina de la Iglesia de la Corte Inmaculada",
      "fr": "Chevalier du palais de la pureté",
      "de": "Ritterin vom Palast der Reinheit",
      "pt": "Cavaleira do Palácio da Pureza"
    }
  },
  "104": {
    "names": {
      "th": "Hunter of Glacial Forest",
      "en": "Hunter of Glacial Forest",
      "zh-CN": "密林卧雪的猎人",
      "zh-TW": "密林臥雪的獵人",
      "ja": "雪の密林の狩人",
      "ko": "혹한 밀림의 사냥꾼",
      "ru": "Охотник ледникового леса",
      "vi": "Thợ Săn Tuyết Phủ",
      "id": "Hunter of Glacial Forest",
      "es": "Cazador del bosque glacial",
      "fr": "Chasseur de la forêt glaciaire",
      "de": "Jäger aus dem Gletscherwald",
      "pt": "Caçador da Floresta Glacial"
    }
  },
  "105": {
    "names": {
      "th": "Champion of Streetwise Boxing",
      "en": "Champion of Streetwise Boxing",
      "zh-CN": "街头出身的拳王",
      "zh-TW": "街頭出身的拳王",
      "ja": "成り上がりチャンピオン",
      "ko": "스트리트 격투왕",
      "ru": "Чемпион уличного бокса",
      "vi": "Quyền Vương Đường Phố",
      "id": "Champion of Streetwise Boxing",
      "es": "Campeona de boxeo callejero",
      "fr": "Championne de boxe de rue",
      "de": "Champion des Straßenboxens",
      "pt": "Campeã de Boxe de Rua"
    }
  },
  "106": {
    "names": {
      "th": "Guard of Wuthering Snow",
      "en": "Guard of Wuthering Snow",
      "zh-CN": "戍卫风雪的铁卫",
      "zh-TW": "戍衛風雪的鐵衛",
      "ja": "吹雪と対峙する兵士",
      "ko": "눈보라에 맞서는 철위대",
      "ru": "Страж снежной метели",
      "vi": "Thiết Vệ Bão Tuyết",
      "id": "Guard of Wuthering Snow",
      "es": "Guardia de la nieve borrascosa",
      "fr": "Garde des neiges hurlantes",
      "de": "Wachen des stürmischen Schnees",
      "pt": "Guarda da Neve Uivante"
    }
  },
  "107": {
    "names": {
      "th": "Firesmith of Lava-Forging",
      "en": "Firesmith of Lava-Forging",
      "zh-CN": "熔岩锻铸的火匠",
      "zh-TW": "熔岩鍛鑄的火匠",
      "ja": "溶岩で鍛造する火匠",
      "ko": "용암 단조의 화장(火匠)",
      "ru": "Кузнец огня и лавы",
      "vi": "Thợ Rèn Lửa Dung Nham",
      "id": "Firesmith of Lava-Forging",
      "es": "Forjador de lava",
      "fr": "Lave de Forgefeu",
      "de": "Feuerschmied der Lavaglut",
      "pt": "Artesão de Fogo da Forja de Lava"
    }
  },
  "108": {
    "names": {
      "th": "Genius of Brilliant Stars",
      "en": "Genius of Brilliant Stars",
      "zh-CN": "繁星璀璨的天才",
      "zh-TW": "繁星璀璨的天才",
      "ja": "星の如く輝く天才",
      "ko": "별처럼 빛나는 천재",
      "ru": "Гений бриллиантовых звёзд",
      "vi": "Thiên Tài Xuất Chúng",
      "id": "Genius of Brilliant Stars",
      "es": "Genio de las estrellas relucientes",
      "fr": "Génies des étoiles",
      "de": "Genie der strahlenden Sterne",
      "pt": "Gênio das Estrelas Brilhantes"
    }
  },
  "109": {
    "names": {
      "th": "Band of Sizzling Thunder",
      "en": "Band of Sizzling Thunder",
      "zh-CN": "激奏雷电的乐队",
      "zh-TW": "激奏雷電的樂團",
      "ja": "雷鳴轟くバンド",
      "ko": "뇌전을 울리는 밴드",
      "ru": "Бэнд испепеляющего грома",
      "vi": "Ban Nhạc Sizzling Thunder",
      "id": "Band of Sizzling Thunder",
      "es": "Banda del trueno crepitante",
      "fr": "Tonnerre grésillant",
      "de": "Band des knisternden Donners",
      "pt": "Banda Trovão Crepitante"
    }
  },
  "110": {
    "names": {
      "th": "Eagle of Twilight Line",
      "en": "Eagle of Twilight Line",
      "zh-CN": "晨昏交界的翔鹰",
      "zh-TW": "晨昏交界的翔鷹",
      "ja": "昼夜の狭間を翔ける鷹",
      "ko": "밤낮의 경계를 나는 매",
      "ru": "Орёл сумеречного рубежа",
      "vi": "Chim Ưng Ranh Giới Ngày Đêm",
      "id": "Eagle of Twilight Line",
      "es": "Águila del crepúsculo",
      "fr": "Aigle de la frontière du crépuscule",
      "de": "Adler des Zwielichts",
      "pt": "Águia da Linha do Crepúsculo"
    }
  },
  "111": {
    "names": {
      "th": "Thief of Shooting Meteor",
      "en": "Thief of Shooting Meteor",
      "zh-CN": "流星追迹的怪盗",
      "zh-TW": "流星追跡的怪盜",
      "ja": "流星の跡を追う怪盗",
      "ko": "유성을 쫓는 괴도",
      "ru": "Вор падающего метеора",
      "vi": "Kẻ Cướp Vệt Sao Băng",
      "id": "Thief of Shooting Meteor",
      "es": "Ladrón del rastro meteórico",
      "fr": "Voleur de météorite filante",
      "de": "Dieb des fallenden Meteors",
      "pt": "Ladrão da Chuva de Meteoros"
    }
  },
  "112": {
    "names": {
      "th": "Wastelander of Banditry Desert",
      "en": "Wastelander of Banditry Desert",
      "zh-CN": "盗匪荒漠的废土客",
      "zh-TW": "盜匪荒漠的廢土客",
      "ja": "荒地で盗みを働く廃土客",
      "ko": "황무지의 도적, 황야인",
      "ru": "Головорез бандитской пустыни",
      "vi": "Kẻ Hoang Dã Sa Mạc",
      "id": "Wastelander of Banditry Desert",
      "es": "Habitante del yermo de los bandidos",
      "fr": "Ferrailleur du désert des bandits",
      "de": "Ödländer aus der Räuberwüste",
      "pt": "Andarilho do Deserto da Bandidagem"
    }
  },
  "113": {
    "names": {
      "th": "Longevous Disciple",
      "en": "Longevous Disciple",
      "zh-CN": "宝命长存的莳者",
      "zh-TW": "寶命長存的蒔者",
      "ja": "宝命長存の蒔者",
      "ko": "장수를 원하는 제자",
      "ru": "Долгоживущий ученик",
      "vi": "Môn Đồ Trường Thọ",
      "id": "Longevous Disciple",
      "es": "Discípula longeva",
      "fr": "Disciple longévive",
      "de": "Langlebige Jüngerin",
      "pt": "Discípula Longeva"
    }
  },
  "114": {
    "names": {
      "th": "Messenger Traversing Hackerspace",
      "en": "Messenger Traversing Hackerspace",
      "zh-CN": "骇域漫游的信使",
      "zh-TW": "駭域漫遊的信使",
      "ja": "仮想空間を漫遊するメッセンジャー",
      "ko": "가상공간을 누비는 메신저",
      "ru": "Вестник, блуждающий в хакерском пространстве",
      "vi": "Tín Sứ Du Ngoạn Không Gian Hacker",
      "id": "Messenger Traversing Hackerspace",
      "es": "Mensajero del espacio hackeado",
      "fr": "Messager du hackerspace",
      "de": "Bote im Hackerspace",
      "pt": "Mensageira Atravessando o Hackerspace"
    }
  },
  "115": {
    "names": {
      "th": "The Ashblazing Grand Duke",
      "en": "The Ashblazing Grand Duke",
      "zh-CN": "毁烬焚骨的大公",
      "zh-TW": "毀燼焚骨的大公",
      "ja": "灰燼を燃やし尽くす大公",
      "ko": "재와 뼈마저 불사르는 대공",
      "ru": "Сжигающий дотла герцог",
      "vi": "Đại Công Tước Tro Tàn",
      "id": "The Ashblazing Grand Duke",
      "es": "Gran duque incinerador",
      "fr": "Grand duc incandescendre",
      "de": "Der eingeäscherte Erzherzog",
      "pt": "Grão-Duque em Brasas"
    }
  },
  "116": {
    "names": {
      "th": "Prisoner in Deep Confinement",
      "en": "Prisoner in Deep Confinement",
      "zh-CN": "幽锁深牢的系囚",
      "zh-TW": "幽鎖深牢的繫囚",
      "ja": "深い牢獄の囚人",
      "ko": "깊은 감옥에 수감된 죄수",
      "ru": "Пленник мрачной темницы",
      "vi": "Tù Nhân Ngục Tối",
      "id": "Prisoner in Deep Confinement",
      "es": "Prisionero aislado",
      "fr": "Prisonnier enchaîné",
      "de": "Gefangene in tiefem Gewahrsam",
      "pt": "Prisioneiro em Confinamento Profundo"
    }
  },
  "117": {
    "names": {
      "th": "Pioneer Diver of Dead Waters",
      "en": "Pioneer Diver of Dead Waters",
      "zh-CN": "死水深潜的先驱",
      "zh-TW": "死水深潛的先驅",
      "ja": "死水に潜る先駆者",
      "ko": "사수에 잠수한 선구자",
      "ru": "Первооткрыватель мёртвых вод",
      "vi": "Tiên Phong Trong Nước Chết",
      "id": "Pioneer Diver of Dead Waters",
      "es": "Buceadora pionera del agua muerta",
      "fr": "Exploratrice des abîmes",
      "de": "Pioniertaucherin toter Gewässer",
      "pt": "Mergulhadora Pioneira de Águas Mortas"
    }
  },
  "118": {
    "names": {
      "th": "Watchmaker, Master of Dream Machinations",
      "en": "Watchmaker, Master of Dream Machinations",
      "zh-CN": "机心戏梦的钟表匠",
      "zh-TW": "機心戲夢的鐘錶匠",
      "ja": "夢を弄ぶ時計屋",
      "ko": "꿈을 조작하는 시계공",
      "ru": "Часовщик сонных махинаций",
      "vi": "Thợ Đồng Hồ, Bậc Thầy Máy Móc",
      "id": "Watchmaker, Master of Dream Machinations",
      "es": "Relojero de maquinaciones oníricas",
      "fr": "Horloger, maître des machinations oniriques",
      "de": "Uhrmacher der maschinellen Traumspiele",
      "pt": "Relojoeiro, Mestre de Maquinações de Sonhos"
    }
  },
  "119": {
    "names": {
      "th": "Iron Cavalry Against the Scourge",
      "en": "Iron Cavalry Against the Scourge",
      "zh-CN": "荡除蠹灾的铁骑",
      "zh-TW": "蕩除蠹災的鐵騎",
      "ja": "蝗害を一掃せし鉄騎",
      "ko": "곤충 재앙을 잠재우는 철기군",
      "ru": "Железная кавалерия против нашествия",
      "vi": "Thiết Kỵ Diệt Trừ Tai Họa",
      "id": "Iron Cavalry Against the Scourge",
      "es": "Caballería de hierro plaguicida",
      "fr": "Brigade de fer à l'assaut du fléau",
      "de": "Eiserne Kavallerie gegen die Plage",
      "pt": "Cavalaria de Ferro Contra a Praga"
    }
  },
  "120": {
    "names": {
      "th": "The Wind-Soaring Valorous",
      "en": "The Wind-Soaring Valorous",
      "zh-CN": "风举云飞的勇烈",
      "zh-TW": "風舉雲飛的勇烈",
      "ja": "風雲を薙ぎ払う勇烈",
      "ko": "바람과 구름을 가르는 용맹함",
      "ru": "Храбрость ветра",
      "vi": "Dũng Khí Ngút Trời",
      "id": "The Wind-Soaring Valorous",
      "es": "Intrépida cabalgavientos",
      "fr": "Vaillance du guerrier du vent",
      "de": "Tapferer Krieger des Winds",
      "pt": "Coragem Como Vento e Nuvem"
    }
  },
  "121": {
    "names": {
      "th": "Sacerdos' Relived Ordeal",
      "en": "Sacerdos' Relived Ordeal",
      "zh-CN": "重循苦旅的司铎",
      "zh-TW": "重循苦旅的司鐸",
      "ja": "再び苦難の道を歩む司祭",
      "ko": "고행의 길에 다시 오른 사제",
      "ru": "Тернистый путь священника",
      "vi": "Lại Một Hành Trình Gian Khổ Của Linh Mục",
      "id": "Sacerdos' Relived Ordeal",
      "es": "Sacerdote del calvario revivido",
      "fr": "Supplice du prêtre",
      "de": "Wiedererlebte Tortur des Priesters",
      "pt": "O Ordálio Revivido de Sacerdos"
    }
  },
  "122": {
    "names": {
      "th": "Scholar Lost in Erudition",
      "en": "Scholar Lost in Erudition",
      "zh-CN": "识海迷坠的学者",
      "zh-TW": "識海迷墜的學者",
      "ja": "知識の海に溺れる学者",
      "ko": "지식의 바다에 빠진 학자",
      "ru": "Затерянный в знаниях учёный",
      "vi": "Học Giả Lạc Lối Trong Biển Tri Thức",
      "id": "Scholar Lost in Erudition",
      "es": "Eruditos perdidos en el mar del conocimiento",
      "fr": "Perdition dans l'Érudition",
      "de": "Im Wissen verlorene Gelehrte",
      "pt": "Uma Erudita Perdida na Erudição"
    }
  },
  "123": {
    "names": {
      "th": "Hero of Triumphant Song",
      "en": "Hero of Triumphant Song",
      "zh-CN": "凯歌祝捷的英豪",
      "zh-TW": "凱歌祝捷的英豪",
      "ja": "凱歌を揚げる英雄",
      "ko": "개선가를 울리는 영웅",
      "ru": "Воспетый эпосом герой",
      "vi": "Anh Hùng Ca Khúc Khải Hoàn",
      "id": "Hero of Triumphant Song",
      "es": "Héroe de la epopeya triunfal",
      "fr": "Héros de la chanson triomphale",
      "de": "Held des Lobgesangs",
      "pt": "Herói da Melodia Triunfante"
    }
  },
  "124": {
    "names": {
      "th": "Poet of Mourning Collapse",
      "en": "Poet of Mourning Collapse",
      "zh-CN": "哀歌覆国的诗人",
      "zh-TW": "哀歌覆國的詩人",
      "ja": "亡国の悲哀を詠う詩人",
      "ko": "망국을 애도하는 시인",
      "ru": "Поющий элегии рапсод",
      "vi": "Nhà Thơ Khúc Bi Ca Vong Quốc",
      "id": "Poet of Mourning Collapse",
      "es": "Poetisa del colapso elegíaco",
      "fr": "Poétesse du déclin funèbre",
      "de": "Klagende Dichterin",
      "pt": "Poetisa do Colapso Enlutada"
    }
  },
  "125": {
    "names": {
      "th": "Warrior Goddess of Sun and Thunder",
      "en": "Warrior Goddess of Sun and Thunder",
      "zh-CN": "烈阳惊雷的女武神",
      "zh-TW": "烈陽驚雷的女武神",
      "ja": "烈陽と雷鳴の武神",
      "ko": "태양과 번개의 여전사",
      "ru": "Воительница солнца и грозы",
      "vi": "Nữ Thần Chiến Binh Nắng Sấm",
      "id": "Warrior Goddess of Sun and Thunder",
      "es": "Guerrera celestial del sol y el trueno",
      "fr": "Valkyrie du soleil et de la foudre",
      "de": "Kriegsgöttin der lodernden Sonne und des Donners",
      "pt": "Deusa Guerreira do Sol e do Trovão"
    }
  },
  "126": {
    "names": {
      "th": "Wavestrider Captain",
      "en": "Wavestrider Captain",
      "zh-CN": "恶海逐波的船长",
      "zh-TW": "惡海逐波的船長",
      "ja": "荒海を越える船長",
      "ko": "거친 파도를 헤치는 선장",
      "ru": "Преследующий волны капитан",
      "vi": "Thuyền Trưởng Đuổi Sóng Biển Sâu",
      "id": "Wavestrider Captain",
      "es": "Capitán del mar maldito",
      "fr": "Capitaine des mers déchaînées",
      "de": "Kapitän über den verfluchten Wellen",
      "pt": "Capitão Navegante de Ondas"
    }
  },
  "127": {
    "names": {
      "th": "World-Remaking Deliverer",
      "en": "World-Remaking Deliverer",
      "zh-CN": "再创天地的救世主",
      "zh-TW": "再創天地的救世主",
      "ja": "天地再創の救世主",
      "ko": "천지를 재창조한 구세주",
      "ru": "Воссоздающий мир спаситель",
      "vi": "Đấng Cứu Thế Tái Tạo Trời Đất",
      "id": "World-Remaking Deliverer",
      "es": "Salvado{F#ra}{M#r} que reforja el mundo",
      "fr": "{F#Libératrice}{M#Libérateur} d'un monde nouveau",
      "de": "{F#Erlöserin}{M#Erlöser} der Weltneuschöpfung",
      "pt": "Portador da Reconstrução do Mundo"
    }
  },
  "128": {
    "names": {
      "th": "Self-Enshrouded Recluse",
      "en": "Self-Enshrouded Recluse",
      "zh-CN": "自匿星芒的隐士",
      "zh-TW": "自匿星芒的隱士",
      "ja": "星の光を隠した隠者",
      "ko": "별빛에 숨은 은둔자",
      "ru": "Таящий сияние отшельник",
      "vi": "Ẩn Sĩ Ẩn Mình Dưới Ánh Sao",
      "id": "Self-Enshrouded Recluse",
      "es": "Eremita aislado en las estrellas",
      "fr": "Ermite des étoiles",
      "de": "Sternenverhüllter Einsiedler",
      "pt": "Ermitão Envolto em Si Mesmo"
    }
  },
  "129": {
    "names": {
      "th": "Ever-Glorious Magical Girl",
      "en": "Ever-Glorious Magical Girl",
      "zh-CN": "闪耀功勋的魔法少女",
      "zh-TW": "功勳閃耀的魔法少女",
      "ja": "功績輝く魔法少女",
      "ko": "빛나는 공훈의 마법 소녀",
      "ru": "Блистательная чародейка",
      "vi": "Cô Gái Phép Thuật Công Lao Lấp Lánh",
      "id": "Ever-Glorious Magical Girl",
      "es": "Chica mágica de hazañas gloriosas",
      "fr": "Illustre magical girl",
      "de": "Magisches Mädchen mit glänzendem Verdienst",
      "pt": "Menina Mágica Sempre Gloriosa"
    }
  },
  "130": {
    "names": {
      "th": "Diviner of Distant Reach",
      "en": "Diviner of Distant Reach",
      "zh-CN": "应天涉远的卜者",
      "zh-TW": "應天涉遠的卜者",
      "ja": "天命に従う旅の卜者",
      "ko": "천명에 응해 먼 길을 떠난 점술가",
      "ru": "Недосягаемый прорицатель",
      "vi": "Nhà Chiêm Tinh Tuân Mệnh Trời",
      "id": "Diviner of Distant Reach",
      "es": "Adivino de alcance remoto",
      "fr": "Oracle des horizons lointains",
      "de": "Himmelweitreichender Wahrsager",
      "pt": "Profeta de Alcance Distante"
    }
  },
  "131": {
    "names": {
      "th": "As Navigator Isee Sees It",
      "en": "As Navigator Isee Sees It",
      "zh-CN": "星如我见的领航员",
      "zh-TW": "星如我見的領航員",
      "ja": "星巡るナビゲーター「シケン」",
      "ko": "별을 갈망하는 항법사 아집",
      "ru": "Взор навигатора Взираи",
      "vi": "Biển Sao Như Hoa Tiêu Isee Nhìn Thấy",
      "id": "As Navigator Isee Sees It",
      "es": "Piloto estelar como Yoveo",
      "fr": "Comme le navigateur Japper Soie le voit",
      "de": "Wie Navigator Isee es sieht",
      "pt": "Como o Navegador Isee Vê"
    }
  },
  "132": {
    "names": {
      "th": "Divine-Querying Master Smith",
      "en": "Divine-Querying Master Smith",
      "zh-CN": "叩问天工的名冶",
      "zh-TW": "叩問天工的名冶",
      "ja": "神業を探求する名匠",
      "ko": "신공을 탐구하는 명장",
      "ru": "Обращённый к небесам кузнец",
      "vi": "Bậc Thầy Rèn Đúc Thỉnh Vấn Tạo Hóa",
      "id": "Divine-Querying Master Smith",
      "es": "Gran forja del interrogante divino",
      "fr": "Forge de l'artisan céleste",
      "de": "Götterbefragender Meisterschmied",
      "pt": "Mestre Ferreiro da Consulta Divina"
    }
  },
  "133": {
    "names": {
      "th": "Dreamlit Actor",
      "en": "Dreamlit Actor",
      "zh-CN": "戏梦点星的伶人",
      "zh-TW": "戲夢點星的伶人",
      "ja": "星灯す夢芝居の伶人",
      "ko": "꿈같은 유희 속 별을 밝히는 연극인",
      "ru": "Актёр звёздной точки",
      "vi": "Kẻ Khóc Thuê Thắp Sao Mộng Kịch",
      "id": "Dreamlit Actor",
      "es": "Plañidera iluminaestrellas",
      "fr": "Actrice des songes étoilés",
      "de": "Die Traumlicht-Mimen",
      "pt": "Ator Onírico"
    }
  },
  "134": {
    "names": {
      "th": "The Edacious Heretic",
      "en": "The Edacious Heretic",
      "zh-CN": "贪噬禁果的异端",
      "zh-TW": "貪噬禁果的異端",
      "ja": "禁断の果実を貪る異端者",
      "ko": "금단의 열매를 삼킨 이단",
      "ru": "Пожирательница запретных плодов",
      "vi": "Kẻ Dị Đoan Nuốt Chửng Trái Cấm",
      "id": "The Edacious Heretic",
      "es": "Hereje del fruto prohibido",
      "fr": "Hérétique vorace",
      "de": "Die gefräßige Ketzerin",
      "pt": "O Herege Voraz"
    }
  },
  "301": {
    "names": {
      "th": "Space Sealing Station",
      "en": "Space Sealing Station",
      "zh-CN": "太空封印站",
      "zh-TW": "太空封印站",
      "ja": "宇宙封印ステーション",
      "ko": "우주 봉인 정거장",
      "ru": "Запечатывающая космос станция",
      "vi": "Trạm Phong Ấn Không Gian",
      "id": "Space Sealing Station",
      "es": "Estación sellaespacios",
      "fr": "Station de scellement spatial",
      "de": "Raumstation für Versiegelung",
      "pt": "Estação de Vedação Espacial"
    }
  },
  "302": {
    "names": {
      "th": "Fleet of the Ageless",
      "en": "Fleet of the Ageless",
      "zh-CN": "不老者的仙舟",
      "zh-TW": "不老者的仙舟",
      "ja": "老いぬ者の仙舟",
      "ko": "불로인의 선주",
      "ru": "Флот нестареющих",
      "vi": "Xianzhou Không Có Tuổi",
      "id": "Fleet of the Ageless",
      "es": "Flota de los eternos",
      "fr": "Flotte de l'éternel",
      "de": "Flotte der Alterslosen",
      "pt": "Frota dos Eternos"
    }
  },
  "303": {
    "names": {
      "th": "Pan-Cosmic Commercial Enterprise",
      "en": "Pan-Cosmic Commercial Enterprise",
      "zh-CN": "泛银河商业公司",
      "zh-TW": "泛銀河商業公司",
      "ja": "汎銀河商事会社",
      "ko": "범은하 상사",
      "ru": "Пангалактическое коммерческое предприятие",
      "vi": "Công Ty Kinh Doanh Liên Ngân Hà",
      "id": "Pan-Cosmic Commercial Enterprise",
      "es": "Entidad comercial pangaláctica",
      "fr": "Entreprise commerciale intersidérale",
      "de": "Pangalaktische Handelsgesellschaft",
      "pt": "Empresa Mercantil Pan-Cósmica"
    }
  },
  "304": {
    "names": {
      "th": "Belobog of the Architects",
      "en": "Belobog of the Architects",
      "zh-CN": "筑城者的贝洛伯格",
      "zh-TW": "築城者的貝洛伯格",
      "ja": "建創者のベロブルグ",
      "ko": "축성가의 벨로보그",
      "ru": "Белобог Архитекторов",
      "vi": "Belobog Của Đấng Kiến Tạo",
      "id": "Belobog of the Architects",
      "es": "La Belobog de los Arquitectos",
      "fr": "Belobog des Architectes",
      "de": "Belobog der Architekten",
      "pt": "Belobog dos Arquitetos"
    }
  },
  "305": {
    "names": {
      "th": "Celestial Differentiator",
      "en": "Celestial Differentiator",
      "zh-CN": "星体差分机",
      "zh-TW": "星體差分機",
      "ja": "天体階差機関",
      "ko": "천체 차분기관",
      "ru": "Небесный дифференциатор",
      "vi": "Máy Sai Lệch Hành Tinh",
      "id": "Celestial Differentiator",
      "es": "Diferenciador celestial",
      "fr": "Différenciateur céleste",
      "de": "Himmlischer Differenziator",
      "pt": "Diferenciador Celestial"
    }
  },
  "306": {
    "names": {
      "th": "Inert Salsotto",
      "en": "Inert Salsotto",
      "zh-CN": "停转的萨尔索图",
      "zh-TW": "停轉的薩爾索圖",
      "ja": "自転が止まったサルソット",
      "ko": "회전을 멈춘 살소토",
      "ru": "Замершее Салсотто",
      "vi": "Salsotto Dừng Xoay",
      "id": "Inert Salsotto",
      "es": "Salsotto inerte",
      "fr": "Salsotto inerte",
      "de": "Regloses Salsotto",
      "pt": "Salsotto Inerte"
    }
  },
  "307": {
    "names": {
      "th": "Talia - Kingdom of Banditry",
      "en": "Talia: Kingdom of Banditry",
      "zh-CN": "盗贼公国塔利亚",
      "zh-TW": "盜賊公國塔利亞",
      "ja": "盗賊公国タリア",
      "ko": "도적국 탈리아",
      "ru": "Талия - край бандитов",
      "vi": "Talia - Vương Quốc Trộm Cướp",
      "id": "Talia: Kingdom of Banditry",
      "es": "Talia, paraíso de los forajidos",
      "fr": "Talia, royaume du banditisme",
      "de": "Talia – Königreich der Banditen",
      "pt": "Talia: Reino do Banditismo"
    }
  },
  "308": {
    "names": {
      "th": "Sprightly Vonwacq",
      "en": "Sprightly Vonwacq",
      "zh-CN": "生命的翁瓦克",
      "zh-TW": "生命的翁瓦克",
      "ja": "生命のウェンワーク",
      "ko": "생명의 바커 공",
      "ru": "Живой Вонвак",
      "vi": "Vonwacq Hoạt Bát",
      "id": "Sprightly Vonwacq",
      "es": "Vonwacq el vivaz",
      "fr": "La vie sur Vonwacq",
      "de": "Lebhaftes Vonwacq",
      "pt": "Vonwacq Vivaz"
    }
  },
  "309": {
    "names": {
      "th": "Rutilant Arena",
      "en": "Rutilant Arena",
      "zh-CN": "繁星竞技场",
      "zh-TW": "繁星競技場",
      "ja": "星々の競技場",
      "ko": "뭇별 경기장",
      "ru": "Звездистая арена",
      "vi": "Đấu Trường Ngôi Sao",
      "id": "Rutilant Arena",
      "es": "Arena rutilante",
      "fr": "Arène rutilante",
      "de": "Sternenarena",
      "pt": "Arena Rutilante"
    }
  },
  "310": {
    "names": {
      "th": "Broken Keel",
      "en": "Broken Keel",
      "zh-CN": "折断的龙骨",
      "zh-TW": "折斷的龍骨",
      "ja": "折れた竜骨",
      "ko": "부러진 용골",
      "ru": "Сломанный киль",
      "vi": "Bộ Khung Bị Gãy",
      "id": "Broken Keel",
      "es": "Quilla rota",
      "fr": "Quille brisée",
      "de": "Gebrochener Kiel",
      "pt": "Quilha Quebrada"
    }
  },
  "311": {
    "names": {
      "th": "Firmament Frontline: Glamoth",
      "en": "Firmament Frontline: Glamoth",
      "zh-CN": "苍穹战线格拉默",
      "zh-TW": "蒼穹戰線格拉默",
      "ja": "蒼穹戦線グラモス",
      "ko": "창공 전선 그라모스",
      "ru": "Небесный фронт Глатирамер",
      "vi": "Glamoth, Chiến Tuyến Không Trung",
      "id": "Firmament Frontline: Glamoth",
      "es": "Glamoth, frente del firmamento",
      "fr": "Glamoth, ligne de front du firmament",
      "de": "Himmelsfront Glamoth",
      "pt": "Linha de Frente: Firmamento de Glamoth"
    }
  },
  "312": {
    "names": {
      "th": "Penacony, Land of the Dreams",
      "en": "Penacony, Land of the Dreams",
      "zh-CN": "梦想之地匹诺康尼",
      "zh-TW": "夢想之地匹諾康尼",
      "ja": "夢の地ピノコニー",
      "ko": "꿈의 땅 페나코니",
      "ru": "Земля грёз Пенакония",
      "vi": "Penacony, Vùng Đất Của Những Giấc Mơ",
      "id": "Penacony, Land of the Dreams",
      "es": "Colonipenal, la tierra de los sueños",
      "fr": "Penacony, terre des rêves",
      "de": "Penacony, Land der Träume",
      "pt": "Penacony, Terra dos Sonhos"
    }
  },
  "313": {
    "names": {
      "th": "Sigonia, the Unclaimed Desolation",
      "en": "Sigonia, the Unclaimed Desolation",
      "zh-CN": "无主荒星茨冈尼亚",
      "zh-TW": "無主荒星茨岡尼亞",
      "ja": "荒涼の惑星ツガンニヤ",
      "ko": "주인 없는 황폐한 별 츠가냐",
      "ru": "Бесплодная Сигония",
      "vi": "Hành Tinh Vô Chủ Sigonia",
      "id": "Sigonia, the Unclaimed Desolation",
      "es": "Sigonia, desolación sin dueño",
      "fr": "Sigonia, terre vierge désolée",
      "de": "Verlassenes Sigonien",
      "pt": "Sigonia, a Desolação Abandonada"
    }
  },
  "314": {
    "names": {
      "th": "Izumo Gensei and Takama Divine Realm",
      "en": "Izumo Gensei and Takama Divine Realm",
      "zh-CN": "出云显世与高天神国",
      "zh-TW": "出雲顯世與高天神國",
      "ja": "顕世の出雲と高天の神国",
      "ko": "이즈모 현세와 타카마 신국",
      "ru": "Мир Идзумо и Царство Такама",
      "vi": "Izumo Hiện Thế Và Thần Quốc Cõi Trời",
      "id": "Izumo Gensei and Takama Divine Realm",
      "es": "Izumo gensei y reino divino de Takama",
      "fr": "Vie présente d'Izumo et royaume divin de Takama",
      "de": "Izumo-Gensei und Takama-Himmelreich",
      "pt": "Izumo Gensei e Reino Divino de Takama"
    }
  },
  "315": {
    "names": {
      "th": "Duran, Dynasty of Running Wolves",
      "en": "Duran, Dynasty of Running Wolves",
      "zh-CN": "奔狼的都蓝王朝",
      "zh-TW": "奔狼的都藍王朝",
      "ja": "奔狼の都藍王朝",
      "ko": "질주하는 늑대의 도람 왕조",
      "ru": "Дуранская династия волков",
      "vi": "Duran - Vương Triều Sói Hoang",
      "id": "Duran, Dynasty of Running Wolves",
      "es": "Duran, dinastía de lobos raudos",
      "fr": "Duran, dynastie des loups",
      "de": "Duran, Dynastie der rennenden Wölfe",
      "pt": "Duran, Dinastia dos Lobos Errantes"
    }
  },
  "316": {
    "names": {
      "th": "Forge of the Kalpagni Lantern",
      "en": "Forge of the Kalpagni Lantern",
      "zh-CN": "劫火莲灯铸炼宫",
      "zh-TW": "劫火蓮燈鑄煉宮",
      "ja": "劫火と蓮灯の鋳煉宮",
      "ko": "겁화 연등의 연마궁",
      "ru": "Лотосовый фонарь дворца",
      "vi": "Cung Điện Rèn Đúc Kiếp Hỏa Liên Đăng",
      "id": "Forge of the Kalpagni Lantern",
      "es": "Fragua de la linterna Kalpagni",
      "fr": "Forge de la lanterne Kalpagni",
      "de": "Schmiede der Kalpagni-Laterne",
      "pt": "Forja da Lanterna Kalpagni"
    }
  },
  "317": {
    "names": {
      "th": "Lushaka, the Sunken Seas",
      "en": "Lushaka, the Sunken Seas",
      "zh-CN": "沉陆海域露莎卡",
      "zh-TW": "沉陸海域露莎卡",
      "ja": "海に沈んだルサカ",
      "ko": "바다에 잠긴 루샤카",
      "ru": "Русалка, затопленные берега",
      "vi": "Biển Lục Địa Chìm - Lushaka",
      "id": "Lushaka, the Sunken Seas",
      "es": "Lushaka, sumergido bajo el mar",
      "fr": "Lushaka, les mers englouties",
      "de": "Lushaka, die versunkene See",
      "pt": "Lushaka, os Mares Submersos"
    }
  },
  "318": {
    "names": {
      "th": "The Wondrous BananAmusement Park",
      "en": "The Wondrous BananAmusement Park",
      "zh-CN": "奇想蕉乐园",
      "zh-TW": "奇想蕉樂園",
      "ja": "奇想天外のバナダイス",
      "ko": "기묘한 나나 낙원",
      "ru": "Чудесный банановый рай",
      "vi": "Công Viên Chuối Kỳ Ảo",
      "id": "The Wondrous BananAmusement Park",
      "es": "Parque de Platanolandia",
      "fr": "Parc de bananattractions",
      "de": "Wunbanana-Park",
      "pt": "O Maravilhoso Parque Bananalândia"
    }
  },
  "319": {
    "names": {
      "th": "Bone Collection's Serene Demesne",
      "en": "Bone Collection's Serene Demesne",
      "zh-CN": "谧宁拾骨地",
      "zh-TW": "謐寧拾骨地",
      "ja": "静謐な拾骨地",
      "ko": "고요한 습골지",
      "ru": "Безмолвная страна костей",
      "vi": "Vùng Đất Nhặt Hài Cốt Tĩnh Lặng",
      "id": "Bone Collection's Serene Demesne",
      "es": "Osario sereno",
      "fr": "Tranquille demeure des os",
      "de": "Ruhiges Anwesen für die Gebeine der Toten",
      "pt": "Domínio Sereno da Coleção de Ossos"
    }
  },
  "320": {
    "names": {
      "th": "Giant Tree of Rapt Brooding",
      "en": "Giant Tree of Rapt Brooding",
      "zh-CN": "渊思寂虑的巨树",
      "zh-TW": "淵思寂慮的巨樹",
      "ja": "深慮に浸る巨樹",
      "ko": "사색하는 거목",
      "ru": "Древо глубоких раздумий",
      "vi": "Đại Thụ Trầm Tư",
      "id": "Giant Tree of Rapt Brooding",
      "es": "Árbol gigante en meditación profunda",
      "fr": "Arbre géant des réflexions profondes",
      "de": "Riesenbaum des versunkenen Grübelns",
      "pt": "Árvore Gigante da Reflexão Arrebatadora"
    }
  },
  "321": {
    "names": {
      "th": "Arcadia of Woven Dreams",
      "en": "Arcadia of Woven Dreams",
      "zh-CN": "妖精织梦的乐园",
      "zh-TW": "妖精織夢的樂園",
      "ja": "夢を紡ぐ妖精の楽園",
      "ko": "꿈을 엮는 요정의 낙원",
      "ru": "Волшебная страна фей",
      "vi": "Thiên Đường Yêu Tinh Dệt Mộng",
      "id": "Arcadia of Woven Dreams",
      "es": "Paraíso de las hadas tejesueños",
      "fr": "Arcadie des rêves tissés",
      "de": "Traumwebendes Feenreich",
      "pt": "Arcádia dos Sonhos Tecidos"
    }
  },
  "322": {
    "names": {
      "th": "Revelry by the Sea",
      "en": "Revelry by the Sea",
      "zh-CN": "沉欢醉饮的海隅",
      "zh-TW": "沉歡醉飲的海隅",
      "ja": "酩酊の海域",
      "ko": "즐거움에 취한 바다의 일각",
      "ru": "Хмельная бухта",
      "vi": "Bờ Biển Men Say",
      "id": "Revelry by the Sea",
      "es": "Litoral embriagado",
      "fr": "Rives enivrantes",
      "de": "Küste der Weintrunkenheit",
      "pt": "Folia à Beira-Mar"
    }
  },
  "323": {
    "names": {
      "th": "Amphoreus, The Eternal Land",
      "en": "Amphoreus, The Eternal Land",
      "zh-CN": "永恒之地翁法罗斯",
      "zh-TW": "永恆之地翁法羅斯",
      "ja": "永遠の地オンパロス",
      "ko": "영원의 땅 앰포리어스",
      "ru": "Вечная земля Амфореус",
      "vi": "Vùng Đất Vĩnh Hằng Amphoreus",
      "id": "Amphoreus, The Eternal Land",
      "es": "Amphoreus, la tierra eterna",
      "fr": "Amphoreus, la terre éternelle",
      "de": "Amphoreus, Land der Ewigkeit",
      "pt": "Amphoreus, a Terra Eterna"
    }
  },
  "324": {
    "names": {
      "th": "Tengoku@Livestream",
      "en": "Tengoku@Livestream",
      "zh-CN": "天国@直播间",
      "zh-TW": "天國@直播頻道",
      "ja": "天国@配信ルーム",
      "ko": "텐고쿠@라이브스트리밍",
      "ru": "Тэнгоку @Стрим",
      "vi": "Tengoku@Livestream",
      "id": "Tengoku@Livestream",
      "es": "Tengoku@sala de chat",
      "fr": "Tengoku@Stream",
      "de": "Tengoku@Livestream",
      "pt": "Tengoku@Stream"
    }
  },
  "325": {
    "names": {
      "th": "Punklorde Stage Zero",
      "en": "Punklorde Stage Zero",
      "zh-CN": "零号关卡朋克洛德",
      "zh-TW": "零號關卡龐克洛德",
      "ja": "ステージゼロ：パンクロード",
      "ko": "0호 스테이지 펑크 로드",
      "ru": "Уровень Зеро Панклорда",
      "vi": "Punklorde Ải Zero",
      "id": "Punklorde Stage Zero",
      "es": "Etapa cero de Punklorde",
      "fr": "Punklorde : niveau zéro",
      "de": "Etappe Nr. Null von Punklorde",
      "pt": "Estágio Zero de Punklorde"
    }
  },
  "326": {
    "names": {
      "th": "City of Converging Stars",
      "en": "City of Converging Stars",
      "zh-CN": "千星荟萃之城",
      "zh-TW": "千星薈萃之城",
      "ja": "千の星が集う街",
      "ko": "천 개의 별이 모인 도시",
      "ru": "Город тысячи звёзд",
      "vi": "Thành Phố Ngàn Sao Hội Tụ",
      "id": "City of Converging Stars",
      "es": "Ciudad de las mil estrellas",
      "fr": "Épicentre du cosmos",
      "de": "Stadt der unzähligen Sterne",
      "pt": "Cidade da Convergência Estelar"
    }
  },
  "327": {
    "names": {
      "th": "Fallen Star Anchorage",
      "en": "Fallen Star Anchorage",
      "zh-CN": "坠星启航地",
      "zh-TW": "墜星啟航地",
      "ja": "墜星の出航地",
      "ko": "추락한 별의 출항지",
      "ru": "Порт падающих звёзд",
      "vi": "Điểm Khởi Hành Sao Rơi",
      "id": "Fallen Star Anchorage",
      "es": "Punto de partida de la estrella caída",
      "fr": "Ancrage de l'étoile déchue",
      "de": "Ankerplatz des gefallenen Sterns",
      "pt": "Ancoradouro da Estrela Caída"
    }
  },
  "328": {
    "names": {
      "th": "Cosmic Life Sciences Institute",
      "en": "Cosmic Life Sciences Institute",
      "zh-CN": "寰宇生研院",
      "zh-TW": "寰宇生研院",
      "ja": "宇宙生命科学研究院",
      "ko": "우주 생명과학연구원",
      "ru": "Институт биологических исследований",
      "vi": "Viện Nghiên Cứu Sinh Học Vũ Trụ",
      "id": "Cosmic Life Sciences Institute",
      "es": "Instituto de Ciencias de la Vida Cósmica",
      "fr": "Institut cosmique des Sciences de la Vie",
      "de": "Institut für kosmische Biowissenschaften",
      "pt": "Instituto de Ciências da Vida Cósmica"
    }
  }
};

export function getLightconeInfo(lcId, langOverride = null) {
  const lang = langOverride || getCurrentLanguage();
  const meta = LIGHTCONE_METADATA[lcId];
  if (!meta) {
    return {
      name: `Lightcone ${lcId}`,
      rarity: 4,
      path: translatePath("Unknown"),
      rawPath: "Unknown"
    };
  }
  const localizedName = meta.names?.[lang] || meta.names?.th || meta.names?.en || `Lightcone ${lcId}`;
  return {
    name: localizedName,
    rarity: meta.rarity,
    path: translatePath(meta.path),
    rawPath: meta.path
  };
}

export function getRelicSetInfo(setIdOrRelicId, langOverride = null) {
  const lang = langOverride || getCurrentLanguage();
  let setId = parseInt(setIdOrRelicId, 10);
  if (setId > 1000) {
    // If a 5-digit relic id like 61031 or 63045, extract the set id
    setId = Math.floor((setId % 10000) / 10);
  }
  const meta = RELIC_SET_METADATA[setId];
  if (!meta) {
    return {
      id: setId,
      name: `Relic Set ${setId}`
    };
  }
  const localizedName = meta.names?.[lang] || meta.names?.th || meta.names?.en || `Relic Set ${setId}`;
  return {
    id: setId,
    name: localizedName
  };
}
