// Megumi Language — Kana kelime havuzu (egzersiz sonrası kelime ezberi)
// [kana, tr, en, kanji?]  — romaji otomatik üretilir.
// Uygulama, yalnızca öğrenilmiş + o egzersizde çalışılan harflerle yazılabilen kelimeleri seçer.
// VOCAB'daki kelimeler ve kanji örnek kelimeleri de havuza otomatik eklenir.
const KANA_WORDS = [
  // あ–こ
  ['あい', 'sevgi, aşk', 'love', '愛'], ['あお', 'mavi', 'blue', '青'], ['あかい', 'kırmızı', 'red', '赤い'],
  ['うえ', 'üst, yukarı', 'above', '上'], ['かお', 'yüz (surat)', 'face', '顔'], ['こえ', 'ses (insan sesi)', 'voice', '声'],
  ['あき', 'sonbahar', 'autumn', '秋'], ['ここ', 'burası', 'here'], ['おおきい', 'büyük', 'big', '大きい'],
  ['きく', 'dinlemek, duymak', 'to listen', '聞く'], ['いけ', 'gölet', 'pond', '池'],
  // さ–と
  ['あさ', 'sabah', 'morning', '朝'], ['いす', 'sandalye', 'chair'], ['うた', 'şarkı', 'song', '歌'],
  ['した', 'alt, aşağı', 'below', '下'], ['そと', 'dışarı', 'outside', '外'], ['くつ', 'ayakkabı', 'shoes', '靴'],
  ['たかい', 'yüksek; pahalı', 'tall; expensive', '高い'], ['ちいさい', 'küçük', 'small', '小さい'],
  ['あした', 'yarın', 'tomorrow', '明日'], ['かさ', 'şemsiye', 'umbrella', '傘'], ['おいしい', 'lezzetli', 'delicious'],
  ['せかい', 'dünya', 'world', '世界'], ['とけい', 'saat (alet)', 'clock, watch', '時計'], ['ちかてつ', 'metro', 'subway', '地下鉄'],
  // な–ほ
  ['なつ', 'yaz', 'summer', '夏'], ['はな', 'çiçek', 'flower', '花'], ['ひと', 'insan, kişi', 'person', '人'],
  ['ふね', 'gemi', 'ship', '船'], ['ねこ', 'kedi', 'cat', '猫'], ['いぬ', 'köpek', 'dog', '犬'],
  ['なに', 'ne', 'what', '何'], ['ほし', 'yıldız', 'star', '星'], ['おなか', 'karın', 'stomach'],
  ['はし', 'yemek çubukları', 'chopsticks', '箸'], ['にし', 'batı', 'west', '西'], ['ひこうき', 'uçak', 'airplane', '飛行機'],
  ['なか', 'iç', 'inside', '中'],
  // ま–ん
  ['やま', 'dağ', 'mountain', '山'], ['まち', 'kasaba, şehir', 'town', '町'], ['もり', 'orman', 'forest', '森'],
  ['はる', 'ilkbahar', 'spring', '春'], ['よる', 'gece', 'night', '夜'], ['くるま', 'araba', 'car', '車'],
  ['ゆき', 'kar', 'snow', '雪'], ['さくら', 'kiraz çiçeği', 'cherry blossom', '桜'], ['ほん', 'kitap', 'book', '本'],
  ['みみ', 'kulak', 'ear', '耳'], ['め', 'göz', 'eye', '目'], ['くすり', 'ilaç', 'medicine', '薬'],
  ['へや', 'oda', 'room', '部屋'], ['やすみ', 'tatil, izin', 'holiday', '休み'], ['あめ', 'yağmur', 'rain', '雨'],
  ['むし', 'böcek', 'insect', '虫'], ['おかあさん', 'anne', 'mother', 'お母さん'], ['りょこう', 'seyahat', 'travel', '旅行'],
  // が–ぞ
  ['かぜ', 'rüzgâr; nezle', 'wind; a cold', '風'], ['かぞく', 'aile', 'family', '家族'], ['ぎんこう', 'banka', 'bank', '銀行'],
  ['かぎ', 'anahtar', 'key', '鍵'], ['めがね', 'gözlük', 'glasses', '眼鏡'], ['ありがとう', 'teşekkürler', 'thanks'],
  ['ぞう', 'fil', 'elephant', '象'], ['すずしい', 'serin', 'cool (weather)', '涼しい'], ['ひがし', 'doğu', 'east', '東'],
  ['げんき', 'sağlıklı, enerjik', 'healthy, energetic', '元気'],
  // だ–ぽ
  ['でんわ', 'telefon', 'telephone', '電話'], ['えんぴつ', 'kurşun kalem', 'pencil', '鉛筆'], ['ぶた', 'domuz', 'pig', '豚'],
  ['てんぷら', 'tempura', 'tempura'], ['からだ', 'vücut', 'body', '体'], ['まど', 'pencere', 'window', '窓'],
  ['ひだり', 'sol', 'left', '左'], ['さんぽ', 'yürüyüş', 'a walk', '散歩'], ['でんしゃ', 'tren', 'train', '電車'],
  ['たべもの', 'yiyecek', 'food', '食べ物'], ['どこ', 'nerede', 'where'], ['だれ', 'kim', 'who', '誰'],
  ['ばんごはん', 'akşam yemeği', 'dinner', '晩ご飯'], ['おとうさん', 'baba', 'father', 'お父さん'],
  // カタカナ
  ['ケーキ', 'pasta, kek', 'cake'], ['ココア', 'kakao (içecek)', 'cocoa'], ['カカオ', 'kakao', 'cacao'], ['オーケー', 'tamam', 'OK'],
  ['アイス', 'dondurma', 'ice cream'], ['スキー', 'kayak', 'skiing'], ['テスト', 'sınav, test', 'test'], ['タクシー', 'taksi', 'taxi'],
  ['スーツ', 'takım elbise', 'suit'], ['セーター', 'kazak', 'sweater'], ['トースト', 'tost', 'toast'], ['テキスト', 'ders kitabı', 'textbook'],
  ['ネクタイ', 'kravat', 'necktie'], ['ノート', 'defter', 'notebook'], ['ナイフ', 'bıçak', 'knife'], ['テニス', 'tenis', 'tennis'],
  ['ヒーター', 'ısıtıcı', 'heater'],
  ['ラーメン', 'ramen', 'ramen'], ['ホテル', 'otel', 'hotel'], ['カメラ', 'fotoğraf makinesi', 'camera'], ['レストラン', 'restoran', 'restaurant'],
  ['アメリカ', 'Amerika', 'America'], ['ワイン', 'şarap', 'wine'], ['ミルク', 'süt', 'milk'], ['タオル', 'havlu', 'towel'],
  ['メロン', 'kavun', 'melon'], ['メニュー', 'menü', 'menu'],
  ['ゲーム', 'oyun', 'game'], ['ガム', 'sakız', 'chewing gum'], ['ギター', 'gitar', 'guitar'], ['ズボン', 'pantolon', 'trousers'],
  ['ガラス', 'cam', 'glass'], ['チーズ', 'peynir', 'cheese'], ['サングラス', 'güneş gözlüğü', 'sunglasses'],
  ['テレビ', 'televizyon', 'TV'], ['バス', 'otobüs', 'bus'], ['デパート', 'alışveriş merkezi', 'department store'], ['ビール', 'bira', 'beer'],
  ['ペン', 'kalem', 'pen'], ['ドア', 'kapı', 'door'], ['ベッド', 'yatak', 'bed'], ['パスポート', 'pasaport', 'passport'],
  ['コンビニ', 'market (7/24)', 'convenience store'], ['ドイツ', 'Almanya', 'Germany'], ['パソコン', 'bilgisayar', 'PC'],

  // ---- Genişletilmiş havuz ----
  // Günlük hayat
  ['あさごはん', 'kahvaltı', 'breakfast', '朝ご飯'], ['ひるごはん', 'öğle yemeği', 'lunch', '昼ご飯'], ['しゅくだい', 'ev ödevi', 'homework', '宿題'],
  ['しごと', 'iş', 'work, job', '仕事'], ['かいしゃ', 'şirket', 'company', '会社'], ['しけん', 'sınav', 'exam', '試験'],
  ['じしょ', 'sözlük', 'dictionary', '辞書'], ['しんぶん', 'gazete', 'newspaper', '新聞'], ['ざっし', 'dergi', 'magazine', '雑誌'],
  ['てがみ', 'mektup', 'letter', '手紙'], ['きっぷ', 'bilet', 'ticket', '切符'], ['にもつ', 'bagaj, eşya', 'luggage', '荷物'],
  ['さいふ', 'cüzdan', 'wallet', '財布'], ['ぼうし', 'şapka', 'hat', '帽子'], ['ふく', 'giysi', 'clothes', '服'],
  ['おかね', 'para', 'money', 'お金'], ['ねだん', 'fiyat', 'price', '値段'], ['みせ', 'dükkân', 'shop', '店'],
  ['としょかん', 'kütüphane', 'library', '図書館'], ['びょういん', 'hastane', 'hospital', '病院'], ['こうえん', 'park', 'park', '公園'],
  ['くうこう', 'havalimanı', 'airport', '空港'], ['みち', 'yol', 'road', '道'], ['はし', 'köprü', 'bridge', '橋'],
  ['いりぐち', 'giriş', 'entrance', '入口'], ['でぐち', 'çıkış', 'exit', '出口'], ['だいどころ', 'mutfak', 'kitchen', '台所'],
  ['おふろ', 'banyo (küvet)', 'bath', 'お風呂'], ['トイレ', 'tuvalet', 'toilet'], ['つくえ', 'masa', 'desk', '机'],
  ['えいが', 'film', 'movie', '映画'], ['しゃしん', 'fotoğraf', 'photo', '写真'], ['おんがく', 'müzik', 'music', '音楽'],
  ['どうぶつ', 'hayvan', 'animal', '動物'], ['とり', 'kuş', 'bird', '鳥'], ['うま', 'at', 'horse', '馬'],
  ['そら', 'gökyüzü', 'sky', '空'], ['うみ', 'deniz', 'sea', '海'], ['かわ', 'nehir', 'river', '川'],
  ['ふゆ', 'kış', 'winter', '冬'], ['くも', 'bulut', 'cloud', '雲'], ['てんき', 'hava durumu', 'weather', '天気'],
  // Kişiler ve aile
  ['りょうしん', 'anne baba', 'parents', '両親'], ['こども', 'çocuk', 'child', '子供'],
  ['おとな', 'yetişkin', 'adult', '大人'], ['おとこのこ', 'erkek çocuk', 'boy', '男の子'], ['おんなのこ', 'kız çocuk', 'girl', '女の子'],
  ['いしゃ', 'doktor', 'doctor', '医者'], ['けいさつ', 'polis', 'police', '警察'], ['みんな', 'herkes', 'everyone'],
  // Zaman
  ['きのう', 'dün', 'yesterday', '昨日'], ['きょう', 'bugün', 'today', '今日'], ['いま', 'şimdi', 'now', '今'],
  ['まいにち', 'her gün', 'every day', '毎日'], ['こんしゅう', 'bu hafta', 'this week', '今週'], ['らいねん', 'gelecek yıl', 'next year', '来年'],
  ['きょねん', 'geçen yıl', 'last year', '去年'], ['じかん', 'zaman, süre', 'time', '時間'], ['いつ', 'ne zaman', 'when'],
  // Sıfatlar
  ['あたらしい', 'yeni', 'new', '新しい'], ['ふるい', 'eski', 'old (things)', '古い'], ['やすい', 'ucuz', 'cheap', '安い'],
  ['ながい', 'uzun', 'long', '長い'], ['みじかい', 'kısa', 'short', '短い'], ['おもい', 'ağır', 'heavy', '重い'],
  ['かるい', 'hafif', 'light', '軽い'], ['はやい', 'erken; hızlı', 'early; fast', '早い'], ['おそい', 'geç, yavaş', 'late, slow', '遅い'],
  ['あつい', 'sıcak (hava)', 'hot (weather)', '暑い'], ['さむい', 'soğuk (hava)', 'cold (weather)', '寒い'], ['つめたい', 'soğuk (dokununca)', 'cold (to touch)', '冷たい'],
  ['あかるい', 'aydınlık', 'bright', '明るい'], ['くらい', 'karanlık', 'dark', '暗い'], ['しずか', 'sessiz', 'quiet', '静か'],
  ['にぎやか', 'canlı, kalabalık', 'lively'], ['きれい', 'güzel; temiz', 'pretty; clean'], ['たのしい', 'eğlenceli', 'fun', '楽しい'],
  ['むずかしい', 'zor', 'difficult', '難しい'], ['やさしい', 'nazik; kolay', 'kind; easy', '優しい'], ['いそがしい', 'meşgul', 'busy', '忙しい'],
  ['わかい', 'genç', 'young', '若い'], ['いたい', 'acıyan', 'painful', '痛い'], ['だいじょうぶ', 'iyi, sorun yok', 'all right', '大丈夫'],
  // Fiiller (sözlük biçimi)
  ['いく', 'gitmek', 'to go', '行く'], ['くる', 'gelmek', 'to come', '来る'], ['かえる', 'dönmek', 'to return', '帰る'],
  ['たべる', 'yemek', 'to eat', '食べる'], ['のむ', 'içmek', 'to drink', '飲む'], ['みる', 'görmek, izlemek', 'to see', '見る'],
  ['よむ', 'okumak', 'to read', '読む'], ['かく', 'yazmak', 'to write', '書く'], ['はなす', 'konuşmak', 'to speak', '話す'],
  ['おきる', 'kalkmak', 'to get up', '起きる'], ['ねる', 'uyumak', 'to sleep', '寝る'], ['はたらく', 'çalışmak', 'to work', '働く'],
  ['あるく', 'yürümek', 'to walk', '歩く'], ['はしる', 'koşmak', 'to run', '走る'], ['およぐ', 'yüzmek', 'to swim', '泳ぐ'],
  ['まつ', 'beklemek', 'to wait', '待つ'], ['あう', 'buluşmak', 'to meet', '会う'], ['おぼえる', 'ezberlemek', 'to memorize', '覚える'],
  ['わすれる', 'unutmak', 'to forget', '忘れる'], ['わかる', 'anlamak', 'to understand', '分かる'], ['しる', 'öğrenmek, bilmek', 'to know', '知る'],
  ['すむ', 'oturmak, yaşamak', 'to live', '住む'], ['つかう', 'kullanmak', 'to use', '使う'], ['つくる', 'yapmak', 'to make', '作る'],
  ['あける', 'açmak', 'to open', '開ける'], ['しめる', 'kapatmak', 'to close', '閉める'], ['いれる', 'koymak, sokmak', 'to put in', '入れる'],
  ['でる', 'çıkmak', 'to go out', '出る'], ['はいる', 'girmek', 'to enter', '入る'], ['のる', 'binmek', 'to ride', '乗る'],
  ['おりる', 'inmek', 'to get off', '降りる'], ['あらう', 'yıkamak', 'to wash', '洗う'], ['きる', 'giymek', 'to wear', '着る'],
  ['あそぶ', 'oynamak', 'to play', '遊ぶ'], ['うたう', 'şarkı söylemek', 'to sing', '歌う'], ['わらう', 'gülmek', 'to laugh', '笑う'],
  ['なく', 'ağlamak', 'to cry', '泣く'], ['おしえる', 'öğretmek', 'to teach', '教える'], ['ならう', 'öğrenmek', 'to learn', '習う'],
  // Katakana
  ['スマホ', 'akıllı telefon', 'smartphone'], ['アプリ', 'uygulama', 'app'], ['メール', 'e-posta', 'email'],
  ['インターネット', 'internet', 'internet'], ['ゲームセンター', 'oyun salonu', 'arcade'], ['アニメ', 'anime', 'anime'],
  ['マンガ', 'manga', 'manga'], ['カレー', 'köri', 'curry'], ['ジュース', 'meyve suyu', 'juice'],
  ['コップ', 'bardak', 'cup, glass'], ['シャワー', 'duş', 'shower'], ['エレベーター', 'asansör', 'elevator'],
  ['スーパー', 'süpermarket', 'supermarket'], ['アルバイト', 'yarı zamanlı iş', 'part-time job'], ['クラス', 'sınıf', 'class'],
];
