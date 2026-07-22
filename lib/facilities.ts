import type { Icon } from '@phosphor-icons/react';
// SSR 版アイコン（サーバー・クライアント両方で描画可能な静的SVG）
import {
  Cigarette,
  Toilet,
  Drop,
  Plug,
  WifiHigh,
  Laptop,
  Car,
} from '@phosphor-icons/react/dist/ssr';

export type Facility = {
  key: string;
  label: string;
  icon: Icon;
};

// 投稿の「設備」カテゴリ一覧。key を DB(posts.facilities text[]) に保存する
export const FACILITIES: Facility[] = [
  { key: 'smoking', label: '喫煙所', icon: Cigarette },
  { key: 'toilet', label: 'トイレ', icon: Toilet },
  { key: 'water', label: '給水', icon: Drop },
  { key: 'outlet', label: 'コンセント', icon: Plug },
  { key: 'wifi', label: 'Wi-Fi', icon: WifiHigh },
  { key: 'work', label: '作業可能', icon: Laptop },
  { key: 'parking', label: '駐車場', icon: Car },
];

// key から Facility を引くためのマップ
export const FACILITY_MAP: Record<string, Facility> = Object.fromEntries(
  FACILITIES.map((f) => [f.key, f]),
);
