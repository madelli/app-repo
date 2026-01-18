import styles from "../styles/blog.module.css";

export default function BlogLayout({ onSecretTrigger }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 onClick={onSecretTrigger}>My Daily Notes</h1>
        <nav>
          <a>Home</a>
          <a>About</a>
          <a>Contact</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.articles}>
          <article>
            <h2 onClick={onSecretTrigger}>今日の散歩記録</h2>
            <p>近所の公園を歩いた話。</p>
          </article>

          <article>
            <h2>最近読んだ本</h2>
            <p>小説の感想。</p>
          </article>

          <article>
            <h2>雑記：コーヒーの話</h2>
            <p>新しい豆を買った。</p>
          </article>
        </section>

        <aside className={styles.sidebar}>
          <h3>プロフィール</h3>
          <p>ただの日常ブログです。</p>

          <h3>カテゴリ</h3>
          <ul>
            <li>日記</li>
            <li>読書</li>
            <li>雑記</li>
          </ul>
        </aside>
      </main>

      <footer className={styles.footer} onClick={onSecretTrigger}>
        © 2026 My Daily Notes
      </footer>
    </div>
  );
}
