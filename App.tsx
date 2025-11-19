import React, { useState, useEffect } from 'react';
import { Book, Character, Message, Role, User, StoryChoice, StoryState, DiscoveryPost } from './types';
import { LibraryScreen } from './components/BookDetails';
import { ChatInterface } from './components/ChatInterface';
import { getCharacterResponse, getBehavioralAnalysis } from './services/geminiService';
import { BottomNavBar } from './components/BottomNavBar';
import { StoryView } from './components/StoryView';
import { TopHeader } from './components/TopHeader';
import { BehaviorAnalysisView } from './components/BehaviorAnalysisView';
import { ChatsListView } from './components/ChatsListView';
import { DiscoverView } from './components/DiscoverView';
import { LoginScreen } from './components/LoginScreen';
import { ProfileView } from './components/ProfileView';
import SplashScreen from './components/SplashScreen';
import { 
  getBooks, 
  getStoryStates, 
  getChatHistories, 
  saveStoryState, 
  saveChatHistory, 
  getAllUsers,
  getDiscoveryPosts,
  addDiscoveryPost,
  togglePostLike,
  addPostReply,
  addNovelSuggestion
} from './services/supabaseService';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'library' | 'chat' | 'story' | 'profile' | 'behaviorAnalysis' | 'chatsList' | 'discover'>('library');
  
  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [storyStates, setStoryStates] = useState<Record<string, StoryState>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [discoveryPosts, setDiscoveryPosts] = useState<DiscoveryPost[]>([]);

  // Selections
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const refreshData = async (userId: string) => {
    const [booksData, storyStatesData, chatHistoriesData, usersData, postsData] = await Promise.all([
        getBooks(),
        getStoryStates(userId),
        getChatHistories(userId),
        getAllUsers(),
        getDiscoveryPosts()
    ]);
    
    setBooks(booksData);
    setStoryStates(storyStatesData);
    setChatHistories(chatHistoriesData);
    setAllUsers(usersData);
    setDiscoveryPosts(postsData);
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    await refreshData(user.id);
  };

  // --- Navigation Handlers ---
  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
    setCurrentView('library');
  };

  const handleStartStory = (book: Book) => {
    setSelectedBook(book);
    
    // Initialize story state if it doesn't exist
    if (!storyStates[book.id]) {
        const initialState: StoryState = {
            messages: [],
            storyProgress: 0,
            inventory: [],
            discoveries: []
        };
        setStoryStates(prev => ({ ...prev, [book.id]: initialState }));
        
        // Trigger initial narration if empty
        handleStoryInteraction(book, initialState, []);
    }
    
    setCurrentView('story');
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    
    // Find the book this character belongs to for context if needed, 
    // though chat history is stored by character ID.
    const book = books.find(b => b.id === character.book_id);
    if (book) setSelectedBook(book);

    setCurrentView('chat');
  };

  // --- Story Logic ---
  const handleStoryInteraction = async (book: Book, currentState: StoryState, newMessages: Message[]) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    // Construct history for AI
    // If it's a fresh start, we might want a system prompt initiator
    const history = [...currentState.messages, ...newMessages];
    
    const systemInstruction = `
    أنت الراوي في رواية تفاعلية مبنية على "${book.title}" للكاتب "${book.author}".
    ملخص الرواية: ${book.summary}
    
    دورك هو:
    1. سرد الأحداث بأسلوب أدبي بليغ ومشوق يناسب أجواء الرواية الأصلية.
    2. جعل المستخدم هو البطل (خاطبه بـ "أنت").
    3. تقديم خيارات للمستخدم تؤثر على مسار القصة (استخدم وسم [CHOICE]).
    4. تتبع المخزون والاكتشافات (استخدم وسوم [INVENTORY_ADD], [INVENTORY_REMOVE], [DISCOVERY]).
    5. إدارة تقدم القصة من 0 إلى 100 (استخدم وسم [PROGRESS:n]).
    
    تنسيق الاستجابة المطلوب:
    - النص السردي العادي.
    - [CHOICE]
    أيقونة :: نص الخيار :: نوع (pragmatic/existential/absurdist)
    [CHOICE]
    
    ملاحظة: إذا كانت بداية القصة، ابدأ بمقدمة قوية تضع المستخدم في قلب الحدث.
    `;

    // Add initial prompt if history is empty
    let messagesToSend = history;
    if (history.length === 0) {
        messagesToSend = [{ role: Role.USER, content: "ابدأ القصة." }];
    }

    const response = await getCharacterResponse(systemInstruction, messagesToSend);
    
    const updatedMessages = [...history, response];
    
    // Update State
    const newState: StoryState = {
        ...currentState,
        messages: updatedMessages,
        storyProgress: response.progressIncrement 
            ? Math.min(100, currentState.storyProgress + response.progressIncrement)
            : currentState.storyProgress,
        inventory: updateInventory(currentState.inventory, response.inventoryAdd, response.inventoryRemove),
        // Discoveries logic would go here parsing the response
    };

    setStoryStates(prev => ({ ...prev, [book.id]: newState }));
    await saveStoryState(currentUser.id, book.id, newState);
    setIsLoading(false);
  };

  const updateInventory = (current: string[], add?: string, remove?: string) => {
    let inv = [...current];
    if (add && !inv.includes(add)) inv.push(add);
    if (remove) inv = inv.filter(i => i !== remove);
    return inv;
  };

  const handleStoryChoice = (choice: StoryChoice) => {
    if (!selectedBook) return;
    const state = storyStates[selectedBook.id];
    const userMsg: Message = { role: Role.USER, content: choice.text };
    
    // Add discovery if choice has category
    let newDiscoveries = state.discoveries;
    if (choice.category) {
        // Simple logic: assume choice text is the discovery for now
        newDiscoveries = [...state.discoveries, { 
            choiceText: choice.text, 
            category: choice.category, 
            outcome: 'unknown' // AI could return outcome later
        }];
    }

    const nextState = { ...state, discoveries: newDiscoveries };
    handleStoryInteraction(selectedBook, nextState, [userMsg]);
  };

  const handleSaveQuote = (quote: string) => {
     // Placeholder: In a real app, save to a quotes table
     console.log("Saved quote:", quote);
     alert("تم حفظ الاقتباس في مفكرتك!");
  };

  // --- Chat Logic ---
  const handleSendMessage = async (text: string) => {
    if (!selectedCharacter || !currentUser) return;
    
    setIsLoading(true);
    const history = chatHistories[selectedCharacter.id] || [];
    const userMsg: Message = { role: Role.USER, content: text };
    const newHistory = [...history, userMsg];
    
    // Optimistic update
    setChatHistories(prev => ({ ...prev, [selectedCharacter.id]: newHistory }));

    const systemInstruction = `
    أنت تقمص شخصية "${selectedCharacter.name}" من رواية.
    صفاتك: ${selectedCharacter.description}
    شخصيتك الداخلية: ${selectedCharacter.persona}
    
    تحدث مع المستخدم بأسلوبك الخاص. لا تخرج عن الشخصية أبدًا.
    `;

    const response = await getCharacterResponse(systemInstruction, newHistory);
    
    const finalHistory = [...newHistory, response];
    setChatHistories(prev => ({ ...prev, [selectedCharacter.id]: finalHistory }));
    await saveChatHistory(currentUser.id, selectedCharacter.id, finalHistory);
    setIsLoading(false);
  };

  // --- Analysis Logic ---
  const handleBehaviorAnalysis = async () => {
    if (!selectedBook) return;
    setIsLoading(true);
    setCurrentView('behaviorAnalysis');
    
    const state = storyStates[selectedBook.id];
    // Find main character of the book for perspective
    const mainChar = selectedBook.characters[0] || { name: 'الراوي', persona: 'مراقب محايد' };
    
    const analysis = await getBehavioralAnalysis(state?.discoveries || [], mainChar.persona);
    setAnalysisText(analysis);
    setIsLoading(false);
  };

  // --- Discover Logic ---
  const handleAddPost = async (postData: any) => {
    if (!currentUser) return;
    const newPost = await addDiscoveryPost({ ...postData, author_id: currentUser.id });
    if (newPost) {
        setDiscoveryPosts(prev => [newPost, ...prev]);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const result = await togglePostLike(postId, currentUser.id);
    if (result) {
        setDiscoveryPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const likes = result.liked 
                    ? [...p.likes, currentUser.id]
                    : p.likes.filter(id => id !== currentUser.id);
                return { ...p, likes };
            }
            return p;
        }));
    }
  };

  const handleAddReply = async (postId: string, content: string) => {
    if (!currentUser) return;
    const reply = await addPostReply({ post_id: postId, author_id: currentUser.id, content });
    if (reply) {
        setDiscoveryPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, replies: [...p.replies, reply] };
            }
            return p;
        }));
    }
  };
  
  const handleSuggestNovel = async (text: string) => {
    if (!currentUser) return;
    await addNovelSuggestion({ title: 'Suggestion', author: text, user_id: currentUser.id });
    alert("شكرًا لاقتراحك! سنقوم بمراجعته.");
  };


  // --- Rendering ---

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const globalProgress = Object.values(storyStates).reduce((acc, curr) => acc + (curr.storyProgress || 0), 0) / Math.max(1, books.length);
  const unlockedAchievements = currentUser.unlocked_achievements || [];

  return (
    <div className="flex flex-col h-screen w-full bg-brand-bg-dark text-brand-text-light font-arabic overflow-hidden">
      {currentView !== 'story' && currentView !== 'chat' && (
         <TopHeader user={currentUser} globalProgress={Math.min(100, Math.round(globalProgress))} />
      )}

      <main className="flex-1 overflow-hidden relative">
        {currentView === 'library' && (
            <LibraryScreen 
                books={books}
                selectedBook={selectedBook}
                storyStates={storyStates}
                onBookSelect={handleBookSelect}
                onCharacterSelect={handleCharacterSelect}
                onStartStory={handleStartStory}
                onBackToGrid={handleBackToLibrary}
                onSuggestNovel={handleSuggestNovel}
                currentUser={currentUser}
            />
        )}

        {currentView === 'story' && selectedBook && (
             <StoryView 
                message={storyStates[selectedBook.id]?.messages.slice(-1)[0] || { role: Role.NARRATOR, content: '...' }}
                isLoading={isLoading}
                onChoiceSelect={handleStoryChoice}
                onOpenInventory={() => alert("المخزون: " + (storyStates[selectedBook.id]?.inventory.join(', ') || "فارغ"))}
                inventoryCount={storyStates[selectedBook.id]?.inventory.length || 0}
                onSaveQuote={handleSaveQuote}
                discoveries={storyStates[selectedBook.id]?.discoveries || []}
             />
        )}

        {currentView === 'chat' && selectedCharacter && (
            <ChatInterface 
                messages={chatHistories[selectedCharacter.id] || []}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                character={selectedCharacter}
                onBack={() => setCurrentView('chatsList')}
                currentUser={currentUser}
            />
        )}

        {currentView === 'profile' && (
            <ProfileView 
                user={currentUser}
                allUsers={allUsers}
                stats={{
                    storiesStarted: Object.keys(storyStates).length,
                    achievementsUnlocked: unlockedAchievements.length
                }}
                unlockedAchievements={unlockedAchievements}
            />
        )}
        
        {currentView === 'behaviorAnalysis' && selectedBook && (
            <BehaviorAnalysisView 
                discoveries={storyStates[selectedBook.id]?.discoveries || []}
                character={selectedBook.characters[0]}
                analysisText={analysisText}
                isLoading={isLoading}
            />
        )}

        {currentView === 'chatsList' && (
            <ChatsListView 
                chatHistories={chatHistories}
                books={books}
                onCharacterSelect={(char, book) => {
                    setSelectedCharacter(char);
                    setSelectedBook(book);
                    setCurrentView('chat');
                }}
            />
        )}

        {currentView === 'discover' && (
            <DiscoverView 
                posts={discoveryPosts}
                currentUser={currentUser}
                allUsers={allUsers}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddReply={handleAddReply}
            />
        )}
      </main>

      <BottomNavBar 
        currentView={currentView} 
        setView={setCurrentView} 
        isStoryMode={!!selectedBook && storyStates[selectedBook.id]?.messages.length > 0} 
      />
    </div>
  );
};
