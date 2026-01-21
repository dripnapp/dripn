declare const UnityAdsBridge: {
  initialize(gameId: string, testMode: boolean): void;
  loadRewarded(placementId: string): Promise<void>;
  showRewarded(placementId: string): Promise<void>;

  addListener(
    eventName: string,
    listener: (event: any) => void,
  ): { remove: () => void };
};
