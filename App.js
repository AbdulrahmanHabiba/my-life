import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Menu,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Mic,
  Sparkles,
  CheckCircle2,
  Circle,
  BookOpen,
  Sun,
  ShieldAlert,
  Languages,
  Plus,
  Maximize2,
  Minimize2,
  Trash2,
  Target,
  X,
} from 'lucide-react-native';
import { classifyUserInput } from './aiClassifier';

const { width } = Dimensions.get('window');

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.78)).current;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAmoledClock, setIsAmoledClock] = useState(false);

  const [timerMode, setTimerMode] = useState('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState('التركيز على مهمة واحدة فقط الآن');

  const [thoughtInput, setThoughtInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [thoughts, setThoughts] = useState([
    { id: '1', text: 'مراجعة إجراءات عزل الطاقة LOTO وتصاريح العمل', category: 'HSE', done: false },
    { id: '2', text: 'مذاكرة 10 جمل محادثة ألماني وتصريف الأفعال', category: 'German', done: false },
  ]);

  const [studyTasks, setStudyTasks] = useState({
    HSE: [
      { id: 'h1', title: 'مراجعة اشتراطات السقالات والعمل على ارتفاعات', done: true },
      { id: 'h2', title: 'تحضير نقاط حديث السلامة (Toolbox Talk)', done: false },
    ],
    German: [
      { id: 'g1', title: 'قواعد النطق والأرقام (A1 Grundlagen)', done: true },
      { id: 'g2', title: 'تكوين الجمل الأساسية والضمائر الشخصية', done: false },
    ],
    English: [
      { id: 'e1', title: 'التدرب الصوتي على سيناريو اجتماع عمل', done: false },
    ],
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [quranPagesToday, setQuranPagesToday] = useState(2);
  const [dailyQuranGoal] = useState(4);
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehPhrase, setTasbeehPhrase] = useState('سبحان الله وبحمده');
  const [adhkarList, setAdhkarList] = useState([
    { id: 'a1', time: 'صباح', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', target: 1, current: 1 },
    { id: 'a2', time: 'مساء', text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', target: 1, current: 0 },
  ]);

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'pomodoro') {
          setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
    Animated.spring(slideAnim, {
      toValue: open ? 0 : -width * 0.78,
      useNativeDriver: true,
      bounciness: 3,
    }).start();
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSmartAdd = async (inputText) => {
    const text = (inputText || thoughtInput).trim();
    if (!text) return;
    const detectedCategory = await classifyUserInput(text);

    if (['HSE', 'German', 'English'].includes(detectedCategory)) {
      setStudyTasks((prev) => ({
        ...prev,
        [detectedCategory]: [{ id: Date.now().toString(), title: text, done: false }, ...prev[detectedCategory]],
      }));
    }

    setThoughts((prev) => [{ id: Date.now().toString(), text, category: detectedCategory, done: false }, ...prev]);
    setThoughtInput('');
  };

  const triggerVoiceCapture = () => {
    if (Platform.OS === 'web' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        handleSmartAdd(transcript);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.start();
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSmartAdd('مذاكرة قواعد اللغة الألمانية ومراجعة خطة السلامة HSE');
      }, 1200);
    }
  };

  const navigateTo = (screen) => {
    setActiveScreen(screen);
    toggleDrawer(false);
  };

  if (isAmoledClock) {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => setIsAmoledClock(false)} style={styles.amoledContainer}>
        <StatusBar hidden />
        <Text style={styles.amoledTimeText}>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
        <Text style={styles.amoledSecondsText}>
          {String(currentTime.getSeconds()).padStart(2, '0')}s • {formatTimer(timerMode === 'pomodoro' ? secondsLeft : stopwatchSeconds)}
        </Text>
        <Text style={styles.amoledFocusTask}>{activeFocusTask}</Text>
        <View style={styles.amoledHintRow}>
          <Minimize2 size={15} color="#444" />
          <Text style={styles.amoledHintText}>اضغط في أي مكان للخروج من وضع AMOLED</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => toggleDrawer(true)} style={styles.iconBtn}>
          <Menu size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Life • ماي لايف</Text>
          <Text style={styles.headerSubtitle}>ADHD Mind & Habit OS</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAmoledClock(true)} style={styles.iconBtn}>
          <Maximize2 size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeScreen === 'home' && (
          <>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setIsAmoledClock(true)} style={styles.clockCard}>
              <View>
                <Text style={styles.clockLabel}>الساعة الآن (اضغط لوضع AMOLED الكامل)</Text>
                <Text style={styles.clockDigital}>
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              </View>
              <View style={styles.amoledBadge}>
                <Clock size={22} color="#007AFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.iosCard}>
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, timerMode === 'pomodoro' && styles.segmentActive]}
                  onPress={() => { setIsTimerRunning(false); setTimerMode('pomodoro'); }}
                >
                  <Text style={[styles.segmentText, timerMode === 'pomodoro' && styles.segmentTextActive]}>تايمر تركيز (25د)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, timerMode === 'stopwatch' && styles.segmentActive]}
                  onPress={() => { setIsTimerRunning(false); setTimerMode('stopwatch'); }}
                >
                  <Text style={[styles.segmentText, timerMode === 'stopwatch' && styles.segmentTextActive]}>ستوب واتش مفتوح</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.focusBanner}>
                <Target size={16} color="#007AFF" />
                <Text style={styles.focusBannerText} numberOfLines={1}>{activeFocusTask}</Text>
              </View>

              <Text style={styles.timerDigits}>
                {formatTimer(timerMode === 'pomodoro' ? secondsLeft : stopwatchSeconds)}
              </Text>

              <View style={styles.timerActions}>
                <TouchableOpacity
                  style={[styles.primaryBtn, isTimerRunning && { backgroundColor: '#FF9500' }]}
                  onPress={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause size={20} color="#FFF" /> : <Play size={20} color="#FFF" />}
                  <Text style={styles.primaryBtnText}>{isTimerRunning ? 'إيقاف مؤقت' : 'ابدأ التركيز'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setIsTimerRunning(false);
                    timerMode === 'pomodoro' ? setSecondsLeft(25 * 60) : setStopwatchSeconds(0);
                  }}
                >
                  <RotateCcw size={20} color="#1C1C1E" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.iosCard}>
              <View style={styles.cardHeaderRow}>
                <Sparkles size={19} color="#5856D6" />
                <Text style={styles.sectionTitle}>تفريغ الأفكار الفوري (صوتي / ذكي)</Text>
              </View>
              <Text style={styles.helperText}>اكتب أو سجل صوتياً أي فكرة تيجي في بالك، والنظام هيصنفها لمكانها تلقائياً.</Text>

              <View style={styles.inputRow}>
                <TouchableOpacity onPress={triggerVoiceCapture} style={[styles.micBtn, isRecording && styles.micBtnRecording]}>
                  <Mic size={20} color={isRecording ? '#FFF' : '#007AFF'} />
                </TouchableOpacity>
                <TextInput
                  style={styles.iosInput}
                  placeholder={isRecording ? 'جاري الاستماع...' : 'اكتب فكرة أو مهمة أو جملة ألماني...'}
                  placeholderTextColor="#8E8E93"
                  value={thoughtInput}
                  onChangeText={setThoughtInput}
                  onSubmitEditing={() => handleSmartAdd()}
                />
                <TouchableOpacity onPress={() => handleSmartAdd()} style={styles.sendBtn}>
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {thoughts.map((item) => (
                <View key={item.id} style={styles.thoughtItem}>
                  <TouchableOpacity style={styles.thoughtContent} onPress={() => setActiveFocusTask(item.text)}>
                    <View style={styles.categoryTag}><Text style={styles.categoryTagText}>{item.category}</Text></View>
                    <Text style={styles.thoughtText}>{item.text}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setThoughts(thoughts.filter((t) => t.id !== item.id))}>
                    <Trash2 size={17} color="#C7C7CC" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {['HSE', 'German', 'English'].includes(activeScreen) && (
          <View style={styles.iosCard}>
            <Text style={styles.screenBigTitle}>
              {activeScreen === 'HSE' && '🛡️ مذاكرة ومهام الـ HSE'}
              {activeScreen === 'German' && '🇩🇪 مذاكرة اللغة الألمانية (Deutsch)'}
              {activeScreen === 'English' && '🇬🇧 تطوير الإنجليزي والمحادثة'}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.iosInput}
                placeholder={`أضف مهمة جديدة في ${activeScreen}...`}
                placeholderTextColor="#8E8E93"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  if (!newTaskTitle.trim()) return;
                  setStudyTasks((prev) => ({
                    ...prev,
                    [activeScreen]: [{ id: Date.now().toString(), title: newTaskTitle, done: false }, ...prev[activeScreen]],
                  }));
                  setNewTaskTitle('');
                }}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {studyTasks[activeScreen].map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <TouchableOpacity
                  style={styles.taskCheckArea}
                  onPress={() => {
                    setStudyTasks((prev) => ({
                      ...prev,
                      [activeScreen]: prev[activeScreen].map((t) => t.id === task.id ? { ...t, done: !t.done } : t),
                    }));
                  }}
                >
                  {task.done ? <CheckCircle2 size={22} color="#34C759" /> : <Circle size={22} color="#C7C7CC" />}
                  <Text style={[styles.taskTitleText, task.done && styles.taskDoneText]}>{task.title}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.focusQuickBtn}
                  onPress={() => { setActiveFocusTask(task.title); setActiveScreen('home'); }}
                >
                  <Text style={styles.focusQuickBtnText}>ابدأ مذاكرة</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeScreen === 'Quran' && (
          <View style={styles.iosCard}>
            <Text style={styles.screenBigTitle}>📖 الورد اليومي للقرآن الكريم</Text>
            <View style={styles.MotivationBox}>
              <Text style={styles.motivationQuote}>قال ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»</Text>
            </View>
            <View style={styles.quranCounterBox}>
              <Text style={styles.quranProgressBig}>{quranPagesToday} / {dailyQuranGoal} صفحات</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setQuranPagesToday((p) => p + 1)}>
                <Plus size={18} color="#FFF" />
                <Text style={styles.primaryBtnText}>قرأت صفحة الآن</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeScreen === 'Adhkar' && (
          <>
            <View style={styles.iosCard}>
              <Text style={styles.screenBigTitle}>📿 السبحة الإلكترونية</Text>
              <TouchableOpacity activeOpacity={0.75} onPress={() => setTasbeehCount((c) => c + 1)} style={styles.tasbeehCircle}>
                <Text style={styles.tasbeehNumber}>{tasbeehCount}</Text>
                <Text style={styles.tasbeehTapHint}>اضغط للتسبيح</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTasbeehCount(0)} style={{ alignSelf: 'center', marginTop: 10 }}>
                <Text style={{ color: '#8E8E93', fontSize: 13 }}>تصفير العداد</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.iosCard}>
              <Text style={styles.sectionTitle}>☀️🌙 أذكار الصباح والمساء</Text>
              {adhkarList.map((dhikr) => (
                <TouchableOpacity
                  key={dhikr.id}
                  onPress={() => setAdhkarList((prev) => prev.map((d) => d.id === dhikr.id && d.current < d.target ? { ...d, current: d.current + 1 } : d))}
                  style={[styles.dhikrCard, dhikr.current >= dhikr.target && styles.dhikrCardDone]}
                >
                  <Text style={styles.dhikrText}>{dhikr.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={isDrawerOpen} transparent animationType="none">
        <View style={styles.drawerOverlay}>
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerAppTitle}>My Life</Text>
              <TouchableOpacity onPress={() => toggleDrawer(false)}><X size={22} color="#8E8E93" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('home')}><Clock size={20} color="#007AFF" /><Text style={styles.drawerItemText}>الرئيسية</Text></TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('HSE')}><ShieldAlert size={20} color="#FF9500" /><Text style={styles.drawerItemText}>مهام HSE</Text></TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('German')}><Languages size={20} color="#5856D6" /><Text style={styles.drawerItemText}>اللغة الألمانية</Text></TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('English')}><Languages size={20} color="#007AFF" /><Text style={styles.drawerItemText}>اللغة الإنجليزية</Text></TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Quran')}><BookOpen size={20} color="#34C759" /><Text style={styles.drawerItemText}>القرآن الكريم</Text></TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Adhkar')}><Sun size={20} color="#FF2D55" /><Text style={styles.drawerItemText}>الأذكار والسبحة</Text></TouchableOpacity>
            </ScrollView>
          </Animated.View>
          <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={() => toggleDrawer(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  clockCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 20, marginBottom: 14, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  clockLabel: { fontSize: 12, color: '#8E8E93', textAlign: 'right', marginBottom: 4 },
  clockDigital: { fontSize: 28, fontWeight: '300', color: '#1C1C1E', letterSpacing: 1 },
  amoledBadge: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0F6FF', alignItems: 'center', justifyContent: 'center' },
  iosCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16 },
  segmentContainer: { flexDirection: 'row-reverse', backgroundColor: '#F2F2F7', borderRadius: 14, padding: 4, marginBottom: 16 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 11, alignItems: 'center' },
  segmentActive: { backgroundColor: '#FFF' },
  segmentText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  segmentTextActive: { color: '#1C1C1E', fontWeight: '700' },
  focusBanner: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F8FF', paddingVertical: 8, borderRadius: 12, gap: 6 },
  focusBannerText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  timerDigits: { fontSize: 64, fontWeight: '200', color: '#1C1C1E', textAlign: 'center', marginVertical: 16 },
  timerActions: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 12 },
  primaryBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 13, paddingHorizontal: 26, borderRadius: 16, gap: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#F2F2F7', padding: 13, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', textAlign: 'right' },
  helperText: { fontSize: 13, color: '#8E8E93', textAlign: 'right', lineHeight: 19, marginBottom: 14 },
  inputRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 14 },
  iosInput: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1C1C1E', textAlign: 'right' },
  micBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0F6FF', alignItems: 'center', justifyContent: 'center' },
  micBtnRecording: { backgroundColor: '#FF3B30' },
  sendBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' },
  thoughtItem: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  thoughtContent: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  categoryTag: { backgroundColor: '#F2F2F7', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  categoryTagText: { fontSize: 11, fontWeight: '600', color: '#5856D6' },
  thoughtText: { fontSize: 14, color: '#1C1C1E', textAlign: 'right', flex: 1 },
  amoledContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  amoledTimeText: { fontSize: 82, fontWeight: '100', color: '#FFF', letterSpacing: 2 },
  amoledSecondsText: { fontSize: 20, color: '#8E8E93', marginTop: 8, marginBottom: 30 },
  amoledFocusTask: { fontSize: 18, color: '#0A84FF', fontWeight: '500', textAlign: 'center', marginBottom: 60 },
  amoledHintRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  amoledHintText: { color: '#444', fontSize: 12 },
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.28)' },
  drawerContent: { width: width * 0.78, maxWidth: 320, backgroundColor: '#FFF', height: '100%', paddingTop: 50, paddingHorizontal: 20 },
  drawerBackdrop: { flex: 1 },
  drawerHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  drawerAppTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  drawerItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 14, gap: 12, marginBottom: 4 },
  drawerItemText: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  screenBigTitle: { fontSize: 21, fontWeight: '800', color: '#1C1C1E', textAlign: 'right', marginBottom: 8 },
  taskRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  taskCheckArea: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 },
  taskTitleText: { fontSize: 15, color: '#1C1C1E', textAlign: 'right', flex: 1 },
  taskDoneText: { textDecorationLine: 'line-through', color: '#8E8E93' },
  focusQuickBtn: { backgroundColor: '#F0F6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  focusQuickBtnText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  MotivationBox: { backgroundColor: '#F4FBF7', borderRadius: 16, padding: 16, marginVertical: 12 },
  motivationQuote: { fontSize: 16, fontWeight: '700', color: '#1E7E34', textAlign: 'center' },
  quranCounterBox: { alignItems: 'center', paddingVertical: 20 },
  quranProgressBig: { fontSize: 42, fontWeight: '300', color: '#1C1C1E', marginVertical: 12 },
  tasbeehCircle: { width: 190, height: 190, borderRadius: 95, backgroundColor: '#F2F2F7', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: 14, borderWidth: 6, borderColor: '#FFF' },
  tasbeehNumber: { fontSize: 54, fontWeight: '200', color: '#007AFF' },
  tasbeehTapHint: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
  dhikrCard: { backgroundColor: '#F9F9FB', borderRadius: 16, padding: 16, marginTop: 12 },
  dhikrCardDone: { backgroundColor: '#F4FBF7' },
  dhikrText: { fontSize: 15, color: '#1C1C1E', textAlign: 'right', lineHeight: 24 },
});
