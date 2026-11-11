import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { useProfile } from "../profile"
import { useNav } from "../nav"
import DetailShell from "./DetailShell"
import { Check } from "lucide-react-native"

export default function EditProfileScreen() {
  const { profile, updateProfile } = useProfile()
  const { back } = useNav()

  const [name, setName] = useState(profile.name)
  const [mobile, setMobile] = useState(profile.mobile)
  const [email, setEmail] = useState(profile.email)
  const [district, setDistrict] = useState(profile.district)
  const [farmSize, setFarmSize] = useState(profile.farmSize)

  function handleSave() {
    updateProfile({
      name,
      mobile,
      email,
      district,
      farmSize,
    })
    back()
  }

  return (
    <DetailShell
      title="Edit Profile"
      subtitle="Update your farm and contact information"
      footer={
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={styles.saveBtn}
          >
            <Check size={18} color="#ffffff" />
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Farmer Name"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="10-digit mobile number"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            placeholder="email@example.com"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>District</Text>
          <TextInput
            value={district}
            onChangeText={setDistrict}
            style={styles.input}
            placeholder="District (e.g. Mandya)"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Farm Size (Acres)</Text>
          <TextInput
            value={farmSize}
            onChangeText={setFarmSize}
            style={styles.input}
            keyboardType="numeric"
            placeholder="4.2"
          />
        </View>
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  saveBtn: {
    backgroundColor: "#256428",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
})

