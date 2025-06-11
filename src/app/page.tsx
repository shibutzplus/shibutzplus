import styles from "./page.module.css";
import Link from "next/link";
import routePath from "../routes";

export default function Home() {
  return (
    <div className={styles.page}>
      <Link href={routePath.login.p}>Login</Link>
      <Link href={routePath.register.p}>Register</Link>
    </div>
  );
}
