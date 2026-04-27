import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
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
      // 成功時は AuthProvider が session を検出して App 側が切り替わる
    } else {
      const r = await signUp(email, password);
      setBusy(false);
      if (r.error) {
        setError(r.error);
      } else if (r.needsConfirmation) {
        setInfo(
          '確認メールを送信しました。メール内のリンクをクリックしてから「ログイン」してください。',
        );
      } else if (r.signedIn) {
        // 即ログイン (メール確認 OFF の場合)
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="max-w-md mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-2xl mb-3">
            <Dumbbell size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-amber-400">macho</span> up
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            ロジカルなトレーニング管理
          </p>
        </div>

        {/* タブ */}
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

        <form onSubmit={submit} className="space-y-3">
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

          <label className="block">
            <span className="text-[10px] text-neutral-500 uppercase">
              パスワード (6文字以上)
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
                : 'アカウントを作成'}
          </button>
        </form>

        <p className="text-[10px] text-neutral-500 text-center mt-8 leading-relaxed">
          データは Supabase に保存され、複数デバイス間で同期されます。
          <br />
          利用は完全無料です。
        </p>
      </div>
    </div>
  );
}
