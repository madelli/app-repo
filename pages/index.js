import { useState } from "react";
import BlogLayout from "../components/BlogLayout";
import SecretModal from "../components/SecretModal";

export default function Home() {
  const [showSecret, setShowSecret] = useState(false);

  const openSecret = () => setShowSecret(true);

  return (
    <>
      <BlogLayout onSecretTrigger={openSecret} />

      {showSecret && (
        <SecretModal onClose={() => setShowSecret(false)} />
      )}
    </>
  );
}

