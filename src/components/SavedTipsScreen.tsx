import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useLang } from "../i18n"
import { useSavedTips } from "../storage/savedTips"
import DetailShell from "./DetailShell"
import { Bookmark, Leaf, Droplets, Sun, Bug, Plus, X, Check } from "lucide-react-native"

export default function SavedTipsScreen() {
  const { t, lang } = useLang()
  const { tips, removeTip, addCustomTip } = useSavedTips()
  const isKn = lang === "kn"

  const [modalOpen, setModalOpen] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteBody, setNoteBody] = useState("")

  function handleSaveNote() {
    if (!noteTitle.trim() || !noteBody.trim()) {
      Alert.alert(
        isKn ? "ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ" : "Missing Details",
        isKn ? "ಶೀರ್ಷಿಕೆ ಮತ್ತು ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ." : "Please enter both title and note details."
      )
      return
    }
    addCustomTip({ title: noteTitle, body: noteBody })
    setNoteTitle("")
    setNoteBody("")
    setModalOpen(false)
  }

  return (
    <DetailShell
      title={t.profile?.rows?.saved || (isKn ? "ಉಳಿಸಿದ ಸಲಹೆಗಳು" : "Saved Tips")}
      subtitle={
        isKn
          ? "ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿಗಳು"
          : "Your bookmarked farming guides & scan remedies"
      }
      action={
        <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.addBtn}>
          <Plus size={14} color="#ffffff" />
          <Text style={styles.addBtnText}>{isKn ? "ಟಿಪ್ಪಣಿ" : "Add"}</Text>
        </TouchableOpacity>
      }
    >
      {tips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Bookmark size={36} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {isKn ? "ಯಾವುದೇ ಸಲಹೆಗಳನ್ನು ಉಳಿಸಿಲ್ಲ" : "No saved tips yet"}
          </Text>
          <Text style={styles.emptySub}>
            {isKn
              ? "ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶದ ಮೇಲಿನ ಬುಕ್‌ಮಾರ್ಕ್ ಒತ್ತಿ ಇಲ್ಲಿ ಉಳಿಸಿ ಅಥವಾ ಹೊಸ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ."
              : "Tap the bookmark icon on any Crop Scan report or add your own farm note above."}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {tips.map((tip) => {
            const cat = (isKn ? tip.categoryKn : tip.categoryEn).toLowerCase()
            const Icon = cat.includes("irrigat") || cat.includes("ನೀರಾವರಿ")
              ? Droplets
              : cat.includes("pest") || cat.includes("ರೋಗ") || cat.includes("ಕೀಟ")
              ? Bug
              : cat.includes("sun")
              ? Sun
              : Leaf
            const bg = tip.isUserSaved
              ? "#dcfce7"
              : cat.includes("irrigat") || cat.includes("ನೀರಾವರಿ")
              ? "#dbeafe"
              : "#fef3c7"
            const color = tip.isUserSaved ? "#15803d" : "#256428"

            return (
              <View key={tip.id} style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                  <Icon size={20} color={color} />
                </View>
                <View style={styles.contentWrap}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>
                      {isKn ? tip.titleKn : tip.titleEn}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeTip(tip.id)}
                      style={styles.bookmarkBtn}
                    >
                      <Bookmark size={16} color="#256428" fill="#256428" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.categoryPill}>
                    {isKn ? tip.categoryKn : tip.categoryEn}
                  </Text>
                  <Text style={styles.body}>
                    {isKn ? tip.bodyKn : tip.bodyEn}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Custom Note Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isKn ? "ಹೊಸ ಕೃಷಿ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ" : "Add Farm Note / Tip"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalOpen(false)}>
                    <X size={20} color="#4b5563" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  placeholder={isKn ? "ಶೀರ್ಷಿಕೆ (ಉದಾ: ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ)" : "Title (e.g. Urea Schedule)"}
                  style={styles.modalInput}
                />
                <TextInput
                  value={noteBody}
                  onChangeText={setNoteBody}
                  placeholder={isKn ? "ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ..." : "Write details or dosage reminder..."}
                  multiline
                  numberOfLines={4}
                  style={[styles.modalInput, { minHeight: 92, textAlignVertical: "top" }]}
                />

                <TouchableOpacity onPress={handleSaveNote} style={styles.modalSaveBtn}>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.modalSaveText}>
                    {isKn ? "ಉಳಿಸಿ" : "Save Tip"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 19,
  },
  list: {
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  bookmarkBtn: {
    padding: 4,
  },
  categoryPill: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
    marginTop: 2,
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  modalSaveBtn: {
    backgroundColor: "#256428",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
