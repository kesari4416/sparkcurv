import { motion } from "framer-motion";

export default function SplashScreen({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        gap: "16px",
      }}
    >
      <motion.img
        src="/images/logo/SPARKCURVEICON.png"
        alt="SparkCurv"
        style={{ width: "100px", height: "auto" }}
      />

      {/* Loading bar — shimmer sweeps left to right */}
      <div
        style={{
          width: "180px",
          height: "4px",
          background: "#e0e0e0",
          borderRadius: "99px",
          overflow: "hidden",
          position: "relative",   // ← needed so child px offsets are predictable
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            height: "100%",
            width: "40%",          // 40% of 180px = 72px
            background: "#02028B",
            borderRadius: "99px",
          }}
          animate={{ x: ["-72px", "180px"] }}  // start fully off-left, end fully off-right
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Auto-dismiss after 2.5 s */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.5, ease: "linear" }}
        onAnimationComplete={onComplete}
        style={{ display: "none" }}
      />
    </motion.div>
  );
}