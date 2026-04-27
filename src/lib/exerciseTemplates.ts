// 一般的なトレーニングメニューのテンプレート (中級者向け目安値)

export type BodyPart = '下半身' | '胸' | '肩' | '腕' | '背中';

export const BODY_PARTS: BodyPart[] = ['下半身', '胸', '肩', '腕', '背中'];

export interface ExerciseTemplate {
  name: string;
  baseWeight: number; // kg
  sets: number;
  reps: number;
}

export const EXERCISE_TEMPLATES: Record<BodyPart, ExerciseTemplate[]> = {
  下半身: [
    { name: 'スクワット', baseWeight: 80, sets: 5, reps: 5 },
    { name: 'ルーマニアンデッドリフト', baseWeight: 70, sets: 4, reps: 8 },
    { name: 'レッグプレス', baseWeight: 120, sets: 3, reps: 10 },
    { name: 'レッグエクステンション', baseWeight: 40, sets: 3, reps: 12 },
    { name: 'レッグカール', baseWeight: 40, sets: 3, reps: 12 },
    { name: 'ブルガリアンスクワット', baseWeight: 20, sets: 3, reps: 10 },
    { name: 'ヒップスラスト', baseWeight: 60, sets: 3, reps: 10 },
    { name: 'カーフレイズ', baseWeight: 40, sets: 4, reps: 15 },
  ],
  胸: [
    { name: 'ベンチプレス', baseWeight: 60, sets: 5, reps: 5 },
    { name: 'インクラインベンチプレス', baseWeight: 50, sets: 4, reps: 8 },
    { name: 'ダンベルベンチプレス', baseWeight: 20, sets: 4, reps: 8 },
    { name: 'ダンベルフライ', baseWeight: 10, sets: 3, reps: 12 },
    { name: 'ディップス', baseWeight: 0, sets: 3, reps: 10 },
    { name: 'チェストプレス (マシン)', baseWeight: 50, sets: 3, reps: 10 },
    { name: 'ケーブルクロスオーバー', baseWeight: 15, sets: 3, reps: 12 },
    { name: 'プッシュアップ', baseWeight: 0, sets: 3, reps: 15 },
  ],
  肩: [
    { name: 'ショルダープレス', baseWeight: 40, sets: 4, reps: 8 },
    { name: 'ダンベルショルダープレス', baseWeight: 14, sets: 4, reps: 10 },
    { name: 'アーノルドプレス', baseWeight: 12, sets: 3, reps: 10 },
    { name: 'サイドレイズ', baseWeight: 8, sets: 3, reps: 12 },
    { name: 'フロントレイズ', baseWeight: 8, sets: 3, reps: 12 },
    { name: 'リアレイズ', baseWeight: 6, sets: 3, reps: 12 },
    { name: 'アップライトロウ', baseWeight: 30, sets: 3, reps: 10 },
    { name: 'シュラッグ', baseWeight: 40, sets: 3, reps: 12 },
    { name: 'フェイスプル', baseWeight: 20, sets: 3, reps: 15 },
  ],
  腕: [
    { name: 'バーベルカール', baseWeight: 30, sets: 3, reps: 10 },
    { name: 'ダンベルカール', baseWeight: 10, sets: 3, reps: 10 },
    { name: 'ハンマーカール', baseWeight: 10, sets: 3, reps: 10 },
    { name: 'プリーチャーカール', baseWeight: 20, sets: 3, reps: 10 },
    { name: 'インクラインダンベルカール', baseWeight: 8, sets: 3, reps: 10 },
    { name: 'トライセプスプレスダウン', baseWeight: 25, sets: 3, reps: 12 },
    { name: 'オーバーヘッドエクステンション', baseWeight: 15, sets: 3, reps: 10 },
    { name: 'フレンチプレス', baseWeight: 20, sets: 3, reps: 10 },
    { name: 'ナローベンチプレス', baseWeight: 40, sets: 3, reps: 8 },
    { name: 'リストカール', baseWeight: 10, sets: 3, reps: 15 },
  ],
  背中: [
    { name: 'デッドリフト', baseWeight: 100, sets: 3, reps: 5 },
    { name: '懸垂 (チンニング)', baseWeight: 0, sets: 3, reps: 8 },
    { name: 'ラットプルダウン', baseWeight: 50, sets: 3, reps: 10 },
    { name: 'ベントオーバーロウ', baseWeight: 60, sets: 4, reps: 8 },
    { name: 'ダンベルロウ (ワンハンド)', baseWeight: 20, sets: 3, reps: 10 },
    { name: 'シーテッドロウ', baseWeight: 50, sets: 3, reps: 10 },
    { name: 'Tバーロウ', baseWeight: 40, sets: 3, reps: 10 },
    { name: 'バックエクステンション', baseWeight: 0, sets: 3, reps: 15 },
  ],
};
