"use client";

import { useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { AdminConsole } from "./AdminConsole";
import { PinGate } from "./PinGate";

/** PIN-gated staff portal. Opened from the site header via openAdmin(). */
export function AdminPortal() {
  const { adminOpen, closeAdmin } = useResort();
  const [unlocked, setUnlocked] = useState(false);
  const [wasOpen, setWasOpen] = useState(adminOpen);

  // Re-lock whenever the portal is closed.
  if (wasOpen !== adminOpen) {
    setWasOpen(adminOpen);
    if (!adminOpen) setUnlocked(false);
  }

  if (!adminOpen) return null;
  if (!unlocked) return <PinGate onClose={closeAdmin} onUnlock={() => setUnlocked(true)} />;
  return <AdminConsole onClose={closeAdmin} onLock={() => setUnlocked(false)} />;
}
