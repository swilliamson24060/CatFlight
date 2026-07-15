/** Illustrated kitchen background. Interactive hotspots are overlaid separately in kitchenScreen.ts. */
export function composeKitchenBackground(): string {
  return `<img src="${import.meta.env.BASE_URL}kitchen/kitchen-background.jpeg" alt="Doc's kitchen" class="kitchen-background-img" />`;
}

/** Illustrated Doc's Workshop background, shown behind the first-trip briefing overlay. */
export function composeWorkshopBackground(): string {
  return `<img src="${import.meta.env.BASE_URL}workshop/lab-background.jpeg" alt="Doc's workshop" class="workshop-background-img" />`;
}
