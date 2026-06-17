'use client'

import React, { Suspense } from "react";
import GenerativeMountainScene from "@/components/ui/mountain-scene";

export default function DemoOne() {
  return (
    <main className="relative w-full h-screen bg-[#0f172a] overflow-hidden text-slate-100">
      <Suspense fallback={<div className="w-full h-full bg-[#0f172a]" />}>
        <GenerativeMountainScene />
      </Suspense>
    </main>
  );
}
