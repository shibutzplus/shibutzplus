import styles from "./teacherSignIn.module.css";

export default function TeacherSignIn() {
  return (
    <main className={styles.container}>
      <div className={styles.mainSection}>
        <div
          style={{
            textAlign: "center",
            color: "rgba(150, 1, 1, 0.98)",
            fontWeight: "bold",
            lineHeight: 1.5,
            fontSize: "1.2rem",
            margin: "2rem 0",
          }}
        >
          אנא צרו קשר עם הנהלת בית הספר לקבלת קישור תקין
        </div>
        <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
      </div>
    </main>
  );
}
