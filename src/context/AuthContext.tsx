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
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  /**
   * @returns
   *  - error: エラー文言
   *  - needsConfirmation: メール確認が必要 (Supabase 側で email confirmation が ON の場合)
   *  - signedIn: true なら即ログイン成功
   */
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error?: string;
    needsConfirmation?: boolean;
    signedIn?: boolean;
  }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
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
    // ローカル残骸を一掃 (option B)
    try {
      localStorage.removeItem('machoup:v1');
    } catch {
      /* noop */
    }
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
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
