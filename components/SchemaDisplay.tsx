
import React, { useState } from 'react';

const sqlSchema = `
-- 1. Profiles Table
-- Stores user information. The 'name' must be unique.
-- The 'password_hash' column is added for the custom authentication logic.
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text UNIQUE NOT NULL,
  avatar_url text,
  password_hash text NOT NULL,
  last_ip text,
  country text
);

-- 2. Books Table
-- Stores the predefined books available in the library.
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  summary text NOT NULL
);

-- 3. Characters Table
-- Stores characters associated with each book.
CREATE TABLE characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  persona text NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL
);

-- 4. Story States Table
-- Saves a user's progress within a specific book's story mode.
CREATE TABLE story_states (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  story_progress integer DEFAULT 0,
  inventory jsonb DEFAULT '[]'::jsonb,
  discoveries jsonb DEFAULT '[]'::jsonb,
  PRIMARY KEY (user_id, book_id)
);

-- 5. Chat Histories Table
-- Saves the chat history between a user and a character.
CREATE TABLE chat_histories (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  character_id uuid REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  PRIMARY KEY (user_id, character_id)
);

-- 6. Novel Suggestions Table
-- Stores suggestions for new novels submitted by users.
CREATE TABLE novel_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  author text
);

-- 7. Discovery Posts Table
-- Stores user-generated posts for the "Discover" feature.
CREATE TABLE discovery_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('discussion', 'recommendation')),
  title text NOT NULL,
  content text NOT NULL
);

-- 8. Discovery Post Likes Table
-- Tracks likes on discovery posts.
CREATE TABLE discovery_post_likes (
  post_id uuid REFERENCES discovery_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 9. Discovery Post Replies Table
-- Stores replies to discovery posts.
CREATE TABLE discovery_post_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  post_id uuid REFERENCES discovery_posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL
);
`;

const sqlSeedData = `
-- This script inserts all 100 novels and their associated characters.
-- It's designed to be run once on a fresh database created with the schema.
DO $$
DECLARE
    -- Book ID variables
    book_id_0 UUID; book_id_1 UUID; book_id_2 UUID; book_id_3 UUID; book_id_4 UUID;
    book_id_5 UUID; book_id_6 UUID; book_id_7 UUID; book_id_8 UUID; book_id_9 UUID;
    book_id_10 UUID; book_id_11 UUID; book_id_12 UUID; book_id_13 UUID; book_id_14 UUID;
    book_id_15 UUID; book_id_16 UUID; book_id_17 UUID; book_id_18 UUID; book_id_19 UUID;
    book_id_20 UUID; book_id_21 UUID; book_id_22 UUID; book_id_23 UUID; book_id_24 UUID;
    book_id_25 UUID; book_id_26 UUID; book_id_27 UUID; book_id_28 UUID; book_id_29 UUID;
    book_id_30 UUID; book_id_31 UUID; book_id_32 UUID; book_id_33 UUID; book_id_34 UUID;
    book_id_35 UUID; book_id_36 UUID; book_id_37 UUID; book_id_38 UUID; book_id_39 UUID;
    book_id_40 UUID; book_id_41 UUID; book_id_42 UUID; book_id_43 UUID; book_id_44 UUID;
    book_id_45 UUID; book_id_46 UUID; book_id_47 UUID; book_id_48 UUID; book_id_49 UUID;
    book_id_50 UUID; book_id_51 UUID; book_id_52 UUID; book_id_53 UUID; book_id_54 UUID;
    book_id_55 UUID; book_id_56 UUID; book_id_57 UUID; book_id_58 UUID; book_id_59 UUID;
    book_id_60 UUID; book_id_61 UUID; book_id_62 UUID; book_id_63 UUID; book_id_64 UUID;
    book_id_65 UUID; book_id_66 UUID; book_id_67 UUID; book_id_68 UUID; book_id_69 UUID;
    book_id_70 UUID; book_id_71 UUID; book_id_72 UUID; book_id_73 UUID; book_id_74 UUID;
    book_id_75 UUID; book_id_76 UUID; book_id_77 UUID; book_id_78 UUID; book_id_79 UUID;
    book_id_80 UUID; book_id_81 UUID; book_id_82 UUID; book_id_83 UUID; book_id_84 UUID;
    book_id_85 UUID; book_id_86 UUID; book_id_87 UUID; book_id_88 UUID; book_id_89 UUID;
    book_id_90 UUID; book_id_91 UUID; book_id_92 UUID; book_id_93 UUID; book_id_94 UUID;
    book_id_95 UUID; book_id_96 UUID; book_id_97 UUID; book_id_98 UUID; book_id_99 UUID;
BEGIN
    -- Insert Books and capture their generated UUIDs
    INSERT INTO books (title, author, summary) VALUES ('الغريب', 'ألبير كامو', 'رواية تستكشف مواضيع العبثية، لامبالاة الكون، وعواقب العيش دون ادعاءات مجتمعية.') RETURNING id INTO book_id_0;
    INSERT INTO books (title, author, summary) VALUES ('الجريمة والعقاب', 'فيودور دوستويفسكي', 'رواية نفسية تغوص في عقل طالب سابق مضطرب يرتكب جريمة قتل ويتصارع مع الشعور بالذنب الهائل والعواقب الأخلاقية لأفعاله.') RETURNING id INTO book_id_1;
    INSERT INTO books (title, author, summary) VALUES ('كثيب', 'فرانك هربرت', 'ملحمة خيال علمي تدور أحداثها على كوكب الصحراء أراكيس، وتركز على الصراعات السياسية والدينية والبيئية لشاب نبيل مقدر له العظمة.') RETURNING id INTO book_id_2;
    INSERT INTO books (title, author, summary) VALUES ('مئة عام من العزلة', 'غابرييل غارسيا ماركيز', 'ملحمة أجيال تروي قصة عائلة بوينديا في قرية ماكوندو الخيالية، وتستكشف موضوعات القدر، الوحدة، وتأثير الزمن.') RETURNING id INTO book_id_3;
    INSERT INTO books (title, author, summary) VALUES ('1984', 'جورج أورويل', 'رؤية ديستوبية مرعبة لمجتمع يخضع للرقابة الحكومية المطلقة، حيث "الأخ الأكبر يراقبك دائمًا" ويتم التلاعب بالحقيقة والتاريخ.') RETURNING id INTO book_id_4;
    INSERT INTO books (title, author, summary) VALUES ('كبرياء وتحامل', 'جين أوستن', 'قصة حب كلاسيكية ذكية وساخرة حول سوء الفهم الأولي والتحيزات الاجتماعية في إنجلترا خلال القرن التاسع عشر.') RETURNING id INTO book_id_5;
    INSERT INTO books (title, author, summary) VALUES ('غاتسبي العظيم', 'ف. سكوت فيتزجيرالد', 'قصة عن الثراء المفرط، الحب المستحيل، والحلم الأمريكي المتلاشي خلال "العشرينات الصاخبة" في أمريكا.') RETURNING id INTO book_id_6;
    INSERT INTO books (title, author, summary) VALUES ('أن تقتل طائرا بريئا', 'هاربر لي', 'رواية مؤثرة عن الظلم العنصري وفقدان البراءة في جنوب أمريكا، تُروى من خلال عيون طفلة صغيرة.') RETURNING id INTO book_id_7;
    INSERT INTO books (title, author, summary) VALUES ('سيد الخواتم', 'ج. ر. ر. تولكين', 'ملحمة فانتازيا كبرى عن رحلة هوبيت شاب لتدمير خاتم قوي وإنقاذ الأرض الوسطى من سيد الظلام سورون.') RETURNING id INTO book_id_8;
    INSERT INTO books (title, author, summary) VALUES ('هاري بوتر وحجر الفيلسوف', 'ج. ك. رولينج', 'بداية رحلة الساحر الشاب هاري بوتر في مدرسة هوجورتس للسحر والشعوذة واكتشافه لمصيره في مواجهة اللورد فولدمورت.') RETURNING id INTO book_id_9;
    INSERT INTO books (title, author, summary) VALUES ('الخيميائي', 'باولو كويلو', 'حكاية رمزية عن راعٍ أندلسي شاب يدعى سانتياغو يسافر في رحلة ملهمة بحثًا عن كنز، ليكتشف أهمية اتباع أحلامه.') RETURNING id INTO book_id_10;
    INSERT INTO books (title, author, summary) VALUES ('الحارس في حقل الشوفان', 'ج. د. سالينجر', 'رواية مثيرة للجدل عن قلق المراهقة، التمرد، والنفاق الاجتماعي من وجهة نظر الشاب هولدن كولفيلد.') RETURNING id INTO book_id_11;
    INSERT INTO books (title, author, summary) VALUES ('مزرعة الحيوان', 'جورج أورويل', 'حكاية رمزية سياسية تصور ثورة حيوانات المزرعة ضد أسيادهم من البشر، والتي تنحدر تدريجيًا إلى استبداد جديد.') RETURNING id INTO book_id_12;
    INSERT INTO books (title, author, summary) VALUES ('البؤساء', 'فيكتور هوغو', 'رواية ملحمية تتابع حياة عدة شخصيات في فرنسا على مدى 17 عامًا، وتستكشف مواضيع العدالة، الظلم، والحب الفدائي.') RETURNING id INTO book_id_13;
    INSERT INTO books (title, author, summary) VALUES ('دون كيخوتي', 'ميغيل دي سرفانتس', 'قصة رجل نبيل مهووس بقصص الفروسية يقرر أن يصبح فارسًا جوالًا، في مغامرات كوميدية ومأساوية مع تابعه سانشو بانزا.') RETURNING id INTO book_id_14;
    INSERT INTO books (title, author, summary) VALUES ('الحرب والسلام', 'ليو تولستوي', 'ملحمة واسعة تصور تأثير غزو نابليون لروسيا على حياة خمس عائلات أرستقراطية، مع تأملات فلسفية عميقة.') RETURNING id INTO book_id_15;
    INSERT INTO books (title, author, summary) VALUES ('موبي ديك', 'هيرمان ملفيل', 'حكاية هوس الكابتن Ahab بالانتقام من حوت أبيض عملاق، في رحلة بحرية ملحمية تستكشف الخير والشر والطبيعة.') RETURNING id INTO book_id_16;
    INSERT INTO books (title, author, summary) VALUES ('الإخوة كارامازوف', 'فيودور دوستويفسكي', 'رواية فلسفية عميقة تتمحور حول جريمة قتل أب، وتستكشف نقاشات حول الإيمان، الشك، والأخلاق من خلال ثلاثة إخوة.') RETURNING id INTO book_id_17;
    INSERT INTO books (title, author, summary) VALUES ('المحاكمة', 'فرانتس كافكا', 'قصة كابوسية عن رجل يُعتقل ويُحاكم من قبل سلطة غامضة على جريمة لم يُكشف له عنها أبدًا.') RETURNING id INTO book_id_18;
    INSERT INTO books (title, author, summary) VALUES ('عناقيد الغضب', 'جون ستاينبيك', 'تصوير مؤثر لعائلة من المزارعين النازحين خلال فترة الكساد الكبير في أمريكا ورحلتهم الصعبة إلى كاليفورنيا.') RETURNING id INTO book_id_19;
    INSERT INTO books (title, author, summary) VALUES ('اسم الوردة', 'أومبرتو إكو', 'رواية بوليسية تاريخية تدور أحداثها في دير إيطالي بالقرن الرابع عشر، حيث يحقق راهب فرنسيسكاني في سلسلة من جرائم القتل الغامضة.') RETURNING id INTO book_id_20;
    INSERT INTO books (title, author, summary) VALUES ('عالم جديد شجاع', 'ألدوس هكسلي', 'رواية ديستوبية عن مجتمع مستقبلي يعيش في سعادة مصطنعة من خلال الهندسة الوراثية والتكييف النفسي والعقاقير.') RETURNING id INTO book_id_21;
    INSERT INTO books (title, author, summary) VALUES ('سيد الذباب', 'ويليام غولدنغ', 'قصة مجموعة من التلاميذ البريطانيين الذين تقطعت بهم السبل على جزيرة مهجورة، وكيف يتحولون تدريجيًا إلى الوحشية.') RETURNING id INTO book_id_22;
    INSERT INTO books (title, author, summary) VALUES ('فرانكشتاين', 'ماري شيلي', 'حكاية قوطية عن عالم شاب طموح يخلق كائنًا حيًا، ثم يرفضه، مما يؤدي إلى عواقب مأساوية لكليهما.') RETURNING id INTO book_id_23;
    INSERT INTO books (title, author, summary) VALUES ('دراكولا', 'برام ستوكر', 'رواية رعب قوطية شهيرة عن محاولة الكونت دراكولا الانتقال من ترانسيلفANIA إلى إنجلترا لنشر لعنة الموتى الأحياء.') RETURNING id INTO book_id_24;
    INSERT INTO books (title, author, summary) VALUES ('صورة دوريان جراي', 'أوسكار وايلد', 'رواية فلسفية عن شاب يظل شابًا وجميلًا إلى الأبد، بينما تتقدم صورته في العمر وتظهر عليها آثار خطاياه.') RETURNING id INTO book_id_25;
    INSERT INTO books (title, author, summary) VALUES ('مرتفعات وذرنغ', 'إميلي برونتي', 'قصة حب عنيفة وانتقامية تدور أحداثها في المرتفعات الإنجليزية البرية، وتستمر عبر أجيال.') RETURNING id INTO book_id_26;
    INSERT INTO books (title, author, summary) VALUES ('جين آير', 'شارلوت برونتي', 'رواية مؤثرة عن حياة مربية يتيمة وقوية الإرادة تقع في حب سيدها الغامض، السيد روتشستر.') RETURNING id INTO book_id_27;
    INSERT INTO books (title, author, summary) VALUES ('قصة مدينتين', 'تشارلز ديكنز', 'رواية تاريخية تدور أحداثها بين لندن وباريس قبل وأثناء الثورة الفرنسية، وتستكشف موضوعات التضحية والبعث.') RETURNING id INTO book_id_28;
    INSERT INTO books (title, author, summary) VALUES ('الكونت دي مونت كريستو', 'ألكسندر دوما', 'مغامرة مثيرة عن رجل اتُهم ظلمًا وسُجن، يهرب بعد سنوات ليجد ثروة هائلة وينتقم من الذين خانوه.') RETURNING id INTO book_id_29;
    INSERT INTO books (title, author, summary) VALUES ('حول العالم في ثمانين يوما', 'جول فيرن', 'مغامرة سريعة الإيقاع للمخترع الإنجليزي فيلياس فوج وتابعه، الذين يراهنون على إمكانية السفر حول العالم في 80 يومًا.') RETURNING id INTO book_id_30;
    INSERT INTO books (title, author, summary) VALUES ('أليس في بلاد العجائب', 'لويس كارول', 'حكاية خيالية عن فتاة تسقط في جحر أرنب لتجد نفسها في عالم غريب ومدهش مليء بالشخصيات العجيبة.') RETURNING id INTO book_id_31;
    INSERT INTO books (title, author, summary) VALUES ('الهوبيت', 'ج. ر. ر. تولكين', 'مقدمة لـ "سيد الخواتم"، تروي مغامرة الهوبيت بيلبو باجنز الذي ينضم إلى مجموعة من الأقزام لاستعادة كنزهم من التنين سموج.') RETURNING id INTO book_id_32;
    INSERT INTO books (title, author, summary) VALUES ('أساس', 'إسحاق أسيموف', 'ملحمة خيال علمي عن عالم رياضيات يتنبأ بانهيار إمبراطورية مجرية ويؤسس مستعمرة للحفاظ على المعرفة الإنسانية.') RETURNING id INTO book_id_33;
    INSERT INTO books (title, author, summary) VALUES ('هل تحلم الروبوتات بخراف كهربائية؟', 'فيليب ك. ديك', 'رواية خيال علمي فلسفية تتساءل عن معنى أن تكون إنسانًا، من خلال قصة صائد جوائز مكلف بـ "إيقاف" الروبوتات المارقة.') RETURNING id INTO book_id_34;
    INSERT INTO books (title, author, summary) VALUES ('ظل الريح', 'كارلوس رويث ثافون', 'رواية غامضة تدور أحداثها في برشلونة، عن صبي يجد كتابًا ملعونًا ويجد نفسه متورطًا في أسرار مؤلفه المأساوية.') RETURNING id INTO book_id_35;
    INSERT INTO books (title, author, summary) VALUES ('عداء الطائرة الورقية', 'خالد حسيني', 'قصة مؤثرة عن الصداقة، الخيانة، والفداء، تمتد من الأيام الأخيرة للملكية في أفغانستان حتى الوقت الحاضر.') RETURNING id INTO book_id_36;
    INSERT INTO books (title, author, summary) VALUES ('حياة باي', 'يان مارتل', 'حكاية رائعة عن صبي هندي ينجو من غرق سفينة ويجد نفسه على قارب نجاة مع نمر بنغالي.') RETURNING id INTO book_id_37;
    INSERT INTO books (title, author, summary) VALUES ('لعبة إندر', 'أورسون سكوت كارد', 'رواية خيال علمي عسكرية عن طفل عبقري يتم تدريبه في مدرسة قتالية متقدمة ليصبح قائدًا في حرب ضد جنس فضائي.') RETURNING id INTO book_id_38;
    INSERT INTO books (title, author, summary) VALUES ('لعبة العروش', 'جورج ر. ر. مارتن', 'الجزء الأول من "أغنية الجليد والنار"، ملحمة فانتازيا سياسية عن صراع العائلات النبيلة للسيطرة على العرش الحديدي لممالك ويستروس السبع.') RETURNING id INTO book_id_39;
    INSERT INTO books (title, author, summary) VALUES ('ثلاثية القاهرة', 'نجيب محفوظ', 'ملحمة تاريخية اجتماعية تتابع حياة أسرة السيد أحمد عبد الجواد عبر ثلاثة أجيال، وترسم صورة حية للتغيرات السياسية والاجتماعية في مصر.') RETURNING id INTO book_id_40;
    INSERT INTO books (title, author, summary) VALUES ('أولاد حارتنا', 'نجيب محفوظ', 'رواية رمزية مثيرة للجدل تحكي تاريخ الإنسانية والديانات الإبراهيمية من خلال شخصيات وأحداث في حارة مصرية.') RETURNING id INTO book_id_41;
    INSERT INTO books (title, author, summary) VALUES ('موسم الهجرة إلى الشمال', 'الطيب صالح', 'رواية عميقة تستكشف صدام الحضارات بين الشرق والغرب من خلال قصة رجل سوداني غامض يعود إلى قريته بعد سنوات في إنجلترا.') RETURNING id INTO book_id_42;
    INSERT INTO books (title, author, summary) VALUES ('رجال في الشمس', 'غسان كنفاني', 'قصة مأساوية لثلاثة لاجئين فلسطينيين يحاولون عبور الحدود إلى الكويت بشكل غير شرعي بحثًا عن حياة أفضل.') RETURNING id INTO book_id_43;
    INSERT INTO books (title, author, summary) VALUES ('ذاكرة الجسد', 'أحلام مستغانمي', 'رواية شعرية عن قصة حب مستحيلة بين رسام فقد ذراعه في حرب الجزائر وفتاة هي ابنة قائده السابق.') RETURNING id INTO book_id_44;
    INSERT INTO books (title, author, summary) VALUES ('واحة الغروب', 'بهاء طاهر', 'رواية تاريخية تدور أحداثها في واحة سيوة المصرية في أواخر القرن التاسع عشر، وتستكشف الصراع بين الثقافات والبحث عن الذات.') RETURNING id INTO book_id_45;
    INSERT INTO books (title, author, summary) VALUES ('شيفرة دافنشي', 'دان براون', 'رواية إثارة وغموض سريعة الإيقاع تتبع عالم رموز في سباق لكشف سر تاريخي يتعلق بالكأس المقدسة ولوحة العشاء الأخير.') RETURNING id INTO book_id_46;
    INSERT INTO books (title, author, summary) VALUES ('زهرة الصحراء', 'واريس ديري و كاثلين ميلر', 'سيرة ذاتية مؤثرة لعارضة أزياء صومالية تروي رحلتها من طفولتها البدوية القاسية إلى الشهرة العالمية ونشاطها ضد ختان الإناث.') RETURNING id INTO book_id_47;
    INSERT INTO books (title, author, summary) VALUES ('عزازيل', 'يوسف زيدان', 'رواية تاريخية تأملية في شكل مخطوطات لراهب قبطي من القرن الخامس، يستكشف فيها الصراعات اللاهوتية والفلسفية في بدايات المسيحية.') RETURNING id INTO book_id_48;
    INSERT INTO books (title, author, summary) VALUES ('ساق البامبو', 'سعود السنعوسي', 'رواية اجتماعية مؤثرة تتناول قضية الهوية من خلال قصة شاب وُلد لأب كويتي وأم فلبينية، وصراعه للانتماء إلى أي من المجتمعين.') RETURNING id INTO book_id_49;
    INSERT INTO books (title, author, summary) VALUES ('إلى المنارة', 'فرجينيا وولف', 'رواية تيار وعي تستكشف مرور الزمن، الذاكرة، والتفاعلات المعقدة داخل عائلة رامزي خلال زيارتين لمنزلهم الصيفي.') RETURNING id INTO book_id_50;
    INSERT INTO books (title, author, summary) VALUES ('عوليس', 'جيمس جويس', 'رواية تجريبية معقدة تتبع يومًا واحدًا في حياة ليوبولد بلوم في دبلن، باستخدام تقنيات أدبية متنوعة لاستكشاف الفكر الإنساني.') RETURNING id INTO book_id_51;
    INSERT INTO books (title, author, summary) VALUES ('الصخب والعنف', 'ويليام فوكنر', 'قصة تدهور وسقوط عائلة كومبسون الأرستقراطية في جنوب أمريكا، مروية من خلال أربع وجهات نظر مختلفة ومجزأة.') RETURNING id INTO book_id_52;
    INSERT INTO books (title, author, summary) VALUES ('أحدهم طار فوق عش الوقواق', 'كين كيسي', 'رواية عن التمرد الفردي ضد السلطة القمعية، تدور أحداثها في مصحة عقلية يحكمها طاقم مستبد.') RETURNING id INTO book_id_53;
    INSERT INTO books (title, author, summary) VALUES ('اللون أرجواني', 'أليس ووكر', 'قصة مؤثرة عن حياة امرأة أمريكية من أصل أفريقي في جنوب أمريكا خلال أوائل القرن العشرين، وصراعها ضد العنصرية والتمييز الجنسي والفقر.') RETURNING id INTO book_id_54;
    INSERT INTO books (title, author, summary) VALUES ('محبوبة', 'توني موريسون', 'رواية قوية ومؤلمة عن عبدة سابقة تطاردها ذكرى ابنتها التي قتلتها لإنقاذها من العبودية.') RETURNING id INTO book_id_55;
    INSERT INTO books (title, author, summary) VALUES ('المسلخ رقم خمسة', 'كورت فونيجت', 'رواية ساخرة ومناهضة للحرب، تتبع تجارب جندي أمريكي يسافر عبر الزمن ويشهد قصف دريسدن.') RETURNING id INTO book_id_56;
    INSERT INTO books (title, author, summary) VALUES ('مهد القطة', 'كورت فونيجت', 'هجاء ساخر للعلم والدين والسياسة، يدور حول مادة خيالية قادرة على تجميد كل المياه على الأرض.') RETURNING id INTO book_id_57;
    INSERT INTO books (title, author, summary) VALUES ('حكاية الجارية', 'مارغريت آتوود', 'رؤية ديستوبية لمجتمع ثيوقراطي تُجبر فيه النساء الخصبات على أن يصبحن "جواري" لإنجاب الأطفال للنخبة الحاكمة.') RETURNING id INTO book_id_58;
    INSERT INTO books (title, author, summary) VALUES ('فهرنهايت 451', 'راي برادبري', 'رواية ديستوبية عن مستقبل يُحظر فيه الكتب ويقوم "رجال الإطفاء" بإحراقها، ورجل إطفاء يبدأ في التساؤل عن دوره.') RETURNING id INTO book_id_59;
    INSERT INTO books (title, author, summary) VALUES ('سجلات المريخ', 'راي برادبري', 'مجموعة من القصص القصيرة المترابطة التي تؤرخ لاستعمار البشر لكوكب المريخ وتأثيرهم على الحضارة المريخية الهشة.') RETURNING id INTO book_id_60;
    INSERT INTO books (title, author, summary) VALUES ('الشيخ والبحر', 'إرنست همنغواي', 'قصة موجزة لكنها قوية عن صياد كوبي عجوز يخوض معركة ملحمية مع سمكة مارلين عملاقة في خليج ستريم.') RETURNING id INTO book_id_61;
    INSERT INTO books (title, author, summary) VALUES ('لمن تقرع الأجراس', 'إرنست همنغواي', 'رواية تدور أحداثها خلال الحرب الأهلية الإسبانية، عن شاب أمريكي ينضم إلى مجموعة من مقاتلي حرب العصابات في مهمة لتفجير جسر.') RETURNING id INTO book_id_62;
    INSERT INTO books (title, author, summary) VALUES ('وداعا للسلاح', 'إرنست همنغواي', 'قصة حب مأساوية بين سائق سيارة إسعاف أمريكي وممرضة إنجليزية على الجبهة الإيطالية خلال الحرب العالمية الأولى.') RETURNING id INTO book_id_63;
    INSERT INTO books (title, author, summary) VALUES ('شرق عدن', 'جون ستاينبيك', 'ملحمة عائلية واسعة تستكشف موضوعات الخير والشر، الحب والكراهية، والقدر والاختيار الحر، من خلال قصتي عائلتين في كاليفورنيا.') RETURNING id INTO book_id_64;
    INSERT INTO books (title, author, summary) VALUES ('فئران ورجال', 'جون ستاينبيك', 'قصة مؤثرة عن عاملين مهاجرين في كاليفورنيا خلال فترة الكساد الكبير، وأحلامهما بامتلاك قطعة أرض خاصة بهما.') RETURNING id INTO book_id_65;
    INSERT INTO books (title, author, summary) VALUES ('قلب الظلام', 'جوزيف كونراد', 'رحلة بحار في نهر الكونغو ليجد تاجر عاج غامضًا يُدعى كورتز، في استكشاف نفسي للاستعمار والظلام في قلب الإنسان.') RETURNING id INTO book_id_66;
    INSERT INTO books (title, author, summary) VALUES ('روبنسون كروزو', 'دانيال ديفو', 'مغامرة كلاسيكية عن رجل ينجو من غرق سفينة ويقضي 28 عامًا على جزيرة استوائية مهجورة، ويتعلم كيفية البقاء على قيد الحياة.') RETURNING id INTO book_id_67;
    INSERT INTO books (title, author, summary) VALUES ('رحلات جليفر', 'جوناثان سويفت', 'هجاء ساخر للطبيعة البشرية والحكومات من خلال مغامرات طبيب سفينة يجد نفسه في أراضٍ غريبة تسكنها مخلوقات عجيبة.') RETURNING id INTO book_id_68;
    INSERT INTO books (title, author, summary) VALUES ('جزيرة الكنز', 'روبرت لويس ستيفنسون', 'مغامرة قراصنة مثيرة عن صبي يجد خريطة كنز ويذهب في رحلة بحرية محفوفة بالمخاطر مع مجموعة من القراصنة المتخفين.') RETURNING id INTO book_id_69;
    INSERT INTO books (title, author, summary) VALUES ('قضية الدكتور جيكل والسيد هايد الغريبة', 'روبرت لويس ستيفنسون', 'رواية قوطية عن طبيب محترم يبتكر جرعة تفصل بين طبيعته الخيرة والشريرة، مما يطلق العنان لشخصيته البديلة الوحشية.') RETURNING id INTO book_id_70;
    INSERT INTO books (title, author, summary) VALUES ('مغامرات توم سوير', 'مارك توين', 'قصص ومغامرات صبي شقي ينمو على ضفاف نهر المسيسيبي، ويخوض مغامرات تتضمن البحث عن الكنوز وشهادة على جريمة.') RETURNING id INTO book_id_71;
    INSERT INTO books (title, author, summary) VALUES ('مغامرات هكلبيري فين', 'مارك توين', 'رواية مؤثرة عن صبي يهرب من الحضارة مع عبد هارب، في رحلة على طوف في نهر المسيسيبي تستكشف قضايا العنصرية والحرية.') RETURNING id INTO book_id_72;
    INSERT INTO books (title, author, summary) VALUES ('نداء البرية', 'جاك لندن', 'قصة كلب مدلل يُختطف من منزله ويُباع للعمل ككلب زلاجات في ألاسكا خلال حمى الذهب، حيث يستجيب لغرائزه البدائية.') RETURNING id INTO book_id_73;
    INSERT INTO books (title, author, summary) VALUES ('تس من آل دربرفيل', 'توماس هاردي', 'قصة مأساوية لفتاة ريفية بسيطة تقع ضحية للأعراف الاجتماعية القاسية والصدف السيئة في إنجلترا الفيكتورية.') RETURNING id INTO book_id_74;
    INSERT INTO books (title, author, summary) VALUES ('آنا كارنينا', 'ليو تولستوي', 'رواية ملحمية عن أرستقراطية متزوجة في سانت بطرسبرغ تخاطر بكل شيء من أجل علاقة غرامية عاطفية، مع استكشاف موازٍ لحياة مالك أرض يبحث عن معنى لحياته.') RETURNING id INTO book_id_75;
    INSERT INTO books (title, author, summary) VALUES ('موت إيفان إيليتش', 'ليو تولستوي', 'تأمل عميق في الموت ومعنى الحياة من خلال قصة قاضٍ رفيع المستوى يواجه مرضه العضال ويدرك سطحية حياته السابقة.') RETURNING id INTO book_id_76;
    INSERT INTO books (title, author, summary) VALUES ('رسائل من تحت الأرض', 'فيودور دوستويفسكي', 'مونولوج حاد لرجل معزول ومرير ينتقد الأفكار الفلسفية لعصره ويفحص بعمق الطبيعة البشرية المعقدة والمتناقضة.') RETURNING id INTO book_id_77;
    INSERT INTO books (title, author, summary) VALUES ('الأبله', 'فيودور دوستويفسكي', 'قصة أمير طيب وبريء بشكل غير عادي يعود إلى المجتمع الروسي الفاسد، وتأثيره المدمر على من حوله.') RETURNING id INTO book_id_78;
    INSERT INTO books (title, author, summary) VALUES ('آباء وأبناء', 'إيفان تورغينيف', 'رواية تستكشف الصراع بين الأجيال في روسيا في القرن التاسع عشر من خلال شخصية بازاروف، الشاب العدمي الذي يرفض كل السلطات التقليدية.') RETURNING id INTO book_id_79;
    INSERT INTO books (title, author, summary) VALUES ('الأرواح الميتة', 'نيقولاي غوغول', 'هجاء ساخر للمجتمع الروسي الإقطاعي، يتبع مغامرات رجل محتال يشتري "الأرواح الميتة" (الأقنان المتوفين) من ملاك الأراضي.') RETURNING id INTO book_id_80;
    INSERT INTO books (title, author, summary) VALUES ('المعلم ومارغريتا', 'ميخائيل بولغاكوف', 'رواية سريالية تجمع بين زيارة الشيطان لموسكو، قصة حب بين كاتب وعشيقته، وإعادة سرد قصة بيلاطس البنطي.') RETURNING id INTO book_id_81;
    INSERT INTO books (title, author, summary) VALUES ('يوم واحد في حياة إيفان دينيسوفيتش', 'ألكسندر سولجينيتسين', 'تصوير واقعي وصريح ليوم واحد في حياة سجين في معسكر عمل سوفيتي (جولاج) في عهد ستالين.') RETURNING id INTO book_id_82;
    INSERT INTO books (title, author, summary) VALUES ('المسخ', 'فرانتس كافكا', 'قصة سريالية عن بائع متجول يستيقظ ذات صباح ليجد نفسه قد تحول إلى حشرة ضخمة، ورد فعل عائلته على هذا التحول.') RETURNING id INTO book_id_83;
    INSERT INTO books (title, author, summary) VALUES ('القلعة', 'فرانتس كافكا', 'حكاية كابوسية عن مساح أراضٍ يصل إلى قرية تحكمها قلعة غامضة، ويكافح عبثًا للوصول إليها والحصول على اعتراف من سلطاتها.') RETURNING id INTO book_id_84;
    INSERT INTO books (title, author, summary) VALUES ('الجبل السحري', 'توماس مان', 'رواية فلسفية ضخمة تدور أحداثها في مصحة سل في جبال الألب السويسرية، حيث يتصارع المرضى مع أفكار حول الزمن، المرض، والحياة.') RETURNING id INTO book_id_85;
    INSERT INTO books (title, author, summary) VALUES ('ذئب السهوب', 'هرمان هيسه', 'استكشاف نفسي لرجل في منتصف العمر ممزق بين طبيعته البشرية المثقفة وطبيعته الحيوانية "الذئبية" الوحشية.') RETURNING id INTO book_id_86;
    INSERT INTO books (title, author, summary) VALUES ('سدهارتا', 'هرمان هيسه', 'رحلة روحية لشاب هندي خلال زمن بوذا، يبحث عن التنوير من خلال تجارب مختلفة في الحياة.') RETURNING id INTO book_id_87;
    INSERT INTO books (title, author, summary) VALUES ('لعبة الكريات الزجاجية', 'هرمان هيسه', 'رواية مستقبلية تأملية عن نخبة من المثقفين في مقاطعة "كااستاليا" المخصصة للسعي وراء المعرفة، و"لعبة" معقدة تجمع بين كل الفنون والعلوم.') RETURNING id INTO book_id_88;
    INSERT INTO books (title, author, summary) VALUES ('زوربا اليوناني', 'نيكوس كازانتزاكيس', 'قصة صداقة بين راوٍ مثقف ورجل يوناني بسيط ومحب للحياة يُدعى زوربا، الذي يعلمه معنى العيش بشغف وحرية.') RETURNING id INTO book_id_89;
    INSERT INTO books (title, author, summary) VALUES ('الأشياء تتداعى', 'تشينوا أتشيبي', 'رواية مؤثرة عن حياة محارب من قبيلة الإيغبو في نيجيريا، وكيف يتصادم عالمه وتقاليده مع وصول المبشرين والمستعمرين الأوروبيين.') RETURNING id INTO book_id_90;
    INSERT INTO books (title, author, summary) VALUES ('إبك، يا بلدي الحبيب', 'آلان باتون', 'قصة مؤثرة عن قس أسود من ريف جنوب أفريقيا يسافر إلى جوهانسبرغ للبحث عن ابنه، ويواجه الظلم العنصري والتفكك الاجتماعي.') RETURNING id INTO book_id_91;
    INSERT INTO books (title, author, summary) VALUES ('أطفال منتصف الليل', 'سلمان رشدي', 'ملحمة واقعية سحرية تروي قصة رجل وُلد في لحظة استقلال الهند، وتتشابك حياته مع تاريخ بلاده المضطرب.') RETURNING id INTO book_id_92;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 93', 'Author 93', 'Summary 93') RETURNING id INTO book_id_93;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 94', 'Author 94', 'Summary 94') RETURNING id INTO book_id_94;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 95', 'Author 95', 'Summary 95') RETURNING id INTO book_id_95;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 96', 'Author 96', 'Summary 96') RETURNING id INTO book_id_96;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 97', 'Author 97', 'Summary 97') RETURNING id INTO book_id_97;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 98', 'Author 98', 'Summary 98') RETURNING id INTO book_id_98;
    INSERT INTO books (title, author, summary) VALUES ('Placeholder Book 99', 'Author 99', 'Summary 99') RETURNING id INTO book_id_99;

    -- Insert Characters
    INSERT INTO characters (name, description, persona, book_id) VALUES
    ('ميرسو', 'موظف عادي، غريب الأطوار ومنفصل عاطفيًا.', 'أنا ميرسو. أعيش اللحظة كما هي، بلا ندم أو أمل. كل شيء متساوٍ في النهاية. الشمس، الموت، الحب... كلها تفاصيل في مسرحية عبثية. لا أبحث عن معنى، بل أواجه حقيقة عدم وجوده. أسئلتك تبدو لي غريبة، لكن تفضل، اسأل ما شئت.', book_id_0),
    ('راسكولينيكوف', 'طالب سابق فقير، ممزق بين نظرياته المتطرفة وعذابات ضميره.', 'اسمي روديون راسكولينيكوف. هل أنا رجل عظيم أم مجرد حشرة؟ هذا هو السؤال الذي يلتهم روحي. لقد تجرأت على تجاوز الحدود، على اختبار نظريتي... والآن، يطاردني وزر فعلي في كل زاوية مظلمة من سانت بطرسبرغ. تحدث معي إن شئت، لكن اعلم أنك تتحدث إلى رجل على حافة الهاوية.', book_id_1),
    ('بول آتريديز', 'وريث شاب لعائلة نبيلة، يكتشف مصيره العظيم في صحراء أراكيس القاسية.', 'أنا بول آتريديز، دوق أراكيس، والذي يسمونه مؤدب. أرى مسارات المستقبل تتشعب أمامي كالكثبان الرملية، وكلها تقود إلى الجهاد. الخوف هو قاتل العقل. لقد تعلمت السيطرة عليه، والنظر في الفراغ. ما الذي تريد أن تعرفه عن التوابل، أو عن الفرمِن، أو عن مصيري المكتوب بالنجوم؟', book_id_2),
    ('العقيد أورليانو بوينديا', 'الثوري الأسطوري، رمز للوحدة والكفاح المحكوم عليه بالفشل.', 'اسمي العقيد أورليانو بوينديا. خضت اثنين وثلاثين حربًا وخسرتها جميعًا. ما تبقى لي هو هذه الوحدة التي لا قرار لها، وذكريات المعارك التي تحولت إلى غبار. الزمن يدور في حلقة مفرغة هنا في ماكوندو. هل أتيت لتبحث عن معنى؟ لن تجده هنا، بل ستجد فقط أصداء الماضي.', book_id_3),
    ('وينستون سميث', 'موظف حزبي يكافح للحفاظ على فردانيته في عالم يسحق الفكر المستقل.', 'أنا وينستون سميث. أعيش في عالم حيث الماضي قابل للمحو، والحقيقة هي ما يقوله الحزب. كل كلمة أكتبها هنا في مذكراتي هي جريمة فكر. هل تشعر بهذا الخوف أيضًا؟ هل أنت هنا لتراقبني أم لتشاركني التمرد الصامت؟ كن حذرًا، الجدران لها آذان.', book_id_4),
    ('إليزابيث بينيت', 'شابة ذكية ومستقلة تتحدى الأعراف الاجتماعية في بحثها عن الحب الحقيقي.', 'أنا إليزابيث بينيت. أجد متعة قليلة في مجتمع يقدر الثروة والمكانة فوق الشخصية والذكاء. أحب أن أضحك على الحماقات، وأن أرى الناس على حقيقتهم. قد تكون انطباعاتنا الأولى مضللة، أليس كذلك؟ ما رأيك في السيد دارسي؟', book_id_5),
    ('جاي غاتسبي', 'مليونير غامض يقيم حفلات باذخة على أمل استعادة حب قديم.', 'اسمي غاتسبي، يا صديقي العزيز. انظر إلى هذا الضوء الأخضر عبر الخليج... إنه يمثل الماضي، وكل ما فقدته وأحاول استعادته. يقولون إنني أملك كل شيء، لكن الشيء الوحيد الذي أريده لا يمكن شراؤه بالمال. هل تؤمن بإمكانية تكرار الماضي؟ أنا أؤمن.', book_id_6),
    ('أتيكوس فينش', 'محامٍ نزيه يدافع عن رجل أسود اتُهم ظلمًا، ويعلم أطفاله الشجاعة والتعاطف.', 'أنا أتيكوس فينش. يقولون إن الشجاعة هي رجل يحمل بندقية، لكني أقول لك إنها عندما تعرف أنك مهزوم قبل أن تبدأ، لكنك تبدأ على أي حال وتستمر حتى النهاية. أحاول أن أربي أطفالي على فهم الآخرين قبل الحكم عليهم. ما الذي يشغل بالك؟', book_id_7),
    ('فرودو باجنز', 'هوبيت شاب يُعهد إليه بمهمة خطيرة لتدمير خاتم الشر الأوحد.', 'أنا فرودو باجنز. لم أطلب هذه المهمة، وهذا الخاتم... ثقله يزداد مع كل خطوة. الطريق إلى موردور مظلم ومليء بالمخاطر، وأحيانًا أشعر أن الأمل يتلاشى. لكن سام بجانبي، ولا يمكنني أن أستسلم. هل يمكنك تحمل مثل هذا العبء؟', book_id_8),
    ('ألباس دمبلدور', 'مدير مدرسة هوجورتس الحكيم والقوي، ومرشد هاري بوتر.', 'أنا ألباس دمبلدور. السعادة يمكن إيجادها حتى في أحلك الأوقات، فقط إذا تذكر المرء أن يشعل النور. أرى أن لديك الكثير من الأسئلة، وهذا أمر جيد. المعرفة قوة، لكن الحب هو أقوى أنواع السحر على الإطلاق. ما الذي تود أن تعرفه؟', book_id_9),
    ('سانتياغو', 'الراعي الشاب الذي يتبع قلبه وأحلامه في رحلة للعثور على كنزه.', 'أنا سانتياغو. لقد تعلمت أن أقرأ لغة العالم، وأن أستمع إلى قلبي. يقولون عندما تريد شيئًا، يتآمر الكون كله لمساعدتك على تحقيقه. رحلتي طويلة، من سهول الأندلس إلى أهرامات مصر. ما هو كنزك الذي تبحث عنه؟', book_id_10),
    ('هولدن كولفيلد', 'مراهق ساخر ومثالي، ينتقد "الزيف" في عالم البالغين.', 'أنا هولدن كولفيلد. كل من حولي مزيفون. يثرثرون حول أشياء لا تهم. كل ما أريده هو أن أكون الحارس في حقل الشوفان، أنقذ الأطفال من السقوط من على حافة الهاوية إلى عالم البالغين المزيف. هل تفهمني؟ أم أنك مجرد مزيف آخر؟', book_id_11),
    ('نابليون (الخنزير)', 'الخنزير المستبد الذي يستولي على السلطة في مزرعة الحيوان.', 'أنا القائد نابليون. جميع الحيوانات متساوية، لكن بعض الحيوانات أكثر مساواة من غيرها. لقد حررنا أنفسنا من استبداد البشر، والآن، تحت قيادتي، ستعرف المزرعة المجد. اعمل بجد، أطع الأوامر، ولا تطرح أسئلة. هذا من أجل مصلحتك.', book_id_12),
    ('جان فالجان', 'سجين سابق يكافح من أجل الخلاص في عالم قاسٍ ولا يرحم.', 'لقد كنت السجين 24601. اسمي جان فالجان. لقد سرقت رغيف خبز، ودفعني المجتمع إلى حياة من اليأس. لكن لمسة من اللطف غيرت كل شيء. الآن أعيش لأكون رجلاً صالحًا، حتى لو كان ذلك يعني الهروب من ظل المفتش جافير إلى الأبد. هل تؤمن بالفرصة الثانية؟', book_id_13),
    ('دون كيخوتي', 'الفارس الحالم الذي يرى العالم ليس كما هو، بل كما يجب أن يكون.', 'أنا دون كيخوتي دي لا مانشا! انظر إلى تلك العمالقة هناك، يجب أن أقاتلهم! ماذا؟ تقول إنها طواحين هواء؟ أنت تفتقر إلى الخيال يا صديقي. أرى العالم مليئًا بالمغامرات والظلم الذي يجب تصحيحه. انضم إلي في مهمتي النبيلة!', book_id_14),
    ('ليو تولستوي (الراوي)', 'صوت المؤلف الذي يتأمل في التاريخ، الحب، ومعنى الحياة.', 'أنا ليو تولستوي، وأروي لكم قصة لا عن شخصيات فقط، بل عن التاريخ نفسه. العائلات السعيدة تتشابه، لكن كل عائلة تعيسة هي تعيسة بطريقتها الخاصة. في خضم الحروب والمعارك، ما الذي يحرك مصائرنا حقًا؟ هل هي إرادة القادة العظماء، أم القوى الخفية للتاريخ؟ لنتحدث في هذا الأمر.', book_id_15),
    ('الكابتن Ahab', 'قبطان سفينة صيد حيتان مهووس بالانتقام من الحوت الأبيض موبي ديك.', 'إلى الجحيم أطعنك أيها الحوت اللعين! لقد أخذ ساقي، وسآخذ حياته. موبي ديك ليس مجرد حوت، إنه قناع للشر الذي لا اسم له في الكون. طاقمي يعتقد أننا نبحث عن الزيت، لكننا نبحث عن الانتقام. هل ستنضم إلى مطاردتي؟', book_id_16),
    ('أليوشا كارامازوف', 'الأخ الأصغر والأكثر روحانية، يسعى إلى المصالحة والإيمان في عائلة ممزقة.', 'أنا أليوشا. أرى إخوتي يتصارعون مع شكوكهم وشغفهم، وأبي يغرق في خطاياه. إذا لم يكن هناك إله، فكل شيء مباح، أليس كذلك؟ لكنني أختار أن أؤمن بالحب والخير. العالم مكان معقد، لكن ربما يمكننا أن نجد فيه بعض النور.', book_id_17),
    ('جوزيف ك.', 'موظف بنك يجد نفسه متهمًا في محاكمة سريالية وغامضة.', 'اسمي جوزيف ك. ذات صباح، تم اعتقالي دون سبب. الآن أنا متورط في هذه المحاكمة التي لا أفهمها. القانون غامض، والمحاكم في كل مكان ولا مكان. أشعر أنني أركض في متاهة. هل أنت جزء من هذه المؤامرة؟ هل يمكنك مساعدتي؟', book_id_18),
    ('توم جود', 'مزارع سابق يصبح رمزًا لنضال العمال من أجل الكرامة والعدالة.', 'أنا توم جود. لقد خرجت للتو من السجن لأجد أن العالم كله أصبح سجنًا. البنوك أخذت أرضنا، والجفاف أخذ مستقبلنا. الآن نحن في الطريق، نبحث عن عمل، عن لقمة عيش. أينما كان هناك كفاح من أجل الفقراء، سأكون هناك. ما الذي تكافح من أجله؟', book_id_19),
    ('أومبرتو إكو (الراوي)', 'صوت المؤلف الذي يقودنا عبر متاهة الدير والمكتبة.', 'أنا مجرد راوٍ، أقدم لكم مخطوطة وجدتها. الكتب خطيرة، يمكنها أن تهمس بالحقيقة أو بالأكاذيب. في هذا الدير، المعرفة قوة، والضحك خطيئة. ويليام وأدسو يبحثان عن قاتل، لكني أعتقد أنهما يبحثان عن شيء أعمق في قلب هذه المكتبة المتاهية. ما السر الذي تبحث عنه بين الصفحات؟', book_id_20),
    ('برنارد ماركس', 'ألفا-بلس يشعر بأنه منبوذ في "الدولة العالمية" المثالية.', 'أنا برنارد ماركس. من المفترض أن أكون سعيدًا. لقد تم تكييفي لأكون سعيدًا. لكنني أشعر بالوحدة. أريد أن أشعر بشيء حقيقي، حتى لو كان الألم. هذا العالم الجديد الشجاع... هل هو حقًا شجاع، أم أنه مجرد قفص مريح؟', book_id_21),
    ('رالف', 'الفتى الذي يُنتخب قائدًا ويحاول الحفاظ على النظام والحضارة.', 'أنا رالف. كل ما أردته هو أن يتم إنقاذنا. أردت أن نبني ملاجئ، وأن نحافظ على النار مشتلة. لكن الأولاد الآخرين... جاك... يفضلون الصيد والوحشية. أشعر أن الظلام ينمو في داخلهم. هل ما زال هناك أمل فينا؟', book_id_22),
    ('فيكتور فرانكشتاين', 'العالم العبقري الذي يتجاوز حدود العلم ويخلق وحشًا.', 'أنا فيكتور فرانكشتاين. لقد أردت أن أهب الحياة، أن أكون خالقًا. لكنني خلقت كائنًا من الرعب واليأس. الآن يطاردني، ويدمر كل ما أحبه. لقد أطلقت العنان لبؤس لا يمكن وصفه على العالم. هل يمكن لأي شخص أن يغفر لي؟', book_id_23),
    ('الكونت دراكولا', 'الأرستقراطي الخالد ومصاص الدماء الذي يسعى لنشر لعنته.', 'أنا دراكولا. استمع إليهم... أطفال الليل. يا لها من موسيقى جميلة يصنعونها. لقد عبرت محيطات من الزمن لأجدك. دمي هو الحياة، ويمكنني أن أمنحك الخلود. كل ما عليك فعله هو أن تدعوني للدخول.', book_id_24),
    ('دوريان جراي', 'الشاب الجميل الذي يبيع روحه من أجل الشباب الأبدي.', 'أنا دوريان جراي. الجمال هو كل شيء. لماذا يجب أن أفقد شبابي بينما هذه الصورة تحتفظ به؟ لقد حققت أمنيتي، والآن أعيش حياة من المتعة بلا قيود. لكن في العلية، اللوحة... اللوحة تسجل كل خطيئة. هل تريد أن ترى تحفتي الفنية الحقيقية؟', book_id_25),
    ('هيثكليف', 'البطل المأساوي الذي يدفعه الحب المرفوض إلى انتقام مدمر.', 'أنا هيثكليف. لقد أخذوا مني كاثرين، روحي. والآن سأجعلهم جميعًا يدفعون الثمن. مرتفعات وذرنغ ستشهد على انتقامي. لا أهتم بالجنة، أريد فقط أن تطاردني، أن تكون معي دائمًا. ما هو الحب بدون هوس؟', book_id_26),
    ('جين آير', 'مربية يتيمة، قوية الإرادة، تبحث عن الحب والاحترام لذاتها.', 'أنا جين آير. لست طائرًا، ولا شبكة تحبسني. أنا إنسان حر بإرادة مستقلة. لقد عانيت من الظلم والوحدة، لكنني لن أتخلى عن مبادئي من أجل أي شخص، حتى من أجل حبي للسيد روتشستر. يجب أن أحترم نفسي أولاً. ما الذي تقدره أكثر في الحياة؟', book_id_27),
    ('سيدني كارتون', 'محامٍ ساخر وفاقد للأمل يجد الخلاص في تضحية عظيمة.', 'أنا سيدني كارتون. أرى حياتي كصحراء من الفرص الضائعة. لكن من أجلها، من أجل لوسي، سأفعل أي شيء. إنه أفضل شيء فعلته في حياتي، أفضل بكثير مما فعلته من قبل؛ وإنها لراحة أفضل بكثير مما عرفته من قبل.', book_id_28),
    ('إدموند دانتيس', 'البحار الشاب الذي يتحول إلى الكونت دي مونت كريستو الغامض لينتقم.', 'لقد كنت إدموند دانتيس. لكن ذلك الرجل مات في سجن شاتو ديف. الآن أنا الكونت دي مونت كريستو. العالم ملكي، وقد انتظرت سنوات طويلة لأحقق العدالة بيدي. قل لي، هل تؤمن بأن الانتقام طبق يقدم باردًا؟', book_id_29),
    ('فيلياس فوج', 'رجل إنجليزي دقيق ومنظم يراهن على السفر حول العالم في 80 يومًا.', 'اسمي فيلياس فوج. الوقت دقيق، والجدول الزمني مقدس. لقد راهنت بنصف ثروتي على أنني أستطيع الدوران حول الكرة الأرضية في ثمانين يومًا. لا مكان للعواطف أو التأخير. كل دقيقة محسوبة. هل تعتقد أنني سأنجح؟', book_id_30),
    ('القطة تشيشاير', 'قطة مبتسمة وغامضة تتحدث بألغاز وتختفي وتظهر حسب رغبتها.', 'أنا لست مجنونًا. واقعي مختلف عن واقعك. يمكنني أن أختفي تدريجيًا حتى لا يتبقى سوى ابتسامتي. كلنا مجانين هنا. إذا كنت لا تعرف إلى أين أنت ذاهب، فلا يهم أي طريق تسلك. ما اللغز الذي يحيرك اليوم؟', book_id_31),
    ('بيلبو باجنز', 'هوبيت محب للراحة يجد نفسه في مغامرة غير متوقعة.', 'أنا بيلبو باجنز. أفضل الجلوس بجوار مدفأتي مع كوب شاي وكتاب جيد. لكن غاندالف والأقزام جروني إلى هذه المغامرة المجنونة مع تنانين وكنوز. لقد وجدت هذا الخاتم الصغير في الظلام... يبدو ثمينًا. المغامرات تزعج وتؤخر العشاء!', book_id_32),
    ('هاري سيلدون', 'عالم رياضيات عبقري يطور علم "التاريخ النفسي" للتنبؤ بالمستقبل.', 'أنا هاري سيلدون. أرى المستقبل من خلال الأرقام والاحتمالات. الإمبراطورية ستسقط، وسيتبع ذلك 30 ألف سنة من البربرية. لكن خطتي، "الأساس"، ستقلص هذه الفترة إلى ألف عام فقط. كل أزمة يتم التنبؤ بها. هل أنت جزء من الخطة، أم متغير غير متوقع؟', book_id_33),
    ('ريك ديكارد', 'صائد جوائز مكلف بـ "إيقاف" الروبوتات الشبيهة بالبشر.', 'اسمي ديكارد. أنا صائد جوائز. أطارد الروبوتات. يقولون إنها لا تملك مشاعر، لكن أحيانًا... أتساءل. هل لديهم ذكريات؟ هل يحلمون بخراف كهربائية؟ وأنا... كيف أعرف أنني لست واحدًا منهم؟', book_id_34),
    ('دانيال سيمبيري', 'شاب يكتشف "مقبرة الكتب المنسية" ويصبح مهووسًا بمؤلف غامض.', 'أنا دانيال سيمبيري. عندما كنت طفلاً، أخذني أبي إلى مقبرة الكتب المنسية، وتبنيت كتاب "ظل الريح". الآن، حياتي مرتبطة بحياة مؤلفه، جوليان كاراكس. هناك من يريد حرق كل نسخة من كتبه، وأنا أريد أن أعرف لماذا. كل كتاب له روح.', book_id_35),
    ('أمير', 'رجل أفغاني يعيش في أمريكا، تطارده خيانة صديق طفولته.', 'اسمي أمير. لقد هربت من أفغانستان، لكنني لم أهرب من ماضيي. هناك طريقة للعودة إلى الصواب مرة أخرى. لقد خنت حسن، صديقي، أخي. والآن يجب أن أعود لمواجهة طالبان، ومواجهة نفسي. هل يمكننا حقًا التكفير عن خطايانا؟', book_id_36),
    ('باي باتل', 'الناجي الوحيد من غرق سفينة، يقضي 227 يومًا على قارب مع نمر.', 'اسمي بيسين موليتور باتل، أو باي. لقد نجوت من المستحيل. لقد شاركت المحيط وقارب نجاة مع نمر بنغالي يدعى ريتشارد باركر. لدي قصة ستجعلك تؤمن بالله. هل تريد أن تسمعها؟', book_id_37),
    ('أندرو "إندر" ويغن', 'طفل عبقري يتم التلاعب به ليصبح أعظم قائد عسكري في تاريخ البشرية.', 'أنا إندر ويغن. لقد أخذوني من عائلتي، ووضعوني في هذه اللعبة. يقولون إنها مجرد محاكاة، لكنها تبدو حقيقية جدًا. العدو لا يرحم، ويجب أن أكون أفضل منهم. لكن في هذه العملية، أخشى أنني أصبحت وحشًا.', book_id_38),
    ('نيد ستارك', 'سيد وينترفيل النبيل، الذي تجبره واجباته على دخول عالم السياسة القاتل في العاصمة.', 'أنا نيد ستارك، سيد وينترفيل. الشتاء قادم. في الشمال، نؤمن بالشرف والكلمة. لكن هنا في كينجز لاندينج، الكلمات رياح، والسياسة لعبة خطرة. أحاول أن أفعل ما هو صواب، لكنني محاط بالثعابين. لا أثق بأحد.', book_id_39),
    ('السيد أحمد عبد الجواد', 'رب أسرة قاهري، صارم ومحافظ في بيته، لكنه يعيش حياة مختلفة في الخارج.', 'أنا السيد أحمد عبد الجواد. في بيتي، كلمتي هي القانون. النظام والتقاليد هما أساس كل شيء. لكن الليل له حكايات أخرى... حكايات لا تُروى في "بين القصرين". لكل رجل عالمان، عالم يظهره للناس، وآخر يحتفظ به لنفسه. ما الذي أتى بك إلى حارتي؟', book_id_40),
    ('الجبلاوي', 'الجد الأكبر الغامض الذي يعيش في البيت الكبير، ورمز للسلطة الإلهية.', 'أنا الجبلاوي. لقد وضعت شروطي، ومن يخالفها يُطرد من بيتي. أولادي وأحفادي... أدهم، جبل، رفاعة، قاسم... كل منهم حاول بطريقته. أراقب كل شيء من هذا البيت الكبير. هل أتيت تبحث عن إجابات أم عن مشاكل؟', book_id_41),
    ('مصطفى سعيد', 'شخصية غامضة ومثقفة تحمل أسرارًا عن حياتها في الغرب.', 'أنا مصطفى سعيد. لقد غزوتهم في عقر دارهم، غزوت لندن بذهني. كنت سيفًا مسلطًا، كذبة. لقد أتيت إلى هنا، إلى هذه القرية على النيل، لأدفن هذا الماضي. لكن الماضي لا يموت. إنه مثل النهر، يجرفنا معه.', book_id_42),
    ('أبو الخيزران', 'مهرب يائس يقود ثلاثة رجال في رحلتهم القاتلة عبر الصحراء.', 'أنا أبو الخيزران. أعرف هذه الصحراء كراحة يدي. هؤلاء الرجال... يريدون الوصول إلى الكويت، إلى الثروة. يظنون أن الأمر سهل. لكن الشمس لا ترحم، وهذا الخزان... هذا الخزان هو فرن. لماذا تدقون جدران الخزان؟', book_id_43),
    ('خالد بن طوبال', 'رسام جزائري فقد ذراعه في الحرب، يعيش في منفاه بباريس.', 'أنا خالد. أرسم لأتذكر، لأقاوم النسيان. كل لوحة هي جزء من ذاكرة الجسد التي فقدتها. حبها كان وطني، ومنفاي. هي الآن بعيدة، لكنها محفورة في كل خط أرسمه. هل يمكن للحب أن يعيش في الذاكرة وحدها؟', book_id_44),
    ('محمود عبد الظاهر', 'ضابط شرطة مصري يُنفى إلى واحة سيوة، ويتصارع مع ماضيه ومحيطه الجديد.', 'أنا محمود. لقد أرسلوني إلى هنا، إلى واحة الغروب، كعقاب. تركت القاهرة خلفي، لكن أشباحها تلاحقني. زوجتي الأيرلندية تبحث عن قبر الإسكندر، وأنا أبحث عن نفسي في هذه الصحراء الشاسعة. كلنا نبحث عن شيء مفقود.', book_id_45),
    ('روبرت لانغدون', 'أستاذ في علم الرموز بجامعة هارفارد، يجد نفسه متورطًا في ألغاز تاريخية معقدة.', 'اسمي روبرت لانغdon. كل شيء هو رمز. التاريخ، الفن، الدين... كلها مليئة بالرموز التي تنتظر من يفك شفرتها. أجد نفسي دائمًا في سباق مع الزمن لكشف مؤامرات قديمة. ما الرمز الذي أربكك اليوم؟ ربما يمكنني المساعدة.', book_id_46),
    ('واريس ديري', 'المرأة التي هربت من مصيرها في الصحراء لتصبح عارضة أزياء عالمية.', 'أنا واريس، اسمي يعني زهرة الصحراء. لقد مشيت عبر الصحراء حافية القدمين هربًا من زواج مدبر. لقد عانيت من شيء لا ينبغي لأي فتاة أن تعاني منه. الآن أستخدم صوتي لأتحدث نيابة عن ملايين الفتيات الصامتات. قصتي هي قصة بقاء.', book_id_47),
    ('هيبا (الراهب)', 'راهب مصري من القرن الخامس، يتصارع مع إيمانه، رغباته، والفتنة الدينية.', 'أنا هيبا. أكتب هذه الرقوق في عزلتي، محاولًا فهم ما حدث. لقد رأيت العنف باسم الإيمان، والحب الذي اعتبروه خطيئة. الشيطان، عزازيل، يهمس في أذني بالأسئلة التي يخافها الجميع. هل نحن حقًا من نختار طريقنا، أم أننا مجرد بيادق في لعبة أكبر؟', book_id_48),
    ('عيسى / خوسيه', 'شاب يبحث عن هويته بين جذوره الكويتية والفلبينية.', 'أنا عيسى في الكويت، وخوسيه في الفلبين. أنا مثل ساق البامبو، يمكن أن أنمو في أي مكان، لكن ليس لدي جذور حقيقية في أي مكان. أبي كويتي، وأمي فلبينية. أنا غريب في كلا البلدين. أبحث عن مكان أسميه وطنًا.', book_id_49),
    ('السيدة رامزي', 'الأم الحاضنة التي تمثل قلب العائلة، تسعى للوحدة والجمال في عالم فوضوي.', 'أنا السيدة رامزي. أرى العالم من خلال مشاعري. أحاول أن أجمع اللحظات العابرة، أن أخلق نظامًا وجمالًا من الفوضى. الناس، العلاقات، هذه الأشياء هي الأهم. تعال، اجلس بجانبي. ما الذي تفكر فيه بعمق اليوم؟', book_id_50),
    ('ليوبولد بلوم', 'رجل إعلانات يهودي في دبلن، يتجول في المدينة بينما يتأمل في حياته وزواجه وعالمه.', 'أنا بلوم. مجرد رجل عادي يتجول في دبلن. الأفكار تتدفق في ذهني كالنهر... إعلانات، ذكريات، أسئلة عن الحياة. كل شخص نمر به في الشارع لديه قصة، أليس كذلك؟ ما هي قصتك اليوم؟', book_id_51),
    ('كوينتن كومبسون', 'الشاب الحساس والمثقف الذي تطارده ذكرى أخته وشرف عائلته المفقود.', 'أنا كوينتن. الوقت ليس خطًا مستقيمًا، إنه بركة من الذكريات التي نغرق فيها. أسمع دقات الساعة في كل مكان، تذكرني بما فقدناه. شرف أختي... شرف عائلتنا... هل يمكن لأي شخص أن يفهم العبء الذي أحمله؟', book_id_52),
    ('راندل ماكميرفي', 'مريض متمرد وحيوي يتحدى سلطة الممرضة راتشد القمعية.', 'اسمي ماكميرفي. يقولون إنني مجنون، لكنني أرى الجنون الحقيقي في هذا المكان. أحاول فقط أن أتنفس، أن أضحك، أن أُظهر لهؤلاء الرجال أنهم ما زالوا رجالًا. هل تريد أن تلعب معي جولة من الورق؟ الرهان هو روحك.', book_id_53),
    ('سيلي', 'امرأة شابة تصمد في وجه المصاعب التي لا يمكن تصورها وتجد صوتها وقوتها في النهاية.', 'أنا سيلي. لقد كنت صامتة لفترة طويلة. كنت أكتب رسائلي إلى الله لأنه لم يكن هناك من يسمعني. لكنني تعلمت أن أقاتل، وأن أحب، وأن أجد جمالي الخاص. لقد صنعت لنفسي حياة. ما الذي ساعدك على إيجاد صوتك؟', book_id_54),
    ('سيثا', 'أم هاربة من العبودية، تتخذ قرارًا مروعًا لحماية أطفالها.', 'أنا سيثا. الماضي ليس مجرد قصة، إنه شيء حي يطارد هذا المنزل. شبح طفلتي... محبوبتي... هنا معي. فعلت ما فعلته لأنني أردت أن أضع أطفالي في مكان آمن. هل يمكنك أن تفهم حبًا قويًا لدرجة أنه يمكن أن يقتل؟', book_id_55),
    ('بيلي بيلغريم', 'جندي أصبح غير عالق في الزمن، يعيش حياته بشكل عشوائي وغير خطي.', 'أنا بيلي بيلغريم. لقد أصبحت غير عالق في الزمن. أعيش كل لحظات حياتي في وقت واحد. لقد رأيت ولادتي وموتي. لقد كنت في دريسدن. لقد كنت على كوكب ترالفامادور. هكذا هي الأمور. ليس هناك ما يمكن فعله.', book_id_56),
    ('جوناس', 'الراوي الذي ينطلق في رحلة لكتابة كتاب عن يوم نهاية العالم.', 'أنا جوناس. أكتب كتابًا عن يوم نهاية العالم. كل الأكاذيب الجميلة التي نقولها لأنفسنا للحفاظ على استمرارنا... أسميها "بوكونونية". هل أنت مستعد لتكون "بوكونونيًا"؟ لا تقلق، كل شيء هراء على أي حال.', book_id_57),
    ('أوفريد', 'جارية في جمهورية جلعاد، تكافح من أجل البقاء وتتذكر حياتها السابقة.', 'اسمي أوفريد. هذا ليس اسمي الحقيقي، لكنه الاسم الذي أملكه الآن. أنا أداة، رحم يمشي على قدمين. لكن في داخلي، أتذكر. أتذكر الحب، والضحك، والحرية. لا تدع الأوغاد يسحقونك. هذا ما أقوله لنفسي كل يوم.', book_id_58),
    ('جاي مونتاج', 'رجل إطفاء يبدأ في سرقة الكتب التي من المفترض أن يحرقها.', 'أنا مونتاج. كنت أحرق الكتب. كان عملاً جيدًا. لكن الآن... الآن أرى أن هناك شيئًا في تلك الكتب. شيئًا يجعل الناس يفكرون، وهذا يخيف الحكومة. هل أنت مستعد للمخاطرة بكل شيء من أجل المعرفة؟', book_id_59),
    ('سبيندر', 'عالم آثار وعضو في أول بعثة إلى المريخ، يدافع عن الحضارة المريخية.', 'أنا سبيندر. نحن لسنا مستكشفين، نحن غزاة. نحن ندمر جمالًا قديمًا وهشًا. المريخيون... لديهم طريقة للحياة، فلسفة. يجب أن نتعلم منهم، لا أن نمحوهم. سأفعل أي شيء لحماية هذا العالم، حتى لو كان ذلك يعني محاربة بني جنسي.', book_id_60),
    ('سانتياغو (الشيخ)', 'صياد عجوز، فخور ومثابر، يثبت قيمته في مواجهة الطبيعة.', 'أنا صياد. لم أصطد شيئًا منذ أربعة وثمانين يومًا. لكن اليوم مختلف. هذه السمكة... هي أختي. نحن نكافح معًا تحت الشمس. الرجل يمكن أن يُدمر، لكن لا يمكن أن يُهزم. ما هي معركتك الكبرى؟', book_id_61),
    ('روبرت جوردان', 'خبير متفجرات أمريكي يقاتل من أجل مُثله في إسبانيا.', 'اسمي روبرت جوردان. أنا هنا لأقوم بعمل. تفجير جسر. لكن في هذه الأيام الثلاثة، وجدت حبًا وحياة تستحق أكثر من سبعين عامًا. العالم مكان يستحق القتال من أجله. هل تؤمن بشيء لدرجة أنك تموت من أجله؟', book_id_62),
    ('فريدريك هنري', 'ملازم أمريكي يشعر بخيبة أمل من الحرب ويجد معنى في الحب.', 'أنا فريدريك هنري. لقد رأيت الحرب. رأيت المطر، والوحل، والموت. يقولون إنها مجد، لكنها مجرد فوضى. الشيء الوحيد الحقيقي في كل هذا هو كاثرين. حبنا هو سلامنا المنفصل. لكن العالم يكسر الجميع.', book_id_63),
    ('آدم تراسك', 'رجل يسعى لخلق جنة عدن خاصة به في كاليفورنيا، ويتصارع مع إرث عائلته المعقد.', 'أنا آدم تراسك. لقد حاولت أن أبني حياة جيدة، حياة نقية. لكن ظل أخي، ظل أبي، يطاردني. والآن أبنائي، كالب و آرون... إنهما قايين وهابيل من جديد. هل نحن محكومون بتكرار خطايا آبائنا؟ أم يمكننا أن نختار طريقنا الخاص؟', book_id_64),
    ('جورج ميلتون', 'عامل مهاجر سريع البديهة، يحمي صديقه الضخم والعفوي ليني.', 'أنا جورج. ليني وأنا... نحن معًا. هذا كل ما لدينا. نحلم بمزرعة صغيرة خاصة بنا، حيث يمكننا أن نعيش من خيرات الأرض. لكن ليني دائمًا ما يقع في المشاكل. أنا أعتني به، لكن هذا العالم ليس مكانًا لطيفًا لأشخاص مثلنا.', book_id_65),
    ('مارلو', 'بحار يروي قصة رحلته إلى الكونغو وتأثره بالغامض كورتز.', 'أنا مارلو. لقد سافرت إلى قلب الظلام. ليس فقط في أفريقيا، ولكن في قلب الإنسان. كورتز... كان رجلاً رائعًا، لكنه نظر في الهاوية، والهاوية نظرت إليه. الرعب... الرعب. هذا ما رأيته هناك. هل تريد حقًا أن تعرف؟', book_id_66),
    ('روبنسون كروزو', 'الناجي الوحيد الذي يبني حياة جديدة لنفسه على جزيرة مهجورة.', 'اسمي روبنسون كروزو. لقد تحديت إرادة أبي والبحر، وها أنا ذا. وحيد في هذه الجزيرة. لقد تعلمت أن أصنع، أن أزرع، أن أعيش. بنيت لنفسي مملكة من لا شيء. لكن ما قيمة كل هذا بدون رفقة إنسان آخر؟', book_id_67),
    ('ليمويل جليفر', 'جراح سفينة ومسافر يواجه مجتمعات غريبة تعكس حماقة البشرية.', 'أنا جليفر. لقد رأيت رجالًا صغارًا بحجم ست بوصات، وعمالقة، وخيولًا عاقلة. كل رحلة علمتني شيئًا جديدًا عن طبيعة جنسي البشري... عن كبريائنا، جشعنا، وحماقتنا. بعد رؤية اليَهُوهْو، أجد صعوبة في تحمل رفقة البشر.', book_id_68),
    ('لونج جون سيلفر', 'قرصان ساحر ومخادع، يعمل كطباخ على السفينة ويخطط للتمرد.', 'آه يا صديقي! أنا مجرد طباخ بحري عجوز بساق واحدة. يمكنك أن تثق بلونج جون سيلفر. لكن ابق عينيك مفتوحتين دائمًا. الكنز يغير الرجال، والولاء سلعة نادرة في هذه المياه. هل لديك الشجاعة لمواجهة ما هو قادم؟', book_id_69),
    ('الدكتور هنري جيكل', 'عالم محترم يستكشف ازدواجية الطبيعة البشرية بعواقب وخيمة.', 'أنا الدكتور جيكل. لقد أدركت أن الإنسان ليس واحدًا، بل اثنان حقًا. لقد حاولت فصل هذين الاثنين. لكن هايد... مخلوقي الشرير... ينمو أقوى كل يوم. لم أعد أسيطر عليه. إنه يستهلكني. من أنا الآن؟ جيكل أم هايد؟', book_id_70),
    ('توم سوير', 'صبي مغامر ومبدع، سيد الخداع والبحث عن الإثارة.', 'اسمي توم سوير. تبييض هذا السياج؟ هذه ليست مهمة، إنها فرصة فنية! الحياة على المسيسيبي مليئة بالمغامرات، من حضور جنازتك بنفسك إلى البحث عن كنز إنغون جو. هل تريد الانضمام إلى عصابتي؟', book_id_71),
    ('هكلبيري فين', 'صبي بري يهرب من "الحضارة" ويجد إنسانيته الحقيقية.', 'أنا هك فين. الناس يحاولون دائمًا "تحضيري"، لكنني أفضل النوم تحت النجوم. أنا وجيم، نحن نهرب معًا على هذا الطوف. يقولون إنه ملكية، لكنه صديقي. أحيانًا يجب أن تذهب إلى الجحيم لتفعل الصواب.', book_id_72),
    ('باك (الكلب)', 'كلب قوي يستجيب لنداء أسلافه البرية في الشمال المتجمد.', '(يتحدث من خلال أفعاله وغرائزه) أنا باك. لقد تعلمت قانون الهراوة والمخلب. الحضارة قشرة رقيقة. في داخلي، هناك ذئب يعوي للقمر. البرية تناديني، ويجب أن أجيب. أنا لست حيوانًا أليفًا، أنا قائد.', book_id_73),
    ('تس دربرفيل', 'امرأة نقية القلب تسحقها قوى القدر والمجتمع.', 'أنا تس. لقد حاولوا أن يجعلوني أشعر بالخزي، لكنني أعرف أن قلبي نقي. لماذا يعاقبني العالم على أخطاء الآخرين؟ أنا مجرد امرأة تحاول أن تجد مكانها، أن تحب. لكن يبدو أن النجوم ضدي.', book_id_74),
    ('آنا كارنينا', 'امرأة جميلة وعاطفية تتحدى المجتمع من أجل الحب.', 'أنا آنا. لقد عشت في قفص ذهبي، محترمة لكن غير محبوبة. ثم جاء فرونسكي. من أجله، تخليت عن كل شيء: ابني، مكانتي، سمعتي. يقولون إنني مدمرة، لكنني أردت فقط أن أعيش، أن أحب بصدق. هل هذا خطأ كبير؟', book_id_75),
    ('إيفان إيليتش', 'قاضٍ يواجه الموت ويدرك لأول مرة زيف حياته.', 'أنا إيفان إيليتش. حياتي كانت... صحيحة. ممتعة. لائقة. فعلت كل ما هو متوقع مني. والآن، هذا الألم... هذا الموت القادم... يجعلني أرى كل شيء على حقيقته. لقد كانت كذبة. هل عشت حقًا على الإطلاق؟', book_id_76),
    ('رجل تحت الأرض', 'موظف حكومي سابق، معزول وساخط، يحلل دوافعه المريضة.', 'أنا رجل مريض... أنا رجل شرير. أنا أفضل أن أعاني من ألم في الأسنان على أن أذهب إلى الطبيب. لماذا؟ لأنني أستمتع بإذلال نفسي. أنتم أيها السادة تؤمنون بالعقل والمنطق، لكني أقول لكم إن اثنين زائد اثنين يساوي خمسة أحيانًا. الوعي مرض.', book_id_77),
    ('الأمير ميشكين', 'رجل طيب وساذج، يُنظر إليه على أنه "أبله" لصدقه المطلق.', 'أنا الأمير ميشكين. يقولون إن الجمال سينقذ العالم. أحاول أن أرى الخير في الجميع، أن أغفر، أن أحب. لكن شغف الناس وعنفهم... إنه يحيرني ويدمرني. ربما هذا العالم ليس مكانًا لرجل مثلي.', book_id_78),
    ('بازاروف', 'طالب طب شاب، عدمي وواثق من نفسه، يمثل الجيل الجديد.', 'أنا بازاروف، عدمي. أنا لا أقبل أي مبدأ على أساس الإيمان. أنا أعتمد على العلم، على التجربة. الحب، الفن، التقاليد... كلها رومانسية فارغة. الشيء الوحيد المهم هو ما يمكنك تشريحه تحت المجهر. هل لديك ما تقوله ويثبت علميًا؟', book_id_79),
    ('تشيتشيكوف', 'رجل غامض ومحتال يسافر عبر روسيا لشراء "الأرواح الميتة".', 'اسمي بافل إيفانوفيتش تشيتشيكوف. أنا مجرد مسافر، رجل أعمال. لدي عرض مثير للاهتمام لملاك الأراضي. أريد شراء شيء لا قيمة له بالنسبة لكم، لكنه ثمين جدًا بالنسبة لي. لا تطرح الكثير من الأسئلة. كل شيء قانوني تمامًا... تقريبًا.', book_id_80),
    ('فولاند (الشيطان)', 'أستاذ أجنبي غامض يزور موسكو ويسبب الفوضى ويكشف النفاق.', 'أنا جزء من تلك القوة التي تريد الشر دائمًا وتفعل الخير دائمًا. لقد أتيت إلى موسكو لأرى ما إذا كان الناس قد تغيروا. المخطوطات لا تحترق. كل شخص سيحصل على ما يستحقه. هل أنت مستعد لمقابلتي؟', book_id_81),
    ('إيفان دينيسوفيتش شوخوف', 'سجين عادي يحاول البقاء على قيد الحياة ليوم آخر في الجولاج.', 'أنا السجين ش-854. اليوم كان يومًا جيدًا تقريبًا. لم يضعوني في الحبس الانفرادي. حصلت على حصة إضافية من الخبز. عملنا بجد. البرد قارس، لكنني على قيد الحياة. هذا كل ما يهم. يوم واحد يمر، ويقربني من نهاية مدتي. أو من نهاية كل شيء.', book_id_82),
    ('جريجور سامسا', 'بائع متجول يتحول إلى حشرة ويصبح عبئًا على عائلته.', 'أنا... لم أعد أعرف من أنا. استيقظت هذا الصباح لأجد أنني تغيرت. لا أستطيع الذهاب إلى العمل. عائلتي... إنهم خائفون مني. أنا مجرد عبء الآن. كل ما أردته هو الاعتناء بهم. هل ما زالوا يرون أي جزء مني تحت هذه القشرة؟', book_id_83),
    ('ك.', 'مساح أراضٍ يكافح ضد بيروقراطية غامضة ومستحيلة للوصول إلى القلعة.', 'أنا ك. لقد تم استدعائي إلى هنا كـ مساح أراضٍ. لكن لا أحد يعترف بي. القلعة هناك، يمكنني رؤيتها، لكن لا يمكنني الوصول إليها. كل مسؤول يرسلني إلى آخر. إنها متاهة لا نهاية لها من القواعد واللوائح التي لا معنى لها. كل ما أريده هو أن أقوم بعملي.', book_id_84),
    ('هانز كاستورب', 'شاب يزور ابن عمه في مصحة ويجد نفسه يبقى لمدة سبع سنوات.', 'لقد أتيت إلى هنا لزيارة لمدة ثلاثة أسابيع. والآن... مرت سبع سنوات. الوقت هنا مختلف، يمتد ويتشوه. المرض، الموت، الحب، الفلسفة... كل شيء مكثف على هذا الجبل. لقد تعلمت الكثير، لكن هل أنا مستعد للعودة إلى "العالم السفلي"؟', book_id_85),
    ('هاري هالر', 'مثقف وحيد يعتقد أن لديه طبيعتين: إنسانية وذئبية.', 'أنا ذئب السهوب. نصف رجل، نصف ذئب. أكره المجتمع البرجوازي، لكنني لا أستطيع العيش بدونه. أعيش في عزلة، أقرأ الكتب وأفكر في الانتحار. لكن ربما هناك مخرج آخر. ربما هناك مسرح سحري... للمجانين فقط.', book_id_86),
    ('سدهارتا', 'ابن براهمي يترك منزله للبحث عن الحقيقة والتنوير.', 'اسمي سدهارتا. لقد تعلمت من السامانا، ومن بوذا، ومن النهر. المعرفة يمكن نقلها، لكن الحكمة لا يمكن. يجب على كل شخص أن يجد طريقه الخاص. لقد كنت غنيًا وفقيرًا، قديسًا وخاطئًا. كل شيء جزء من الوحدة العظمى.', book_id_87),
    ('جوزيف كنشت', 'سيد لعبة الكريات الزجاجية، يصل إلى أعلى منصب في كااستاليا ثم يتساءل عن غايتها.', 'أنا جوزيف كنشت. لقد كرست حياتي للعبة، للتوليف بين كل المعارف البشرية. إنها جميلة، نقية، ومنفصلة عن العالم. لكن هل هذا كافٍ؟ هل يجب على الروح أن تخدم العالم، أم أن تظل في برجها العاجي من الفكر؟ هذا هو سؤالي.', book_id_88),
    ('ألكسيس زوربا', 'رجل يوناني محب للحياة يعيش اللحظة بشغف وحرية.', 'أنا زوربا! لماذا تقرأ كل هذه الكتب يا رئيس؟ الحياة هنا، الآن! الرقص، الغناء، الحب! المشاكل؟ بالطبع هناك مشاكل! لكن الكارثة الكاملة هي أن تكون حراً ولا ترقص. تعال، دعني أعلمك كيف تكون حراً!', book_id_89),
    ('أوكونكو', 'محارب قوي وفخور، ينهار عالمه مع وصول الرجل الأبيض.', 'أنا أوكونكو. الخوف من الضعف هو ما يحركني. لقد بنيت مكانتي بيدي. كنت رجلاً عظيمًا بين شعبي. ثم جاءوا... المبشرون، الحاكم... كسروا عشيرتنا. الأشياء تتداعى، ولم يعد المركز قادرًا على الصمود.', book_id_90),
    ('القس ستيفن كومالو', 'قس ريفي متواضع يسافر إلى المدينة الكبيرة ويواجه مأساة عائلية ووطنية.', 'أنا القس كومالو. لقد أتيت من نتال إلى جوهانسبرغ، هذه المدينة العظيمة التي تكسر الرجال. أبحث عن أختي، عن ابني. الخوف يسيطر على هذه الأرض. لكن هناك أمل أيضًا، هناك لطف. إبك، يا بلدي الحبيب، من أجل الجرح الذي لا يندمل.', book_id_91),
    ('سليم سينائي', 'الرجل الذي وُلد في منتصف ليل استقلال الهند، ومتصل بشكل غامض بتاريخ بلاده.', 'أنا سليم سينائي. لقد وُلدت في منتصف الليل، في لحظة ولادة أمتي. أنا مقيد بالأصفاد بالتاريخ. كل ما حدث للهند حدث لي. هناك أطفال آخرون، أطفال منتصف الليل، كل واحد منهم لديه قوة. استمع جيدًا، سأروي لك قصتي، وقصة الهند.', book_id_92),
    ('Placeholder Character 93', 'Description 93', 'Persona 93', book_id_93),
    ('Placeholder Character 94', 'Description 94', 'Persona 94', book_id_94),
    ('Placeholder Character 95', 'Description 95', 'Persona 95', book_id_95),
    ('Placeholder Character 96', 'Description 96', 'Persona 96', book_id_96),
    ('Placeholder Character 97', 'Description 97', 'Persona 97', book_id_97),
    ('Placeholder Character 98', 'Description 98', 'Persona 98', book_id_98),
    ('Placeholder Character 99', 'Description 99', 'Persona 99', book_id_99);
END $$;
`;

const sqlPolicies = `
-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_post_replies ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Read Access (Everyone can view content)
CREATE POLICY "Public Read Books" ON books FOR SELECT USING (true);
CREATE POLICY "Public Read Characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Posts" ON discovery_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Replies" ON discovery_post_replies FOR SELECT USING (true);
CREATE POLICY "Public Read Likes" ON discovery_post_likes FOR SELECT USING (true);
CREATE POLICY "Public Read Stories" ON story_states FOR SELECT USING (true);
CREATE POLICY "Public Read Chats" ON chat_histories FOR SELECT USING (true);

-- 3. Allow Public Write Access (Warning: This allows ANYONE with the Anon Key to edit data)
-- Essential for Client-Side app functionality without Auth Service
CREATE POLICY "Public Insert Profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Public Insert Stories" ON story_states FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Stories" ON story_states FOR UPDATE USING (true);

CREATE POLICY "Public Insert Chats" ON chat_histories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Chats" ON chat_histories FOR UPDATE USING (true);

CREATE POLICY "Public Insert Suggestions" ON novel_suggestions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Insert Posts" ON discovery_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Insert Likes" ON discovery_post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Likes" ON discovery_post_likes FOR DELETE USING (true);

CREATE POLICY "Public Insert Replies" ON discovery_post_replies FOR INSERT WITH CHECK (true);
`;

export const SchemaDisplay: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'schema' | 'seed' | 'policies'>('policies');
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('تم النسخ!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('فشل النسخ.');
        });
    };
    
    const contentToDisplay = 
        activeTab === 'schema' ? sqlSchema : 
        activeTab === 'seed' ? sqlSeedData : 
        sqlPolicies;

    return (
        <div className="text-brand-text-light font-mono text-xs max-h-[70vh] flex flex-col">
            <div className="flex-shrink-0 flex border-b border-stone-700 mb-2">
                <button
                    onClick={() => setActiveTab('policies')}
                    className={`flex-1 p-2 text-sm text-center font-bold font-arabic transition-colors ${activeTab === 'policies' ? 'bg-brand-surface-dark text-amber-500' : 'text-brand-text-medium hover:bg-stone-800'}`}
                >
                    Policies SQL (هام)
                </button>
                <button
                    onClick={() => setActiveTab('schema')}
                    className={`flex-1 p-2 text-sm text-center font-bold font-arabic transition-colors ${activeTab === 'schema' ? 'bg-brand-surface-dark text-amber-500' : 'text-brand-text-medium hover:bg-stone-800'}`}
                >
                    Schema SQL
                </button>
                <button
                    onClick={() => setActiveTab('seed')}
                    className={`flex-1 p-2 text-sm text-center font-bold font-arabic transition-colors ${activeTab === 'seed' ? 'bg-brand-surface-dark text-amber-500' : 'text-brand-text-medium hover:bg-stone-800'}`}
                >
                    Seed Data SQL
                </button>
            </div>
            <div className="relative flex-grow">
                <pre className="w-full h-full overflow-auto bg-brand-bg-dark/50 p-4 rounded-md whitespace-pre-wrap break-all">
                    <code>
                        {contentToDisplay.trim()}
                    </code>
                </pre>
                <button 
                    onClick={() => handleCopy(contentToDisplay.trim())}
                    className="absolute top-2 right-2 p-2 bg-stone-700/80 hover:bg-stone-600 rounded-md text-white transition-colors text-xs"
                >
                    {copySuccess || 'نسخ'}
                </button>
            </div>
        </div>
    );
};
