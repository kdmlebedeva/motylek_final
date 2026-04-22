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
import * as Haptics from "expo-haptics";
import { MothHeader } from "@/components/MothHeader";
import { useApp, HomeworkAssignment } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatDue(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  if (diff > 0) {
    const lastDigit = diff % 10;
    const lastTwo = diff % 100;
    let suffix = "дней";
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) suffix = "день";
      else if (lastDigit >= 2 && lastDigit <= 4) suffix = "дня";
    }
    return `Через ${diff} ${suffix}`;
  }
  return "Просрочено";
}

function isOverdue(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function HomeworkCard({
  hw,
  onToggle,
}: {
  hw: HomeworkAssignment;
  onToggle: (id: string) => void;
}) {
  const colors = useColors();
  const router = useRouter();
  const overdue = isOverdue(hw.dueDate) && !hw.isCompleted;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: hw.isCompleted
            ? colors.muted
            : colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => {
        router.push({ pathname: "/homework/[id]", params: { id: hw.id } });
      }}
    >
      <View style={styles.cardRow}>
        <Pressable
          style={[
            styles.checkbox,
            {
              borderColor: hw.isCompleted ? colors.primary : colors.border,
              backgroundColor: hw.isCompleted ? colors.primary : "transparent",
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(hw.id);
          }}
          hitSlop={12}
        >
          {hw.isCompleted && (
            <Feather name="check" size={13} color={colors.primaryForeground} />
          )}
        </Pressable>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            {!hw.isRead && !hw.isCompleted && (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            )}
            <Text
              style={[
                styles.cardTitle,
                {
                  color: hw.isCompleted
                    ? colors.mutedForeground
                    : colors.foreground,
                  textDecorationLine: hw.isCompleted ? "line-through" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {hw.title}
            </Text>
          </View>
          <View style={styles.dueRow}>
            <Feather
              name="clock"
              size={12}
              color={overdue ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={[
                styles.dueText,
                { color: overdue ? colors.destructive : colors.mutedForeground },
              ]}
            >
              {formatDue(hw.dueDate)}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.border} />
      </View>
    </Pressable>
  );
}

export default function HomeworkScreen() {
  const { homework, markHomeworkCompleted } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const pending = homework.filter((h) => !h.isCompleted);
  const completed = homework.filter((h) => h.isCompleted);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MothHeader
        title="Домашние задания"
        subtitle={(() => {
          const n = pending.length;
          const lastDigit = n % 10;
          const lastTwo = n % 100;
          let word = "заданий";
          if (lastTwo < 11 || lastTwo > 14) {
            if (lastDigit === 1) word = "задание";
            else if (lastDigit >= 2 && lastDigit <= 4) word = "задания";
          }
          return `Осталось ${n} ${word}`;
        })()}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {pending.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={40} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Всё сделано
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Невыполненных заданий нет. Наслаждайтесь моментом.
            </Text>
          </View>
        )}
        {pending.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              К ВЫПОЛНЕНИЮ
            </Text>
            {pending.map((h) => (
              <HomeworkCard key={h.id} hw={h} onToggle={markHomeworkCompleted} />
            ))}
          </>
        )}
        {completed.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              ВЫПОЛНЕНО
            </Text>
            {completed.map((h) => (
              <HomeworkCard key={h.id} hw={h} onToggle={markHomeworkCompleted} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dueText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  emptyBody: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
