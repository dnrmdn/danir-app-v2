"use client";

import { useRef, useEffect } from "react";
import { members } from "../data/members";
import MemberCard from "./membersCard";

/**
 * FamilyTaskBoard with:
 *  - pointer drag to scroll (mouse + touch)
 *  - inertia / momentum after release
 *  - auto-snap to nearest card after stop
 */

export default function FamilyTaskBoard() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // drag state
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);

  // velocity tracking for inertia
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // config
  const SPEED_MULTIPLIER = 1.5; // feel free to tweak
  const FRICTION = 0.95; // closer to 1 = longer glide
  const MIN_VELOCITY = 0.5; // when to stop inertia
  const SNAP_THRESHOLD = 0.5; // fraction, how "near" triggers snap

  // pointer down
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    // stop any running inertia animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      velocityRef.current = 0;
    }

    // set pointer capture for consistent move/up events across devices
    (e.target as Element).setPointerCapture(e.pointerId);

    draggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollRef.current = el.scrollLeft;

    // initialize velocity tracking
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el || !draggingRef.current) return;
    e.preventDefault();

    const x = e.clientX;
    const walk = (x - startXRef.current) * SPEED_MULTIPLIER; // displacement
    el.scrollLeft = startScrollRef.current - walk;

    // update velocity: simple finite difference over recent move
    const now = performance.now();
    const dt = now - lastTRef.current;
    if (dt > 0) {
      const dx = x - lastXRef.current;
      // pixels per ms
      velocityRef.current = dx / dt;
      lastXRef.current = x;
      lastTRef.current = now;
    }
  };

  const onPointerUpOrCancel = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    draggingRef.current = false;

    // compute final velocity in pixels per ms, convert to pixels per frame-ish
    // We'll use velocityRef.current (px/ms) and animate using requestAnimationFrame.
    startInertia();
  };

  // inertia animation
  function startInertia() {
    const el = scrollRef.current;
    if (!el) return;

    // convert px/ms to px per frame (approx 16ms per frame)
    let velocity = velocityRef.current * 16; // px per RAF-step approximation
    const animate = () => {
      // apply friction
      velocity *= FRICTION;

      // if velocity is very small, stop and snap
      if (Math.abs(velocity) < MIN_VELOCITY) {
        velocity = 0;
        velocityRef.current = 0;
        rafRef.current = null;
        // ensure we snap to nearest card after inertia
        snapToNearest();
        return;
      }

      // update scroll (note sign: earlier we did el.scrollLeft = start - walk,
      // during move dx positive meant pointer moved right (so cards move right), velocity has same sign
      // here we'll subtract velocity to continue same feel)
      el.scrollLeft -= velocity;

      // clamp within bounds
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft < 0) {
        el.scrollLeft = 0;
        rafRef.current = null;
        snapToNearest();
        return;
      }
      if (el.scrollLeft > maxScroll) {
        el.scrollLeft = maxScroll;
        rafRef.current = null;
        snapToNearest();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // only start if we actually have some velocity
    if (Math.abs(velocity) > 0.5) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // no inertia, just snap
      snapToNearest();
    }
  }

  // snap to nearest child card
  function snapToNearest() {
    const el = scrollRef.current;
    if (!el) return;

    // get child nodes (each child has flex-none w-[320px])
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    // compute center-based nearest: find child whose left is nearest to current scrollLeft
    const scrollLeft = el.scrollLeft;
    // We'll consider the left of the element relative to scroll (offsetLeft)
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childLeft = child.offsetLeft; // position in scroll content
      // distance between child's left and current scrollLeft
      const distance = Math.abs(childLeft - scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Optional: if we want "snap only if close enough", apply threshold:
    // const childWidth = (children[0]?.offsetWidth ?? 0);
    // if (nearestDistance > childWidth * SNAP_THRESHOLD) return;

    const target = children[nearestIndex].offsetLeft;

    // smooth scroll to target
    el.scrollTo({
      left: target,
      behavior: "smooth",
    });
  }

  // cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div>
      <div
        // container: horizontal scroll + scroll-snap + drag handlers
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none no-scrollbar"
        // CSS scroll snapping
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrCancel}
        onPointerCancel={onPointerUpOrCancel}
        onPointerLeave={(e) => {
          // if pointer leaves while dragging, treat like up
          if (draggingRef.current) onPointerUpOrCancel(e);
        }}
      >
        {members.map((member, i) => (
          <div key={i} className="flex-none scroll-ml-4" style={{ scrollSnapAlign: "start" }}>
            <MemberCard member={member} />
          </div>
        ))}

        {/* spacer agar item terakhir bisa tersnap ke 'start' */}
        <div aria-hidden="true" style={{ flex: "0 0 calc(100% - 320px)" }} />
      </div>
    </div>
  );
}
