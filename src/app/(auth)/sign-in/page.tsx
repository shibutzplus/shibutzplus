"use client";

import Image from "next/image";
import styles from "./signIn.module.css";
import { NextPage } from "next";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import Link from "next/link";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { EmailLink } from "@/models/constant";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import Loading from "@/components/core/Loading/Loading";
import routes from "@/routes";
import { Suspense } from "react";
import HeroSection from "@/components/layout/HeroSection/HeroSection";

const SignInContent: React.FC = () => {

  const { data: session, status } = useSession(); // 'loading' | 'authenticated' | 'unauthenticated'
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error");
  const router = useRouter(); // Next.js router (push/replace)
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (googleError === "AccessDenied") {
      errorToast(messages.auth.accessDenied);
    }
  }, [googleError]);

  // Show Loader during the OAuth bounce while NextAuth resolves the session
  useEffect(() => {
    if (status === "loading") setIsLoading(true);
  }, [status]);

  // Stop loader if auth failed and we are back unauthenticated
  useEffect(() => {
    if (status === "unauthenticated" && !hasNavigatedRef.current) {
      setIsLoading(false);
    }
  }, [status]);

  // Navigate once authenticated; keep loader visible until push completes
  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      setIsLoading(true);
      const target =
        (session.user as any).status === "annual" ? DEFAULT_REDIRECT : routes.dailySchedule.p; // routes = your routes map
      router.push(target);
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setError(res.message);
      setIsLoading(false);
    }
  };

  // Show Loader if loading or navigating
  if (isLoading || status === "loading" || (status === "authenticated" && !hasNavigatedRef.current)) {
    return (
      <main className={styles.container} aria-busy="true" aria-live="polite">
        <section style={{ display: "grid", placeItems: "center", minHeight: "60vh", gap: "12px" }}>
          <Loading />
          <p style={{ fontSize: 22, opacity: 0.8 }}>מתחבר למערכת...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <section className={styles.mainSection}>
        <HeroSection title="ניהול מערכת השעות" description="מערכת שעות יומית ושיבוץ מורים — פשוט, חכם, יעיל" />
        <div className={styles.formContainer}>
          <button type="button" className={styles.googleButton} onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? <Loading /> : null}
            <GoogleIcon /> התחברות בעזרת Google
          </button>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.registerLink}>
            <p>
              בעיה בהתחברות?{" "}
              <Link href={EmailLink} className={styles.problemLink}>
                צרו קשר
              </Link>
            </p>
          </div>
        </div>
      </section>

      <div className={styles.illustrationContainer}>
        <Image
          src="/undraw_workspace_s6wf.svg"
          alt="Workspace Illustration"
          width={140}
          height={40}
          className={styles.illustration}
          priority
        />
      </div>
    </main>
  );
};



const SignInPage: NextPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SignInContent />
    </Suspense>
  );
};

export default SignInPage;
