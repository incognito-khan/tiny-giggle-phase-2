// import { animate, useMotionValue, useTransform, motion } from 'framer-motion';
// import { useEffect, useRef } from 'react';
// import { useInView } from 'framer-motion';

// export function AnimatedCounter({ from = 0, to = 20, duration = 1 }) {
//   const count = useMotionValue(from);
//   const rounded = useTransform(count, v => Math.round(v));
//   const ref = useRef(null);
//   const inView = useInView(ref, { once: false, amount: 0.4 });

//   useEffect(() => {
//     if (inView) {
//       const controls = animate(count, to, { duration });
//       return () => controls.stop();
//     }
//   }, [inView, count, to, duration]);

//   return <motion.span ref={ref}>{rounded}</motion.span>;
// }

import { animate, useMotionValue, useTransform, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

export function AnimatedCounter({ from = 1, to = 20, duration = 2 }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, v => Math.round(v));
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration });
      return () => controls.stop();
    } else {
      count.set(from);
    }
  }, [inView, count, to, duration, from]);

  return <motion.span ref={ref} className="text-5xl font-extrabold mb-2">{rounded}</motion.span>;
}
