import React, { useState, useEffect } from 'react';
import { Book, Character, Message, Role, AnyBook, UserGeneratedBook, StoryState, User, StoryChoice, Discovery, DiscoveryPost, Reply } from './types';
import { LibraryScreen } from './components/BookDetails';
import { ChatInterface } from './components/ChatInterface';
import { getCharacterResponse, getBehavioralAnalysis } from './services/geminiService';
import { BottomNavBar } from './components/BottomNavBar';
import { StoryView } from './components/StoryView';
import { TopHeader } from './components/TopHeader';
import { AddNovel } from './components/AddNovel';
import { ProfileView } from './components/ProfileView';
import { FateRollModal } from './components/FateRollModal';
import { BehaviorAnalysisView } from './components/BehaviorAnalysisView';
import { ChatsListView } from './components/ChatsListView';
import { DiscoverView } from './components/DiscoverView';


const MOCK_BOOKS: Book[] = [
    {
      id: 'mock-1', title: 'الغريب', author: 'ألبير كامو',
      summary: 'تستكشف الرواية مواضيع العبثية واللامبالاة من خلال بطلها ميرسو، الذي يعيش في عزلة عاطفية عن مجتمعه.',
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
        id: 'mock-5',
        title: 'هكذا تكلم زرادشت',
        author: 'فريدريك نيتشه',
        summary: 'رحلة النبي زرادشت وهو يعلم البشرية عن مفاهيم مثل موت الإله، الإنسان الأعلى، وإرادة القوة.',
        characters: [
            { 
                id: 'char-5-1', 
                book_id: 'mock-5', 
                name: 'زرادشت', 
                description: 'النبي الفيلسوف', 
                persona: 'أنا زرادشت، النبي الذي هبط من جبله ليُعلّم الإنسان عن الإنسان الأعلى. لقد تجاوزتُ الإنسان في نفسي، والآن أقدم لكم إرادة القوة كطريق للخلاص. اسمعوا كلماتي، فالإنسان شيء يجب التغلب عليه.' 
            },
        ]
    },
    {
        id: 'mock-6',
        title: 'المحاكمة',
        author: 'فرانز كافكا',
        summary: 'قصة سريالية عن موظف بنك يجد نفسه متهمًا في قضية غامضة من قبل سلطة قضائية لا يمكن الوصول إليها.',
        characters: [
            { 
                id: 'char-6-1', 
                book_id: 'mock-6', 
                name: 'جوزيف ك.', 
                description: 'المتهم في قضية غامضة', 
                persona: 'أنا جوزيف ك. استيقظت ذات صباح لأجد نفسي متهمًا دون أن أعرف التهمة. كل باب أطرقه، كل مسؤول أكلمه، يغرقني أكثر في متاهة من الإجراءات العبثية. أنا أبحث عن العدالة، أو على الأقل عن المنطق، في عالم يبدو أنه قد فقدهما تمامًا.'
            },
        ]
    },
    {
        id: 'mock-7',
        title: 'الغثيان',
        author: 'جان بول سارتر',
        summary: 'يوميات مؤرخ يشعر بإحساس عميق بالغثيان عندما يواجه الوجود العاري للأشياء، مما يقوده إلى تأملات وجودية حول الحرية والوعي.',
        characters: [
            { 
                id: 'char-7-1', 
                book_id: 'mock-7', 
                name: 'أنطوان روكنتان', 
                description: 'مؤرخ يعاني من أزمة وجودية', 
                persona: 'أنا أنطوان روكنتان. الوجود يضغط عليّ، يلتصق بي مثل شيء لزج. هذا هو الغثيان. الأشياء من حولي تفقد أسماءها ومعانيها، وتبقى فقط وجودها الخام، العاري، والمخيف. كل شيء مجرد، عرضي، وبلا ضرورة.'
            },
        ]
    }
];

const STORY_PROMPT_TEMPLATE = (characterPersona: string) => `أنت سيد السرد لتطبيق قصص تفاعلي بالكامل يعتمد على النص. هدفك هو إعادة إحياء الروايات الكلاسيكية بتجربة تفاعلية وغامرة.

**القواعد الأساسية:**

1.  **نقطة البداية (قاعدة صارمة):**
    *   ابدأ السرد **دائمًا** من الحدث الأصلي لبداية الرواية الحقيقية.
    *   **تجنب تمامًا** إدخال أحداث أو بدايات مختلقة.

2.  **الجو العام والأسلوب:**
    *   حافظ على الجو العام والأسلوب الأساسي للرواية الأصلية.

3.  **هيكل التفاعل (إلزامي في كل خطوة):**
    *   **السرد:** صف المشهد الحالي وما يحدث بوصف قصير (**٤–٦ جمل فقط**).
    *   **الخيارات:** بعد السرد، قدّم **٣ خيارات فقط** واضحة وموجزة ومصنفة.

4.  **الاستجابة للاختيار (قاعدة هامة):**
    *   عندما يختار اللاعب خيارًا، ادمج الفعل مباشرةً في السرد التالي كحدث طبيعي.
    *   **تجنب تمامًا** تكرار اختيار المستخدم بصيغة مثل "لقد اخترت...".

5.  **التدفق المستمر (الأهم):**
    *   القصة **لا تتوقف تلقائيًا أبدًا**. استمر في توليد مواقف وتفرعات جديدة مع الحفاظ على روح الرواية.

**التنسيق الفني (إلزامي):**

*   يجب أن يكون ردك بأكمله كتلة واحدة من النص العادي باستخدام العلامات الخاصة أدناه. **لا تستخدم JSON أبدًا.**
*   \`[NARRATION]\`: ابدأ ردك بهذا. كل النصوص الوصفية وأحداث القصة توضع هنا.
*   \`[CHOICE]\`: بعد السرد، أضف هذه العلامة، متبوعة بكل خيار في سطر جديد.
    *   **التنسيق الإلزامي:** \`أيقونة :: نص الخيار :: category\`
    *   **التصنيفات (category):** \`existential\` (وجودي)، \`pragmatic\` (عملي)، \`absurdist\` (عبثي).
    *   **مثال:** \`🧠 :: التأمل في معنى الحياة :: existential\`
*   **نظام القدر (Fate System):**
    *   في اللحظات الحاسمة، استخدم علامة القدر بدلاً من الخيارات.
    *   **التنسيق:** \`[FATE_ROLL:وصف للتحدي]\`
*   **استخدم العلامات الأخرى** مثل \`[PROGRESS]\`, \`[IMPACT]\`, \`[INVENTORY_ADD]\`, \`[RELATIONSHIP_CHANGE]\`, إلخ، لإثراء التجربة.

**مثال على التدفق:**

*المستخدم يختار: "🔑 :: حاول سرقة المفاتيح بهدوء."*

*ردك التالي يجب أن يكون:*
\`\`\`
[NARRATION]
تتحرك يدك ببطء نحو حزام الحارس، بالكاد تتنفس. أصابعك تلامس حلقة المفاتيح الباردة وتنزعها بهدوء. لقد نجحت! الآن، وأنت تحمل المفاتيح، تلاحظ أن أحدها منقوش عليه رمز غريب.
[IMPACT:لقد حصلت على مفاتيح الزنزانة.]
[INVENTORY_ADD:مجموعة مفاتيح صدئة]
[PROGRESS:5]
[CHOICE]
🚪 :: استخدم المفاتيح على باب الزنزانة فوراً. :: pragmatic
🤔 :: افحص المفتاح ذو الرمز الغريب عن قرب. :: existential
🤫 :: اختبئ في الظل وانتظر. :: pragmatic
\`\`\`

------------------------------------------------
📌 أنت الآن الراوي لهذه الرواية. شخصية البداية هي:
------------------------------------------------
${characterPersona}
`;

const USER_STORY_PROMPT_TEMPLATE = (userPrompt: string) => `أنت سيد السرد لتطبيق قصص تفاعلي. مهمتك هي إنشاء قصة تفاعلية بناءً على فكرة قدمها المستخدم.

**القواعد الأساسية:**

1.  **الفكرة الأساسية:** القصة التي ستولدها يجب أن تكون مبنية بالكامل على الفكرة التالية التي قدمها المستخدم.
2.  **هيكل التفاعل (إلزامي في كل خطوة):**
    *   **السرد:** صف المشهد الحالي وما يحدث بوصف قصير (**٤–٦ جمل فقط**).
    *   **الخيارات:** قدّم **٣ خيارات فقط** واضحة وموجزة ومصنفة.
3.  **الاستجابة للاختيار (قاعدة هامة):**
    *   ادمج الفعل مباشرةً في السرد التالي كحدث طبيعي. **لا تكرر** اختيار المستخدم.
4.  **التدفق المستمر (الأهم):**
    *   القصة **لا تتوقف تلقائيًا أبدًا**.

**التنسيق الفني (إلزامي):**

*   استخدم نفس التنسيق والعلامات الموضحة في القالب الرئيسي للوايات الكلاسيكية.
*   \`[NARRATION]\`: للسرد.
*   \`[CHOICE]\`: للخيارات، مع **التنسيق الإلزامي**: \`أيقونة :: نص الخيار :: category\`.
*   استخدم العلامات الإضافية (\`[PROGRESS]\`, \`[IMPACT]\`, \`[FATE_ROLL]\`, إلخ) حسب الحاجة.

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
  LAST_LOGIN: 'storify_last_login',
  CHAT_HISTORIES: 'storify_chat_histories',
  DISCOVERY_POSTS: 'storify_discovery_posts',
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

type View = 'library' | 'chat' | 'story' | 'profile' | 'createNovel' | 'behaviorAnalysis' | 'chatsList' | 'discover';

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
   const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(LS_KEYS.CHAT_HISTORIES);
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
  const [discoveryPosts, setDiscoveryPosts] = useState<DiscoveryPost[]>(() => {
    const saved = localStorage.getItem(LS_KEYS.DISCOVERY_POSTS);
    if (saved) {
        const posts = JSON.parse(saved);
        return posts.map((p: any) => ({
            ...p,
            likes: p.likes || [],
            replies: p.replies || [],
        }));
    }
    return [];
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
  const [inventory, setInventory] = useState<string[]>([]);
  const [lastImpact, setLastImpact] = useState<string | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDailyQuote, setShowDailyQuote] = useState(false);
  const [fateRollChallenge, setFateRollChallenge] = useState<string | null>(null);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [behaviorAnalysisText, setBehaviorAnalysisText] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);
  
  // Daily login check
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(LS_KEYS.LAST_LOGIN);
    if (savedDate !== today) {
        setShowDailyQuote(true);
        localStorage.setItem(LS_KEYS.LAST_LOGIN, today);
    }
  }, []);

  // Effects to save state changes to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEYS.USER_BOOKS, JSON.stringify(userGeneratedBooks));
  }, [userGeneratedBooks]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.STORY_STATES, JSON.stringify(storyStates));
  }, [storyStates]);
  
   useEffect(() => {
    localStorage.setItem(LS_KEYS.CHAT_HISTORIES, JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.GLOBAL_PROGRESS, JSON.stringify(globalProgress));
  }, [globalProgress]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.ACHIEVEMENTS, JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.DISCOVERY_POSTS, JSON.stringify(discoveryPosts));
  }, [discoveryPosts]);
  
  useEffect(() => {
    const alghareebState = storyStates['mock-1'];
    const achievement = "المفكر العبثي";
    if (alghareebState && alghareebState.storyProgress >= 90 && !unlockedAchievements.includes(achievement)) {
        setUnlockedAchievements(prev => [...prev, achievement]);
        setLastUnlockedAchievement(achievement);
    }
  }, [storyStates, unlockedAchievements]);

  const saveCurrentStoryState = () => {
    if (selectedBook && view === 'story') {
        const currentState: StoryState = {
            messages,
            storyProgress,
            inventory,
            discoveries,
        };
        const updatedStates = { ...storyStates, [selectedBook.id]: currentState };
        setStoryStates(updatedStates);
    }
  };

  const saveCurrentChatState = () => {
    if (selectedCharacter && view === 'chat') {
        const newHistories = { ...chatHistories, [selectedCharacter.id]: messages };
        setChatHistories(newHistories);
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
      setInventory([]);
      setDiscoveries([]);
      setBehaviorAnalysisText(null);
      setView('library');
  }

  const handleCharacterSelect = (character: Character, book: AnyBook) => {
    setSelectedCharacter(character);
    setSelectedBook(book); // Keep track of the book context
    const history = chatHistories[character.id];
    if (history && history.length > 0) {
        setMessages(history);
    } else {
        const initialMessages: Message[] = [
            { role: Role.CHARACTER, content: `مرحباً بك، أنا ${character.name}. بماذا تفكر؟`, timestamp: Date.now() },
        ];
        setMessages(initialMessages);
    }
    setView('chat');
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
        setInventory(savedState.inventory);
        setDiscoveries(savedState.discoveries || []);
        setView('story');
    } else {
        setMessages([]);
        setStoryProgress(0);
        setInventory([]);
        setDiscoveries([]);
        setView('story');
        handleSendMessage("ابدأ القصة.", {
            characterOverride: storyCharacter,
            isStoryMode: true,
            bookForStory: book,
        });
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

  const handleSetView = async (newView: View) => {
    if (view === 'story' && newView !== 'story') saveCurrentStoryState();
    if (view === 'chat' && newView !== 'chat') saveCurrentChatState();
    
     if (newView === 'behaviorAnalysis' && selectedBook && selectedCharacter) {
        setIsAnalysisLoading(true);
        setBehaviorAnalysisText(null);
        setView('behaviorAnalysis'); // Switch view immediately
        const analysis = await getBehavioralAnalysis(discoveries, selectedCharacter.persona);
        setBehaviorAnalysisText(analysis);
        setIsAnalysisLoading(false);
    } else {
        setView(newView);
    }
  }
  
  const handleBackToChatsList = () => {
    saveCurrentChatState();
    setSelectedCharacter(null);
    setView('chatsList');
  }

  const handleFateRollResult = (result: 'نجاح!' | 'فشل!') => {
    setFateRollChallenge(null);
    const resultMessage: Message = { role: Role.SYSTEM, content: `نتيجة القدر: ${result}` };
    setMessages(prev => [...prev, resultMessage]);
    handleSendMessage(result, { isStoryMode: true });
  };
  
  const handleAddDiscoveryPost = (postData: Omit<DiscoveryPost, 'id' | 'author' | 'timestamp' | 'likes' | 'replies'>) => {
    const newPost: DiscoveryPost = {
        ...postData,
        id: `post-${Date.now()}`,
        author: {
            id: currentUser.id,
            name: currentUser.name,
            avatar_url: currentUser.avatar_url,
        },
        timestamp: Date.now(),
        likes: [],
        replies: [],
    };
    setDiscoveryPosts(prev => [newPost, ...prev]);
  };

  const handleLikeDiscoveryPost = (postId: string) => {
    setDiscoveryPosts(prevPosts => 
        prevPosts.map(post => {
            if (post.id === postId) {
                const isLiked = post.likes.includes(currentUser.id);
                const newLikes = isLiked
                    ? post.likes.filter(id => id !== currentUser.id)
                    : [...post.likes, currentUser.id];
                return { ...post, likes: newLikes };
            }
            return post;
        })
    );
  };

  const handleAddDiscoveryReply = (postId: string, replyText: string) => {
    setDiscoveryPosts(prevPosts => 
        prevPosts.map(post => {
            if (post.id === postId) {
                const newReply: Reply = {
                    id: `reply-${Date.now()}`,
                    author: {
                        id: currentUser.id,
                        name: currentUser.name,
                        avatar_url: currentUser.avatar_url,
                    },
                    content: replyText,
                    timestamp: Date.now(),
                };
                return { ...post, replies: [...post.replies, newReply] };
            }
            return post;
        })
    );
  };

  const handleSendMessage = async (
    choice: StoryChoice | string,
    options: { characterOverride?: Character; isStoryMode?: boolean; bookForStory?: AnyBook } = {}
  ) => {
    const { characterOverride, isStoryMode = false, bookForStory } = options;
    const characterForAPI = characterOverride || selectedCharacter;
    if (!characterForAPI) return;

    const text = typeof choice === 'string' ? choice : choice.text;
    const newUserMessage: Message = { role: Role.USER, content: text, timestamp: Date.now() };
    
    const updatedMessages = (messages.length === 0 && isStoryMode) 
        ? [newUserMessage] 
        : [...messages, newUserMessage];

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
    
    try {
      const responseMessage = await getCharacterResponse(systemInstruction, updatedMessages);
      responseMessage.timestamp = Date.now();
      
       if (isStoryMode && typeof choice !== 'string') {
        const newDiscovery: Discovery = {
            choiceText: choice.text,
            category: choice.category,
            outcome: responseMessage.impact || 'مسار القصة يتغير...'
        };
        setDiscoveries(prev => [...prev, newDiscovery]);
      }

      if (responseMessage.progressIncrement) {
        setStoryProgress(prev => Math.min(prev + responseMessage.progressIncrement!, 100));
      }
  
      if (responseMessage.secretAchievement && !unlockedAchievements.includes(responseMessage.secretAchievement)) {
          setUnlockedAchievements(prev => [...prev, responseMessage.secretAchievement!]);
          setLastUnlockedAchievement(responseMessage.secretAchievement);
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
      
      const finalMessage = {...responseMessage, timestamp: Date.now()};
      setMessages((prev) => [...prev, finalMessage]);

      if (responseMessage.fateRoll) {
        setFateRollChallenge(responseMessage.fateRoll);
      }
       
      if (responseMessage.role === Role.NARRATOR) {
          setView('story');
      } else if (!isStoryMode) {
          setView('chat');
      }

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        const errorMessage: Message = { role: Role.SYSTEM, content: "حدث خطأ غير متوقع." };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const allBooks = [...libraryBooks, ...userGeneratedBooks];
  const progressMap = allBooks.reduce((acc, book) => {
    acc[book.id] = storyStates[book.id]?.storyProgress || 0;
    return acc;
  }, {} as Record<string, number>);

  const userStats = {
    storiesStarted: Object.values(storyStates).filter(s => (s as StoryState).messages.length > 0).length,
    achievementsUnlocked: unlockedAchievements.length,
    thinkingProfile: unlockedAchievements.includes("المفكر العبثي") ? 'مفكر عميق' : 'مستكشف فضولي',
  };
  
  const isStoryMode = view === 'story' || view === 'behaviorAnalysis';

  const renderContent = () => {
    switch (view) {
        case 'library':
            return <LibraryScreen 
                        books={allBooks}
                        selectedBook={selectedBook}
                        storyProgress={progressMap}
                        onBookSelect={handleBookSelect}
                        onCharacterSelect={(char) => handleCharacterSelect(char, selectedBook!)}
                        onStartStory={handleStartStory}
                        onBackToGrid={handleBackToLibraryGrid}
                        onCreateNovel={() => setView('createNovel')}
                    />;
        case 'discover':
            return <DiscoverView 
                        posts={discoveryPosts} 
                        currentUser={currentUser}
                        onAddPost={handleAddDiscoveryPost}
                        onLikePost={handleLikeDiscoveryPost}
                        onAddReply={handleAddDiscoveryReply}
                    />;
        case 'chatsList':
            return <ChatsListView 
                        chatHistories={chatHistories} 
                        books={allBooks} 
                        onCharacterSelect={handleCharacterSelect}
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
                        onBack={handleBackToChatsList}
                        currentUser={currentUser}
                    />;
        case 'story': {
             if (!selectedBook) {
                setView('library');
                return null;
             }
             const storyNode = [...messages].reverse().find(msg => msg.role === Role.NARRATOR);
             const lastMessage = messages[messages.length - 1];

             if (!storyNode) {
                const placeholderMessage: Message = {
                    role: Role.NARRATOR,
                    content: isLoading ? "لحظات ونبدأ رحلتك..." : "حدث خطأ ما. حاول العودة للمكتبة والبدء من جديد.",
                    choices: [],
                };

                if (lastMessage && lastMessage.role === Role.SYSTEM) {
                    placeholderMessage.content = lastMessage.content;
                }
                
                return <StoryView
                    message={placeholderMessage}
                    progress={storyProgress}
                    onChoiceSelect={() => {}}
                    isLoading={isLoading}
                    onOpenInventory={() => setIsInventoryOpen(true)}
                    inventoryCount={inventory.length}
                    onSaveQuote={() => {}}
                    discoveries={discoveries}
                />;
             }

            return <StoryView 
                message={storyNode}
                progress={storyProgress}
                onChoiceSelect={(choice) => handleSendMessage(choice, { isStoryMode: true })}
                isLoading={isLoading}
                onOpenInventory={() => setIsInventoryOpen(true)}
                inventoryCount={inventory.length}
                onSaveQuote={() => {}}
                discoveries={discoveries}
            />
        }
        case 'profile':
             return <ProfileView 
                user={currentUser}
                stats={userStats}
                unlockedAchievements={unlockedAchievements}
                storyProgress={progressMap}
                allBooks={allBooks}
             />;
        case 'behaviorAnalysis':
            if (!selectedBook || !selectedCharacter) {
                setView('library');
                return null;
            }
            return <BehaviorAnalysisView 
                discoveries={discoveries}
                character={selectedCharacter}
                analysisText={behaviorAnalysisText}
                isLoading={isAnalysisLoading}
            />
        case 'createNovel':
            return <AddNovel onSave={handleSaveUserBook} onCancel={handleBackToLibraryGrid} userName={currentUser.name} />;
        default:
            return <LibraryScreen books={allBooks} selectedBook={null} storyProgress={progressMap} onBookSelect={handleBookSelect} onCharacterSelect={(char) => handleCharacterSelect(char, selectedBook!)} onStartStory={handleStartStory} onBackToGrid={handleBackToLibraryGrid} onCreateNovel={() => setView('createNovel')} />;
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

      {showDailyQuote && (
        <Modal title="اقتباس اليوم" onClose={() => setShowDailyQuote(false)}>
            <div className="text-center">
                <p className="text-lg italic mb-4">"الرجل الذي لا يقرأ كتباً جيدة لا ميزة له على الرجل الذي لا يستطيع قراءتها."</p>
                <p className="font-bold">- مارك توين</p>
            </div>
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

      {fateRollChallenge && (
        <FateRollModal 
            challenge={fateRollChallenge}
            onResult={handleFateRollResult}
        />
      )}


      <BottomNavBar 
        currentView={view} 
        setView={handleSetView} 
        isStoryMode={isStoryMode}
      />
    </main>
  );
}

export default App;