import { Feather } from "@expo/vector-icons";
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
import { useApp, NewsItem } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatRelativeTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Сегодня";
  if (days === 1) return "Вчера";
  if (days < 7) {
    const lastDigit = days % 10;
    const lastTwo = days % 100;
    let word = "дней";
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) word = "день";
      else if (lastDigit >= 2 && lastDigit <= 4) word = "дня";
    }
    return `${days} ${word} назад`;
  }
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

const TYPE_CONFIG = {
  change: { icon: "alert-circle" as const, label: "Изменение расписания" },
  announcement: { icon: "star" as const, label: "Объявление" },
  news: { icon: "bell" as const, label: "Новости" },
};

function NewsCard({
  item,
  onRead,
}: {
  item: NewsItem;
  onRead: (id: string) => void;
}) {
  const colors = useColors();
  const config = TYPE_CONFIG[item.type];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: item.isRead ? colors.card : colors.background,
          borderColor: item.isRead ? colors.border : colors.primary,
          borderLeftWidth: 3,
          borderLeftColor: item.isRead ? colors.border : colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => {
        if (!item.isRead) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onRead(item.id);
        }
      }}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.typePill,
            { backgroundColor: item.isRead ? colors.muted : colors.secondary },
          ]}
        >
          <Feather
            name={config.icon}
            size={12}
            color={item.isRead ? colors.mutedForeground : colors.primary}
          />
          <Text
            style={[
              styles.typeLabel,
              {
                color: item.isRead ? colors.mutedForeground : colors.primary,
              },
            ]}
          >
            {config.label}
          </Text>
        </View>
        <View style={styles.rightTop}>
          {!item.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
      </View>
      <Text style={[styles.newsTitle, { color: colors.foreground }]}>
        {item.title}
      </Text>
      <Text
        style={[styles.newsBody, { color: colors.mutedForeground }]}
        numberOfLines={3}
      >
        {item.body}
      </Text>
      {!item.isRead && (
        <Text style={[styles.tapHint, { color: colors.primary }]}>
          Нажмите, чтобы отметить как прочитанное
        </Text>
      )}
    </Pressable>
  );
}

export default function NewsScreen() {
  const { news, markNewsRead } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  const unread = news.filter((n) => !n.isRead);
  const read = news.filter((n) => n.isRead);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MothHeader
        title="Новости"
        subtitle={(() => {
          const n = unread.length;
          if (n === 0) return "Всё прочитано";
          const lastDigit = n % 10;
          const lastTwo = n % 100;
          let word = "новых обновлений";
          if (lastTwo < 11 || lastTwo > 14) {
            if (lastDigit === 1) word = "новое обновление";
            else if (lastDigit >= 2 && lastDigit <= 4) word = "новых обновления";
          }
          return `${n} ${word}`;
        })()}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {unread.length === 0 && read.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Пока новостей нет
            </Text>
          </View>
        )}
        {unread.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              НОВОЕ
            </Text>
            {unread.map((n) => (
              <NewsCard key={n.id} item={n} onRead={markNewsRead} />
            ))}
          </>
        )}
        {read.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              РАНЕЕ
            </Text>
            {read.map((n) => (
              <NewsCard key={n.id} item={n} onRead={markNewsRead} />
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
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  rightTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  newsTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  newsBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  tapHint: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
});
