import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MothHeader } from "@/components/MothHeader";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { DIARY_QUESTIONS } from "@/context/AppContext";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function DiaryScreen() {
  const { sessions, diaryEntries } = useApp();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const sessionsWithQuestions = sessions.filter(
    (s) => DIARY_QUESTIONS[s.id]?.length > 0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MothHeader title="Дневник" subtitle="Размышляйте после каждого занятия" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          После каждого занятия преподаватель оставляет вопросы. Это ваше пространство
          для честных размышлений.
        </Text>
        {sessionsWithQuestions.map((session) => {
          const questions = DIARY_QUESTIONS[session.id] ?? [];
          const answers = diaryEntries.filter((e) => e.sessionId === session.id);
          const answeredCount = answers.filter((e) => e.answer.trim().length > 0).length;

          return (
            <Pressable
              key={session.id}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() =>
                router.push({ pathname: "/diary/[id]", params: { id: session.id } })
              }
            >
              <View style={styles.cardTop}>
                <Text style={[styles.dateLabel, { color: colors.primary }]}>
                  {formatDate(session.date)}
                </Text>
                <View style={styles.progressBadge}>
                  <Text
                    style={[
                      styles.progressText,
                      {
                        color:
                          answeredCount === questions.length
                            ? colors.primary
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {answeredCount}/{questions.length}
                  </Text>
                </View>
              </View>
              <Text style={[styles.sessionTitle, { color: colors.foreground }]}>
                {session.title}
              </Text>
              <View style={styles.questionPreview}>
                <Feather
                  name="edit-3"
                  size={13}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.questionText, { color: colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {questions[0]}
                </Text>
              </View>
              {answeredCount === questions.length && (
                <View
                  style={[
                    styles.completedBadge,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Feather name="check-circle" size={12} color={colors.primary} />
                  <Text style={[styles.completedText, { color: colors.primary }]}>
                    Рефлексия завершена
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
  intro: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  progressBadge: {},
  progressText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sessionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  questionPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  questionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    fontStyle: "italic",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  completedText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
