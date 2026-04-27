import { type ReactNode, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Dumbbell,
  Home as HomeIcon,
  LineChart,
  Settings as SettingsIcon,
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function GuidePage({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* ヘッダ */}
        <header
          className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-3 h-14 flex items-center gap-2"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-neutral-800"
            aria-label="閉じる"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold">使い方ガイド</h1>
        </header>

        <main className="flex-1 px-4 py-5 space-y-6">
          {/* 1. macho up とは */}
          <Section title="macho up とは">
            <p>
              <strong className="text-amber-300">macho up</strong>{' '}
              はトレーニングメニューを作成・管理するためのスマホ向けアプリです。
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-300">
              <li>最大6つのメニュー（ルーティン）を登録</li>
              <li>ローテーションで自動スケジュール作成</li>
              <li>セット毎の重量・レップを記録</li>
              <li>履歴をグラフ化（最大3種目を比較）</li>
              <li>クラウド保存で複数デバイス同期</li>
              <li>
                <span className="text-neutral-400">
                  （任意）ピリオダイゼーション機能で重量を自動変動
                </span>
              </li>
            </ul>
          </Section>

          {/* 2. クイックスタート */}
          <Section title="クイックスタート (3ステップ)">
            <Step n={1} label="アカウント作成">
              認証画面の「新規登録」タブでメアドとパスワード(6文字以上)を入力 →
              「アカウントを作成」。即座にアプリが使えるようになります。
            </Step>
            <Step n={2} label="プランを作る">
              <strong>プラン</strong>{' '}
              タブを開き、「⚡ おすすめプランで始める」を押すと
              Push/Pull/Legs の3メニュー構成が即座に作成されます。
              自分で1から作ることも可能。
            </Step>
            <Step n={3} label="記録する">
              <strong>ホーム</strong>{' '}
              で今日のメニューを確認 → 「記録する」 →{' '}
              <strong>ログ</strong>タブでセットごとの重量・レップを入力 → 保存。
            </Step>
          </Section>

          {/* 3. 画面ごとの使い方 */}
          <Section title="画面ごとの使い方">
            <Accordion icon={<HomeIcon size={16} />} title="ホーム">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>今日のメニュー</strong> — 種目ごとの重量・セット数を表示
                </li>
                <li>
                  <strong>今週のスケジュール</strong>{' '}
                  — 7日間の予定。日付タップで詳細モーダルが開きます
                </li>
                <li>
                  <strong>直近履歴</strong> — 最新3件のログ
                </li>
                <li>
                  <strong>リスケ</strong>{' '}
                  ボタン — 今日できなかった時に「全体ずらす」or「その日のみ」を選択
                </li>
                <li className="text-neutral-400">
                  ※ ピリオダイゼーションを使う場合のみ「現在のサイクル」カードが上部に表示されます
                </li>
              </ul>
            </Accordion>

            <Accordion icon={<Dumbbell size={16} />} title="プラン">
              <ul className="list-disc list-inside space-y-1">
                <li>最大 6 つのトレーニングメニュー (ルーティン) を登録可能</li>
                <li>
                  各メニューに <strong>チェックボックス</strong>{' '}
                  — チェック ON で予定に反映
                </li>
                <li>
                  各メニューを開くと <strong>種目編集</strong>:
                  <br />
                  種目名 / 基準KG / セット数 / レップ数
                </li>
                <li>
                  「テンプレート / 既存種目から追加」 — 部位別 (下半身・胸・肩・腕・背中)
                  の代表種目から選択可
                </li>
                <li>
                  上部「ローテーション & オフ日数」で各メニュー後の休養日を設定
                </li>
                <li className="text-neutral-400">
                  ※ ピリオダイゼーション・変動セットは応用機能(後述)。OFFのままで普通に使えます
                </li>
              </ul>
            </Accordion>

            <Accordion icon={<CalendarDays size={16} />} title="予定">
              <ul className="list-disc list-inside space-y-1">
                <li>月単位のカレンダー (グリッド表示) + リスト表示</li>
                <li>カラードットでメニューが識別できる (最大6色)</li>
                <li>完了済みの日は緑のマーカー</li>
                <li>過去の未消化日は赤で「未消化」表示</li>
                <li>左右のボタンで前月/翌月に移動</li>
              </ul>
            </Accordion>

            <Accordion icon={<ClipboardList size={16} />} title="ログ">
              <ul className="list-disc list-inside space-y-1">
                <li>今日のルーティンの種目が自動表示</li>
                <li>
                  各セットの <strong>重量 (kg)</strong> と{' '}
                  <strong>レップ数</strong> を [-] [+] ボタンで微調整
                </li>
                <li>
                  各セット右の <strong>チェックボタン</strong>{' '}
                  で完了マーク (緑)
                </li>
                <li>メモ欄に体調・気付きを残せる</li>
                <li>
                  「保存」を押すとログ確定。ホームの直近履歴・グラフに反映
                </li>
              </ul>
            </Accordion>

            <Accordion icon={<LineChart size={16} />} title="グラフ">
              <ul className="list-disc list-inside space-y-1">
                <li>履歴のある種目が自動でリストされる</li>
                <li>
                  <strong>最大 3 種目を選択</strong>{' '}
                  して重ね描画 (色分け凡例付き)
                </li>
                <li>選択しないと「全種目合算ボリューム」が表示</li>
                <li>選択は端末に保存され、次回も同じ種目が表示される</li>
              </ul>
            </Accordion>

            <Accordion icon={<SettingsIcon size={16} />} title="設定">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>テーマ</strong> — ダーク / ライトを切替
                </li>
                <li>
                  <strong>ステータス</strong> — 総ログ数・総セット数・総重量
                  (自由の女神 / モアイ象 / スクールバス /
                  グランドピアノ / ダイオウイカ / パンダ 換算)
                </li>
                <li>
                  <strong>CSV エクスポート</strong> — 全ログをExcel互換で出力
                </li>
                <li>
                  <strong>全データ初期化</strong> — 種目・ルーティン・ログを全削除
                  (取り消し不可)
                </li>
                <li>
                  <strong>ログアウト</strong> — アカウントから出る。再ログインでデータ復元
                </li>
              </ul>
            </Accordion>
          </Section>

          {/* 4. Tips (普段使いの基本ノウハウ) */}
          <Section title="Tips（普段使い）">
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>
                <strong>基準KGは「無理なくこなせる重量」を入れる</strong>
              </li>
              <li>
                <strong>記録できなかった日は素直にリスケ</strong>{' '}
                — 完璧主義で挫折するより柔軟に
              </li>
              <li>
                <strong>グラフで停滞を見つけたら基準KGを再調整</strong>
              </li>
              <li>
                <strong>CSV エクスポート</strong>{' '}
                を月1で保存しておくと、もし問題があっても安心
              </li>
              <li>
                <strong>ホーム画面に追加</strong>すると
                ネイティブアプリ風に起動できます (PWA)
              </li>
            </ul>
          </Section>

          {/* 5. 応用機能 (任意) */}
          <Section title="応用機能（使わなくてOK）">
            <p className="text-xs text-neutral-400 leading-relaxed">
              以下は <strong>知らなくても普通に使える</strong>{' '}
              応用機能です。慣れてきて「重量を計画的に上げ下げしたい」と思ったら覗いてみてください。
              特に興味なければ <strong>OFF のまま無視で OK</strong>。
            </p>

            <Accordion title="📈 ピリオダイゼーション (任意)">
              <p>
                <strong>ピリオダイゼーション</strong>{' '}
                とは、計画的にトレーニング負荷を変動させて
                効率良く筋力を伸ばす手法のこと。本アプリでは{' '}
                <strong>4 段階を 1 ループ</strong> で繰り返します:
              </p>
              <table className="w-full text-xs font-mono mt-2 border-collapse">
                <thead>
                  <tr className="text-neutral-400">
                    <th className="text-left py-1">サイクル</th>
                    <th className="text-left py-1">係数</th>
                    <th className="text-left py-1">狙い</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-200">
                  <tr className="border-t border-neutral-800">
                    <td className="py-1">Cycle 1</td>
                    <td>75%</td>
                    <td>ボリューム重視</td>
                  </tr>
                  <tr className="border-t border-neutral-800">
                    <td className="py-1">Cycle 2</td>
                    <td>80%</td>
                    <td>強度上昇</td>
                  </tr>
                  <tr className="border-t border-neutral-800">
                    <td className="py-1">Cycle 3</td>
                    <td>85%</td>
                    <td>最大強度</td>
                  </tr>
                  <tr className="border-t border-neutral-800">
                    <td className="py-1">Cycle 4</td>
                    <td>50%</td>
                    <td>Deload (回復)</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-neutral-300">
                <strong>使い方</strong>: 各種目編集画面の「ピリオダイゼーション」スイッチを ON にすると、
                その種目だけサイクル係数が適用されます。
                サイクル進行はホームの「次へ」ボタンを押すと進みます。
              </p>
              <p className="mt-1 text-neutral-400">
                ※ ⚠️ ルーティン内に1つでも ON があると、4サイクル目だけは
                OFF の種目も含めて全種目 50% に統一されます (Deload を確実にするため)。
              </p>
              <p className="mt-2 text-neutral-300">
                <strong>知らない人へ向けて</strong>:
                上記の話が「???」なら使わなくて大丈夫です。
                スイッチを OFF のままなら、入力した重量がそのまま表示されるだけのシンプル動作になります。
              </p>
            </Accordion>

            <Accordion title="🔀 変動セット (任意)">
              <p>1セッション内でセットごとに重量を変えるパターン:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  <strong>ストレート</strong>: 全セット同じ重量 (基本・デフォルト)
                </li>
                <li>
                  <strong>アセンディング</strong>:
                  前セットから「増減%」分上げる (例 5% なら 80→84→88...)
                </li>
                <li>
                  <strong>ドロップ</strong>:
                  前セットから「増減%」分下げる (例 10% なら 80→72→64...)
                </li>
              </ul>
              <p className="mt-2 text-neutral-300">
                ストレートのままで普通に使えるので、こだわりが無い人は触らなくて OK。
              </p>
            </Accordion>

            <Accordion title="🔄 リスケの 2 種類">
              <p>
                今日できなかった時に、ホームの「リスケ」ボタンから 2 種類選べる:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  <strong>① 全体をずらす</strong>:
                  以降の予定を 1 日後ろにスライド。オフ日構成は維持
                </li>
                <li>
                  <strong>② その日のみずらす</strong>:
                  今日の予定だけを次の最寄りオフ日に移動。他の予定はそのまま
                </li>
              </ul>
            </Accordion>
          </Section>

          {/* 6. FAQ */}
          <Section title="よくある質問">
            <Accordion title="ピリオダイゼーションって何ですか？必須？">
              <p>
                計画的に重量を上げ下げする筋トレの手法です。
                <strong>使わなくて全く問題ありません</strong>。
                デフォルトで OFF になっているので、意識せずシンプルに使えます。
              </p>
              <p className="mt-1 text-neutral-400">
                興味があれば「応用機能」セクションを参照。
              </p>
            </Accordion>

            <Accordion title="他人にデータを見られませんか？">
              見られません。Supabase の Row Level Security
              により「自分のメアドでログインしている時だけ自分のデータが見える」設計です。
              管理者(運営)もパスワードは見えません(ハッシュ化済)。
            </Accordion>

            <Accordion title="パスワードを忘れたら？">
              現在パスワードリセット機能は未実装です。困ったら運営にご連絡ください。
              将来のアップデートで対応予定。
            </Accordion>

            <Accordion title="複数のデバイスで使えますか？">
              はい。同じメアドでログインすれば PC・スマホ・タブレットどこでも
              同じデータが見えます。リアルタイム同期ではないので、
              切り替え時にリロードを推奨。
            </Accordion>

            <Accordion title="データは消えませんか？">
              Supabase のクラウドDB に保存されています。バックアップとして
              <strong>設定 → CSV エクスポート</strong>{' '}
              を定期的に実行することをおすすめします。
            </Accordion>

            <Accordion title="無料ですか？">
              はい、完全無料で使えます。
              データ容量や同時アクセス数の上限は実用上問題ありません(数千人の同時利用が可能)。
            </Accordion>

            <Accordion title="ホーム画面に追加できますか？">
              スマホブラウザの共有メニューから「ホーム画面に追加」を選べます。
              ネイティブアプリ風に起動できます (PWA)。
            </Accordion>
          </Section>

          {/* フッター */}
          <section className="text-[10px] text-neutral-500 text-center pb-8">
            macho up · v0.2.0
            <br />
            Made for those who train logically.
          </section>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// 内部部品
// ============================================================

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-amber-300 border-b border-neutral-800 pb-1">
        {title}
      </h2>
      <div className="text-sm text-neutral-200 space-y-2 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Step({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm flex items-center justify-center">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function Accordion({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-amber-400">{icon}</span>}
          <span className="font-semibold text-sm truncate">{title}</span>
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-3 pb-3 text-xs text-neutral-200 leading-relaxed border-t border-neutral-800 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
