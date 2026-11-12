import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native"
import {
  useAudioRecorder,
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio"
import { useLang } from "../i18n"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import { FadeSlideIn, PulseHalo, ScalePressable, WaveformBars } from "./Motion"
import {
  Mic,
  Volume2,
  Sparkles,
  Send,
  Sprout,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
} from "lucide-react-native"
import {
  fetchActiveCropStage,
  submitTextObservation,
  type ActiveCropStageResponse,
} from "../api/cropStage"
import {
  streamAgriChat,
  streamVoiceAudio,
  synthesizeSpeechAudio,
} from "../api/aiAdvisor"

type ChatEntry = {
  role: "user" | "assistant"
  text: string
  stageContext?: string
  urgency?: "LOW" | "MEDIUM" | "HIGH"
  timestamp: string
}

export default function VoiceAssistantScreen() {
  const { lang } = useLang()
  const { profile } = useProfile()
  const { params } = useNav()
  const isKn = lang === "kn"
  const seededPromptSentRef = useRef(false)

  const [stageData, setStageData] = useState<ActiveCropStageResponse | null>(null)
  const [loadingStage, setLoadingStage] = useState(true)
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceStatusText, setVoiceStatusText] = useState<string | null>(null)
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null)
  const [loadingAudioIdx, setLoadingAudioIdx] = useState<number | null>(null)

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const nativePlayerRef = useRef<any>(null)
  const webAudioRef = useRef<any>(null)

  const stopSpeechPlayback = () => {
    try {
      if (nativePlayerRef.current) {
        nativePlayerRef.current.pause?.()
        nativePlayerRef.current.remove?.()
        nativePlayerRef.current = null
      }
    } catch {}
    try {
      if (webAudioRef.current) {
        webAudioRef.current.pause?.()
        webAudioRef.current = null
      }
      if (Platform.OS === "web" && typeof window !== "undefined" && (window as any).speechSynthesis) {
        ;(window as any).speechSynthesis.cancel()
      }
    } catch {}
    setSpeakingIdx(null)
    setLoadingAudioIdx(null)
  }

  useEffect(() => {
    return () => {
      stopSpeechPlayback()
    }
  }, [])

  const handleSpeakToggle = async (idx: number, text: string) => {
    if (!text.trim()) return
    if (speakingIdx === idx || loadingAudioIdx === idx) {
      stopSpeechPlayback()
      return
    }
    stopSpeechPlayback()
    setLoadingAudioIdx(idx)

    const langCode = isKn ? "kn-IN" : "en-IN"
    const res = await synthesizeSpeechAudio(text, langCode)
    setLoadingAudioIdx(null)

    if (res.ok && res.dataUri) {
      if (Platform.OS === "web" && typeof Audio !== "undefined") {
        try {
          const audio = new Audio(res.dataUri)
          webAudioRef.current = audio
          setSpeakingIdx(idx)
          audio.onended = () => setSpeakingIdx(null)
          audio.onerror = () => setSpeakingIdx(null)
          await audio.play()
          return
        } catch {}
      } else {
        try {
          await setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
          }).catch(() => {})
          const player = createAudioPlayer(res.dataUri)
          nativePlayerRef.current = player
          setSpeakingIdx(idx)
          player.addListener?.("playbackStatusUpdate", (st: any) => {
            if (st?.didJustFinish) {
              setSpeakingIdx(null)
            }
          })
          player.play()
          return
        } catch {}
      }
    }

    if (Platform.OS === "web" && typeof window !== "undefined" && (window as any).speechSynthesis) {
      try {
        const utter = new (window as any).SpeechSynthesisUtterance(text.slice(0, 480))
        utter.lang = langCode
        setSpeakingIdx(idx)
        utter.onend = () => setSpeakingIdx(null)
        utter.onerror = () => setSpeakingIdx(null)
        ;(window as any).speechSynthesis.speak(utter)
        return
      } catch {}
    }

    setSpeakingIdx(null)
    Alert.alert(
      isKn ? "ಧ್ವನಿ ಪ್ಲೇಬ್ಯಾಕ್" : "Audio Unavailable",
      res.error || (isKn ? "ಈ ಸಂದೇಶವನ್ನು ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ." : "Could not play audio for this message.")
    )
  }

  const [chat, setChat] = useState<ChatEntry[]>([
    {
      role: "assistant",
      text: isKn
        ? `ನಮಸ್ಕಾರ ${profile.nameKn || profile.name}! ನಾನು ನಿಮ್ಮ ಕೃಷಿಕಧಾರಾ AI ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಬೆಳೆಯ ಪ್ರಸ್ತುತ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.`
        : `Namaskara ${profile.name}! I am your KrushikaDhara AI Advisor. Ask questions tailored to your crop's present growth stage.`,
      timestamp: "Just now",
    },
  ])

  // Load active crop and stage on mount
  useEffect(() => {
    fetchActiveCropStage(profile.mobile)
      .then((res) => setStageData(res))
      .finally(() => setLoadingStage(false))
  }, [profile.mobile])

  // Auto-submit pre-populated scan follow-up query when opened from ScanResultScreen (wait until active crop stage finishes loading)
  useEffect(() => {
    const initialPrompt = typeof params?.initialPrompt === "string" ? params.initialPrompt.trim() : ""
    if (initialPrompt && !loadingStage && !seededPromptSentRef.current) {
      seededPromptSentRef.current = true
      const timer = setTimeout(() => {
        void handleSendText(initialPrompt)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [params?.initialPrompt, loadingStage])

  const crop = stageData?.cropField
  const stageName = isKn ? crop?.currentStageNameKn : crop?.currentStageNameEn
  const daysCount = crop?.daysSinceSowing ?? 35

  // Dynamic quick suggestions tailored to active crop stage
  const dynamicSuggestions = isKn
    ? [
      `ಈ ${stageName || "ಬೆಳವಣಿಗೆ"} ಹಂತದಲ್ಲಿ ಎಷ್ಟು ಗೊಬ್ಬರ ಹಾಕಬೇಕು?`,
      "ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?",
      "ಈ ಹಂತದಲ್ಲಿ ನೀರಿನ ಮಟ್ಟ ಎಷ್ಟು ಇರಬೇಕು?",
      "ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಸಲಹೆ ನೀಡಿ",
    ]
    : [
      `What fertilizer is needed at ${crop?.currentStageNameEn || "this stage"}?`,
      "Leaves are turning yellow, what should I spray?",
      "How much irrigation is required right now?",
      "Pest and disease prevention tips for this stage",
    ]

  const handleSendText = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim()
    if (!query || isProcessing) return

    setInputText("")
    const userMsg: ChatEntry = {
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setChat((prev) => [...prev, userMsg])
    setIsProcessing(true)

    // Placeholder for progressive streamed response
    const initialAssistantMsg: ChatEntry = {
      role: "assistant",
      text: "",
      stageContext: stageName || "Rice (Paddy)",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setChat((prev) => [...prev, initialAssistantMsg])

    let accumulatedText = ""

    await streamAgriChat(
      query,
      {
        onChunk: (chunk: string) => {
          accumulatedText += chunk
          setChat((prev) => {
            const next = [...prev]
            if (next.length > 0) {
              const last = next[next.length - 1]
              if (last.role === "assistant") {
                next[next.length - 1] = {
                  ...last,
                  text: accumulatedText,
                }
              }
            }
            return next
          })
        },
        onDone: () => {
          setIsProcessing(false)
        },
        onError: async (errMsg: string) => {
          console.warn("⚠️ [Streaming error, falling back to standard endpoint]:", errMsg)
          // Fallback to standard endpoint
          try {
            const res = await submitTextObservation(
              query,
              profile.mobile,
              isKn ? "kn" : "en"
            )
            const fallbackAnswer = isKn ? res.adviceKn : res.adviceEn
            setChat((prev) => {
              const next = [...prev]
              if (next.length > 0 && next[next.length - 1].role === "assistant") {
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  text: fallbackAnswer,
                  urgency: res.urgency,
                }
              }
              return next
            })
          } finally {
            setIsProcessing(false)
          }
        },
      },
      {
        mobile: profile.mobile,
        cropName: crop?.cropName,
        district: profile.district,
        language: isKn ? "kn" : "en",
      }
    )
  }

  const sendRecordedAudio = async (
    audioInput: Blob | { uri: string; name?: string; type?: string },
    filename: string
  ) => {
    setIsProcessing(true)
    setVoiceStatusText(isKn ? "ಧ್ವನಿ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ..." : "Transcribing with Sarvam AI...")

    let accumulatedText = ""
    const assistantPlaceholder: ChatEntry = {
      role: "assistant",
      text: "",
      stageContext: stageName || "Rice (Paddy)",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    await streamVoiceAudio(
      audioInput,
      filename,
      {
        onTranscript: (transcript: string) => {
          const userMsg: ChatEntry = {
            role: "user",
            text: transcript,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
          setChat((prev) => [...prev, userMsg, assistantPlaceholder])
          setVoiceStatusText(null)
        },
        onChunk: (chunk: string) => {
          accumulatedText += chunk
          setChat((prev) => {
            const next = [...prev]
            if (next.length > 0 && next[next.length - 1].role === "assistant") {
              next[next.length - 1] = {
                ...next[next.length - 1],
                text: accumulatedText,
              }
            }
            return next
          })
        },
        onDone: () => {
          setIsProcessing(false)
          setVoiceStatusText(null)
        },
        onError: (err) => {
          console.error("Voice stream error:", err)
          setIsProcessing(false)
          setVoiceStatusText(null)
          Alert.alert(
            isKn ? "ಧ್ವನಿ ದೋಷ" : "Voice Error",
            err || (isKn ? "ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ." : "Could not transcribe audio. Please speak clearly.")
          )
        },
      },
      {
        mobile: profile.mobile,
        language: isKn ? "kn-IN" : "en-IN",
        cropName: crop?.cropName,
        district: profile.district,
      }
    )
  }

  // Handle Voice / Mic Recording using expo-audio on Mobile (Android/iOS) and MediaRecorder on Web
  const handleMicToggle = async () => {
    if (isProcessing) return

    // Native (Android / iOS Expo Go) path via expo-audio
    if (Platform.OS !== "web") {
      if (isListening) {
        try {
          setIsListening(false)
          setVoiceStatusText(isKn ? "ಧ್ವನಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "Finishing recording...")
          await audioRecorder.stop()
          await setAudioModeAsync({ allowsRecording: false }).catch(() => {})
          const uri = audioRecorder.uri
          if (!uri) {
            setVoiceStatusText(null)
            return
          }
          await sendRecordedAudio({ uri, name: "recording.m4a", type: "audio/m4a" }, "recording.m4a")
        } catch (stopErr: any) {
          console.warn("⚠️ Stop recording error:", stopErr)
          setIsListening(false)
          setIsProcessing(false)
          setVoiceStatusText(null)
        }
        return
      }

      try {
        const perm = await requestRecordingPermissionsAsync()
        if (!perm.granted) {
          Alert.alert(
            isKn ? "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ" : "Microphone Permission",
            isKn
              ? "ಧ್ವನಿ ಸಹಾಯಕಕ್ಕೆ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ."
              : "Microphone permission is required for voice questions. Please allow access in Settings."
          )
          return
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        })
        await audioRecorder.prepareToRecordAsync()
        audioRecorder.record()
        setIsListening(true)
        setVoiceStatusText(
          isKn
            ? "ಮಾತನಾಡಿ... ನಿಲ್ಲಿಸಲು ಮೈಕ್ ಮೇಲೆ ಮತ್ತೊಮ್ಮೆ ಒತ್ತಿ"
            : "Listening... Tap mic again to stop & send"
        )
      } catch (recErr: any) {
        console.warn("⚠️ Native audio recording error:", recErr)
        setIsListening(false)
        setVoiceStatusText(null)
        Alert.alert(
          isKn ? "ರೆಕಾರ್ಡಿಂಗ್ ದೋಷ" : "Recording Error",
          recErr?.message || "Failed to start microphone recording"
        )
      }
      return
    }

    // Web path: stop existing MediaRecorder
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      setIsListening(false)
      return
    }

    // Web: check MediaRecorder support, fallback to Web Speech API
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      if (typeof window !== "undefined" && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)) {
        const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRec()
        recognition.lang = isKn ? "kn-IN" : "en-IN"
        recognition.interimResults = false

        setIsListening(true)
        setVoiceStatusText(isKn ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ" : "Listening... Speak now")

        recognition.onresult = (event: any) => {
          const spoken = event.results?.[0]?.[0]?.transcript
          setIsListening(false)
          setVoiceStatusText(null)
          if (spoken) {
            handleSendText(spoken)
          }
        }

        recognition.onerror = () => {
          setIsListening(false)
          setVoiceStatusText(null)
        }

        recognition.onend = () => {
          setIsListening(false)
          setVoiceStatusText(null)
        }

        try {
          recognition.start()
        } catch {}
        return
      }

      Alert.alert(
        isKn ? "ಲಭ್ಯವಿಲ್ಲ" : "Not Supported",
        isKn ? "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ" : "Microphone not supported on this browser"
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const mediaRecorder = new (window as any).MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        if (audioBlob.size < 500) {
          setVoiceStatusText(null)
          return
        }

        await sendRecordedAudio(audioBlob, "recording.webm")
      }

      mediaRecorder.start()
      setIsListening(true)
      setVoiceStatusText(isKn ? "ಮಾತನಾಡಿ... ನಿಲ್ಲಿಸಲು ಮೈಕ್ ಮೇಲೆ ಮತ್ತೊಮ್ಮೆ ಕ್ಲಿಕ್ ಮಾಡಿ" : "Listening... Tap mic again to stop")
    } catch (micErr: any) {
      console.warn("⚠️ Microphone access error:", micErr)
      setIsListening(false)
      setVoiceStatusText(null)
      Alert.alert(
        isKn ? "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ" : "Microphone Permission",
        isKn
          ? "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ ಅನುಮತಿ ನೀಡಿ."
          : "Microphone permission denied. Please allow microphone access in your browser."
      )
    }
  }

  return (
    <DetailShell
      title={isKn ? "ಧ್ವನಿ ಕೃಷಿ ಸಹಾಯಕ" : "AI Voice Agronomist"}
      subtitle={
        isKn
          ? "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಸಲಹೆ ಪಡೆಯಿರಿ"
          : "Voice-driven agronomy tailored to your crop stage"
      }
    >
      {/* Active Crop & Growth Stage Banner */}
      <View style={styles.stageBannerCard}>
        <View style={styles.stageBannerLeft}>
          <View style={styles.sproutCircle}>
            <Sprout size={20} color="#15803d" />
          </View>
          <View style={styles.stageMeta}>
            <View style={styles.stageHeaderRow}>
              <Text style={styles.activeCropText}>{crop?.cropName || "Rice (Paddy)"}</Text>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>
                  {isKn ? `ದಿನ ${daysCount}` : `Day ${daysCount}`}
                </Text>
              </View>
            </View>
            <Text style={styles.currentStageText}>
              {isKn ? "ಪ್ರಸ್ತುತ ಹಂತ" : "Current Stage"}: {stageName}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stage Suggestions */}
      <Text style={styles.sectionTitle}>
        {isKn ? "ಈ ಹಂತದ ಮುಖ್ಯ ಪ್ರಶ್ನೆಗಳು:" : "Stage-Specific Questions:"}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsScroll}
      >
        {dynamicSuggestions.map((s, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleSendText(s)}
            activeOpacity={0.8}
            style={styles.suggestionChip}
          >
            <Sparkles size={13} color="#15803d" />
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        {chat.map((msg, idx) => {
          const isUser = msg.role === "user"
          return (
            <View
              key={idx}
              style={[
                styles.messageRow,
                isUser ? styles.userMessageRow : styles.assistantMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                {!isUser && msg.stageContext && (
                  <View style={styles.stagePill}>
                    <Sprout size={11} color="#166534" />
                    <Text style={styles.stagePillText}>{msg.stageContext}</Text>
                  </View>
                )}

                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
                  {msg.text}
                </Text>

                <View style={styles.messageFooter}>
                  <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.assistantTimeText]}>
                    {msg.timestamp}
                  </Text>
                  {!isUser && Boolean(msg.text.trim()) && (
                    <TouchableOpacity
                      onPress={() => handleSpeakToggle(idx, msg.text)}
                      accessibilityLabel={isKn ? "ಸಂದೇಶವನ್ನು ಕೇಳಿ" : "Listen to response"}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.audioIconBtn}
                    >
                      {loadingAudioIdx === idx ? (
                        <ActivityIndicator size={12} color="#15803d" />
                      ) : speakingIdx === idx ? (
                        <WaveformBars active color="#dc2626" barCount={4} maxHeight={13} />
                      ) : (
                        <Volume2 size={14} color="#15803d" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )
        })}

        {isProcessing && (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color="#15803d" />
            <Text style={styles.processingText}>
              {isKn
                ? "ಸರ್ವಮ್ AI ಮೂಲಕ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."
                : "Evaluating with Sarvam AI against current growth stage..."}
            </Text>
          </View>
        )}
      </View>

      {/* Voice Recording / Microphone Action Area */}
      <View style={styles.inputArea}>
        <View style={styles.textInputWrap}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              isKn
                ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ..."
                : "Type your farm question or observation..."
            }
            placeholderTextColor="#9ca3af"
            style={styles.textInput}
            onSubmitEditing={() => handleSendText()}
          />
          {inputText.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSendText()}
              style={styles.sendIconBtn}
            >
              <Send size={16} color="#15803d" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.micStage}>
          <PulseHalo size={54} color="#ef4444" active={isListening} delay={0} />
          <ScalePressable
            onPress={handleMicToggle}
            scaleTo={0.9}
            style={[styles.micBtn, isListening && styles.micBtnActive]}
          >
            {isListening ? (
              <WaveformBars active color="#ffffff" barCount={5} maxHeight={20} />
            ) : (
              <Mic size={24} color="#ffffff" />
            )}
          </ScalePressable>
        </View>
      </View>

      {isListening && (
        <FadeSlideIn delay={20}>
          <View style={styles.listeningNotice}>
            <WaveformBars active color="#dc2626" barCount={7} maxHeight={16} />
            <Text style={styles.listeningText}>
              {voiceStatusText || (isKn ? "ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ... (ಸರ್ವಮ್ STT ಕೇಳುತ್ತಿದೆ)" : "Listening in Kannada/English (Sarvam STT)...")}
            </Text>
          </View>
        </FadeSlideIn>
      )}

      {voiceStatusText && !isListening && (
        <View style={styles.listeningNotice}>
          <Text style={styles.listeningText}>
            ⏳ {voiceStatusText}
          </Text>
        </View>
      )}
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  stageBannerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  stageBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sproutCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  stageMeta: {
    flex: 1,
  },
  stageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeCropText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  dayBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#b45309",
  },
  currentStageText: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "600",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  suggestionsScroll: {
    gap: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  suggestionText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  chatContainer: {
    gap: 12,
    marginBottom: 20,
    minHeight: 200,
  },
  messageRow: {
    flexDirection: "row",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  assistantMessageRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 18,
    padding: 13,
  },
  userBubble: {
    backgroundColor: "#166534",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  stagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  stagePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#ffffff",
  },
  assistantMessageText: {
    color: "#1f2937",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  timeText: {
    fontSize: 10,
  },
  userTimeText: {
    color: "rgba(255,255,255,0.7)",
  },
  assistantTimeText: {
    color: "#9ca3af",
  },
  audioIconBtn: {
    padding: 2,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  processingText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  textInputWrap: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    paddingVertical: 4,
  },
  sendIconBtn: {
    padding: 4,
  },
  micStage: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#166534",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  micBtnActive: {
    backgroundColor: "#dc2626",
  },
  listeningNotice: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  listeningText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991b1b",
  },
})
