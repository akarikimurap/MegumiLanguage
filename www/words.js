// Megumi — Kana kelime havuzu (egzersiz sonrası kelime ezberi)
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
];
