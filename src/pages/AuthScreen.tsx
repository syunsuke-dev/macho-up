import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BearLiftIcon } from '../components/BearLiftIcon';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';

interface Props {
  onShowGuide?: () => void;
}

export function AuthScreen({ onShowGuide }: Props = {}) {
  const {
    signIn,
    signUp,
    sendPasswordResetEmail,
    updatePassword,
    isPasswordRecovery,
    clearPasswordRecovery,
    signOut,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // パスワードリカバリリンクから来た場合は reset モードに自動切替
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset');
      setError(null);
      setInfo(null);
    }
  }, [isPasswordRecovery]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
    setPassword('');
    setPassword2('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    if (mode === 'signin') {
      const r = await signIn(email, password);
      setBusy(false);
      if (r.error) setError(r.error);
    } else if (mode === 'signup') {
      const r = await signUp(email, password);
      setBusy(false);
      if (r.error) setError(r.error);
      else if (r.needsConfirmation) {
        setInfo('確認メールを送信しました。リンクをクリックしてください。');
      }
    } else if (mode === 'forgot') {
      const r = await sendPasswordResetEmail(email);
      setBusy(false);
      if (r.error) setError(r.error);
      else if (r.sent) {
        setInfo(
          'パスワード再設定メールを送信しました。受信したメール内のリンクをクリックして新しいパスワードを設定してください。',
        );
      }
    } else if (mode === 'reset') {
      if (password.length < 6) {
        setBusy(false);
        setError('パスワードは6文字以上にしてください');
        return;
      }
      if (password !== password2) {
        setBusy(false);
        setError('パスワードが一致しません');
        return;
      }
      const r = await updatePassword(password);
      setBusy(false);
      if (r.error) setError(r.error);
      else if (r.ok) {
        setInfo('パスワードを更新しました。続けてアプリをご利用ください。');
        clearPasswordRecovery();
        // updatePassword 成功後はそのままログイン状態なので、AuthGate が自動でアプリを表示する
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="max-w-md mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-3">
            <BearLiftIcon size={68} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-amber-400">macho</span> up
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            ロジカルなトレーニング管理
          </p>
        </div>

        {/* タブ (signin/signup のみ表示) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex gap-1.5 mb-4 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 h-9 rounded-lg font-semibold text-sm transition-colors ${
                mode === 'signin'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 h-9 rounded-lg font-semibold text-sm transition-colors ${
                mode === 'signup'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              新規登録
            </button>
          </div>
        )}

        {/* forgot / reset モード時は戻るボタン + タイトル */}
        {(mode === 'forgot' || mode === 'reset') && (
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={async () => {
                if (mode === 'reset') {
                  // 再設定キャンセル: recovery セッションを破棄して signin に
                  clearPasswordRecovery();
                  await signOut();
                }
                switchMode('signin');
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-neutral-900"
              aria-label="戻る"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="text-sm font-bold">
              {mode === 'forgot'
                ? 'パスワードを忘れた'
                : '新しいパスワードを設定'}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {/* メアド入力 (reset 時は非表示) */}
          {mode !== 'reset' && (
            <label className="block">
              <span className="text-[10px] text-neutral-500 uppercase">
                メールアドレス
              </span>
              <div className="relative mt-1">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="you@example.com"
                />
              </div>
            </label>
          )}

          {/* パスワード入力 (forgot 時は非表示) */}
          {mode !== 'forgot' && (
            <label className="block">
              <span className="text-[10px] text-neutral-500 uppercase">
                {mode === 'reset' ? '新しいパスワード' : 'パスワード'} (6文字以上)
              </span>
              <div className="relative mt-1">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </label>
          )}

          {/* パスワード確認入力 (reset 時のみ) */}
          {mode === 'reset' && (
            <label className="block">
              <span className="text-[10px] text-neutral-500 uppercase">
                パスワード (確認)
              </span>
              <div className="relative mt-1">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
                />
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full h-12 bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </label>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-lg bg-amber-500 text-neutral-950 font-bold disabled:opacity-50 active:scale-[0.99] transition"
          >
            {busy
              ? '送信中...'
              : mode === 'signin'
                ? 'ログインする'
                : mode === 'signup'
                  ? 'アカウントを作成'
                  : mode === 'forgot'
                    ? '再設定メールを送信'
                    : 'パスワードを更新'}
          </button>
        </form>

        {/* signin モード時のみ「パスワードを忘れた?」リンク */}
        {mode === 'signin' && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="mt-3 mx-auto block text-[11px] text-neutral-400 hover:text-amber-300 underline-offset-2 hover:underline"
          >
            パスワードを忘れた?
          </button>
        )}

        <p className="text-[10px] text-neutral-500 text-center mt-6 leading-relaxed">
          データは Supabase に保存され、複数デバイス間で同期されます。
          <br />
          利用は完全無料です。
        </p>

        {onShowGuide && (
          <button
            type="button"
            onClick={onShowGuide}
            className="mt-3 mx-auto block text-[11px] text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline"
          >
            使い方を見る →
          </button>
        )}
      </div>
    </div>
  );
}
