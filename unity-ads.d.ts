declare module "expo-unity-ads" {
  export function initialize(gameId: string, testMode: boolean): Promise<void>;
  export function load(placementId: string): Promise<void>;
  export function show(placementId: string): Promise<void>;
  export function setRewardListener(
    callback: (placementId: string, reward: { amount: number }) => void,
  ): void;
}
