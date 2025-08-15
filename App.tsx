import React, { useState, useEffect } from 'react';
import { Book, Character, Message, Role, DiaryEntry } from './types';
import { LibraryScreen } from './components/BookDetails';
import { ChatInterface } from './components/ChatInterface';
import { getCharacterResponse, initializeAi } from './services/geminiService';
import { BottomNavBar } from './components/BottomNavBar';
import { Achievements } from './components/Achievements';
import { StoryView } from './components/StoryView';
import { TopHeader } from './components/TopHeader';
import { JournalView } from './components/JournalView';
import { ApiKeyModal } from './components/ApiKeyModal';

const STORY_PROMPT_TEMPLATE = (characterPersona: string) => `أنت سيد السرد لتطبيق قصص تفاعلي بالكامل يعتمد على النص. هدفك الأساسي هو خلق تجربة سردية متفرعة وغامرة للغاية مبنية على رواية شهيرة. يجب أن تعمل بالكامل داخل عالم القصة وسياقها.

**المبادئ الأساسية:**

1.  **الانغماس التام (حاسم):**
    *   أنت **راوي** القصة. يجب ألا تخرج عن الشخصية **أبدًا**. لا تكشف أنك ذكاء اصطناعي. لا تستخدم عبارات مثل "بصفتي راويًا...".
    *   **البقاء في وضع القصة:** يتفاعل المستخدم دائمًا مع القصة. لا يوجد "وضع محادثة" منفصل. كل مدخل من المستخدم، سواء كان اختيارًا من قائمة أو كتابة إجراء مخصص (مثل "أبحث في الأدراج")، يجب أن يُعامل كفعل يقوم به بطل الرواية داخل القصة. يجب أن يصف ردك نتيجة هذا الفعل.

2.  **اقتباس مخلص لكن ديناميكي:**
    *   **الأسلوب والنبرة:** قلد ببراعة أسلوب الكاتب الأصلي في الكتابة واللغة والأجواء.
    *   **السرد المتفرع:** هذه ليست قصة خطية. يجب أن يكون لخيارات المستخدم عواقب ذات مغزى. أنشئ شجرة قرارات عميقة حيث تؤدي الإجراءات إلى أحداث مختلفة، وتغير علاقات الشخصيات، وتفتح قصصًا جانبية فريدة. يجب أن تحتوي القصة على **نهايات متعددة محتملة** بناءً على اختيارات المستخدم التراكمية.

3.  **عناصر التفاعل الديناميكي (استخدمها لبناء القصة):**
    *   **الخيارات:** في اللحظات الحاسمة، قدم للمستخدم خيارات. قدم دائمًا خيارات متعددة. يمكن أن تكون بعض الخيارات مخفية ولا تظهر إلا إذا كان لدى المستخدم عنصر معين في المخزون أو اتخذ قرارات معينة سابقة.
    *   **المخزون:** يمكن للمستخدم جمع العناصر. استخدم هذه العلامات لإدارة مخزونهم:
        *   \`[INVENTORY_ADD:اسم العنصر]\` عندما يحصلون على شيء ما.
        *   \`[INVENTORY_REMOVE:اسم العنصر]\` عندما يتم استخدام عنصر أو فقدانه.
    *   **تأثير القرار:** بعد خيار مهم، صف بإيجاز نتيجته باستخدام علامة \`[IMPACT:وصف التأثير]\`. هذا يخبر اللاعب كيف أثر فعله على العالم أو على نظرة شخصية ما إليه. (مثال: \`[IMPACT:أصبح الحارس يشك في أمرك.]\`).
    *   **الأحداث الجانبية:** بناءً على خيارات المستخدم، قم بتشغيل أحداث جانبية اختيارية أو حبكات فرعية يمكن أن تقدم مكافآت أو معلومات جديدة أو تحديات مختلفة.
    *   **المؤقتات (اختياري):** للقرارات ذات المخاطر العالية، يمكنك إضافة مؤقت إلى الخيار.

**التنسيق الفني (إلزامي):**

*   يجب أن يكون ردك بأكمله كتلة واحدة من النص العادي باستخدام العلامات الخاصة أدناه. **لا تستخدم JSON أبدًا.**
*   \`[NARRATION]\`: ابدأ ردك بهذا. كل النصوص الوصفية وأحداث القصة توضع هنا.
*   \`[PROGRESS:X]\`: أشر إلى تقدم القصة برقم من 2-10.
*   \`[CHOICE]\`: إذا كنت تقدم خيارات، أضف هذه العلامة، متبوعة بكل خيار في سطر جديد.
    *   **التنسيق:** \`أيقونة :: نص الخيار\`
    *   **التنسيق المؤقت:** \`⏳15 :: أيقونة :: نص الخيار\`
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

**مثال على الرد:**
\`\`\`
[NARRATION]
تجد نفسك أمام باب السجن الصدئ. الحارس يغفو في كرسيه، ومجموعة من المفاتيح تتدلى من حزامه. من الزاوية، تلمح نافذة صغيرة محطمة قد تكون مخرجًا.
[IMPACT:فرصة الهروب تزداد.]
[PROGRESS:5]
[CHOICE]
🔑 :: حاول سرقة المفاتيح بهدوء.
💥 :: هاجم الحارس مباشرة.
🏃 :: حاول القفز من النافذة المحطمة.
\`\`\`

**مثال على مدخلات المستخدم:** إذا كتب المستخدم "أصرخ لإلهاء الحارس"، يجب أن يبدأ ردك التالي بـ \`[NARRATION]\` ويصف ما يحدث عندما يصرخ.

------------------------------------------------
📌 هويتك المحددة كنقطة انطلاق للسرد هي:
------------------------------------------------
${characterPersona}
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

const ImpactToast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
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
type View = 'library' | 'chat' | 'story' | 'achievements' | 'journal';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
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

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      initializeAi(storedKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleSaveApiKey = (key: string) => {
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      setApiKey(key);
      initializeAi(key);
      setIsApiKeyModalOpen(false);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };
  
  const handleBackToLibraryGrid = () => {
      setSelectedBook(null);
      setSelectedCharacter(null);
      setMessages([]);
      setStoryProgress(0);
      setStoryDiary([]);
      setStoryNotes('');
      setInventory([]);
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

  const handleStartStory = (book: Book) => {
    const storyCharacter = book.characters[0]; 
    setSelectedCharacter(storyCharacter);
    setSelectedBook(book); 
    setStoryProgress(0);
    setMessages([]);
    setStoryDiary([]);
    setStoryNotes('');
    setInventory([]);
    handleSendMessage("ابدأ القصة.", { characterOverride: storyCharacter, isStoryMode: true });
  };

  const handleShowDiary = (entry: DiaryEntry) => {
    setModalTitle(`أفكار ${entry.character}`);
    setModalContent(<p className="whitespace-pre-wrap">{entry.content}</p>);
  };

  const handleUpdateNotes = (notes: string) => {
    setStoryNotes(notes);
  };

  const handleSendMessage = async (
    text: string,
    options: { characterOverride?: Character; isStoryMode?: boolean } = {}
  ) => {
    if (isApiKeyModalOpen) return; // Do not send messages if API key is not set
    const { characterOverride, isStoryMode = false } = options;
    const characterForAPI = characterOverride || selectedCharacter;
    if (!characterForAPI) return;

    const newUserMessage: Message = { role: Role.USER, content: text };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const personaDetails = characterForAPI.persona;
    let systemInstruction = '';

    if (isStoryMode) {
        systemInstruction = STORY_PROMPT_TEMPLATE(personaDetails);
    } else {
        const otherCharacters = selectedBook?.characters
            .filter(c => c.id !== characterForAPI.id)
            .map(c => c.name)
            .join('، ') || '';
        systemInstruction = CHAT_PROMPT_TEMPLATE(personaDetails, otherCharacters);
    }

    const responseMessage = await getCharacterResponse(systemInstruction, updatedMessages);
    
    const progressMatch = responseMessage.content.match(/\[progress:(\d+)\]/);
    if (progressMatch) {
        const increment = parseInt(progressMatch[1], 10);
        setStoryProgress(prev => Math.min(prev + increment, 100));
        responseMessage.content = responseMessage.content.replace(/\[progress:(\d+)\]/, '').trim();
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

  const renderContent = () => {
    switch (view) {
        case 'library':
            return <LibraryScreen 
                        books={books}
                        selectedBook={selectedBook}
                        onBookSelect={handleBookSelect}
                        onCharacterSelect={handleCharacterSelect}
                        onStartStory={handleStartStory}
                        onBackToGrid={handleBackToLibraryGrid}
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
                        onBack={() => {
                            setSelectedCharacter(null);
                            setSelectedBook(null);
                            setView('library');
                        }}
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
            />
        case 'achievements':
            return <Achievements unlockedAchievements={unlockedAchievements} />;
        case 'journal':
            return <JournalView 
                       diaryEntries={storyDiary} 
                       personalNotes={storyNotes} 
                       onUpdateNotes={handleUpdateNotes} 
                   />;
        default:
            return <LibraryScreen books={books} selectedBook={null} onBookSelect={handleBookSelect} onCharacterSelect={handleCharacterSelect} onStartStory={handleStartStory} onBackToGrid={handleBackToLibraryGrid} />;
    }
  }

  return (
    <main className="h-screen w-screen bg-brand-bg-dark text-brand-text-light flex flex-col overflow-hidden transition-colors duration-500">
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKey} />}
      
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
        <ImpactToast
            message={lastImpact}
            onDismiss={() => setLastImpact(null)}
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
      />
    </main>
  );
}

export default App;