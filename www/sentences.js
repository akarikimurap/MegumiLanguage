// Megumi — Günlük cümle havuzu (yazma pratiği)
// Biçim: kelimeler boşlukla ayrılır (yalnızca romaji için; Japonca metinde boşluk yok).
//   漢字[okunuş]  → kanji öğrenildiyse kanjiyle, öğrenilmediyse okunuşuyla (kana) yazılır
//   {は} {へ}     → ek olarak "wa" / "e" okunan は / へ
// Uygulama yalnızca öğrenilmiş kana ve kanjilerle yazılabilen cümleleri seçer.
// [cümle, tr, en]
const SENTENCES = [
  // Yalnızca kana — ilk günler için
  ['おはよう ございます。', 'Günaydın.', 'Good morning.'],
  ['ありがとう ございます。', 'Teşekkür ederim.', 'Thank you.'],
  ['いただきます。', 'Yemeğe başlarken söylenir.', 'Said before eating.'],
  ['はい、 そう です。', 'Evet, öyle.', 'Yes, that\'s right.'],
  ['いいえ、 ちがいます。', 'Hayır, değil.', 'No, that\'s wrong.'],
  ['おいしい です。', 'Lezzetli.', 'It\'s delicious.'],
  ['これ {は} なん です か。', 'Bu nedir?', 'What is this?'],
  ['ねこ が すき です。', 'Kedileri severim.', 'I like cats.'],
  ['さくら が きれい です。', 'Kiraz çiçekleri güzel.', 'The cherry blossoms are beautiful.'],
  ['はじめまして。 よろしく おねがいします。', 'Memnun oldum. Lütfen bana iyi davranın.', 'Nice to meet you.'],

  // Kişiler
  ['私[わたし] {は} 学生[がくせい] です。', 'Ben öğrenciyim.', 'I am a student.'],
  ['私[わたし] {は} トルコ人[じん] です。', 'Ben Türküm.', 'I am Turkish.'],
  ['私[わたし] の 名前[なまえ] {は} メグミ です。', 'Benim adım Megumi.', 'My name is Megumi.'],
  ['母[はは] {は} 先生[せんせい] です。', 'Annem öğretmen.', 'My mother is a teacher.'],
  ['父[ちち] {は} 元気[げんき] です。', 'Babam iyi (sağlıklı).', 'My father is well.'],
  ['子[こ]ども が 二人[ふたり] います。', 'İki çocuğum var.', 'I have two children.'],
  ['男[おとこ] の 人[ひと] と 女[おんな] の 人[ひと] が います。', 'Bir erkek ve bir kadın var.', 'There is a man and a woman.'],
  ['友達[ともだち] と 話[はな]します。', 'Arkadaşımla konuşurum.', 'I talk with my friend.'],

  // Günlük işler
  ['水[みず] を 飲[の]みます。', 'Su içerim.', 'I drink water.'],
  ['本[ほん] を 読[よ]みます。', 'Kitap okurum.', 'I read a book.'],
  ['手紙[てがみ] を 書[か]きます。', 'Mektup yazarım.', 'I write a letter.'],
  ['音楽[おんがく] を 聞[き]きます。', 'Müzik dinlerim.', 'I listen to music.'],
  ['テレビ を 見[み]ます。', 'Televizyon izlerim.', 'I watch TV.'],
  ['すし を 食[た]べました。', 'Suşi yedim.', 'I ate sushi.'],
  ['コーヒー を 飲[の]みません でした。', 'Kahve içmedim.', 'I didn\'t drink coffee.'],
  ['ラーメン を 食[た]べたい です。', 'Ramen yemek istiyorum.', 'I want to eat ramen.'],
  ['何[なに] を 食[た]べます か。', 'Ne yiyeceksin?', 'What will you eat?'],
  ['毎日[まいにち] 日本語[にほんご] を 勉強[べんきょう]します。', 'Her gün Japonca çalışırım.', 'I study Japanese every day.'],
  ['毎朝[まいあさ]、 パン を 食[た]べます。', 'Her sabah ekmek yerim.', 'I eat bread every morning.'],
  ['大学[だいがく] で 日本語[にほんご] を 学[まな]びます。', 'Üniversitede Japonca öğreniyorum.', 'I learn Japanese at university.'],
  ['午後[ごご]、 テニス を します。', 'Öğleden sonra tenis oynarım.', 'I play tennis in the afternoon.'],
  ['三時[さんじ] に 休[やす]みます。', 'Saat üçte mola veririm.', 'I take a break at three.'],
  ['外[そと] で 遊[あそ]びます。', 'Dışarıda oynarım.', 'I play outside.'],
  ['新[あたら]しい 車[くるま] を 買[か]いました。', 'Yeni bir araba aldım.', 'I bought a new car.'],

  // Yerler ve yolculuk
  ['明日[あした] 学校[がっこう] に 行[い]きます。', 'Yarın okula gideceğim.', 'I will go to school tomorrow.'],
  ['駅[えき] {は} どこ です か。', 'İstasyon nerede?', 'Where is the station?'],
  ['ホテル {は} 駅[えき] の 前[まえ] です。', 'Otel istasyonun önünde.', 'The hotel is in front of the station.'],
  ['電車[でんしゃ] で 行[い]きます。', 'Trenle giderim.', 'I go by train.'],
  ['九月[くがつ] に 日本[にほん] {へ} 行[い]きます。', 'Eylülde Japonya\'ya gideceğim.', 'I will go to Japan in September.'],
  ['来年[らいねん]、 日本[にほん] に 住[す]みたい です。', 'Gelecek yıl Japonya\'da yaşamak istiyorum.', 'I want to live in Japan next year.'],
  ['東京[とうきょう] {は} 大[おお]きい です。', 'Tokyo büyük.', 'Tokyo is big.'],
  ['右[みぎ] に 曲[ま]がって ください。', 'Lütfen sağa dönün.', 'Please turn right.'],
  ['山[やま] と 川[かわ] を 見[み]ます。', 'Dağı ve nehri görüyorum.', 'I see the mountain and the river.'],

  // Zaman, hava, alışveriş
  ['今[いま] 何時[なんじ] です か。', 'Şimdi saat kaç?', 'What time is it now?'],
  ['今日[きょう] {は} 雨[あめ] です。', 'Bugün yağmurlu.', 'It\'s raining today.'],
  ['天気[てんき] が いい です。', 'Hava güzel.', 'The weather is nice.'],
  ['北[きた] {は} 寒[さむ]い です。', 'Kuzey soğuk.', 'The north is cold.'],
  ['五分[ごふん] 待[ま]って ください。', 'Lütfen beş dakika bekleyin.', 'Please wait five minutes.'],
  ['この 店[みせ] {は} 安[やす]い です。', 'Bu dükkân ucuz.', 'This shop is cheap.'],
  ['千円[せんえん] です。', 'Bin yen.', 'It\'s 1,000 yen.'],
  ['白[しろ]い 花[はな] が 好[す]き です。', 'Beyaz çiçekleri severim.', 'I like white flowers.'],
  ['少[すこ]し 待[ま]って ください。', 'Lütfen biraz bekleyin.', 'Please wait a moment.'],
  ['駅[えき] {は} 近[ちか]い です か。', 'İstasyon yakın mı?', 'Is the station close?'],
  ['青[あお]い 空[そら] が きれい です。', 'Mavi gökyüzü çok güzel.', 'The blue sky is beautiful.'],
  ['冬[ふゆ] {は} 雪[ゆき] が 多[おお]い です。', 'Kışın çok kar yağar.', 'There is a lot of snow in winter.'],

  // Günlük rutin
  ['毎朝[まいあさ] 七時[しちじ] に 起[お]きます。', 'Her sabah saat yedide kalkarım.', 'I get up at seven every morning.'],
  ['夜[よる] 十一時[じゅういちじ] に 寝[ね]ます。', 'Gece saat on birde yatarım.', 'I go to bed at eleven at night.'],
  ['家[いえ] に 帰[かえ]ります。', 'Eve dönüyorum.', 'I\'m going home.'],
  ['料理[りょうり] を 作[つく]ります。', 'Yemek yaparım.', 'I cook.'],
  ['図書館[としょかん] で 勉強[べんきょう]します。', 'Kütüphanede ders çalışırım.', 'I study at the library.'],
  ['自転車[じてんしゃ] で 学校[がっこう] に 行[い]きます。', 'Okula bisikletle giderim.', 'I go to school by bicycle.'],
  ['映画[えいが] を 見[み]ました。', 'Film izledim.', 'I watched a movie.'],
  ['写真[しゃしん] を 見[み]せて ください。', 'Lütfen fotoğrafı gösterin.', 'Please show me the photo.'],
  ['家族[かぞく] と 海[うみ] に 行[い]きました。', 'Ailemle denize gittim.', 'I went to the sea with my family.'],
  ['夏休[なつやす]み に 旅行[りょこう]します。', 'Yaz tatilinde seyahat ederim.', 'I travel during the summer vacation.'],
  ['兄[あに] {は} 医者[いしゃ] です。', 'Ağabeyim doktor.', 'My older brother is a doctor.'],
  ['犬[いぬ] が 好[す]き です。', 'Köpekleri severim.', 'I like dogs.'],
  ['漢字[かんじ] {は} 楽[たの]しい です。', 'Kanji eğlenceli.', 'Kanji is fun.'],
];
