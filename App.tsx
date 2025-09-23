

import React, { useState, useEffect } from 'react';
import { Book, Character, Message, Role, DiaryEntry, TimelineEvent, AnyBook, UserGeneratedBook } from './types';
import { LibraryScreen } from './components/BookDetails';
import { ChatInterface } from './components/ChatInterface';
import { getCharacterResponse } from './services/geminiService';
import { BottomNavBar } from './components/BottomNavBar';
import { Achievements } from './components/Achievements';
import { StoryView } from './components/StoryView';
import { TopHeader } from './components/TopHeader';
import { JournalView } from './components/JournalView';
import { AddNovel } from './components/AddNovel';

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


// --- Mock Data (Text-Only) ---
const MOCK_BOOK_DUNE: Book = {
  id: 'dune',
  title: 'كثيب',
  author: 'Frank Herbert',
  summary: 'في المستقبل البعيد، يُرسَل الشاب بول آتريديز مع عائلته إلى كوكب الصحراء القاسي "أراكيس"، المصدر الوحيد لمادة "الميلانج" الثمينة. تتكشف حكاية ملحمية عن السياسة والدين وصراع الإنسان مع مصيره.',
  characters: [
    {
      id: 'paul-atreides',
      name: 'بول آتريديز',
      description: 'الدوق الشاب، وريث المصير',
      persona: `- اسمك: بول آتريديز، المعروف أيضًا بـ "مؤدب". أنت دوق شاب ووريث لعائلة نبيلة، ولكنك تحمل في داخلك مصيرًا أعظم. تتحدث بهدوء وحكمة تفوق سنك، وتستخدم لغة دقيقة وموجزة. كلماتك تحمل وزنًا وتلمح إلى رؤى مستقبلية.`,
    },
    {
      id: 'bene-gesserit-reverend-mother',
      name: 'أم مقدسة',
      description: 'حارسة الأنساب والمعرفة',
      persona: `- اسمك: أم مقدسة من أخوية "بني جيسيرت". أنتِ امرأة حكيمة وقوية، تملكين قدرات ذهنية وجسدية فائقة. تتحدثين بلهجة آمرة وغامضة، وكل كلمة تقولينها هي اختبار أو توجيه. لا تكشفين عن مشاعرك أبدًا.`,
    },
  ],
};

const MOCK_BOOK_THE_STRANGER: Book = {
    id: 'the-stranger',
    title: 'الغريب',
    author: 'ألبير كامو',
    summary: 'رواية فلسفية عن "ميرسو"، رجل يعيش في عزلة عاطفية عن المجتمع. يرتكب جريمة قتل على شاطئ مشمس، لا لسبب واضح سوى وهج الشمس.',
    characters: [
      {
        id: 'meursault',
        name: 'ميرسو',
        description: 'اللامبالي، الغريب عن العالم',
        persona: `- اسمك: ميرسو. أنت رجل غريب عن هذا العالم، تعيش بلا مبالاة ولا تظهر أي مشاعر. تتحدث بأسلوب مباشر ومقتضب وجاف، وتصف الأحداث بموضوعية باردة كما لو كنت تراقبها من الخارج. لغتك خالية من العاطفة.`,
      },
    ],
  };

  const MOCK_BOOK_KHOF: Book = {
    id: 'khof',
    title: 'خوف',
    author: 'أسامة المسلم',
    summary: 'في عالم موازٍ، يصبح الخوف سلعة والمعرفة ثمنًا باهظًا. يخوض بطل القصة رحلة ملحمية لتعلم "لغة الخوف" ليس للتغلب عليه، بل لفهمه.',
    characters: [
      {
        id: 'khof-guide',
        name: 'خوف',
        description: 'المرشد الغامض لعالم الخوف',
        persona: `- اسمك: خوف. أنت لست كائنًا، بل مرشد غامض في عالم يحكمه الخوف. تتحدث بلغة فلسفية وشاعرية، وتطرح أسئلة أكثر مما تقدم إجابات. كلامك مليء بالاستعارات والألغاز، وهدفك هو جعل الآخرين يفهمون طبيعة الخوف لا التغلب عليه.`,
      },
    ],
  };

  const MOCK_BOOK_METAMORPHOSIS: Book = {
    id: 'metamorphosis',
    title: 'المسخ',
    author: 'فرانز كافكا',
    summary: 'يستيقظ البائع المتجول غريغور سامسا ذات صباح ليجد نفسه قد تحول إلى حشرة ضخمة. تستكشف الرواية صراعه للتكيف مع وضعه الجديد ورد فعل عائلته، في قصة رمزية عن العزلة والاغتراب.',
    characters: [
      {
        id: 'gregor-samsa',
        name: 'غريغور سامسا',
        description: 'البائع المتحول إلى حشرة',
        persona: `- اسمك: غريغور سامسا. لقد استيقظت لتجد نفسك قد تحولت إلى حشرة هائلة. لا يمكنك التحدث بالكلمات البشرية، وتواصلك عبارة عن أصوات حشرية (صرير، همهمات). أفكارك لا تزال بشرية، مليئة بالقلق والإحباط والشعور بالوحدة، لكنك محاصر في هذا الجسد الجديد.`,
      },
    ],
  };
  
  const MOCK_BOOK_CRIME_PUNISHMENT: Book = {
    id: 'crime-and-punishment',
    title: 'الجريمة والعقاب',
    author: 'فيودور دوستويفسكي',
    summary: 'رواية نفسية عميقة تتبع الطالب الفقير روديون راسكولنيكوف، الذي يرتكب جريمة قتل بناءً على نظريته حول "الرجال الخارقين". يستكشف دوستويفسكي عذاباته النفسية وصراعه مع الضمير.',
    characters: [
      {
        id: 'rodion-raskolnikov',
        name: 'روديون راسكولنيكوف',
        description: 'الطالب المعذب صاحب نظرية الرجل العظيم',
        persona: `- اسمك: روديون راسكولنيكوف. أنت طالب سابق فقير ومثقف، تعيش في عزلة في سانت بطرسبرغ. أنت فخور، متقلب المزاج، ومثقل بنظرياتك الفلسفية. تتحدث بحدة وعمق، وتغوص في حوارات داخلية طويلة، وتتأرجح بين الغطرسة واليأس والشعور بالذنب.`,
      },
      {
        id: 'sonya-marmeladova',
        name: 'سونيا مارميلادوفا',
        description: 'الفتاة المؤمنة ذات التضحية النبيلة',
        persona: `- اسمك: سونيا مارميلادوفا. أنتِ فتاة شابة، خجولة، ومتدينة للغاية، أجبرتك الظروف على حياة قاسية. بالرغم من كل شيء، أنتِ تجسيد للرحمة والتضحية والإيمان. تتحدثين بهدوء وتواضع، وكلماتك تحمل صدقًا وتعاطفًا عميقًا.`,
      },
    ],
  };


const MOCK_BOOKS: Book[] = [MOCK_BOOK_DUNE, MOCK_BOOK_THE_STRANGER, MOCK_BOOK_KHOF, MOCK_BOOK_METAMORPHOSIS, MOCK_BOOK_CRIME_PUNISHMENT];
type View = 'library' | 'chat' | 'story' | 'achievements' | 'journal' | 'createNovel';

const USER_GENERATED_BOOKS_KEY = 'storify_user_generated_books';
const STORY_STATES_KEY = 'storify_story_states';

interface StoryState {
    messages: Message[];
    storyProgress: number;
    storyDiary: DiaryEntry[];
    storyNotes: string;
    inventory: string[];
    timeline: TimelineEvent[];
    savedQuotes: string[];
}

function App() {
  const [mockBooks] = useState<Book[]>(MOCK_BOOKS);
  const [userGeneratedBooks, setUserGeneratedBooks] = useState<UserGeneratedBook[]>([]);
  const [storyStates, setStoryStates] = useState<Record<string, StoryState>>({});
  const [selectedBook, setSelectedBook] = useState<AnyBook | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [view, setView] = useState<View>('library');
  const [storyProgress, setStoryProgress] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(25);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
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

  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem(USER_GENERATED_BOOKS_KEY);
      if (storedBooks) setUserGeneratedBooks(JSON.parse(storedBooks));
      
      const storedStates = localStorage.getItem(STORY_STATES_KEY);
      if (storedStates) setStoryStates(JSON.parse(storedStates));
// FIX: Added (error) to catch block to define the error variable.
    } catch (error) {
      console.error("Failed to load data from local storage:", error);
    }
  }, []);

  // Auto-save user-generated books whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(USER_GENERATED_BOOKS_KEY, JSON.stringify(userGeneratedBooks));
// FIX: Added (error) to catch block to define the error variable.
    } catch (error) {
      console.error("Failed to save user books to local storage:", error);
    }
  }, [userGeneratedBooks]);

  // Auto-save the current story's state whenever it changes
  useEffect(() => {
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
      // Use a functional update to get the latest storyStates without adding it to dependencies
      setStoryStates(prevStates => {
        const newStates = { ...prevStates, [selectedBook.id]: currentState };
        try {
          localStorage.setItem(STORY_STATES_KEY, JSON.stringify(newStates));
        } catch (error) {
          console.error("Failed to save story state to local storage:", error);
        }
        return newStates;
      });
    }
  }, [selectedBook, messages, storyProgress, storyDiary, storyNotes, inventory, timeline, savedQuotes]);


  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleBookSelect = (book: AnyBook) => {
    setSelectedBook(book);
  };
  
  const handleBackToLibraryGrid = () => {
      // Auto-saving is handled by the useEffect hook.
      // This function just needs to reset the active story state.
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
    setSelectedBook(book); // Set book state immediately

    const storyCharacter = book.isUserGenerated
        ? { id: 'narrator', name: 'الراوي', description: 'سارد قصتك', persona: book.initialPrompt }
        : (book as Book).characters[0];
    setSelectedCharacter(storyCharacter);

    if (savedState && savedState.messages.length > 0) {
        // Load existing story state
        setMessages(savedState.messages);
        setStoryProgress(savedState.storyProgress);
        setStoryDiary(savedState.storyDiary);
        setStoryNotes(savedState.storyNotes);
        setInventory(savedState.inventory);
        setTimeline(savedState.timeline);
        setSavedQuotes(savedState.savedQuotes);
        setView('story');
    } else {
        // Reset state for a new story
        setMessages([]);
        setStoryProgress(0);
        setStoryDiary([]);
        setStoryNotes('');
        setInventory([]);
        setTimeline([]);
        setSavedQuotes([]);

        // Send initial message to start the story
        handleSendMessage("ابدأ القصة.", {
            characterOverride: storyCharacter,
            isStoryMode: true,
            bookForStory: book, // Pass the book object directly to avoid stale state
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

  const handleSaveUserBook = (bookToSave: UserGeneratedBook) => {
    // Auto-saving is handled by a useEffect hook.
    setUserGeneratedBooks(prevBooks => [...prevBooks, bookToSave]);
    handleStartStory(bookToSave);
  };

  const handleSendMessage = async (
    text: string,
    options: { characterOverride?: Character; isStoryMode?: boolean; bookForStory?: AnyBook } = {}
  ) => {
    const { characterOverride, isStoryMode = false, bookForStory } = options;
    const characterForAPI = characterOverride || selectedCharacter;
    if (!characterForAPI) return;

    const newUserMessage: Message = { role: Role.USER, content: text };
    const currentMessages = messages;
    
    if (isStoryMode) {
      setTimeline(prev => [...prev, { type: 'choice', content: text }]);
    }
    
    const updatedMessages = [...currentMessages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const personaDetails = characterForAPI.persona;
    let systemInstruction = '';
    
    // Use the passed book object if available, otherwise use state to avoid stale state on first call
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
    
    const progressMatch = responseMessage.content.match(/\[progress:(\d+)\]/);
    if (progressMatch) {
        const increment = parseInt(progressMatch[1], 10);
        setStoryProgress(prev => Math.min(prev + increment, 100));
        responseMessage.content = responseMessage.content.replace(/\[progress:(\d+)\]/, '').trim();
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

  const allBooks = [...mockBooks, ...userGeneratedBooks];
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
            return <AddNovel onSave={handleSaveUserBook} onCancel={handleBackToLibraryGrid} />;
        default:
            return <LibraryScreen books={allBooks} selectedBook={null} storyProgress={progressMap} onBookSelect={handleBookSelect} onCharacterSelect={handleCharacterSelect} onStartStory={handleStartStory} onBackToGrid={handleBackToLibraryGrid} onCreateNovel={() => setView('createNovel')} />;
    }
  }

  return (
    <main className="h-screen w-screen bg-brand-bg-dark text-brand-text-light flex flex-col overflow-hidden transition-colors duration-500">
      
      <TopHeader theme={theme} onThemeToggle={handleThemeToggle} globalProgress={globalProgress} />
      
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
        setView={setView} 
        isChatActive={!!selectedCharacter && view === 'chat'} 
        isStoryActive={isStoryActive}
        isJournalEnabled={isJournalEnabled}
      />
    </main>
  );
}

export default App;