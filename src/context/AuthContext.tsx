import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** パスワード再設定リンクから入った直後 (true の間は新パスワード入力 UI を出す) */
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error?: string;
    needsConfirmation?: boolean;
    signedIn?: boolean;
  }>;
  signOut: () => Promise<void>;
  /** パスワード再設定メールを送信 */
  sendPasswordResetEmail: (
    email: string,
  ) => Promise<{ error?: string; sent?: boolean }>;
  /** パスワードを更新 (recovery セッション中に呼ばれる想定) */
  updatePassword: (
    newPassword: string,
  ) => Promise<{ error?: string; ok?: boolean }>;
  /** リカバリ完了後、フラグをクリア */
  clearPasswordRecovery: () => void;
}

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    // セッション変更監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, sess) => {
      if (!mounted) return;
      // パスワードリカバリリンクからの遷移を検知
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      setSession(sess);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: prettyError(error.message) };
    return {};
  };

  const signUp: AuthContextValue['signUp'] = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: prettyError(error.message) };
    if (data.session) {
      // 確認なし: 即セッション発行
      return { signedIn: true };
    }
    // 確認あり: メール確認待ち
    return { needsConfirmation: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
    // ローカル残骸を一掃 (option B)
    try {
      localStorage.removeItem('machoup:v1');
    } catch {
      /* noop */
    }
  };

  const sendPasswordResetEmail: AuthContextValue['sendPasswordResetEmail'] =
    async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // メール内のリンクをクリックすると、このURLに戻ってくる
        // (Supabase はここに #access_token=...&type=recovery を付加する)
        redirectTo: `${window.location.origin}/`,
      });
      if (error) return { error: prettyError(error.message) };
      return { sent: true };
    };

  const updatePassword: AuthContextValue['updatePassword'] = async (
    newPassword,
  ) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) return { error: prettyError(error.message) };
    return { ok: true };
  };

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isPasswordRecovery,
        signIn,
        signUp,
        signOut,
        sendPasswordResetEmail,
        updatePassword,
        clearPasswordRecovery,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Supabase の英語エラーを軽く日本語化 */
function prettyError(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) {
    return 'メールアドレスまたはパスワードが正しくありません';
  }
  if (/User already registered/i.test(msg)) {
    return 'このメールアドレスは既に登録されています';
  }
  if (/Password should be at least/i.test(msg)) {
    return 'パスワードは6文字以上にしてください';
  }
  if (/Email not confirmed/i.test(msg)) {
    return 'メール確認が完了していません';
  }
  if (/rate limit/i.test(msg)) {
    return 'リクエスト過多。少し時間を空けて再試行してください';
  }
  return msg;
}
