import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MothHeader } from "@/components/MothHeader";
import { useApp, ChatMessage } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return "Сегодня";
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "short" });
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

const AVATAR_COLORS = [
  "#c9820a", "#7c5c2a", "#5c7c2a", "#2a5c7c", "#7c2a5c", "#5c2a7c",
];
function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const colors = useColors();

  if (msg.isOwn) {
    return (
      <View style={styles.ownRow}>
        <View>
          <View
            style={[styles.bubble, styles.ownBubble, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.bubbleText, { color: colors.primaryForeground }]}>
              {msg.text}
            </Text>
          </View>
          <Text style={[styles.timeText, styles.ownTime, { color: colors.mutedForeground }]}>
            {formatTime(msg.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.otherRow}>
      <Avatar initials={msg.senderInitials} color={getColor(msg.senderName)} />
      <View style={styles.otherContent}>
        <Text style={[styles.senderName, { color: colors.primary }]}>
          {msg.senderName}
        </Text>
        <View
          style={[styles.bubble, styles.otherBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.bubbleText, { color: colors.foreground }]}>
            {msg.text}
          </Text>
        </View>
        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
          {formatTime(msg.timestamp)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { chatMessages, sendChatMessage } = useApp();
  const colors = useColors();
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const handleSend = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendChatMessage(text.trim());
    setText("");
  };

  const inverted = [...chatMessages].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MothHeader title="Общий чат" subtitle="Ансамбль Moth" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={inverted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: bottomPad + 6,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            value={text}
            onChangeText={setText}
            placeholder="Написать ансамблю..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: text.trim() ? colors.primary : colors.muted,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Feather
              name="send"
              size={18}
              color={text.trim() ? colors.primaryForeground : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  ownRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  otherRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  otherContent: { gap: 3, flex: 1 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  senderName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 2,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  timeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  ownTime: {
    textAlign: "right",
    marginTop: 3,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
