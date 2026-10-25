// Megumi Language — içerik verisi (Türkçe ana dil, İngilizce yardımcı)
// Her metin çifti: [Türkçe, English]

// ---------- KANA ----------
// [satır, hiragana, katakana, romaji]  — "・" boş hücre
const KANA_ROWS = [
  ['a',  'あいうえお', 'アイウエオ', 'a i u e o'],
  ['k',  'かきくけこ', 'カキクケコ', 'ka ki ku ke ko'],
  ['s',  'さしすせそ', 'サシスセソ', 'sa shi su se so'],
  ['t',  'たちつてと', 'タチツテト', 'ta chi tsu te to'],
  ['n',  'なにぬねの', 'ナニヌネノ', 'na ni nu ne no'],
  ['h',  'はひふへほ', 'ハヒフヘホ', 'ha hi fu he ho'],
  ['m',  'まみむめも', 'マミムメモ', 'ma mi mu me mo'],
  ['y',  'や・ゆ・よ', 'ヤ・ユ・ヨ', 'ya - yu - yo'],
  ['r',  'らりるれろ', 'ラリルレロ', 'ra ri ru re ro'],
  ['w',  'わ・・・を', 'ワ・・・ヲ', 'wa - - - wo'],
  ['nn', 'ん・・・・', 'ン・・・・', 'n - - - -'],
  ['g',  'がぎぐげご', 'ガギグゲゴ', 'ga gi gu ge go'],
  ['z',  'ざじずぜぞ', 'ザジズゼゾ', 'za ji zu ze zo'],
  ['d',  'だぢづでど', 'ダヂヅデド', 'da ji zu de do'],
  ['b',  'ばびぶべぼ', 'バビブベボ', 'ba bi bu be bo'],
  ['p',  'ぱぴぷぺぽ', 'パピプペポ', 'pa pi pu pe po'],
];
const DAKUTEN_ROWS = ['g', 'z', 'd', 'b', 'p'];

// Telaffuz ipuçları: önce harfe, sonra romajiye göre aranır
const KANA_TIPS = {
  u:   ['Türkçe "u"dan daha az yuvarlak: dudakları büzmeden, "u" ile "ı" arası.', 'Less rounded than English "oo" — keep the lips relaxed.'],
  shi: ['Türkçe "şi" gibi okunur.', 'Pronounced like "she".'],
  chi: ['Türkçe "çi" gibi okunur.', 'Pronounced like "chee".'],
  tsu: ['"t" ve "s" tek seste birleşir — Türkçede yok; "pizza"daki "zz" gibi düşün.', '"ts" as in "cats".'],
  fu:  ['"f" ile "h" arası: dişler dudağa değmez, dudaklardan hafifçe üflenir.', 'Between "f" and "h" — blow softly through the lips.'],
  ji:  ['Türkçe "ci" gibi okunur.', 'Pronounced like "jee".'],
  ra:  ['Japonca "r": dil damağa bir kez hafifçe dokunur, "r" ile "l" arası. Türkçe "r" gibi titretilmez.', 'A light tap between "r" and "l" — never rolled.'],
  ri:  ['Japonca "r": "r" ile "l" arası, tek dokunuş.', 'A light tap between "r" and "l".'],
  ru:  ['Japonca "r": "r" ile "l" arası, tek dokunuş.', 'A light tap between "r" and "l".'],
  re:  ['Japonca "r": "r" ile "l" arası, tek dokunuş.', 'A light tap between "r" and "l".'],
  ro:  ['Japonca "r": "r" ile "l" arası, tek dokunuş.', 'A light tap between "r" and "l".'],
  wo:  ['"o" diye okunur; neredeyse yalnızca nesne eki (を) olarak kullanılır.', 'Read "o"; used almost only as the object particle.'],
  n:   ['Tek başına hece olan tek ünsüz. Sonraki sese göre n / m / ng gibi duyulur.', 'The only standalone consonant; sounds like n / m / ng depending on what follows.'],
  'は': ['Konu eki olarak kullanıldığında "wa" okunur: わたしは (watashi wa).', 'Read "wa" when used as the topic particle.'],
  'へ': ['Yön eki olarak kullanıldığında "e" okunur.', 'Read "e" when used as the direction particle.'],
  'ぢ': ['Nadir kullanılır; aynı sesi genelde じ verir.', 'Rare — じ is normally used for this sound.'],
  'づ': ['Nadir kullanılır; aynı sesi genelde ず verir.', 'Rare — ず is normally used for this sound.'],
  'ヂ': ['Nadir kullanılır; aynı sesi genelde ジ verir.', 'Rare — ジ is normally used for this sound.'],
  'ヅ': ['Nadir kullanılır; aynı sesi genelde ズ verir.', 'Rare — ズ is normally used for this sound.'],
  'ー': ['Katakanada uzatma çizgisi: önceki sesliyi uzatır (コーヒー = koohii).', 'Long-vowel mark in katakana.'],
};

// ---------- KELİMELER ----------
// jp: kana, k: kanji (varsa), r: romaji, tr / en: anlam, note: [tr, en]
const VOCAB = {
  greet: [
    { jp: 'おはようございます', r: 'ohayō gozaimasu', tr: 'Günaydın', en: 'Good morning' },
    { jp: 'こんにちは', r: 'konnichiwa', tr: 'Merhaba / İyi günler', en: 'Hello / Good afternoon', note: ['Sondaki は "wa" okunur.', 'The final は is read "wa".'] },
    { jp: 'こんばんは', r: 'konbanwa', tr: 'İyi akşamlar', en: 'Good evening' },
    { jp: 'おやすみなさい', r: 'oyasuminasai', tr: 'İyi geceler', en: 'Good night' },
    { jp: 'ありがとうございます', r: 'arigatō gozaimasu', tr: 'Teşekkür ederim', en: 'Thank you' },
    { jp: 'すみません', r: 'sumimasen', tr: 'Affedersiniz / Özür dilerim', en: 'Excuse me / Sorry', note: ['Dikkat çekmek, özür dilemek ve hatta teşekkür etmek için kullanılır.', 'Used to get attention, apologise, or even thank someone.'] },
    { jp: 'はい', r: 'hai', tr: 'Evet', en: 'Yes' },
    { jp: 'いいえ', r: 'iie', tr: 'Hayır', en: 'No' },
    { jp: 'はじめまして', r: 'hajimemashite', tr: 'Tanıştığımıza memnun oldum', en: 'Nice to meet you', note: ['Yalnızca ilk tanışmada söylenir.', 'Said only when meeting for the first time.'] },
    { jp: 'よろしくおねがいします', r: 'yoroshiku onegaishimasu', tr: 'Lütfen bana iyi davranın / Memnun oldum', en: 'Please treat me kindly', note: ['Tanışmanın sonunda söylenir; Türkçede tam karşılığı yok.', 'Ends an introduction; no exact equivalent in Turkish or English.'] },
    { jp: 'さようなら', r: 'sayōnara', tr: 'Hoşça kal', en: 'Goodbye' },
    { jp: 'いただきます', r: 'itadakimasu', tr: 'Yemeğe başlarken söylenir', en: 'Said before eating', note: ['Yemeği hazırlayanlara ve yemeğe teşekkür ifadesidir; "Afiyet olsun"a yakın ama yiyen kişi söyler.', 'An expression of gratitude, said by the person about to eat.'] },
  ],
  numbers: [
    { jp: 'いち', k: '一', r: 'ichi', tr: 'bir (1)', en: 'one' },
    { jp: 'に', k: '二', r: 'ni', tr: 'iki (2)', en: 'two' },
    { jp: 'さん', k: '三', r: 'san', tr: 'üç (3)', en: 'three' },
    { jp: 'よん', k: '四', r: 'yon', tr: 'dört (4)', en: 'four', note: ['"し" diye de okunur, ama "ölüm" (死) ile aynı sesli olduğu için genelde よん tercih edilir.', 'Also read "shi", but よん is preferred since "shi" also means "death".'] },
    { jp: 'ご', k: '五', r: 'go', tr: 'beş (5)', en: 'five' },
    { jp: 'ろく', k: '六', r: 'roku', tr: 'altı (6)', en: 'six' },
    { jp: 'なな', k: '七', r: 'nana', tr: 'yedi (7)', en: 'seven', note: ['"しち" diye de okunur.', 'Also read "shichi".'] },
    { jp: 'はち', k: '八', r: 'hachi', tr: 'sekiz (8)', en: 'eight' },
    { jp: 'きゅう', k: '九', r: 'kyū', tr: 'dokuz (9)', en: 'nine' },
    { jp: 'じゅう', k: '十', r: 'jū', tr: 'on (10)', en: 'ten', note: ['Sayılar Türkçe gibi kurulur: じゅういち = on bir, にじゅう = iki on = yirmi.', 'Built like Turkish: じゅういち = ten-one (11), にじゅう = two-ten (20).'] },
    { jp: 'ひゃく', k: '百', r: 'hyaku', tr: 'yüz (100)', en: 'one hundred' },
  ],
  people: [
    { jp: 'わたし', k: '私', r: 'watashi', tr: 'ben', en: 'I' },
    { jp: 'あなた', r: 'anata', tr: 'sen / siz', en: 'you', note: ['Japoncada karşındakine adıyla hitap etmek daha kibardır; あなた az kullanılır.', 'Using the person\'s name is more polite; あなた is used sparingly.'] },
    { jp: 'ともだち', k: '友達', r: 'tomodachi', tr: 'arkadaş', en: 'friend' },
    { jp: 'せんせい', k: '先生', r: 'sensei', tr: 'öğretmen', en: 'teacher' },
    { jp: 'がくせい', k: '学生', r: 'gakusei', tr: 'öğrenci', en: 'student' },
    { jp: 'がっこう', k: '学校', r: 'gakkō', tr: 'okul', en: 'school', note: ['Küçük っ bir sonraki ünsüzü ikiler: gak-kō.', 'A small っ doubles the next consonant: gak-kō.'] },
    { jp: 'いえ', k: '家', r: 'ie', tr: 'ev', en: 'house / home' },
    { jp: 'えき', k: '駅', r: 'eki', tr: 'istasyon', en: 'station' },
    { jp: 'にほん', k: '日本', r: 'nihon', tr: 'Japonya', en: 'Japan' },
    { jp: 'トルコ', r: 'toruko', tr: 'Türkiye', en: 'Turkey' },
    { jp: 'にほんじん', k: '日本人', r: 'nihonjin', tr: 'Japon (kişi)', en: 'Japanese (person)' },
    { jp: 'トルコじん', k: 'トルコ人', r: 'torukojin', tr: 'Türk (kişi)', en: 'Turkish (person)', note: ['〜じん (人) "-li / -lı" gibi milliyet bildirir.', '〜じん (人) marks nationality.'] },
    { jp: 'にほんご', k: '日本語', r: 'nihongo', tr: 'Japonca', en: 'Japanese (language)' },
    { jp: 'トルコご', k: 'トルコ語', r: 'torukogo', tr: 'Türkçe', en: 'Turkish (language)', note: ['〜ご (語) "-ce / -ca" gibi dil bildirir.', '〜ご (語) marks a language.'] },
  ],
  food: [
    { jp: 'みず', k: '水', r: 'mizu', tr: 'su', en: 'water' },
    { jp: 'おちゃ', k: 'お茶', r: 'ocha', tr: 'çay (yeşil çay)', en: 'tea (green tea)', note: ['Türkçe "çay" ile aynı kökten: Çince 茶 (cha).', 'Same origin as Turkish "çay": Chinese 茶 (cha).'] },
    { jp: 'コーヒー', r: 'kōhī', tr: 'kahve', en: 'coffee', note: ['"ー" önceki sesliyi uzatır. Katakana yabancı kökenli kelimeler için kullanılır.', '"ー" lengthens the vowel. Katakana is used for loanwords.'] },
    { jp: 'ごはん', k: 'ご飯', r: 'gohan', tr: 'pilav / yemek', en: 'rice / meal' },
    { jp: 'パン', r: 'pan', tr: 'ekmek', en: 'bread', note: ['Portekizce "pão" kelimesinden gelir.', 'From Portuguese "pão".'] },
    { jp: 'さかな', k: '魚', r: 'sakana', tr: 'balık', en: 'fish' },
    { jp: 'にく', k: '肉', r: 'niku', tr: 'et', en: 'meat' },
    { jp: 'たまご', k: '卵', r: 'tamago', tr: 'yumurta', en: 'egg' },
    { jp: 'やさい', k: '野菜', r: 'yasai', tr: 'sebze', en: 'vegetable' },
    { jp: 'りんご', r: 'ringo', tr: 'elma', en: 'apple' },
    { jp: 'すし', k: '寿司', r: 'sushi', tr: 'suşi', en: 'sushi' },
  ],
  verbs: [
    { jp: 'たべます', k: '食べます', r: 'tabemasu', tr: 'yemek (yerim)', en: 'to eat', note: ['〜ます kibar fiil kalıbıdır; kişi eki yoktur: "yerim / yersin / yer".', '〜ます is the polite form; there is no person ending.'] },
    { jp: 'のみます', k: '飲みます', r: 'nomimasu', tr: 'içmek (içerim)', en: 'to drink' },
    { jp: 'いきます', k: '行きます', r: 'ikimasu', tr: 'gitmek (giderim)', en: 'to go' },
    { jp: 'きます', k: '来ます', r: 'kimasu', tr: 'gelmek (gelirim)', en: 'to come' },
    { jp: 'みます', k: '見ます', r: 'mimasu', tr: 'görmek / izlemek', en: 'to see / watch' },
    { jp: 'ねます', k: '寝ます', r: 'nemasu', tr: 'uyumak (uyurum)', en: 'to sleep' },
    { jp: 'よみます', k: '読みます', r: 'yomimasu', tr: 'okumak (okurum)', en: 'to read' },
    { jp: 'かきます', k: '書きます', r: 'kakimasu', tr: 'yazmak (yazarım)', en: 'to write' },
    { jp: 'はなします', k: '話します', r: 'hanashimasu', tr: 'konuşmak (konuşurum)', en: 'to speak' },
    { jp: 'かいます', k: '買います', r: 'kaimasu', tr: 'satın almak (alırım)', en: 'to buy' },
  ],
};

// ---------- DERSLER ----------
const UNITS = [
  [1, 'Hiragana', 'Hiragana'],
  [2, 'İlk adımlar', 'First steps'],
  [3, 'Katakana', 'Katakana'],
  [4, 'Günlük hayat', 'Daily life'],
];

const GRAMMAR = {
  g1: {
    sections: [
      { h: ['Türkçe gibi: fiil sonda', 'Like Turkish: verb last'],
        p: ['Japonca da Türkçe gibi Özne – Nesne – Yüklem (SOV) dizilişine sahiptir ve ekler kelimenin arkasına gelir. わたしは りんごを たべます → "Ben elma(yı) yerim" — kelime kelime aynı sıra! Bu, Türkçe konuşanlar için büyük bir avantaj.',
            'Japanese is Subject – Object – Verb, like Turkish, and particles follow the word. The word order maps one-to-one onto Turkish — a big head start.'] },
      { h: ['は (wa) — konu eki', 'は (wa) — topic marker'],
        p: ['Cümlenin neyle ilgili olduğunu gösterir. Türkçede tam karşılığı yok; "…\'e gelince / … ise" gibi düşünebilirsin. は diye yazılır ama ek olarak "wa" okunur.',
            'Marks what the sentence is about ("as for…"). Written は but read "wa" as a particle.'] },
      { h: ['です (desu) — "-dir / -(y)Im"', 'です (desu) — "is / am / are"'],
        p: ['İsimden sonra gelerek kibar bir yüklem yapar: がくせいです = "öğrenciyim / öğrencidir". Kişi eki yoktur; kim olduğu bağlamdan anlaşılır. Sondaki u genelde çok hafif okunur: "des".',
            'Makes a polite noun sentence. No person ending — context tells who. The final u is usually silent: "des".'] },
    ],
    examples: [
      { jp: 'わたしは トルコじんです。', r: 'watashi wa torukojin desu.', tr: 'Ben Türküm.', en: 'I am Turkish.' },
      { jp: 'わたしは がくせいです。', r: 'watashi wa gakusei desu.', tr: 'Ben öğrenciyim.', en: 'I am a student.' },
      { jp: 'たなかさんは せんせいです。', r: 'Tanaka-san wa sensei desu.', tr: 'Tanaka Bey/Hanım öğretmendir.', en: 'Mr./Ms. Tanaka is a teacher.' },
      { jp: 'これは みずです。', r: 'kore wa mizu desu.', tr: 'Bu sudur.', en: 'This is water.' },
    ],
    quiz: [
      { q: 'わたし＿ がくせいです。', a: 'は', o: ['は', 'を', 'に', 'の'], tr: 'Ben öğrenciyim.', en: 'I am a student.' },
      { q: 'これ＿ おちゃです。', a: 'は', o: ['は', 'を', 'で', 'か'], tr: 'Bu çaydır.', en: 'This is tea.' },
      { q: 'わたしは トルコじん＿。', a: 'です', o: ['です', 'ます', 'を', 'に'], tr: 'Ben Türküm.', en: 'I am Turkish.' },
    ],
  },
  g2: {
    sections: [
      { h: ['を (o) — belirtme hâli -(y)ı', 'を (o) — direct object'],
        p: ['Fiilin doğrudan etkilediği nesneyi gösterir, Türkçedeki -(y)ı / -(y)i gibi. Japoncada belirli/belirsiz ayrımı yoktur: "su içerim" de "suyu içerim" de みずを のみます olur. を diye yazılır, "o" okunur.',
            'Marks the direct object. Japanese makes no definite/indefinite distinction. Written を, read "o".'] },
      { h: ['に (ni) — yönelme hâli -(y)e ve zaman', 'に (ni) — destination and time'],
        p: ['Gidilen yeri gösterir: がっこうに いきます = okula giderim. Belirli zamanlar için de kullanılır: しちじに = saat yedide. Bir yerde "bulunmak" için de に kullanılır: いえに います = evdeyim.',
            'Marks destination ("to"), specific times ("at 7"), and where something exists.'] },
      { h: ['で (de) — eylemin yeri ve araç', 'で (de) — place of action and means'],
        p: ['Sesi bile Türkçedeki -de ekine benzer! Eylemin yapıldığı yeri gösterir: いえで たべます = evde yerim. Araç için "-le / ile" anlamı da taşır: バスで = otobüsle.',
            'Marks where an action takes place ("at / in") and the means ("by bus").'] },
    ],
    table: [
      ['を', '-(y)ı · suyu', 'object'],
      ['に', '-(y)e · okula / saat 7\'de', 'to / at (time)'],
      ['で', '-de · evde / -le · otobüsle', 'at (action) / by'],
    ],
    examples: [
      { jp: 'みずを のみます。', r: 'mizu o nomimasu.', tr: 'Su içerim.', en: 'I drink water.' },
      { jp: 'がっこうに いきます。', r: 'gakkō ni ikimasu.', tr: 'Okula giderim.', en: 'I go to school.' },
      { jp: 'いえで ごはんを たべます。', r: 'ie de gohan o tabemasu.', tr: 'Evde yemek yerim.', en: 'I eat a meal at home.' },
      { jp: 'バスで えきに いきます。', r: 'basu de eki ni ikimasu.', tr: 'Otobüsle istasyona giderim.', en: 'I go to the station by bus.' },
    ],
    quiz: [
      { q: 'りんご＿ たべます。', a: 'を', o: ['を', 'に', 'で', 'の'], tr: 'Elma yerim.', en: 'I eat an apple.' },
      { q: 'にほん＿ いきます。', a: 'に', o: ['に', 'を', 'の', 'か'], tr: 'Japonya\'ya giderim.', en: 'I go to Japan.' },
      { q: 'いえ＿ ほんを よみます。', a: 'で', o: ['で', 'を', 'は', 'か'], tr: 'Evde kitap okurum.', en: 'I read a book at home.' },
      { q: 'バス＿ いきます。', a: 'で', o: ['で', 'を', 'の', 'は'], tr: 'Otobüsle giderim.', en: 'I go by bus.' },
    ],
  },
  g3: {
    sections: [
      { h: ['の (no) — tamlayan -(n)ın', 'の (no) — possessive \'s / of'],
        p: ['İki ismi bağlar; sıra Türkçeyle aynıdır, sahip önce gelir: わたしの ともだち = benim arkadaşım. Japoncada iyelik eki (-ım) yoktur; の tek başına yeter. にほんごの せんせい = Japonca öğretmeni.',
            'Links two nouns, owner first — same order as Turkish. わたしの ともだち = my friend.'] },
      { h: ['か (ka) — soru eki mı / mi', 'か (ka) — question marker'],
        p: ['Cümlenin sonuna eklenerek soru yapar, Türkçedeki mı / mi gibi. Soru işareti genelde yazılmaz; nokta (。) yeterlidir.',
            'Added at the end to make a question. A question mark is usually not written.'] },
    ],
    table: [
      ['の', '-(n)ın · benim, öğretmenin', '\'s / of'],
      ['か', 'mı / mi?', 'question'],
    ],
    examples: [
      { jp: 'わたしの ともだちです。', r: 'watashi no tomodachi desu.', tr: '(O) benim arkadaşım.', en: '(He/She) is my friend.' },
      { jp: 'にほんごの せんせいです。', r: 'nihongo no sensei desu.', tr: '(O) Japonca öğretmeni.', en: '(He/She) is a Japanese teacher.' },
      { jp: 'にほんじんですか。', r: 'nihonjin desu ka.', tr: 'Japon musunuz?', en: 'Are you Japanese?' },
      { jp: 'これは なんですか。', r: 'kore wa nan desu ka.', tr: 'Bu nedir?', en: 'What is this?' },
    ],
    quiz: [
      { q: 'わたし＿ いえです。', a: 'の', o: ['の', 'を', 'に', 'で'], tr: 'Benim evim.', en: 'It\'s my house.' },
      { q: 'にほんじんです＿。', a: 'か', o: ['か', 'の', 'を', 'は'], tr: 'Japon musunuz?', en: 'Are you Japanese?' },
      { q: 'せんせい＿ ほんです。', a: 'の', o: ['の', 'で', 'か', 'を'], tr: 'Öğretmenin kitabı.', en: 'It\'s the teacher\'s book.' },
      { q: 'これは みずです＿。', a: 'か', o: ['か', 'の', 'に', 'で'], tr: 'Bu su mu?', en: 'Is this water?' },
    ],
  },
  g4: {
    sections: [
      { h: ['〜ます kalıbı', 'The 〜ます form'],
        p: ['Kibar fiil kalıbıdır. Kişi eki yoktur: たべます = yerim / yersin / yer. Geniş zaman ve gelecek zaman aynı biçimdedir: あした いきます = yarın gideceğim.',
            'The polite verb form. No person endings, and the same form covers present and future.'] },
      { h: ['Türkçe gibi ek üstüne ek', 'Suffixes stack, just like Turkish'],
        p: ['Türkçede ye-me-di nasıl kuruluyorsa, Japoncada da tabe-masen-deshita öyle kurulur: kök + olumsuzluk + geçmiş. ません ≈ -me/-ma, ました ≈ -di, ませんでした ≈ -medi.',
            'tabe-masen-deshita stacks negative + past, exactly like Turkish ye-me-di.'] },
    ],
    table: [
      ['たべます', 'yerim', 'I eat'],
      ['たべません', 'yemem', 'I don\'t eat'],
      ['たべました', 'yedim', 'I ate'],
      ['たべませんでした', 'yemedim', 'I didn\'t eat'],
    ],
    examples: [
      { jp: 'コーヒーを のみません。', r: 'kōhī o nomimasen.', tr: 'Kahve içmem.', en: 'I don\'t drink coffee.' },
      { jp: 'きのう すしを たべました。', r: 'kinō sushi o tabemashita.', tr: 'Dün suşi yedim.', en: 'I ate sushi yesterday.' },
      { jp: 'テレビを みませんでした。', r: 'terebi o mimasen deshita.', tr: 'Televizyon izlemedim.', en: 'I didn\'t watch TV.' },
      { jp: 'あした がっこうに いきます。', r: 'ashita gakkō ni ikimasu.', tr: 'Yarın okula gideceğim.', en: 'I will go to school tomorrow.' },
    ],
    quiz: [
      { q: 'すしを たべ＿。', a: 'ませんでした', o: ['ませんでした', 'ました', 'ません', 'ます'], tr: 'Suşi yemedim.', en: 'I didn\'t eat sushi.' },
      { q: 'みずを のみ＿。', a: 'ました', o: ['ました', 'ません', 'ます', 'ませんでした'], tr: 'Su içtim.', en: 'I drank water.' },
      { q: 'テレビを み＿。', a: 'ません', o: ['ません', 'ました', 'ます', 'ませんでした'], tr: 'Televizyon izlemem.', en: 'I don\'t watch TV.' },
      { q: 'あした えきに いき＿。', a: 'ます', o: ['ます', 'ました', 'ませんでした', 'です'], tr: 'Yarın istasyona gideceğim.', en: 'I will go to the station tomorrow.' },
    ],
  },
};

const LESSONS = [
  { id: 'h1', unit: 1, type: 'kana', script: 'h', rows: ['a', 'k'], icon: 'あ', title: ['Hiragana: あ – こ', 'Hiragana: a – ko'] },
  { id: 'h2', unit: 1, type: 'kana', script: 'h', rows: ['s', 't'], icon: 'さ', title: ['Hiragana: さ – と', 'Hiragana: sa – to'] },
  { id: 'h3', unit: 1, type: 'kana', script: 'h', rows: ['n', 'h'], icon: 'な', title: ['Hiragana: な – ほ', 'Hiragana: na – ho'] },
  { id: 'h4', unit: 1, type: 'kana', script: 'h', rows: ['m', 'y', 'r', 'w', 'nn'], icon: 'ま', title: ['Hiragana: ま – ん', 'Hiragana: ma – n'] },
  { id: 'h5', unit: 1, type: 'kana', script: 'h', rows: ['g', 'z'], icon: 'が', title: ['Hiragana: が – ぞ (ten-ten)', 'Hiragana: ga – zo (voiced)'] },
  { id: 'h6', unit: 1, type: 'kana', script: 'h', rows: ['d', 'b', 'p'], icon: 'ぱ', title: ['Hiragana: だ – ぽ', 'Hiragana: da – po'] },
  { id: 'v-greet', unit: 2, type: 'vocab', set: 'greet', icon: '👋', title: ['Selamlaşma', 'Greetings'] },
  { id: 'g1', unit: 2, type: 'grammar', icon: '文', title: ['Cümle yapısı, は ve です', 'Word order, は and です'] },
  { id: 'v-num', unit: 2, type: 'vocab', set: 'numbers', icon: '🔢', title: ['Sayılar', 'Numbers'] },
  { id: 'v-people', unit: 2, type: 'vocab', set: 'people', icon: '🏫', title: ['İnsanlar ve yerler', 'People and places'] },
  { id: 'g2', unit: 2, type: 'grammar', icon: '文', title: ['Ekler: を・に・で', 'Particles: を・に・で'] },
  { id: 'k1', unit: 3, type: 'kana', script: 'k', rows: ['a', 'k'], icon: 'ア', title: ['Katakana: ア – コ', 'Katakana: a – ko'] },
  { id: 'k2', unit: 3, type: 'kana', script: 'k', rows: ['s', 't'], icon: 'サ', title: ['Katakana: サ – ト', 'Katakana: sa – to'] },
  { id: 'k3', unit: 3, type: 'kana', script: 'k', rows: ['n', 'h'], icon: 'ナ', title: ['Katakana: ナ – ホ', 'Katakana: na – ho'] },
  { id: 'k4', unit: 3, type: 'kana', script: 'k', rows: ['m', 'y', 'r', 'w', 'nn'], icon: 'マ', title: ['Katakana: マ – ン', 'Katakana: ma – n'] },
  { id: 'k5', unit: 3, type: 'kana', script: 'k', rows: ['g', 'z'], icon: 'ガ', title: ['Katakana: ガ – ゾ (ten-ten)', 'Katakana: ga – zo (voiced)'] },
  { id: 'k6', unit: 3, type: 'kana', script: 'k', rows: ['d', 'b', 'p'], icon: 'パ', title: ['Katakana: ダ – ポ', 'Katakana: da – po'] },
  { id: 'v-food', unit: 4, type: 'vocab', set: 'food', icon: '🍙', title: ['Yiyecek ve içecek', 'Food and drink'] },
  { id: 'g3', unit: 4, type: 'grammar', icon: '文', title: ['Ekler: の ve か', 'Particles: の and か'] },
  { id: 'v-verbs', unit: 4, type: 'vocab', set: 'verbs', icon: '🏃', title: ['Temel fiiller', 'Basic verbs'] },
  { id: 'g4', unit: 4, type: 'grammar', icon: '文', title: ['Olumsuz ve geçmiş zaman', 'Negative and past tense'] },
];

// Ana sayfadaki "Türkçe avantajı" ipuçları
const TIPS = [
  ['Japonca da Türkçe gibi fiili sona koyar: わたしは りんごを たべます = Ben elma yerim.', 'Like Turkish, Japanese puts the verb at the end.'],
  ['İki dil de eklemelidir: たべ・ません・でした ≈ ye・me・di.', 'Both languages are agglutinative: suffixes stack after the stem.'],
  ['Japoncanın 5 sesli harfi (a i u e o) Türkçedekilere çok yakın; Türkçe okunuşla neredeyse doğru telaffuz edersin.', 'Japanese vowels closely match Turkish vowels.'],
  ['で eki Türkçedeki -de gibi: いえで たべます = evde yerim.', 'で marks where an action happens, like Turkish -de.'],
  ['Japoncada artikel (a / the) ve dilbilgisel cinsiyet yok — tıpkı Türkçe gibi.', 'No articles or grammatical gender — just like Turkish.'],
  ['Çoğul eki genelde kullanılmaz: ほん hem "kitap" hem "kitaplar" olabilir.', 'Plurals are usually unmarked: ほん = book or books.'],
  ['Soru eki か, Türkçedeki mı / mi gibi cümle sonuna gelir: にほんじんですか = Japon musunuz?', 'か ends a question, like Turkish mı / mi.'],
  ['"Çay" ve おちゃ (ocha) aynı Çince kökten gelir: 茶 (cha).', 'Turkish "çay" and Japanese おちゃ share the Chinese root 茶.'],
];
