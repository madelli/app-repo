import React, { useState } from 'react';
import './FirstLayer.css';

const FirstLayer = () => {
  const [sequence, setSequence] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 儀式クリックの正しい順番
  const secret = ['header', 'footer', 'post1', 'post2'];

  // クリック登録
  const register = (area) => {
    const updated = [...sequence, area].slice(-4);
    setSequence(updated);

    if (JSON.stringify(updated) === JSON.stringify(secret)) {
      setShowModal(true);
    }
  };

  // ★ 修正ポイント：パスワード成功で /layer2 に遷移
  const handlePassword = () => {
    const input = document.getElementById('password-input').value;

    if (input === 'coldoperator') {
      window.location.href = '/layer2';   // ← ここが重要
    } else {
      document.getElementById('password-input').value = '';
    }
  };

  return (
    <div className="blog-container">
      <header onClick={() => register('header')}>
        <h1>真彬の雑記ブログ</h1>
        <p>日々の気づきやメモを書き留めています。</p>
      </header>

      <main>
        <article onClick={() => register('post1')}>
          <h2>最近学んだこと</h2>
          <p>GitHub Actions の挙動について少し調べてみました。</p>
        </article>

        <article onClick={() => register('post2')}>
          <h2>お気に入りのツール</h2>
          <p>VSCode はやっぱり使いやすいです。</p>
        </article>
      </main>

      <footer onClick={() => register('footer')}>
        <p>© 2026 Masai</p>
      </footer>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>パスワードを入力</h3>
            <input type="password" id="password-input" placeholder="Password" />
            <button onClick={handlePassword}>Enter</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstLayer;
