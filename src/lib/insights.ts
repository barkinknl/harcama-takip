import type { InsightItem } from "@/components/dashboard/Insights";
import type {
  Category,
  MonthlySummaryData,
  TransactionWithCategory,
} from "@/types";

interface ComputeInput {
  current: MonthlySummaryData;
  currentTransactions: TransactionWithCategory[];
  previousAggregate: {
    byCategory: Map<string, number>;
    totalExpense: number;
    totalIncome: number;
  } | null;
  categories: Category[];
}

function aggregateByCategory(items: TransactionWithCategory[]) {
  const map = new Map<string, number>();
  for (const t of items) {
    if (t.type !== "expense" || !t.category_id) continue;
    map.set(t.category_id, (map.get(t.category_id) ?? 0) + Number(t.amount));
  }
  return map;
}

export function computeInsights({
  current,
  currentTransactions,
  previousAggregate,
  categories,
}: ComputeInput): InsightItem[] {
  const out: InsightItem[] = [];
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // 1) Aylık toplam harcama deltası (önceki aya göre)
  if (previousAggregate && previousAggregate.totalExpense > 0) {
    const delta =
      ((current.total_expenditure - previousAggregate.totalExpense) /
        previousAggregate.totalExpense) *
      100;

    if (Math.abs(delta) >= 5) {
      out.push({
        id: "total-expense",
        tone: delta > 0 ? "negative" : "positive",
        title:
          delta > 0
            ? `Bu ay toplam ${delta.toFixed(0)}% daha fazla harcadın`
            : `Bu ay toplam ${Math.abs(delta).toFixed(0)}% daha az harcadın`,
        body:
          delta > 0
            ? "Bütçeyi tutturmak istiyorsan kalan günleri planla."
            : "Geçen aya göre güzel bir tasarruf — devam et.",
        amount: current.total_expenditure,
        delta,
      });
    }
  }

  // 2) Kategori bazlı en büyük artış / azalış
  if (previousAggregate) {
    const currentByCat = aggregateByCategory(currentTransactions);
    let topRise: { id: string; delta: number; current: number } | null = null;
    let topDrop: { id: string; delta: number; current: number } | null = null;

    for (const [catId, currentAmt] of currentByCat) {
      const prevAmt = previousAggregate.byCategory.get(catId) ?? 0;
      if (prevAmt === 0 && currentAmt === 0) continue;
      if (prevAmt === 0) continue;
      const delta = ((currentAmt - prevAmt) / prevAmt) * 100;
      if (Math.abs(delta) < 15) continue;

      if (delta > 0 && (!topRise || delta > topRise.delta)) {
        topRise = { id: catId, delta, current: currentAmt };
      }
      if (delta < 0 && (!topDrop || delta < topDrop.delta)) {
        topDrop = { id: catId, delta, current: currentAmt };
      }
    }

    if (topRise) {
      const cat = catMap.get(topRise.id);
      if (cat) {
        out.push({
          id: `cat-rise-${topRise.id}`,
          tone: "negative",
          title: `${cat.name} kategorisinde belirgin artış`,
          body: `Geçen aya göre ${topRise.delta.toFixed(0)}% arttı. Sebebini gözden geçirmek isteyebilirsin.`,
          amount: topRise.current,
          delta: topRise.delta,
        });
      }
    }
    if (topDrop) {
      const cat = catMap.get(topDrop.id);
      if (cat) {
        out.push({
          id: `cat-drop-${topDrop.id}`,
          tone: "positive",
          title: `${cat.name} kategorisinde tasarruf`,
          body: `Geçen aya göre ${Math.abs(topDrop.delta).toFixed(0)}% düştü.`,
          amount: topDrop.current,
          delta: topDrop.delta,
        });
      }
    }
  }

  // 3) Bütçe uyarısı: aydan kaç gün geçti vs harcama oranı
  if (current.income > 0 && current.this_month_balance > 0) {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const monthProgress = dayOfMonth / daysInMonth;
    const spendRatio =
      current.total_expenditure / current.this_month_balance;

    if (spendRatio > monthProgress + 0.15 && spendRatio < 1) {
      out.push({
        id: "burn-rate",
        tone: "negative",
        title: "Bu ay normalden hızlı harcıyorsun",
        body: `Ayın %${(monthProgress * 100).toFixed(0)}'ında bütçenin %${(spendRatio * 100).toFixed(0)}'ını kullandın.`,
      });
    } else if (spendRatio < monthProgress - 0.15 && current.total_expenditure > 0) {
      out.push({
        id: "burn-rate-good",
        tone: "positive",
        title: "Bütçenin önündesin",
        body: `Ayın %${(monthProgress * 100).toFixed(0)}'ında bütçenin yalnızca %${(spendRatio * 100).toFixed(0)}'ını kullandın. Tasarruf hedefin için iyi.`,
      });
    }

    if (spendRatio >= 1) {
      out.push({
        id: "over-budget",
        tone: "negative",
        title: "Aylık bütçeyi aştın",
        body: "Bu ay gelirden fazla harcama yaptın; bir sonraki aya devir borcu olarak yansıyacak.",
      });
    }
  }

  // En fazla 4 tane göster
  return out.slice(0, 4);
}
