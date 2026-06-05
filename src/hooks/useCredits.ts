export function useCredits(credits: number = 0) {
  const isOutOfCredits = credits <= 0;
  const isLowBalance = credits > 0 && credits < 10;
  return {
    credits,
    isLowBalance,
    isOutOfCredits,
    remainingText: `⚡ ${credits} crédits restants`,
  };
}
