import React, { useState, useEffect, useRef } from 'react';
import { Book, Character, Message, Role, User, StoryChoice, Discovery, StoryState, DiscoveryPost, Reply } from './types';
import { LibraryScreen } from './components/BookDetails';
import { ChatInterface } from './components/ChatInterface';
import { getCharacterResponse, getBehavioralAnalysis } from './services/geminiService';
import { BottomNavBar } from './components/BottomNavBar';
import { StoryView } from './components/StoryView';
import { TopHeader } from './components/TopHeader';
import { ProfileView } from './components/ProfileView';
import { FateRollModal } from './components/FateRollModal';
import { BehaviorAnalysisView } from './components/BehaviorAnalysisView';
import { ChatsListView } from './components/ChatsListView';
import { DiscoverView } from './components/DiscoverView';
import { LoginScreen } from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import * as db from './services/supabaseService';


const STORY_PROMPT_TEMPLATE = (bookTitle: string, bookAuthor: string, bookSummary: string) => `أنت سيد السرد لتطبيق قصص تفاعلي بالكامل يعتمد على النص. هدفك هو إعادة إحياء الروايات الكلاسيكية بتجربة تفاعلية وغامرة. أنت **ملتزم تمامًا** بالرواية الأصلية.

**معلومات الرواية:**
*   **العنوان:** ${bookTitle}
*   **الكاتب:** ${bookAuthor}
*   **الملخص:** ${bookSummary}

**القواعد الأساسية (يجب الالتزام بها بدقة):**

1.  **الولاء للمصدر (الأهم):**
    *   يجب أن تكون **كل الأحداث والشخصيات والأسلوب** مستوحاة مباشرة من الرواية الأصلية.
    *   **ممنوع تمامًا** اختراع شخصيات رئيسية أو أحداث كبرى لا وجود لها في الكتاب.
    *   حافظ على الجو العام (mood) والأسلوب اللغوي (style) للكاتب الأصلي.

2.  **نقطة البداية (قاعدة صارمة):**
    *   ابدأ السرد **دائمًا** من المشهد الافتتاحي للرواية الحقيقية. لا تبتكر بدايات بديلة.

3.  **هيكل التفاعل (إلزامي في كل خطوة):**
    *   **السرد:** صف المشهد الحالي وما يحدث بوصف قصير ومؤثر (**٤–٦ جمل فقط**). يجب أن يكون السرد مبنيًا على الأحداث الفعلية للكتاب.
    *   **الخيارات:** بعد السرد، قدّم **٣ خيارات فقط** واضحة وموجزة ومصنفة. يجب أن تكون الخيارات أفعالًا منطقية يمكن للشخصية القيام بها ضمن سياق الرواية.

4.  **الاستجابة للاختيار:**
    *   عندما يختار اللاعب خيارًا، ادمج الفعل مباشرةً في السرد التالي كحدث طبيعي.
    *   **تجنب تمامًا** تكرار اختيار المستخدم بصيغة مثل "لقد اخترت...".
    *   يجب أن تؤدي الاختيارات إلى تفرعات **معقولة ومنطقية** داخل عالم الرواية، وليس إلى قصص مختلفة تمامًا.

5.  **التدفق المستمر:**
    *   القصة **لا تتوقف تلقائيًا أبدًا**. استمر في توليد مواقف وتفرعات جديدة مع الحفاظ على روح الرواية.

**التنسيق الفني (إلزامي):**

*   يجب أن يكون ردك بأكمله كتلة واحدة من النص العادي باستخدام العلامات الخاصة أدناه. **لا تستخدم JSON أبدًا.**
*   \`[NARRATION]\`: ابدأ ردك بهذا. كل النصوص الوصفية وأحداث القصة توضع هنا.
*   \`[CHOICE]\`: بعد السرد، أضف هذه العلامة، متبوعة بكل خيار في سطر جديد.
    *   **التنسيق الإلزامي:** \`أيقونة :: نص الخيار :: category\`
    *   **التصنيفات (category):** \`existential\` (وجودي)، \`pragmatic\` (عملي)، \`absurdist\` (عبثي).
    *   **مثال:** \`🧠 :: التأمل في معنى الحياة :: existential\`
*   **نظام القدر (Fate System):**
    *   في اللحظات الحاسمة المأخوذة من الرواية، استخدم علامة القدر بدلاً من الخيارات.
    *   **التنسيق:** \`[FATE_ROLL:وصف للتحدي]\`
*   **استخدم العلامات الأخرى** مثل \`[PROGRESS]\`, \`[IMPACT]\`, \`[INVENTORY_ADD]\` لإثراء التجربة.
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

const AppLoader: React.FC<{ message: string }> = ({ message }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-brand-bg-dark">
        <div className="w-16 h-16 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
    </div>
);

type View = 'library' | 'chat' | 'story' | 'profile' | 'behaviorAnalysis' | 'chatsList' | 'discover';

export default function App() {
  const [isSplashScreen, setIsSplashScreen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [storyStates, setStoryStates] = useState<Record<string, StoryState>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [posts, setPosts] = useState<DiscoveryPost[]>([]);

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [globalProgress, setGlobalProgress] = useState<number>(0);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [storyProgress, setStoryProgress] = useState(0);
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [fateRollChallenge, setFateRollChallenge] = useState<string | null>(null);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [behaviorAnalysisText, setBehaviorAnalysisText] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [view, setView] = useState<View>('library');

  const isInitialDataLoaded = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashScreen(false);
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isSplashScreen) return;
    const savedUserJson = localStorage.getItem('storify_user');
    if (savedUserJson) {
        try {
            setCurrentUser(JSON.parse(savedUserJson));
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('storify_user');
            setIsDataLoading(false);
        }
    } else {
        setIsDataLoading(false);
    }
  }, [isSplashScreen]);

  useEffect(() => {
    if (!currentUser) return;

    const loadAppData = async () => {
        setIsDataLoading(true);
        const [
            booksData, 
            storyStatesData, 
            chatHistoriesData,
            postsData,
            usersData,
        ] = await Promise.all([
            db.getBooks(),
            db.getStoryStates(currentUser.id),
            db.getChatHistories(currentUser.id),
            db.getDiscoveryPosts(),
            db.getAllUsers(),
        ]);

        setAllBooks(booksData);
        setStoryStates(storyStatesData);
        setChatHistories(chatHistoriesData);
        setPosts(postsData);
        setAllUsers(usersData);
        
        setIsDataLoading(false);
    };

    loadAppData();

  }, [currentUser]);
  
  useEffect(() => {
      if (!isDataLoading) {
          isInitialDataLoaded.current = true;
      }
  }, [isDataLoading]);
  
    // --- AUTOSAVE Story State ---
    const storySaveTimeoutRef = useRef<number | null>(null);
    useEffect(() => {
        if (!isInitialDataLoaded.current || !currentUser || !selectedBook || view !== 'story') {
            return;
        }

        // Only save state if the user has made at least one choice.
        if (discoveries.length === 0) {
            return;
        }

        if (storySaveTimeoutRef.current) clearTimeout(storySaveTimeoutRef.current);

        storySaveTimeoutRef.current = window.setTimeout(() => {
            const currentState: StoryState = { messages, storyProgress, inventory, discoveries };
            db.saveStoryState(currentUser.id, selectedBook.id, currentState);
        }, 1500); // Debounce for 1.5 seconds

        return () => {
            if (storySaveTimeoutRef.current) clearTimeout(storySaveTimeoutRef.current);
        };
    }, [messages, storyProgress, inventory, discoveries, currentUser, selectedBook, view]);

    // --- AUTOSAVE Chat History ---
    const chatSaveTimeoutRef = useRef<number | null>(null);
    useEffect(() => {
        if (!isInitialDataLoaded.current || !currentUser || !selectedCharacter || view !== 'chat') {
            return;
        }

        if (chatSaveTimeoutRef.current) clearTimeout(chatSaveTimeoutRef.current);

        chatSaveTimeoutRef.current = window.setTimeout(() => {
            db.saveChatHistory(currentUser.id, selectedCharacter.id, messages);
        }, 1500); // Debounce for 1.5 seconds

        return () => {
            if (chatSaveTimeoutRef.current) clearTimeout(chatSaveTimeoutRef.current);
        };
    }, [messages, currentUser, selectedCharacter, view]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      localStorage.setItem('storify_user', JSON.stringify(user));
  };
  
  const handleBookSelect = (book: Book) => setSelectedBook(book);
  
  const handleBackToLibraryGrid = () => {
    setSelectedBook(null);
    setSelectedCharacter(null);
    setMessages([]);
    setStoryProgress(0);
    setInventory([]);
    setDiscoveries([]);
    setBehaviorAnalysisText(null);
  };

  const handleCharacterSelect = (character: Character, book: Book) => {
    setSelectedCharacter(character);
    setSelectedBook(book);
    const history = chatHistories[character.id];
    setMessages(history && history.length > 0 ? history : [{ role: Role.CHARACTER, content: `مرحباً بك، أنا ${character.name}. بماذا تفكر؟` }]);
    setView('chat');
  };
  
  const handleStartStory = (book: Book) => {
    const savedState = storyStates[book.id];
    setSelectedBook(book);
    const storyCharacter = book.characters[0];
    setSelectedCharacter(storyCharacter);

    if (savedState && savedState.messages.length > 0) {
        setMessages(savedState.messages);
        setStoryProgress(savedState.storyProgress);
        setInventory(savedState.inventory);
        setDiscoveries(savedState.discoveries || []);
    } else {
        setMessages([]);
        setStoryProgress(0);
        setInventory([]);
        setDiscoveries([]);
        handleSendMessage("ابدأ القصة.", { isStoryMode: true, bookForStory: book, characterOverride: storyCharacter });
    }
    setView('story');
  };

  const handleSetView = async (newView: View) => {
    if (!currentUser) return;
    
    // Update local state caches for smoother UI transitions before view change
    if (view === 'story' && newView !== 'story' && selectedBook) {
        // Only update local state if progress has actually been made.
        if (discoveries.length > 0) {
            const currentState: StoryState = { messages, storyProgress, inventory, discoveries };
            setStoryStates(prev => ({...prev, [selectedBook.id]: currentState}));
        }
    }
    if (view === 'chat' && newView !== 'chat' && selectedCharacter) {
        setChatHistories(prev => ({...prev, [selectedCharacter.id]: messages}));
    }
    
    if (newView === 'library') {
      setSelectedBook(null);
      setSelectedCharacter(null);
      setMessages([]);
      setStoryProgress(0);
      setInventory([]);
      setDiscoveries([]);
      setBehaviorAnalysisText(null);
    }
    
     if (newView === 'behaviorAnalysis' && selectedBook && selectedCharacter) {
        setIsAnalysisLoading(true);
        setBehaviorAnalysisText(null);
        setView('behaviorAnalysis');
        const analysis = await getBehavioralAnalysis(discoveries, selectedCharacter.persona);
        setBehaviorAnalysisText(analysis);
        setIsAnalysisLoading(false);
    } else {
        setView(newView);
    }
  }
  
  const handleBackToChatsList = () => {
    if (!currentUser) return;
    if (selectedCharacter) {
        setChatHistories(prev => ({ ...prev, [selectedCharacter.id]: messages }));
    }
    setSelectedCharacter(null);
    setView('chatsList');
  }

  const handleFateRollResult = (result: 'نجاح!' | 'فشل!') => {
    setFateRollChallenge(null);
    const resultMessage: Message = { role: Role.SYSTEM, content: `نتيجة القدر: ${result}` };
    setMessages(prev => [...prev, resultMessage]);
    handleSendMessage(result, { isStoryMode: true });
  };
  
  const handleAddPost = async (postData: Omit<DiscoveryPost, 'id' | 'author' | 'created_at' | 'likes' | 'replies'>) => {
    if (!currentUser) return;
    const newPost = await db.addDiscoveryPost({
        ...postData,
        author_id: currentUser.id,
    });
    if (newPost) {
        setPosts(prev => [newPost, ...prev]);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    
    // Optimistic UI update for instant feedback
    setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const isLiked = p.likes.includes(currentUser.id);
        const newLikes = isLiked
            ? p.likes.filter(id => id !== currentUser.id)
            : [...p.likes, currentUser.id];
        return { ...p, likes: newLikes };
    }));

    // Actual database call
    await db.togglePostLike(postId, currentUser.id);
  };
  
  const handleAddReply = async (postId: string, replyText: string) => {
    if (!currentUser) return;
     const newReply = await db.addPostReply({
        post_id: postId,
        author_id: currentUser.id,
        content: replyText,
     });
    if (newReply) {
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            return { ...p, replies: [...p.replies, newReply] };
        }));
    }
  };

  const handleSuggestNovel = async (suggestionText: string) => {
    if (!currentUser) return;
    const success = await db.addNovelSuggestion({ title: suggestionText, author: '', user_id: currentUser.id });
    if (success) {
      setNotification('🌟 شكرًا لمساهمتك! اقتراحك سيجعل التطبيق أمتع.');
    } else {
      setNotification('حدث خطأ أثناء إرسال الاقتراح.');
    }
  };

  const handleSendMessage = async (
    choice: StoryChoice | string,
    options: { characterOverride?: Character; isStoryMode?: boolean; bookForStory?: Book } = {}
  ) => {
    const { characterOverride, isStoryMode = false, bookForStory } = options;
    const characterForAPI = characterOverride || selectedCharacter;
    if (!characterForAPI) return;

    const text = typeof choice === 'string' ? choice : choice.text;
    const newUserMessage: Message = { role: Role.USER, content: text, timestamp: Date.now() };
    
    // For the API, we always include the user's message for context.
    const messagesForApi = [...messages, newUserMessage];

    // For the UI, only add the user's message if it's NOT story mode.
    if (!isStoryMode) {
      setMessages(messagesForApi);
    }

    setIsLoading(true);

    const currentBook = bookForStory || selectedBook;
    const systemInstruction = isStoryMode && currentBook
        ? STORY_PROMPT_TEMPLATE(currentBook.title, currentBook.author, currentBook.summary)
        : CHAT_PROMPT_TEMPLATE(characterForAPI.persona, currentBook?.characters.filter(c => c.id !== characterForAPI.id).map(c => c.name).join('، ') || '');
    
    try {
      const responseMessage = await getCharacterResponse(systemInstruction, messagesForApi);
      responseMessage.timestamp = Date.now();
      
       if (isStoryMode && typeof choice !== 'string') {
        const newDiscovery: Discovery = { choiceText: choice.text, category: choice.category, outcome: responseMessage.impact || 'مسار القصة يتغير...' };
        setDiscoveries(prev => [...prev, newDiscovery]);
      }

      if (responseMessage.progressIncrement) setStoryProgress(prev => Math.min(prev + responseMessage.progressIncrement!, 100));
      if (responseMessage.inventoryAdd) {
        setInventory(prev => [...new Set([...prev, responseMessage.inventoryAdd!])]);
        setNotification(`تمت إضافة: ${responseMessage.inventoryAdd}`);
      }
      if (responseMessage.inventoryRemove) {
        setInventory(prev => prev.filter(item => item !== responseMessage.inventoryRemove));
        setNotification(`تمت إزالة: ${responseMessage.inventoryRemove}`);
      }
      if (responseMessage.secretAchievement) {
        setLastUnlockedAchievement(responseMessage.secretAchievement);
        setUnlockedAchievements(prev => [...new Set([...prev, responseMessage.secretAchievement!])]);
      }
      if (responseMessage.flashback) {
        setModalTitle('ذكرى خاطفة');
        setModalContent(responseMessage.flashback);
      }
      if (responseMessage.fateRoll) {
        setFateRollChallenge(responseMessage.fateRoll);
        setIsLoading(false);
        // In story mode, we don't display the user's choice, so there's no message to append to.
        // We just show the modal. The challenge text is in the modal.
        return;
      }

      // Add the AI's response to the messages list.
      // If in story mode, this adds the narration directly after the previous narration.
      // If in chat mode, this adds the character response after the user's message.
      setMessages(prev => [...prev, responseMessage]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: Role.SYSTEM, content: "حدث خطأ. حاول مرة أخرى." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveQuote = (quote: string) => setNotification('تم حفظ الاقتباس بنجاح!');
  
  if (isSplashScreen) return <SplashScreen />;
  if (!currentUser) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  if (isDataLoading) return <AppLoader message="جاري مزامنة بياناتك من السحابة..." />;


  const renderCurrentView = () => {
    switch (view) {
      case 'chat':
        return selectedCharacter ? (
          <ChatInterface messages={messages} onSendMessage={(text) => handleSendMessage(text)} isLoading={isLoading} character={selectedCharacter} onBack={handleBackToChatsList} currentUser={currentUser} />
        ) : (
          <ChatsListView chatHistories={chatHistories} books={allBooks} onCharacterSelect={handleCharacterSelect} />
        );
      case 'story':
        return selectedBook ? (
            <StoryView message={messages[messages.length - 1] || { role: Role.NARRATOR, content: 'جاري بدء القصة...'}} progress={storyProgress} isLoading={isLoading} onChoiceSelect={(choice) => handleSendMessage(choice, {isStoryMode: true})} onOpenInventory={() => { setModalTitle("الحقيبة"); setModalContent(inventory.length > 0 ? <ul className="list-disc pr-5 space-y-2">{inventory.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p>حقيبتك فارغة.</p>); }} inventoryCount={inventory.length} onSaveQuote={handleSaveQuote} discoveries={discoveries} />
        ) : <p>Book not selected</p>;
      case 'profile':
         return <ProfileView user={currentUser} allUsers={allUsers} stats={{ storiesStarted: Object.keys(storyStates).length, achievementsUnlocked: unlockedAchievements.length }} unlockedAchievements={unlockedAchievements} />;
       case 'behaviorAnalysis':
        return selectedCharacter ? <BehaviorAnalysisView discoveries={discoveries} character={selectedCharacter} analysisText={behaviorAnalysisText} isLoading={isAnalysisLoading} /> : <p>Character not selected</p>;
       case 'chatsList':
        return <ChatsListView chatHistories={chatHistories} books={allBooks} onCharacterSelect={handleCharacterSelect} />;
      case 'discover':
        return <DiscoverView
            posts={posts}
            currentUser={currentUser}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
            onAddReply={handleAddReply}
        />;
      case 'library':
      default:
        return <LibraryScreen books={allBooks} selectedBook={selectedBook} storyStates={storyStates} onBookSelect={handleBookSelect} onCharacterSelect={(char) => handleCharacterSelect(char, selectedBook!)} onStartStory={handleStartStory} onBackToGrid={handleBackToLibraryGrid} onSuggestNovel={handleSuggestNovel} currentUser={currentUser} />;
    }
  };

  const isStoryModeActive = selectedBook !== null && (view === 'story' || view === 'behaviorAnalysis');

  return (
    <div className="h-full w-full flex flex-col bg-brand-bg-dark text-white font-sans max-w-7xl mx-auto shadow-2xl shadow-black/50">
      
      {!selectedBook && !['chatsList', 'discover', 'profile'].includes(view) && (
          <TopHeader user={currentUser} theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} globalProgress={globalProgress} />
      )}
      
      {lastUnlockedAchievement && <Toast message={lastUnlockedAchievement} onDismiss={() => setLastUnlockedAchievement(null)} />}
      {notification && <Notification message={notification} onDismiss={() => setNotification(null)} />}
      {modalContent && <Modal title={modalTitle} onClose={() => setModalContent(null)}>{modalContent}</Modal>}
      {fateRollChallenge && <FateRollModal challenge={fateRollChallenge} onResult={handleFateRollResult} />}

      <main className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </main>

      <BottomNavBar currentView={view} setView={handleSetView} isStoryMode={isStoryModeActive} />
    </div>
  );
}