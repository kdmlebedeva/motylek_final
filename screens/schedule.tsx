import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MothHeader } from "@/components/MothHeader";
import { useApp, ClassSession } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isUpcoming(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T12:00:00");
  return d >= today;
}

function SessionCard({ session }: { session: ClassSession }) {
  const colors = useColors();
  const router = useRouter();
  const upcoming = isUpcoming(session.date);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: session.isChanged ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
          borderLeftWidth: 3,
          borderLeftColor: upcoming ? colors.primary : colors.border,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/session/[id]",
          params: { id: session.id },
        })
      }
    >
      <View style={styles.cardTop}>
        <View style={styles.cardDate}>
          <Text style={[styles.dateText, { color: colors.primary }]}>
            {formatDate(session.date)}
          </Text>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
            {session.startTime} – {session.endTime}
          </Text>
        </View>
        {session.isChanged && (
          <View style={[styles.changeBadge, { backgroundColor: colors.secondary }]}>
            <Feather name="alert-circle" size={12} color={colors.primary} />
            <Text style={[styles.changeText, { color: colors.primary }]}>Изменено</Text>
          </View>
        )}
      </View>
      <Text style={[styles.sessionTitle, { color: colors.foreground }]}>
        {session.title}
      </Text>
      <View style={styles.locationRow}>
        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
        <Text style={[styles.locationText, { color: colors.mutedForeground }]}>
          {session.location}
        </Text>
      </View>
      {session.isChanged && session.changeNote && (
        <View style={[styles.changeNote, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.changeNoteText, { color: colors.primary }]}>
            {session.changeNote}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ScheduleScreen() {
  const { sessions } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const upcoming = sessions.filter((s) => isUpcoming(s.date));
  const past = sessions.filter((s) => !isUpcoming(s.date));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MothHeader title="Расписание" subtitle="Весенний семестр 2026" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {upcoming.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              ПРЕДСТОЯЩИЕ
            </Text>
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </>
        )}
        {past.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              ПРОШЕДШИЕ
            </Text>
            {past.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 12 },
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
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardDate: { gap: 2 },
  dateText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  sessionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  changeNote: {
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  changeNoteText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
