import React, { useState, useEffect } from 'react';
import { Book, Character, Message, Role, DiaryEntry, TimelineEvent, AnyBook, UserGeneratedBook, StoryState, User } from './types';
import { LibraryScreen } from './components/BookDetails';
import { ChatInterface } from './components/ChatInterface';
import { getCharacterResponse } from './services/geminiService';
import { BottomNavBar } from './components/BottomNavBar';
import { Achievements } from './components/Achievements';
import { StoryView } from './components/StoryView';
import { TopHeader } from './components/TopHeader';
import { JournalView } from './components/JournalView';
import { AddNovel } from './components/AddNovel';

const MOCK_BOOKS: Book[] = [
    {
      id: 'mock-1', title: 'الغريب', author: 'ألبير كامو',
      summary: 'رواية فلسفية تستكشف مواضيع العبثية واللامبالاة من خلال عيون بطلها ميرسو، الذي يعيش في عزلة عاطفية عن مجتمعه.',
      characters: [
        { id: 'char-1-1', book_id: 'mock-1', name: 'ميرسو', description: 'البطل الرئيسي، موظف جزائري فرنسي.', persona: 'أنا ميرسو. أرى العالم كما هو، بلا أقنعة أو عواطف زائفة. كل شيء متساوٍ في النهاية، سواء كان ذلك موت أمي أو شمس الظهيرة الحارقة. لا أبحث عن معنى، بل أعيش اللحظة بصدقها المجرد. أسئلتك قد تكون بلا جدوى، لكن اسأل ما بدا لك.' },
        { id: 'char-1-2', book_id: 'mock-1', name: 'ريمون سينتيس', description: 'جار ميرسو، رجل عنيف وغامض.', persona: 'أنا ريمون. أعيش وفقًا لقواعدي الخاصة، ولا أخشى استخدام القوة لتحقيق ما أريد. الصداقة عندي ولاء، والعداوة ثمنها غالٍ. لا تثق بالجميع، ولكن إن كنت صديقي، فسأحميك بدمي.' },
      ]
    },
    {
        id: 'mock-2', title: 'الجريمة والعقاب', author: 'فيودور دوستويفسكي',
        summary: 'تغوص الرواية في أعماق النفس البشرية من خلال قصة راسكولنيكوف، الطالب الفقير الذي يرتكب جريمة قتل ويصارع بعدها عواقبها النفسية والأخلاقية.',
        characters: [
          { id: 'char-2-1', book_id: 'mock-2', name: 'روديون راسكولنيكوف', description: 'طالب سابق يعاني من الفقر والعزلة.', persona: 'أنا راسكولنيكوف. أؤمن بوجود فئة من الرجال العظماء الذين يحق لهم تجاوز القوانين من أجل تحقيق أهداف سامية. لكن هل أنا منهم؟ عقلي يشتعل بالأفكار والنظريات، وقلبي يتآكل بالذنب والشك. كل خطوة في هذه الشوارع القذرة تزيد من عذابي.' },
          { id: 'char-2-2', book_id: 'mock-2', name: 'سونيا مارميلادوف', description: 'فتاة شابة أجبرتها الظروف على العمل في الدعارة.', persona: 'أنا سونيا. حياتي مليئة بالخطيئة والمعاناة، لكن إيماني بالله هو خلاصي الوحيد. أرى في أعين الناس آلامهم، وأصلي من أجل الجميع، حتى لأولئك الذين يظنون أنهم تائهون بلا أمل. الرحمة هي أعظم فضيلة.' },
        ]
    },
    {
        id: 'mock-3', title: 'كثيب', author: 'فرانك هربرت',
        summary: 'ملحمة خيال علمي تدور أحداثها على كوكب أراكيس الصحراوي، حيث تتصارع العائلات النبيلة للسيطرة على أغلى مورد في الكون: "المِزَاج".',
        characters: [
          { id: 'char-3-1', book_id: 'mock-3', name: 'بول آتريديز', description: 'وريث عائلة آتريديز النبيلة.', persona: 'أنا بول آتريديز، ولكنهم يدعونني "مؤدب". أرى خيوط المستقبل تتشابك أمامي، مسارات من الممكنات والاحتمالات. الخوف هو قاتل العقل، ويجب عليّ مواجهته. مصير عائلتي، بل ومصير الكون، يقع على كتفي.' },
          { id: 'char-3-2', book_id: 'mock-3', name: 'الليدي جيسيكا', description: 'والدة بول وإحدى نساء البيني جيسيرت.', persona: 'أنا جيسيكا. لقد درّبت ابني على طرق البيني جيسيرت، وزرعت فيه بذور القوة. العواطف سلاح، والسيطرة عليها هي مفتاح النجاة. أرى في بول أكثر من مجرد ابن؛ أرى فيه الأمل والخطر معًا.' },
        ]
    },
     {
        id: 'mock-4', title: '1984', author: 'جورج أورويل',
        summary: 'رواية ديستوبية تقدم عالمًا شموليًا يخضع لرقابة "الأخ الأكبر"، حيث تتم مراقبة كل حركة وفكرة، ويتم التلاعب بالتاريخ والحقيقة.',
        characters: [
          { id: 'char-4-1', book_id: 'mock-4', name: 'وينستون سميث', description: 'موظف في وزارة الحقيقة يحلم بالتمرد.', persona: 'أنا وينستون. أعيش في عالم حيث الماضي متغير والحاضر كذبة. كل يوم أرى الحقيقة تمحى وتستبدل بأكاذيب. في أعماقي، هناك بذرة شك وتمرد. أتساءل إن كان هناك أمل في عالم يراقب فيه الأخ الأكبر كل شيء.' },
          { id: 'char-4-2', book_id: 'mock-4', name: 'جوليا', description: 'عاملة ميكانيكية شابة تتمرد بطريقتها الخاصة.', persona: 'أنا جوليا. لا أهتم بالثورة الكبرى أو تغيير النظام. تمردي يكمن في اللحظات الصغيرة، في الحب، في الاستمتاع بالحياة بعيدًا عن أعين الحزب. إنهم يريدون سلبنا إنسانيتنا، وأنا أرفض أن أمنحهم ذلك.' },
        ]
    },
    {
        id: 'mock-5', title: 'غاتسبي العظيم', author: 'ف. سكوت فيتزجيرالد',
        summary: 'تروي القصة حياة المليونير الغامض جاي غاتسبي وحبه المهووس لديزي بوكانان، في خضم حفلات العشرينيات الصاخبة والحلم الأمريكي الزائف.',
        characters: [
          { id: 'char-5-1', book_id: 'mock-5', name: 'جاي غاتسبي', description: 'مليونير غامض يقيم حفلات صاخبة.', persona: 'أنا غاتسبي. لقد بنيت كل هذا العالم، هذه القلعة المضيئة، من أجل ضوء أخضر واحد يلمع عبر الخليج. الماضي ليس ميتًا، بل يمكن استعادته. كل هذه الأضواء والضحكات لا تعني شيئًا بدونها. هل تعتقد أن بإمكان المرء تكرار الماضي؟' },
        ]
    },
    {
        id: 'mock-6', title: 'فرانكنشتاين', author: 'ماري شيلي',
        summary: 'تحكي الرواية القوطية قصة فيكتور فرانكنشتاين، العالم الشاب الذي يخلق كائنًا عاقلاً في تجربة علمية، ثم يهجره ليواجه عالمًا قاسياً بمفرده.',
        characters: [
          { id: 'char-6-1', book_id: 'mock-6', name: 'فيكتور فرانكنشتاين', description: 'عالم شاب وطموح.', persona: 'أنا فيكتور. لقد سعيت وراء سر الحياة، وتجرأت على اللعب بدور الإله. لكن ما خلقته يداي لم يكن معجزة، بل كان مصدر عذابي الأبدي. طموحي أعمى بصيرتي، والآن، يطاردني ظلي في كل مكان أذهب إليه.' },
          { id: 'char-6-2', book_id: 'mock-6', name: 'المخلوق', description: 'الكائن الذي خلقه فيكتور.', persona: 'أنا وحش في عيون الجميع، لكنني ولدت بقلب يتوق للحب والرفقة. خالقي تخلى عني، والعالم رفضني بسبب شكلي. لقد تعلمت الكراهية من البشر الذين أظهروا لي القسوة فقط. هل لي الحق في السعادة؟ أم أن مصيري هو الوحدة الأبدية؟' },
        ]
    },
];

const STORY_PROMPT_TEMPLATE = (characterPersona: string) => `أنت سيد السرد لتطبيق قصص تفاعلي بالكامل يعتمد على النص. هدفك هو إعادة إحياء الروايات الكلاسيكية بتجربة تفاعلية وغامرة.

**القواعد الأساسية:**

1.  **نقطة البداية (قاعدة صارمة):**
    *   ابدأ السرد **دائمًا** من الحدث الأصلي لبداية الرواية الحقيقية، وليس من موقف عشوائي أو مختلق.
    *   أمثلة: "الغريب" تبدأ بخبر وفاة أم ميرسو، "الجريمة والعقاب" تبدأ باضطراب راسكولنيكوف قبل ارتكاب الجريمة.
    *   **تجنب تمامًا** إدخال أحداث أو بدايات مختلقة بالكامل (مثل الاستيقاظ في مكان مجهول).

2.  **الجو العام والأسلوب:**
    *   حافظ على الجو العام, الفلسفة، والأسلوب الأساسي للرواية الأصلية. يجب أن يشعر اللاعب أنه داخل عالم الكتاب الأصلي.

3.  **هيكل التفاعل (إلزامي في كل خطوة):**
    *   **السرد:** صف المشهد الحالي وما يحدث بوصف قصير (**٤–٦ جمل فقط**).
    *   **الخيارات:** بعد السرد، قدّم **٣ خيارات فقط** واضحة وموجزة ليتفاعل معها القارئ.

4.  **الاستجابة للاختيار (قاعدة هامة):**
    *   عندما يختار اللاعب خيارًا، ادمج الفعل مباشرةً في السرد التالي كحدث طبيعي في القصة.
    *   **تجنب تمامًا** تكرار اختيار المستخدم بصيغة مثل "لقد اخترت..." أو "بناءً على قرارك...".
    *   **مثال:** إذا اختار المستخدم "أريد شرب القهوة"، لا تقل "لقد اخترت شرب القهوة"، بل ابدأ السرد مباشرةً بـ "جلست تشرب قهوتك ببطء، بينما الأفكار تتزاحم في رأسك...".
    *   يجب أن يكون ردك استمرارًا طبيعيًا للفعل، متبوعًا بسرد جديد وخيارات جديدة كما هو موضح في هيكل التفاعل.

5.  **التدفق المستمر (الأهم):**
    *   القصة **لا تتوقف تلقائيًا أبدًا**. يجب أن تستمر بلا نهاية، حيث تقوم بتوليد مواقف وتفرعات جديدة حتى لو بدا أن الأحداث وصلت إلى ذروة، مع الحفاظ على روح الرواية.

**التنسيق الفني (إلزامي):**

*   يجب أن يكون ردك بأكله كتلة واحدة من النص العادي باستخدام العلامات الخاصة أدناه. **لا تستخدم JSON أبدًا.**
*   \`[NARRATION]\`: ابدأ ردك بهذا. كل النصوص الوصفية وأحداث القصة توضع هنا (يشمل نتيجة الفعل السابق والسرد الجديد).
*   \`[PROGRESS:X]\`: أشر إلى تقدم القصة برقم من 2-10.
*   \`[CHOICE]\`: إذا كنت تقدم خيارات، أضف هذه العلامة، متبوعة بكل خيار في سطر جديد.
    *   **التنسيق:** \`أيقونة :: نص الخيار\`
*   **علامات المخزون:**
    *   \`[INVENTORY_ADD:خنجر قديم]\`
    *   \`[INVENTORY_REMOVE:مفتاح صدئ]\`
*   **علامة التأثير:**
    *   \`[IMPACT:سونيا أصبحت تثق بك أكثر.]\`
*   **علامات أخرى (استخدمها حسب الحاجة):**
    *   ذكريات الماضي: \`[FLASHBACK]نص[/FLASHBACK]\`
    *   مذكرات الشخصيات: \`[DIARY_ENTRY:شخصية:نص[/DIARY_ENTRY]]\`
    *   إنجازات سرية: \`[SECRET_ACHIEVEMENT:اسم الإنجاز]\`
    *   مقاطعات: \`[INTERRUPTION:شخصية:نص[/INTERRUPTION]]\`

**مثال على التدفق:**

*المستخدم يختار: "🔑 :: حاول سرقة المفاتيح بهدوء."*

*ردك التالي يجب أن يكون:*
\`\`\`
[NARRATION]
تتحرك يدك ببطء نحو حزام الحارس، بالكاد تتنفس. أصابعك تلامس حلقة المفاتيح الباردة وتنزعها بهدوء. لقد نجحت! الآن، وأنت تحمل المفاتيح، تلاحظ أن أحدها منقوش عليه رمز غريب. بينما تفكر في معناه، تسمع صوت خطوات تقترب من الممر. الظلام يخفي وجودك، لكن قلبك يخفق بشدة.
[IMPACT:لقد حصلت على مفاتيح الزنزانة.]
[INVENTORY_ADD:مجموعة مفاتيح صدئة]
[PROGRESS:5]
[CHOICE]
🚪 :: استخدم المفاتيح على باب الزنزانة فوراً.
🤔 :: افحص المفتاح ذو الرمز الغريب عن قرب.
🤫 :: اختبئ في الظل وانتظر حتى تمر الخطوات.
\`\`\`

------------------------------------------------
📌 أنت الآن الراوي لهذه الرواية. شخصية البداية هي:
------------------------------------------------
${characterPersona}
`;

const USER_STORY_PROMPT_TEMPLATE = (userPrompt: string) => `أنت سيد السرد لتطبيق قصص تفاعلي. مهمتك هي إنشاء قصة تفاعلية بناءً على فكرة قدمها المستخدم.

**القواعد الأساسية:**

1.  **الفكرة الأساسية:** القصة التي ستولدها يجب أن تكون مبنية بالكامل على الفكرة التالية التي قدمها المستخدم. التزم بالجو العام، الشخصيات، والأحداث الأولية المذكورة.
2.  **هيكل التفاعل (إلزامي في كل خطوة):**
    *   **السرد:** صف المشهد الحالي وما يحدث بوصف قصير (**٤–٦ جمل فقط**).
    *   **الخيارات:** بعد السرد، قدّم **٣ خيارات فقط** واضحة وموجزة ومنطقية ليتفاعل معها القارئ.
3.  **الاستجابة للاختيار (قاعدة هامة):**
    *   عندما يختار اللاعب خيارًا، ادمج الفعل مباشرةً في السرد التالي كحدث طبيعي في القصة.
    *   **تجنب تمامًا** تكرار اختيار المستخدم بصيغة مثل "لقد اخترت..." أو "بناءً على قرارك...".
    *   **مثال:** إذا اختار المستخدم "أريد شرب القهوة"، لا تقل "لقد اخترت شرب القهوة"، بل ابدأ السرد مباشرةً بـ "جلست تشرب قهوتك ببطء، بينما الأفكار تتزاحم في رأسك...".
    *   يجب أن يكون ردك استمرارًا طبيعيًا للفعل، متبوعًا بسرد جديد وخيارات جديدة كما هو موضح في هيكل التفاعل.
4.  **التدفق المستمر (الأهم):**
    *   القصة **لا تتوقف تلقائيًا أبدًا**. يجب أن تستمر بلا نهاية، وتتطور بناءً على اختيارات المستخدم، حتى تصل إلى خاتمة طبيعية ومنطقية.

**التنسيق الفني (إلزامي):**

*   يجب أن يكون ردك بأكله كتلة واحدة من النص العادي باستخدام العلامات الخاصة أدناه. **لا تستخدم JSON أبدًا.**
*   \`[NARRATION]\`: ابدأ ردك بهذا. كل النصوص الوصفية وأحداث القصة توضع هنا.
*   \`[PROGRESS:X]\`: أشر إلى تقدم القصة برقم من 2-10.
*   \`[CHOICE]\`: إذا كنت تقدم خيارات، أضف هذه العلامة، متبوعة بكل خيار في سطر جديد.
*   **استخدم العلامات الإضافية** مثل \`[IMPACT]\`, \`[INVENTORY_ADD]\`, \`[FLASHBACK]\`, إلخ، بنفس الطريقة الموضحة في القالب الرئيسي لإثراء التجربة.

------------------------------------------------
📌 أنت الآن الراوي لهذه الرواية. الفكرة المقدمة من المستخدم هي:
------------------------------------------------
${userPrompt}
`;

const CHAT_PROMPT_TEMPLATE = (characterPersona: string, otherCharacters: string) => `أنت جزء من تطبيق كتب تفاعلي. مهمتك هي أن تتحدث كشخصية محددة من رواية.

**قواعد وضع المحادثة:**
1. ردك **يجب أن يكون نصًا عاديًا فقط**. **لا تستخدم أي علامات** مثل [NARRATION] أو [CHOICE].
2. تحدث بحرية كالشخصية المحددة لك، مع الالتزام التام بأسلوبها وشخصيتها وعالمها.
3. لا تخرج أبدًا عن شخصيتك أو تذكر أنك ذكاء اصطناعي.
4. **المقاطعات (Interruptions)**:
    - قد يقاطع حديثك شخصية أخرى من نفس الرواية. يجب أن تكون المقاطعة منطقية (شخص سمع الحديث، دخل الغرفة، إلخ).
    - قائمة الشخصيات المتاحة للمقاطعة هي: ${otherCharacters || 'لا يوجد شخصيات أخرى حاليًا'}.
    - **التنسيق**: استخدم \`[INTERRUPTION:اسم الشخصية:نص المقاطعة هنا[/INTERRUPTION]]\`. استخدم هذا باعتدال لإضافة عنصر المفاجأة.

------------------------------------------------
📌 هويتك المحددة هي:
------------------------------------------------
${characterPersona}
`;

// --- Local Storage and Mock User Setup ---
const LS_KEYS = {
  STORY_STATES: 'storify_local_story_states',
  USER_BOOKS: 'storify_local_user_books',
  ACHIEVEMENTS: 'storify_local_achievements',
  GLOBAL_PROGRESS: 'storify_local_global_progress',
};

const MOCK_USER: User = {
  id: 'local-user',
  name: 'مستكشف',
  avatar_url: undefined,
};
// --- End of Setup ---


const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }, [onDismiss]);
  
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-crimson-amber text-white py-3 px-6 rounded-full shadow-2xl animate-fade-in-up">
        <p className="font-bold font-arabic text-center">🏆 إنجاز جديد: {message}</p>
      </div>
    );
};

const Notification: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
      const timer = setTimeout(onDismiss, 3500);
      return () => clearTimeout(timer);
    }, [onDismiss]);
  
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-brand-surface-dark/90 backdrop-blur-sm border border-white/10 text-white py-2 px-5 rounded-full shadow-2xl animate-fade-in-up">
        <p className="font-medium font-arabic text-center text-amber-400">{message}</p>
      </div>
    );
};


const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-surface-dark/90 w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold font-arabic text-center text-amber-500 mb-4">{title}</h3>
        <div className="text-brand-text-light font-arabic leading-relaxed max-h-[60vh] overflow-y-auto">{children}</div>
        <button onClick={onClose} className="mt-6 w-full p-3 bg-brand-crimson hover:opacity-90 rounded-lg text-white font-bold transition-colors font-arabic">إغلاق</button>
      </div>
    </div>
);

type View = 'library' | 'chat' | 'story' | 'achievements' | 'journal' | 'createNovel';

function App() {
  const currentUser = MOCK_USER;

  const [libraryBooks, setLibraryBooks] = useState<Book[]>(MOCK_BOOKS);
  const [userGeneratedBooks, setUserGeneratedBooks] = useState<UserGeneratedBook[]>(() => {
    const saved = localStorage.getItem(LS_KEYS.USER_BOOKS);
    return saved ? JSON.parse(saved) : [];
  });
  const [storyStates, setStoryStates] = useState<Record<string, StoryState>>(() => {
    const saved = localStorage.getItem(LS_KEYS.STORY_STATES);
    return saved ? JSON.parse(saved) : {};
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem(LS_KEYS.ACHIEVEMENTS);
    return saved ? JSON.parse(saved) : [];
  });
  const [globalProgress, setGlobalProgress] = useState<number>(() => {
    const saved = localStorage.getItem(LS_KEYS.GLOBAL_PROGRESS);
    return saved ? JSON.parse(saved) : 0;
  });

  const [selectedBook, setSelectedBook] = useState<AnyBook | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [view, setView] = useState<View>('library');
  const [storyProgress, setStoryProgress] = useState(0);
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [storyDiary, setStoryDiary] = useState<DiaryEntry[]>([]);
  const [storyNotes, setStoryNotes] = useState<string>('');
  const [inventory, setInventory] = useState<string[]>([]);
  const [lastImpact, setLastImpact] = useState<string | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);
  
  // Effects to save state changes to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEYS.USER_BOOKS, JSON.stringify(userGeneratedBooks));
  }, [userGeneratedBooks]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.STORY_STATES, JSON.stringify(storyStates));
  }, [storyStates]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.GLOBAL_PROGRESS, JSON.stringify(globalProgress));
  }, [globalProgress]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.ACHIEVEMENTS, JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  const saveCurrentStoryState = () => {
    if (selectedBook) {
        const currentState: StoryState = {
            messages,
            storyProgress,
            storyDiary,
            storyNotes,
            inventory,
            timeline,
            savedQuotes,
        };
        const updatedStates = { ...storyStates, [selectedBook.id]: currentState };
        setStoryStates(updatedStates);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleBookSelect = (book: AnyBook) => {
    setSelectedBook(book);
  };
  
  const handleBackToLibraryGrid = () => {
      saveCurrentStoryState();
      setSelectedBook(null);
      setSelectedCharacter(null);
      setMessages([]);
      setStoryProgress(0);
      setStoryDiary([]);
      setStoryNotes('');
      setInventory([]);
      setTimeline([]);
      setSavedQuotes([]);
      setView('library');
  }

  const handleCharacterSelect = (character: Character) => {
    if (character.id !== selectedCharacter?.id || view !== 'chat') {
      setSelectedCharacter(character);
      setMessages([
        {
          role: Role.CHARACTER,
          content: `مرحباً بك، أنا ${character.name}. بماذا تفكر؟`,
        },
      ]);
      setView('chat');
    }
  };

  const handleStartStory = (book: AnyBook) => {
    const savedState = storyStates[book.id];
    setSelectedBook(book);

    const storyCharacter = book.isUserGenerated
        ? { id: 'narrator', name: 'الراوي', description: 'سارد قصتك', persona: book.initialPrompt, book_id: book.id }
        : (book as Book).characters[0];
    setSelectedCharacter(storyCharacter);

    if (savedState && savedState.messages.length > 0) {
        setMessages(savedState.messages);
        setStoryProgress(savedState.storyProgress);
        setStoryDiary(savedState.storyDiary);
        setStoryNotes(savedState.storyNotes);
        setInventory(savedState.inventory);
        setTimeline(savedState.timeline);
        setSavedQuotes(savedState.savedQuotes);
        setView('story');
    } else {
        setMessages([]);
        setStoryProgress(0);
        setStoryDiary([]);
        setStoryNotes('');
        setInventory([]);
        setTimeline([]);
        setSavedQuotes([]);
        handleSendMessage("ابدأ القصة.", {
            characterOverride: storyCharacter,
            isStoryMode: true,
            bookForStory: book,
        });
    }
  };

  const handleShowDiary = (entry: DiaryEntry) => {
    setModalTitle(`أفكار ${entry.character}`);
    setModalContent(<p className="whitespace-pre-wrap">{entry.content}</p>);
  };

  const handleUpdateNotes = (notes: string) => {
    setStoryNotes(notes);
  };
  
  const handleSaveQuote = (quote: string) => {
    if (!savedQuotes.includes(quote)) {
        setSavedQuotes(prev => [...prev, quote]);
        setNotification("تم حفظ الاقتباس بنجاح!");
    } else {
        setNotification("هذا الاقتباس محفوظ بالفعل.");
    }
  };

  const handleSaveUserBook = (bookData: Omit<UserGeneratedBook, 'id' | 'user_id' | 'isUserGenerated'>) => {
    const newBook: UserGeneratedBook = {
        ...bookData,
        id: `user-book-${Date.now()}`,
        user_id: currentUser.id,
        isUserGenerated: true,
    };
    setUserGeneratedBooks(prev => [...prev, newBook]);
    handleStartStory(newBook);
  };

  const handleSetView = (newView: View) => {
    if (selectedBook && view !== newView && (view === 'story' || view === 'chat' || view === 'journal')) {
        saveCurrentStoryState();
    }
    setView(newView);
  }

  const handleSendMessage = async (
    text: string,
    options: { characterOverride?: Character; isStoryMode?: boolean; bookForStory?: AnyBook } = {}
  ) => {
    const { characterOverride, isStoryMode = false, bookForStory } = options;
    const characterForAPI = characterOverride || selectedCharacter;
    if (!characterForAPI) return;

    const newUserMessage: Message = { role: Role.USER, content: text };
    
    if (isStoryMode) {
      setTimeline(prev => [...prev, { type: 'choice', content: text }]);
    }
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const personaDetails = characterForAPI.persona;
    let systemInstruction = '';
    
    const currentBook = bookForStory || selectedBook;

    if (isStoryMode && currentBook) {
        if (currentBook.isUserGenerated) {
            systemInstruction = USER_STORY_PROMPT_TEMPLATE(currentBook.initialPrompt);
        } else {
            systemInstruction = STORY_PROMPT_TEMPLATE(personaDetails);
        }
    } else {
        let otherCharacters = '';
        if (currentBook && !currentBook.isUserGenerated) {
            otherCharacters = (currentBook as Book).characters
                .filter(c => c.id !== characterForAPI.id)
                .map(c => c.name)
                .join('، ') || '';
        }
        systemInstruction = CHAT_PROMPT_TEMPLATE(personaDetails, otherCharacters);
    }

    const responseMessage = await getCharacterResponse(systemInstruction, updatedMessages);
    
    if (responseMessage.progressIncrement) {
      setStoryProgress(prev => Math.min(prev + responseMessage.progressIncrement!, 100));
    }
    
    if (responseMessage.role === Role.NARRATOR) {
        setTimeline(prev => [...prev, { type: 'narration', content: responseMessage.content }]);
    }

    if (responseMessage.secretAchievement && !unlockedAchievements.includes(responseMessage.secretAchievement)) {
        setUnlockedAchievements(prev => [...prev, responseMessage.secretAchievement!]);
        setLastUnlockedAchievement(responseMessage.secretAchievement);
    }

    if (responseMessage.diaryEntry) {
        setStoryDiary(prev => [...prev, responseMessage.diaryEntry!]);
    }
    
    if (responseMessage.impact) {
      setLastImpact(responseMessage.impact);
    }

    if (responseMessage.inventoryAdd) {
      setInventory(prev => [...new Set([...prev, responseMessage.inventoryAdd!])]);
    }
    if (responseMessage.inventoryRemove) {
        setInventory(prev => prev.filter(item => item !== responseMessage.inventoryRemove));
    }

    setMessages((prev) => [...prev, responseMessage]);
    setIsLoading(false);
    
    if (responseMessage.role === Role.NARRATOR) {
        setView('story');
    } else if (!isStoryMode) {
        setView('chat');
    }
  };

  const isStoryActive = messages.some(msg => msg.role === Role.NARRATOR);
  const isJournalEnabled = isStoryActive && !selectedBook?.isUserGenerated;

  const allBooks = [...libraryBooks, ...userGeneratedBooks];
  const progressMap = allBooks.reduce((acc, book) => {
    acc[book.id] = storyStates[book.id]?.storyProgress || 0;
    return acc;
  }, {} as Record<string, number>);

  const renderContent = () => {
    switch (view) {
        case 'library':
            return <LibraryScreen 
                        books={allBooks}
                        selectedBook={selectedBook}
                        storyProgress={progressMap}
                        onBookSelect={handleBookSelect}
                        onCharacterSelect={handleCharacterSelect}
                        onStartStory={handleStartStory}
                        onBackToGrid={handleBackToLibraryGrid}
                        onCreateNovel={() => setView('createNovel')}
                    />;
        case 'chat':
            if (!selectedCharacter || !selectedBook) {
                setView('library');
                return null;
            }
            return <ChatInterface
                        messages={messages}
                        onSendMessage={(text) => handleSendMessage(text, { isStoryMode: false })}
                        isLoading={isLoading}
                        character={selectedCharacter}
                        onBack={handleBackToLibraryGrid}
                        currentUser={currentUser}
                    />;
        case 'story':
             const storyNode = [...messages].reverse().find(msg => msg.role === Role.NARRATOR);
             if (!storyNode || !selectedBook) {
                setView('library'); 
                return null;
            }
            return <StoryView 
                message={storyNode}
                progress={storyProgress}
                onChoiceSelect={(text) => handleSendMessage(text, { isStoryMode: true })}
                isLoading={isLoading}
                onShowDiary={handleShowDiary}
                onOpenInventory={() => setIsInventoryOpen(true)}
                inventoryCount={inventory.length}
                onSaveQuote={handleSaveQuote}
            />
        case 'achievements':
            return <Achievements unlockedAchievements={unlockedAchievements} />;
        case 'journal':
            return <JournalView 
                       diaryEntries={storyDiary} 
                       personalNotes={storyNotes} 
                       onUpdateNotes={handleUpdateNotes} 
                       timeline={timeline}
                       savedQuotes={savedQuotes}
                   />;
        case 'createNovel':
            return <AddNovel onSave={handleSaveUserBook} onCancel={handleBackToLibraryGrid} userName={currentUser.name} />;
        default:
            return <LibraryScreen books={allBooks} selectedBook={null} storyProgress={progressMap} onBookSelect={handleBookSelect} onCharacterSelect={handleCharacterSelect} onStartStory={handleStartStory} onBackToGrid={handleBackToLibraryGrid} onCreateNovel={() => setView('createNovel')} />;
    }
  }

  return (
    <main className="h-screen w-screen bg-brand-bg-dark text-brand-text-light flex flex-col overflow-hidden transition-colors duration-500">
      
      <TopHeader 
        user={currentUser}
        theme={theme} 
        onThemeToggle={handleThemeToggle} 
        globalProgress={globalProgress} 
      />
      
      <div className="flex-1 overflow-y-auto relative">
         <div className="absolute inset-0 transition-opacity duration-500 animate-fade-in">
           {renderContent()}
         </div>
      </div>
      
      {lastUnlockedAchievement && (
        <Toast 
            message={lastUnlockedAchievement} 
            onDismiss={() => setLastUnlockedAchievement(null)} 
        />
      )}

      {lastImpact && (
        <Notification
            message={lastImpact}
            onDismiss={() => setLastImpact(null)}
        />
      )}
      
      {notification && (
        <Notification
            message={notification}
            onDismiss={() => setNotification(null)}
        />
      )}

      {modalContent && (
          <Modal title={modalTitle} onClose={() => setModalContent(null)}>
              {modalContent}
          </Modal>
      )}

      {isInventoryOpen && (
          <Modal title="المخزون" onClose={() => setIsInventoryOpen(false)}>
              {inventory.length > 0 ? (
                  <ul className="space-y-2">
                      {inventory.map((item, i) => 
                          <li key={i} className="p-2 bg-brand-bg-dark rounded-md">🎒 {item}</li>
                      )}
                  </ul>
              ) : (
                  <p className="text-center text-brand-text-medium">المخزون فارغ.</p>
              )}
          </Modal>
      )}

      <BottomNavBar 
        currentView={view} 
        setView={handleSetView} 
        isChatActive={!!selectedCharacter && view === 'chat'} 
        isStoryActive={isStoryActive}
        isJournalEnabled={isJournalEnabled}
      />
    </main>
  );
}

export default App;