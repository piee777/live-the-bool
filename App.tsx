import React, { useState, useEffect } from 'react';
import { Book, Character, Message, Role, User, StoryChoice, Discovery, DiscoveryPost, Reply, StoryState } from './types';
import * as supabase from './services/supabaseService';
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
        <p className="font-arabic text-brand-text-medium mt-4">{message}</p>
    </div>
);

type View = 'library' | 'chat' | 'story' | 'profile' | 'behaviorAnalysis' | 'chatsList' | 'discover';

export default function App() {
  const [isSplashScreen, setIsSplashScreen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appIsLoading, setAppIsLoading] = useState(true);

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [storyStates, setStoryStates] = useState<Record<string, StoryState>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [globalProgress, setGlobalProgress] = useState<number>(0);
  const [discoveryPosts, setDiscoveryPosts] = useState<DiscoveryPost[]>([]);
  
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashScreen(false);
    }, 3000); // Splash screen duration
    return () => clearTimeout(timer);
  }, []);

  // Check for existing user on app start
  useEffect(() => {
    const checkUser = async () => {
        setAppIsLoading(true);
        const userId = localStorage.getItem('storify_user_id');
        if (userId) {
            const userProfile = await supabase.getUserProfile(userId);
            if (userProfile) {
                setCurrentUser(userProfile);
            } else {
                localStorage.removeItem('storify_user_id'); // Clear invalid ID
            }
        }
        setAppIsLoading(false); // Done checking, now we either show login or load data
    };
    if (!isSplashScreen) {
        checkUser();
    }
  }, [isSplashScreen]);

  // Load user-specific data once we have a user
  useEffect(() => {
    const loadUserData = async () => {
        if (!currentUser) return;
        setAppIsLoading(true);
        try {
            await supabase.syncInitialBooks(); // Ensure books are up-to-date
            
            const [
                booksData,
                storyStatesData,
                chatHistoriesData,
                postsData
            ] = await Promise.all([
                supabase.getBooks(),
                supabase.getStoryStates(currentUser.id),
                supabase.getChatHistories(currentUser.id),
                supabase.getDiscoveryPosts()
            ]);
            
            setAllBooks(booksData);
            setStoryStates(storyStatesData);
            setChatHistories(chatHistoriesData);
            setDiscoveryPosts(postsData);
            setUnlockedAchievements([]); 
            setGlobalProgress(0);

        } catch (error) {
            console.error("Failed to load user data:", error);
        } finally {
            setAppIsLoading(false);
        }
    };

    loadUserData();
  }, [currentUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      localStorage.setItem('storify_user_id', user.id);
  };
  
  const handleBookSelect = (book: Book) => setSelectedBook(book);
  
  const handleBackToLibraryGrid = () => {
    // This function's only job is to navigate from the book detail screen
    // back to the library grid. It should NOT save state, as that can
    // accidentally overwrite valid progress with an empty state.
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
    // Save progress *before* changing the view.
    if (view === 'story' && newView !== 'story' && selectedBook && currentUser) {
        const currentState: StoryState = { messages, storyProgress, inventory, discoveries };
        setStoryStates(prev => ({ ...prev, [selectedBook.id]: currentState }));
        await supabase.saveStoryState(currentUser.id, selectedBook.id, currentState);
    }
    if (view === 'chat' && newView !== 'chat' && selectedCharacter && currentUser) {
        const currentMessages = messages;
        setChatHistories(prev => ({ ...prev, [selectedCharacter.id]: currentMessages }));
        await supabase.saveChatHistory(currentUser.id, selectedCharacter.id, currentMessages);
    }
    
    // If navigating to the library, always go to the grid view by clearing the selected book.
    // This provides a consistent UX and prevents race conditions with stale props.
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
    // Capture and save state before navigating.
    if (selectedCharacter && currentUser) {
        const currentMessages = messages;
        setChatHistories(prev => ({ ...prev, [selectedCharacter.id]: currentMessages }));
        supabase.saveChatHistory(currentUser.id, selectedCharacter.id, currentMessages);
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
  
  const handleAddDiscoveryPost = async (postData: Omit<DiscoveryPost, 'id' | 'author' | 'created_at' | 'likes' | 'replies'>) => {
    if (!currentUser) return;
    await supabase.createDiscoveryPost(postData, currentUser.id);
    const updatedPosts = await supabase.getDiscoveryPosts();
    setDiscoveryPosts(updatedPosts);
  };

  const handleLikeDiscoveryPost = (postId: string) => {
    if (!currentUser) return;
    const post = discoveryPosts.find(p => p.id === postId);
    if (!post) return;
    
    const isLiked = post.likes.includes(currentUser.id);
    supabase.togglePostLike(postId, currentUser.id, isLiked);

    setDiscoveryPosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? { ...p, likes: isLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id] } : p)
    );
  };

  const handleAddDiscoveryReply = async (postId: string, replyText: string) => {
    if (!currentUser) return;
    const newReply = await supabase.addReplyToPost(postId, replyText, currentUser.id);
    if(newReply) {
        const updatedReply = { ...newReply, author: { id: currentUser.id, name: currentUser.name, avatar_url: currentUser.avatar_url }};
        setDiscoveryPosts(prevPosts => 
            prevPosts.map(post => post.id === postId ? { ...post, replies: [...post.replies, updatedReply] } : post)
        );
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
    const newUserMessage: Message = { role: Role.USER, content: text };
    
    const messagesForApi = [...messages, newUserMessage];

    const isFirstStoryMessage = messages.length === 0 && isStoryMode;
    if (!isStoryMode || isFirstStoryMessage) {
        setMessages(messagesForApi);
    }

    setIsLoading(true);

    const currentBook = bookForStory || selectedBook;
    const systemInstruction = isStoryMode && currentBook
        ? STORY_PROMPT_TEMPLATE(currentBook.title, currentBook.author, currentBook.summary)
        : CHAT_PROMPT_TEMPLATE(characterForAPI.persona, currentBook?.characters.filter(c => c.id !== characterForAPI.id).map(c => c.name).join('، ') || '');
    
    try {
      const responseMessage = await getCharacterResponse(systemInstruction, messagesForApi);
      
       if (isStoryMode && typeof choice !== 'string') {
        const newDiscovery: Discovery = { choiceText: choice.text, category: choice.category, outcome: responseMessage.impact || 'مسار القصة يتغير...' };
        setDiscoveries(prev => [...prev, newDiscovery]);
      }

      if (responseMessage.progressIncrement) setStoryProgress(prev => Math.min(prev + responseMessage.progressIncrement!, 100));
      if (responseMessage.inventoryAdd) {
        setInventory(prev => [...prev, responseMessage.inventoryAdd!]);
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
        return; 
      }

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
  if (appIsLoading) return <AppLoader message="جاري تحميل عالمك..." />;
  if (!currentUser) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;

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
            <StoryView message={messages[messages.length - 1] || { role: Role.NARRATOR, content: '...'}} progress={storyProgress} isLoading={isLoading} onChoiceSelect={(choice) => handleSendMessage(choice, {isStoryMode: true})} onOpenInventory={() => { setModalTitle("الحقيبة"); setModalContent(inventory.length > 0 ? <ul className="list-disc pr-5 space-y-2">{inventory.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p>حقيبتك فارغة.</p>); }} inventoryCount={inventory.length} onSaveQuote={handleSaveQuote} discoveries={discoveries} />
        ) : <p>Book not selected</p>;
      case 'profile':
         return <ProfileView user={currentUser} stats={{ storiesStarted: Object.keys(storyStates).length, achievementsUnlocked: unlockedAchievements.length, thinkingProfile: 'المفكر الوجودي' }} unlockedAchievements={unlockedAchievements} allBooks={allBooks} storyProgress={Object.entries(storyStates).reduce((acc, [bookId, state]) => ({...acc, [bookId]: (state as StoryState).storyProgress}), {} as Record<string, number>)} />;
       case 'behaviorAnalysis':
        return selectedCharacter ? <BehaviorAnalysisView discoveries={discoveries} character={selectedCharacter} analysisText={behaviorAnalysisText} isLoading={isAnalysisLoading} /> : <p>Character not selected</p>;
       case 'chatsList':
        return <ChatsListView chatHistories={chatHistories} books={allBooks} onCharacterSelect={handleCharacterSelect} />;
      case 'discover':
        return <DiscoverView posts={discoveryPosts} currentUser={currentUser} onAddPost={handleAddDiscoveryPost} onLikePost={handleLikeDiscoveryPost} onAddReply={handleAddDiscoveryReply} />;
      case 'library':
      default:
        return <LibraryScreen books={allBooks} selectedBook={selectedBook} storyProgress={Object.entries(storyStates).reduce((acc, [bookId, state]) => ({...acc, [bookId]: (state as StoryState).storyProgress}), {} as Record<string, number>)} onBookSelect={handleBookSelect} onCharacterSelect={(char) => handleCharacterSelect(char, selectedBook!)} onStartStory={handleStartStory} onBackToGrid={handleBackToLibraryGrid} />;
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