"use client";

import { useEffect, useState } from "react";
import QrModal from "./QrModal";

export default function QrButton() {
  const [href, setHref] = useState("");
  useEffect(() => {
    setHref(window.location.href);
  }, []);
  return <QrModal url={href} />;
}


