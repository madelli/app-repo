import { useState } from "react";
import styles from "../styles/blog.module.css";

export default function SecretModal({ onClose }) {
  const [password, setPassword] = useState("");

  const submit = () => {
    if (password === process.env.NEXT_PUBLIC_SECRET_PASSWORD) {
      window.location.href = "/layer2";
    } else {
      alert("ACCESS DENIED");
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>ACCESS REQUIRED</h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={submit}>ENTER</button>
      </div>
    </div>
  );
}
