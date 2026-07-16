/** Illustrated kitchen background. Interactive hotspots are overlaid separately in kitchenScreen.ts. */
export function composeKitchenBackground(): string {
  return `<img src="${import.meta.env.BASE_URL}kitchen/kitchen-background.jpeg" alt="Doc's kitchen" class="kitchen-background-img" />`;
}

/** Illustrated Doc's Workshop background, shown behind the first-trip briefing overlay. */
export function composeWorkshopBackground(): string {
  return `<img src="${import.meta.env.BASE_URL}workshop/lab-background.jpeg" alt="Doc's workshop" class="workshop-background-img" />`;
}

/** Illustrated outcome scene (transparent background), shown over the kitchen a beat after the
 * post-flight fog settles. */
export function composeOutcomeImage(success: boolean): string {
  const file = success ? "outcome-success.png" : "outcome-failure.png";
  const alt = success ? "Meow-gor happily eating, Doc Frankie celebrating" : "Meow-gor and Doc Frankie disappointed by an empty bowl";
  return `<img src="${import.meta.env.BASE_URL}outcome/${file}" alt="${alt}" class="outcome-img" />`;
}
