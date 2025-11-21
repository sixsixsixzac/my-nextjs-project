// Type constants
export const TYPE_MANGA = "manga";
export const TYPE_NOVEL = "novel";

// Type labels
export const TYPE_LABELS: Record<string, string> = {
  [TYPE_MANGA]: "มังงะ",
  [TYPE_NOVEL]: "นิยาย",
};

// Origin type constants
export const ORIGIN_TYPE_THAI = 1;
export const ORIGIN_TYPE_JAPANESE = 2;
export const ORIGIN_TYPE_KOREAN = 3;
export const ORIGIN_TYPE_CHINESE = 4;

// Origin type labels
export const ORIGIN_TYPE_LABELS: Record<number, string> = {
  [ORIGIN_TYPE_THAI]: "ไทย",
  [ORIGIN_TYPE_JAPANESE]: "ญี่ปุ่น",
  [ORIGIN_TYPE_KOREAN]: "เกาหลี",
  [ORIGIN_TYPE_CHINESE]: "จีน",
};

// Age rate constants
export const AGE_RATE_ALL = "all";
export const AGE_RATE_13_PLUS = "13+";
export const AGE_RATE_16_PLUS = "16+";
export const AGE_RATE_18_PLUS = "18+";

// Age rate labels
export const AGE_RATE_LABELS: Record<string, string> = {
  [AGE_RATE_ALL]: "ทุกวัย",
  [AGE_RATE_13_PLUS]: "13+",
  [AGE_RATE_16_PLUS]: "16+",
  [AGE_RATE_18_PLUS]: "18+",
};

