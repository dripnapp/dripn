export const ADGEM_CONFIG = {
  appId: '31880',
  postbackKey: 'd1mlf8521na3g25819hm6a3k',
  wallUrl: 'https://api.adgem.com/v1/wall',
};

export const getAdGemWallUrl = () => {
  return `${ADGEM_CONFIG.wallUrl}?appid=${ADGEM_CONFIG.appId}`;
};
