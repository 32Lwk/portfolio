"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// アクセシビリティ: アニメーションを減らす設定を確認
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

interface Mikan {
  id: number;
  x: number; // SVG座標系でのx位置（0-120）
  y: number; // SVG座標系でのy位置（0-200）
  size: number;
  rotation: number;
  state: "onTree" | "shaking" | "falling" | "rolling" | "hidden";
  rollDirection: number; // 転がる方向（-1: 左, 1: 右）
  fallOffsetX: number; // 落下時の横方向のずれ（固定値）
  fallStartX?: number; // 落下開始時のx位置
  fallStartY?: number; // 落下開始時のy位置
}

export function MikanTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mikans, setMikans] = useState<Mikan[]>([]);
  const [isWindy, setIsWindy] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // ランダムな位置を生成する関数（葉の範囲内）
  const generateRandomPosition = () => {
    // 葉の中心: x=60, y=60, 半径=50
    // ランダムな角度と距離で位置を生成
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 10; // 10-50の範囲
    const x = 60 + Math.cos(angle) * distance;
    const y = 60 + Math.sin(angle) * distance;
    
    // 範囲内に収める
    return {
      x: Math.max(15, Math.min(105, x)),
      y: Math.max(20, Math.min(90, y)),
    };
  };

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    
    // 初期のみかんの配置（ランダムに8-12個配置）
    const mikanCount = 8 + Math.floor(Math.random() * 5); // 8-12個
    const initialMikans: Mikan[] = [];
    
    for (let i = 0; i < mikanCount; i++) {
      const pos = generateRandomPosition();
      initialMikans.push({
        id: i,
        x: pos.x,
        y: pos.y,
        size: 10 + Math.random() * 6, // SVG座標系で10-16px
        rotation: Math.random() * 360,
        state: "onTree",
        rollDirection: Math.random() > 0.5 ? 1 : -1,
        fallOffsetX: (Math.random() - 0.5) * 15, // 落下時の横方向のずれ（固定値）
      });
    }
    setMikans(initialMikans);

    // 風のアニメーション（ランダムに発生、アニメーション減らす設定の場合は無効）
    let windInterval: NodeJS.Timeout | null = null;
    if (!reducedMotion) {
      windInterval = setInterval(() => {
        setIsWindy(true);
        setTimeout(() => setIsWindy(false), 2000);
      }, 5000);
    }

    return () => {
      if (windInterval) clearInterval(windInterval);
    };
  }, []);

  // 木全体をクリックした時の処理
  const handleTreeClick = () => {
    // 木を大きく揺らす
    setIsShaking(true);
    
    // ランダムに1-3個のみかんを落とす
    const onTreeMikans = mikans.filter((m) => m.state === "onTree");
    if (onTreeMikans.length === 0) {
      setIsShaking(false);
      return;
    }
    
    const fallCount = Math.min(1 + Math.floor(Math.random() * 3), onTreeMikans.length);
    const mikansToFall = onTreeMikans
      .sort(() => Math.random() - 0.5)
      .slice(0, fallCount);

    // 選択されたみかんを揺らす状態に
    setMikans((prev) =>
      prev.map((mikan) =>
        mikansToFall.some((m) => m.id === mikan.id)
          ? { ...mikan, state: "shaking" }
          : mikan
      )
    );

    // 0.5秒後にみかんを落下させる（現在位置を保存）
    setTimeout(() => {
      setMikans((prev) =>
        prev.map((mikan) => {
          if (mikansToFall.some((m) => m.id === mikan.id)) {
            const mikanSizePx = mikan.size;
            const leftPx = mikan.x - mikanSizePx / 2;
            const topPx = mikan.y - mikanSizePx / 2;
            return {
              ...mikan,
              state: "falling",
              fallStartX: leftPx,
              fallStartY: topPx,
            };
          }
          return mikan;
        })
      );
      setIsShaking(false);
    }, 500);

    // 各みかんに対して個別にアニメーションを設定
    mikansToFall.forEach((mikan, index) => {
      const delay = index * 100; // 少しずつ時間をずらす

      // 落下後、地面で転がる（1.5秒後、落下の最終位置を保存）
      setTimeout(() => {
        setMikans((prev) =>
          prev.map((m) => {
            if (m.id === mikan.id) {
              const mikanSizePx = m.size;
              const leftPx = m.x - mikanSizePx / 2;
              const groundY = 176 - mikanSizePx / 2 - mikanSizePx * 1.1; // 地面の上端に合わせる（1.1個分調整）
              const fallEndX = leftPx + m.fallOffsetX;
              return {
                ...m,
                state: "rolling",
                fallStartX: fallEndX,
                fallStartY: groundY,
              };
            }
            return m;
          })
        );
      }, 2000 + delay);

      // 転がった後、消える（3.5秒後）
      setTimeout(() => {
        setMikans((prev) =>
          prev.map((m) =>
            m.id === mikan.id ? { ...m, state: "hidden" } : m
          )
        );
      }, 3500 + delay);

      // 4秒後に新しいみかんを追加（ランダムな位置に）
      setTimeout(() => {
        const newPos = generateRandomPosition();
        setMikans((prev) =>
          prev.map((m) =>
            m.id === mikan.id
              ? {
                  ...m,
                  state: "onTree",
                  x: newPos.x,
                  y: newPos.y,
                  rotation: Math.random() * 360,
                  rollDirection: Math.random() > 0.5 ? 1 : -1,
                  fallOffsetX: (Math.random() - 0.5) * 15,
                }
              : m
          )
        );
      }, 4000 + delay);
    });
  };

  // 個別のみかんをクリックした時の処理
  const handleMikanClick = (id: number) => {
    const clickedMikan = mikans.find((m) => m.id === id);
    if (!clickedMikan || clickedMikan.state !== "onTree") return;

    // 木を大きく揺らす
    setIsShaking(true);
    setMikans((prev) =>
      prev.map((mikan) =>
        mikan.id === id ? { ...mikan, state: "shaking" } : mikan
      )
    );

    // 0.5秒後にみかんを落下させる（現在位置を保存）
    setTimeout(() => {
      setMikans((prev) =>
        prev.map((mikan) => {
          if (mikan.id === id) {
            const mikanSizePx = mikan.size;
            const leftPx = mikan.x - mikanSizePx / 2;
            const topPx = mikan.y - mikanSizePx / 2;
            return {
              ...mikan,
              state: "falling",
              fallStartX: leftPx,
              fallStartY: topPx,
            };
          }
          return mikan;
        })
      );
      setIsShaking(false);
    }, 500);

    // 落下後、地面で転がる（1.5秒後、落下の最終位置を保存）
    setTimeout(() => {
      setMikans((prev) =>
        prev.map((mikan) => {
          if (mikan.id === id) {
            const mikanSizePx = mikan.size;
            const leftPx = mikan.x - mikanSizePx / 2;
            const groundY = 176 - mikanSizePx / 2; // 地面の上端に合わせる
            const fallEndX = leftPx + mikan.fallOffsetX;
            return {
              ...mikan,
              state: "rolling",
              fallStartX: fallEndX,
              fallStartY: groundY,
            };
          }
          return mikan;
        })
      );
    }, 2000);

    // 転がった後、消える（3.5秒後）
    setTimeout(() => {
      setMikans((prev) =>
        prev.map((mikan) =>
          mikan.id === id ? { ...mikan, state: "hidden" } : mikan
        )
      );
    }, 3500);

    // 4秒後に新しいみかんを追加（ランダムな位置に）
    setTimeout(() => {
      const newPos = generateRandomPosition();
      setMikans((prev) =>
        prev.map((mikan) =>
          mikan.id === id
            ? {
                ...mikan,
                state: "onTree",
                x: newPos.x,
                y: newPos.y,
                rotation: Math.random() * 360,
                rollDirection: Math.random() > 0.5 ? 1 : -1,
                fallOffsetX: (Math.random() - 0.5) * 15,
              }
            : mikan
        )
      );
    }, 4000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 flex items-end justify-center"
    >
      {/* 木のコンテナ（SVGと同じ位置にみかんを配置するため） */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] h-[200px]">
        {/* 木のSVG（クリック可能） */}
        <svg
          className="absolute inset-0 z-10 cursor-pointer"
          width="120"
          height="200"
          viewBox="0 0 120 200"
          onClick={handleTreeClick}
        >
        {/* 幹 */}
        <motion.rect
          x="55"
          y="80"
          width="10"
          height="120"
          fill="#8B4513"
          animate={
            prefersReducedMotion()
              ? {}
              : isShaking
              ? {
                  rotate: [0, -8, 8, -6, 4, -4, 0],
                }
              : isWindy
              ? {
                  rotate: [0, -1, 1, -1, 0],
                }
              : {}
          }
          transition={{
            duration: isShaking ? 0.5 : 2,
            ease: "easeInOut",
          }}
        />

        {/* 葉の部分（円形） */}
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="#228B22"
          animate={
            prefersReducedMotion()
              ? {}
              : isShaking
              ? {
                  x: [0, -8, 8, -6, 4, -4, 0],
                  rotate: [0, -3, 3, -2, 1, -1, 0],
                }
              : isWindy
              ? {
                  x: [0, -3, 3, -2, 0],
                }
              : {}
          }
          transition={{
            duration: isShaking ? 0.5 : 2,
            ease: "easeInOut",
          }}
        />
      </svg>

        {/* みかん（SVGと同じ座標系で配置） */}
        {mikans.map((mikan) => {
          if (mikan.state === "hidden") return null;

          // SVG座標系を直接使用（120x200のviewBox）
          // コンテナの高さ: h-64 = 256px
          // SVGの高さ: 200px
          // 地面の高さ: h-8 = 32px
          // SVGの底はコンテナの底から (256 - 200) = 56px上
          // 地面の上端はコンテナの底から32px上
          // SVG座標系での地面の上端位置: 200 - (56 - 32) = 176
          
          const mikanSizePx = mikan.size; // SVG座標系でのサイズ
          const leftPx = mikan.x - mikanSizePx / 2;
          const topPx = mikan.y - mikanSizePx / 2;

          // 地面の位置（SVG座標系で地面の上端にみかんの中心が来るように）
          // 地面の上端: y = 176、みかんの中心を地面の上に配置
          // 実際には1.1個分下に判定があるので、それだけ上に調整（0.1個分浮かないように）
          const groundY = 176 - mikanSizePx / 2 - mikanSizePx * 1.1;

          // 落下時の最終x位置（少し横にずれる）
          const fallEndX = leftPx + mikan.fallOffsetX;
          // 転がる時の最終x位置
          const rollEndX = fallEndX + mikan.rollDirection * 35;

          // アニメーションの値を状態に応じて設定（状態ごとに明確に分離）
          const animateValue = (() => {
            if (prefersReducedMotion()) {
              return { x: leftPx, y: topPx, rotate: mikan.rotation };
            }

            switch (mikan.state) {
              case "shaking":
                return {
                  rotate: [mikan.rotation, mikan.rotation - 10, mikan.rotation + 10, mikan.rotation - 8, mikan.rotation + 8, mikan.rotation],
                  x: [leftPx, leftPx - 2, leftPx + 2, leftPx - 1, leftPx + 1, leftPx],
                  y: [topPx, topPx - 1, topPx + 1, topPx - 0.5, topPx + 0.5, topPx],
                };
              
              case "falling":
                // 落下アニメーション：保存された開始位置から地面へ
                const startX = mikan.fallStartX ?? leftPx;
                const startY = mikan.fallStartY ?? topPx;
                return {
                  rotate: [mikan.rotation, mikan.rotation + 360],
                  y: [startY, groundY],
                  x: [startX, fallEndX],
                };
              
              case "rolling":
                // 転がるアニメーション：保存された位置から転がる（地面の上で）
                const rollStartX = mikan.fallStartX ?? fallEndX;
                const rollStartY = mikan.fallStartY ?? groundY;
                // 地面の上で自然に転がる（滑らかで連続的な動き）
                const rollMid1X = rollStartX + mikan.rollDirection * 12;
                const rollMid2X = rollStartX + mikan.rollDirection * 25;
                return {
                  rotate: [mikan.rotation + 360, mikan.rotation + 450, mikan.rotation + 540, mikan.rotation + 630, mikan.rotation + 720],
                  x: [rollStartX, rollMid1X, rollMid2X, rollEndX],
                  y: [rollStartY, rollStartY - 1.5, rollStartY - 0.5, groundY], // 地面の上で少し跳ねながら転がる
                };
              
              default:
                if (isWindy) {
                  return {
                    rotate: [mikan.rotation, mikan.rotation - 5, mikan.rotation + 5, mikan.rotation - 3, mikan.rotation],
                    x: leftPx,
                    y: topPx,
                  };
                }
                return { 
                  x: leftPx, 
                  y: topPx, 
                  rotate: mikan.rotation 
                };
            }
          })();

          const transitionValue = (() => {
            if (prefersReducedMotion()) return {};
            
            switch (mikan.state) {
              case "shaking":
                return { duration: 0.5, ease: [0.42, 0, 0.58, 1] as const };
              
              case "falling":
                return { 
                  duration: 1.5, 
                  ease: [0.42, 0, 1, 1] as const, // easeIn
                  x: { duration: 1.5, ease: [0.42, 0, 1, 1] as const, type: "tween" as const },
                  y: { duration: 1.5, ease: [0.42, 0, 1, 1] as const, type: "tween" as const },
                  rotate: { duration: 1.5, ease: [0.42, 0, 1, 1] as const, type: "tween" as const },
                };
              
              case "rolling":
                return { 
                  duration: 1.5, 
                  ease: [0, 0, 0.58, 1] as const, // easeOut
                  x: { duration: 1.5, ease: [0, 0, 0.58, 1] as const, type: "tween" as const },
                  y: { duration: 1.5, ease: [0.42, 0, 0.58, 1] as const, type: "tween" as const }, // 跳ねる動き
                  rotate: { duration: 1.5, ease: [0, 0, 0.58, 1] as const, type: "tween" as const },
                };
              
              default:
                return { duration: 2, ease: [0.42, 0, 0.58, 1] as const };
            }
          })();

          // 状態に応じた初期位置を設定
          const getInitialPosition = () => {
            if (mikan.state === "falling" && mikan.fallStartX !== undefined && mikan.fallStartY !== undefined) {
              return {
                x: mikan.fallStartX,
                y: mikan.fallStartY,
                rotate: mikan.rotation,
              };
            }
            if (mikan.state === "rolling" && mikan.fallStartX !== undefined && mikan.fallStartY !== undefined) {
              return {
                x: mikan.fallStartX,
                y: mikan.fallStartY,
                rotate: mikan.rotation + 360,
              };
            }
            return {
              x: leftPx,
              y: topPx,
              rotate: mikan.rotation,
            };
          };

          return (
            <motion.div
              key={`mikan-${mikan.id}-${mikan.state}`}
              className="absolute cursor-pointer z-20"
              initial={getInitialPosition()}
              animate={animateValue}
              transition={transitionValue}
              style={{
                width: `${mikanSizePx}px`,
                height: `${mikanSizePx}px`,
                willChange: mikan.state === "falling" || mikan.state === "rolling" ? "transform" : "auto",
              }}
            onClick={(e) => {
              e.stopPropagation(); // 木のクリックイベントを防ぐ
              handleMikanClick(mikan.id);
            }}
            whileHover={
              prefersReducedMotion() || mikan.state !== "onTree"
                ? {}
                : { scale: 1.2 }
            }
            whileTap={prefersReducedMotion() ? {} : { scale: 0.9 }}
          >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md"
          >
            {/* みかんの実 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="#FF8C00"
              stroke="#FF7F00"
              strokeWidth="2"
            />
            {/* ハイライト */}
            <ellipse cx="35" cy="35" rx="15" ry="20" fill="#FFD700" opacity="0.6" />
            {/* ヘタ */}
            <circle cx="50" cy="20" r="8" fill="#228B22" />
            <ellipse cx="50" cy="15" rx="3" ry="5" fill="#32CD32" />
          </svg>
        </motion.div>
          );
        })}
      </div>

      {/* 地面 */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-t-full" />

      {/* 説明テキスト */}
      <div className="absolute top-4 left-0 right-0 text-center z-30">
        <p className="text-sm text-muted-foreground">
          木をクリックすると揺れてみかんが落ちます 🍊
        </p>
      </div>
    </div>
  );
}
