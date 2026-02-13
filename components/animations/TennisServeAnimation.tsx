"use client";

import { useEffect, useRef, useState } from "react";

// アクセシビリティ: アニメーションを減らす設定を確認
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

interface TennisAnimationState {
  phase: "idle" | "preparing" | "serving" | "ballFlying" | "complete";
  progress: number; // 0-1
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  racketAngle: number;
}

export function TennisServeAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const stateRef = useRef<TennisAnimationState>({
    phase: "idle",
    progress: 0,
    ballX: 0,
    ballY: 0,
    ballVx: 0,
    ballVy: 0,
    racketAngle: 0,
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // アニメーションを減らす設定の場合は非表示
    if (prefersReducedMotion()) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // CSS変数から実際の色を取得
    const getCSSVariable = (varName: string): string => {
      if (typeof window === "undefined") return "#60a5fa";
      const root = document.documentElement;
      const value = getComputedStyle(root).getPropertyValue(varName).trim();
      return value || "#60a5fa";
    };

    // ダークモードかどうか（プレイヤー色・コート色で使用）
    const isDarkMode = () => {
      if (typeof document === "undefined") return true;
      const root = document.documentElement;
      if (root.classList.contains("dark")) return true;
      if (root.classList.contains("light")) return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    // プレイヤー用の色（primaryの色相を活かしつつ、彩度・明度を抑えてシルエット的に）
    const getPlayerColor = () => {
      const hue = getCSSVariable("--primary").split(" ")[0] || "200";
      const dark = isDarkMode();
      // ダーク: やや抑えた青（彩度70%, 明度52%）
      // ライト: 濃いめのシルエット（彩度45%, 明度35%）
      const [s, l] = dark ? [70, 52] : [45, 35];
      return `hsl(${hue}, ${s}%, ${l}%)`;
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // セクションの位置を取得
    const getSectionPositions = () => {
      const educationSection = document.querySelector(
        '[data-section="education"]'
      );
      const careerSection = document.querySelector('[data-section="career"]');

      if (!educationSection || !careerSection) {
        return { educationTop: 0, educationBottom: 0, careerTop: 0 };
      }

      const educationRect = educationSection.getBoundingClientRect();
      const careerRect = careerSection.getBoundingClientRect();

      return {
        educationTop: educationRect.top + window.scrollY,
        educationBottom: educationRect.bottom + window.scrollY,
        careerTop: careerRect.top + window.scrollY,
      };
    };

    // スクロール位置からアニメーションの進行度を計算
    const updateScrollProgress = () => {
      const { educationTop, careerTop } = getSectionPositions();
      
      // セクションが見つからない場合は常に表示
      if (educationTop === 0 && careerTop === 0) {
        stateRef.current.phase = "preparing";
        stateRef.current.progress = 0.5;
        return;
      }

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportCenter = scrollY + viewportHeight / 2;

      // 学歴セクションに入る前（準備ポーズを表示）
      if (viewportCenter < educationTop) {
        setScrollProgress(0);
        stateRef.current.phase = "preparing";
        stateRef.current.progress = 0;
        return;
      }

      // 学歴セクションから経歴セクションの手前まで
      const animationStart = educationTop;
      const animationEnd = careerTop - viewportHeight * 0.3;
      const animationRange = animationEnd - animationStart;

      if (viewportCenter >= animationStart && viewportCenter < animationEnd) {
        const progressInRange = (viewportCenter - animationStart) / animationRange;
        const normalizedProgress = Math.min(1, Math.max(0, progressInRange));
        setScrollProgress(normalizedProgress);

        // 進行度に応じてフェーズを設定（サーブ打つタイミングを遅く: 準備・テイクバックを長く）
        if (normalizedProgress < 0.4) {
          stateRef.current.phase = "preparing";
          stateRef.current.progress = normalizedProgress / 0.4;
        } else if (normalizedProgress < 0.7) {
          stateRef.current.phase = "serving";
          stateRef.current.progress = (normalizedProgress - 0.4) / 0.3;
        } else {
          stateRef.current.phase = "ballFlying";
          stateRef.current.progress = (normalizedProgress - 0.7) / 0.3;
        }
        return;
      }

      // 経歴セクションの手前でボールを打ち出す
      if (viewportCenter >= animationEnd && viewportCenter < careerTop) {
        setScrollProgress(1);
        stateRef.current.phase = "ballFlying";
        stateRef.current.progress = 1;
        return;
      }

      // 経歴セクション以降
      setScrollProgress(1);
      stateRef.current.phase = "complete";
    };

    // プレイヤーとラケットの描画（大幅改善版）
    const drawPlayer = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      racketAngle: number,
      phase: string,
      progress: number = 0
    ) => {
      const scale = Math.min(window.innerWidth / 1920, 1);
      const playerSize = 120 * scale;
      const primaryColor = getPlayerColor();

      ctx.save();
      ctx.translate(x, y);

      // 体（より縦長の楕円形、ラケットより大きく）
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = 0.95;
      const bodyWidth = playerSize * 0.24; // さらに幅を狭く
      const bodyHeight = playerSize * 0.55; // さらに高さを高く
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // 首（頭と体をつなぐ）
      const neckHeight = playerSize * 0.08;
      ctx.beginPath();
      ctx.ellipse(0, -bodyHeight + neckHeight * 0.5, bodyWidth * 0.5, neckHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // 頭（円形、より大きく自然に、体から離す）
      const headRadius = playerSize * 0.22;
      const headY = -bodyHeight - neckHeight - headRadius * 0.3; // 体から適切に離す
      ctx.beginPath();
      ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // 足（左）- 後ろ側、自然な角度で
      const leftLegLength = playerSize * 0.55;
      const leftLegStartX = -bodyWidth * 0.6;
      const leftLegStartY = bodyHeight * 0.7;
      const leftLegEndX = -bodyWidth * 0.8;
      const leftLegEndY = leftLegStartY + leftLegLength;
      
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 10 * scale;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(leftLegStartX, leftLegStartY);
      ctx.lineTo(leftLegEndX, leftLegEndY);
      ctx.stroke();

      // 足（右）- 前側、自然な角度で
      const rightLegStartX = bodyWidth * 0.6;
      const rightLegStartY = bodyHeight * 0.7;
      const rightLegEndX = bodyWidth * 1.0;
      const rightLegEndY = rightLegStartY + leftLegLength * 0.9; // 少し短くして前後感を出す
      
      ctx.beginPath();
      ctx.moveTo(rightLegStartX, rightLegStartY);
      ctx.lineTo(rightLegEndX, rightLegEndY);
      ctx.stroke();

      // 足の先（左）- 靴の形
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.ellipse(leftLegEndX, leftLegEndY, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 足の先（右）- 靴の形
      ctx.beginPath();
      ctx.ellipse(rightLegEndX, rightLegEndY, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 左腕（バランス用、ラケットを持たない方）— 体の左側に自然に下ろしたポーズ
      const leftArmAngleDeg = 158; // 左斜め下（度）
      const leftArmLength = playerSize * 0.36;
      const leftArmX = Math.cos((leftArmAngleDeg * Math.PI) / 180) * leftArmLength;
      const leftArmY = Math.sin((leftArmAngleDeg * Math.PI) / 180) * leftArmLength;
      
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 7 * scale;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(leftArmX, leftArmY);
      ctx.stroke();

      // 手（左）
      ctx.beginPath();
      ctx.arc(leftArmX, leftArmY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 右腕（ラケットを持つ方）
      // racketAngleは左側を向く角度（0度が左、90度が上、-90度が下）
      const armLength = playerSize * 0.5;
      const armAngleRad = (racketAngle * Math.PI) / 180;
      
      // 頭頂の位置（headYは上で定義済み）
      const headTopY = headY - headRadius;
      
      // サーブ時は頭の上でラケットとボールが当たるように調整
      let armX, armY;
      if (phase === "serving" && progress >= 0.4 && progress <= 0.6) {
        // サーブ中は頭の上にラケットを配置
        armX = 0; // 頭の真上
        armY = headTopY - 20 * scale; // 頭の少し上（ボールと当たる位置）
      } else {
        // 通常時は角度に従う
        armX = Math.cos(armAngleRad) * armLength;
        armY = Math.sin(armAngleRad) * armLength;
      }

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 8 * scale;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armX, armY);
      ctx.stroke();

      // 手（右）
      ctx.beginPath();
      ctx.arc(armX, armY, 6 * scale, 0, Math.PI * 2);
      ctx.fill();

      // ラケット（適切なサイズ比に調整、体より小さく）
      const racketSize = playerSize * 0.35; // 体より小さく
      ctx.save();
      
      // サーブ時は頭の上でラケットを配置
      if (phase === "serving" && progress >= 0.4 && progress <= 0.6) {
        ctx.translate(armX, armY);
        ctx.rotate((racketAngle * Math.PI) / 180);
      } else {
        ctx.translate(armX, armY);
        ctx.rotate(armAngleRad);
      }
      
      // ラケットのフレーム（楕円形）
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4 * scale;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, racketSize * 0.8, racketSize * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // ラケットのストリング（縦横）
      ctx.strokeStyle = primaryColor;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1 * scale;
      
      // 横のストリング
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-racketSize * 0.8, i * racketSize * 0.1);
        ctx.lineTo(racketSize * 0.8, i * racketSize * 0.1);
        ctx.stroke();
      }
      
      // 縦のストリング
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * racketSize * 0.1, -racketSize * 0.6);
        ctx.lineTo(i * racketSize * 0.1, racketSize * 0.6);
        ctx.stroke();
      }
      
      ctx.restore();

      ctx.restore();
      ctx.globalAlpha = 1;
    };

    // サービスボックス内にターゲット位置を制限する関数
    const constrainTargetToServiceBox = (
      ballStartX: number,
      ballStartY: number,
      targetX: number,
      targetY: number
    ): { x: number; y: number } => {
      const scale = Math.min(window.innerWidth / 1920, 1);
      
      // コートの寸法定数
      const COURT_LENGTH_M = 23.77;
      const SINGLES_WIDTH_M = 8.23;
      const SERVICE_LINE_FROM_NET_M = 6.4;
      
      // ボール軌道方向を計算
      const dx = targetX - ballStartX;
      const dy = targetY - ballStartY;
      const travelDistance = Math.hypot(dx, dy);
      if (travelDistance < 1) return { x: targetX, y: targetY };
      
      const trajectoryAngle = Math.atan2(dy, dx);
      const angle = trajectoryAngle - Math.PI / 2;
      
      // コートサイズを1.25倍に拡大
      const desiredCourtLengthPx = Math.min(
        Math.max(travelDistance * 0.82, window.innerHeight * 0.55),
        window.innerWidth * 0.9
      ) * 1.25;
      const meterToPx = desiredCourtLengthPx / COURT_LENGTH_M;
      
      const halfLength = (COURT_LENGTH_M * meterToPx) / 2;
      const halfSinglesWidth = (SINGLES_WIDTH_M * meterToPx) / 2;
      const serviceLineY = SERVICE_LINE_FROM_NET_M * meterToPx;
      
      const courtCenterX = (ballStartX + targetX) / 2;
      const courtCenterY = (ballStartY + targetY) / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // キャンバス座標をローカル座標に変換
      const worldToLocal = (worldX: number, worldY: number) => {
        const relX = worldX - courtCenterX;
        const relY = worldY - courtCenterY;
        return {
          x: relX * cos + relY * sin,
          y: -relX * sin + relY * cos,
        };
      };
      
      // ローカル座標をキャンバス座標に変換
      const localToWorld = (localX: number, localY: number) => ({
        x: courtCenterX + localX * cos - localY * sin,
        y: courtCenterY + localX * sin + localY * cos,
      });
      
      // ターゲット位置をローカル座標に変換
      const localTarget = worldToLocal(targetX, targetY);
      
      
      const serviceBoxMinX = 0; // センターライン
      const serviceBoxMaxX = halfSinglesWidth;
      const serviceBoxMinY = serviceLineY;
      const serviceBoxMaxY = halfLength;
      
      // サービスボックス内に制限
      let constrainedX = Math.max(serviceBoxMinX, Math.min(serviceBoxMaxX, localTarget.x));
      let constrainedY = Math.max(serviceBoxMinY, Math.min(serviceBoxMaxY, localTarget.y));
      
      // サービスボックスの中央付近に配置（より自然に見えるように）
      if (localTarget.x < serviceBoxMinX || localTarget.x > serviceBoxMaxX) {
        constrainedX = (serviceBoxMinX + serviceBoxMaxX) /2;
      }
      if (localTarget.y < serviceBoxMinY || localTarget.y > serviceBoxMaxY) {
        constrainedY = (serviceBoxMinY + serviceBoxMaxY) /2;
      }
      
      // キャンバス座標に戻す
      return localToWorld(constrainedX, constrainedY);
    };

    // コートとネットの描画（学歴セクションでのみ）
    const drawCourt = (
      ctx: CanvasRenderingContext2D,
      ballStartX: number,
      ballStartY: number,
      targetX: number,
      targetY: number
    ) => {
      const scale = Math.min(window.innerWidth / 1920, 1);
      const dark = isDarkMode();

      // テーマに応じたコートの色（ライトモードでは線を暗くして視認性を確保）
      const courtSurfaceFill = dark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.04)";
      const courtLineStroke = dark
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(0, 0, 0, 0.88)";
      const netPostFill = dark
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(0, 0, 0, 0.88)";

      // 実際のテニスコート寸法（m）
      const COURT_LENGTH_M = 23.77;
      const DOUBLES_WIDTH_M = 10.97;
      const SINGLES_WIDTH_M = 8.23;
      const SERVICE_LINE_FROM_NET_M = 6.4;
      const CENTER_MARK_M = 0.1;

      // ボール軌道方向をコートの長手方向（+Y）に合わせる
      const dx = targetX - ballStartX;
      const dy = targetY - ballStartY;
      const travelDistance = Math.hypot(dx, dy);
      if (travelDistance < 1) return;

      const trajectoryAngle = Math.atan2(dy, dx);
      const angle = trajectoryAngle - Math.PI / 2;

      // 軌道に対して自然に見えるよう、表示サイズだけ可変にする（比率は実寸固定）
      // コートサイズを1.25倍に拡大
      const desiredCourtLengthPx = Math.min(
        Math.max(travelDistance * 0.82, window.innerHeight * 0.55),
        window.innerWidth * 0.9
      ) * 1.25;
      const meterToPx = desiredCourtLengthPx / COURT_LENGTH_M;

      const halfLength = (COURT_LENGTH_M * meterToPx) / 2;
      const halfDoublesWidth = (DOUBLES_WIDTH_M * meterToPx) / 2;
      const halfSinglesWidth = (SINGLES_WIDTH_M * meterToPx) / 2;
      const serviceLineY = SERVICE_LINE_FROM_NET_M * meterToPx;
      const centerMarkLength = Math.max(CENTER_MARK_M * meterToPx, 6 * scale);

      const courtCenterX = (ballStartX + targetX) / 2;
      const courtCenterY = (ballStartY + targetY) / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // ローカル座標（x: 横幅, y: 長手）をキャンバス座標へ変換
      const transformPoint = (point: { x: number; y: number }) => ({
        x: courtCenterX + point.x * cos - point.y * sin,
        y: courtCenterY + point.x * sin + point.y * cos,
      });

      const drawLine = (
        from: { x: number; y: number },
        to: { x: number; y: number },
        lineWidth: number,
        alpha = 1
      ) => {
        const start = transformPoint(from);
        const end = transformPoint(to);

        ctx.globalAlpha = alpha;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      };

      const drawClosedPolyline = (
        points: { x: number; y: number }[],
        lineWidth: number,
        alpha = 1
      ) => {
        const worldPoints = points.map(transformPoint);
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(worldPoints[0].x, worldPoints[0].y);
        worldPoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.stroke();
      };

      // コート面
      const courtPolygon = [
        { x: -halfDoublesWidth, y: -halfLength },
        { x: halfDoublesWidth, y: -halfLength },
        { x: halfDoublesWidth, y: halfLength },
        { x: -halfDoublesWidth, y: halfLength },
      ];
      const worldCourtPolygon = courtPolygon.map(transformPoint);

      ctx.fillStyle = courtSurfaceFill;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(worldCourtPolygon[0].x, worldCourtPolygon[0].y);
      worldCourtPolygon
        .slice(1)
        .forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = courtLineStroke;
      const mainLineWidth = Math.max(1.6, 2.2 * scale);
      const detailLineWidth = Math.max(1.1, 1.6 * scale);

      // 外枠（ダブルスコート）
      drawClosedPolyline(courtPolygon, mainLineWidth);

      // シングルスサイドライン
      drawLine(
        { x: -halfSinglesWidth, y: -halfLength },
        { x: -halfSinglesWidth, y: halfLength },
        detailLineWidth
      );
      drawLine(
        { x: halfSinglesWidth, y: -halfLength },
        { x: halfSinglesWidth, y: halfLength },
        detailLineWidth
      );

      // サービスライン（ネットから6.4m）
      drawLine(
        { x: -halfSinglesWidth, y: -serviceLineY },
        { x: halfSinglesWidth, y: -serviceLineY },
        detailLineWidth
      );
      drawLine(
        { x: -halfSinglesWidth, y: serviceLineY },
        { x: halfSinglesWidth, y: serviceLineY },
        detailLineWidth
      );

      // センターサービスライン
      drawLine(
        { x: 0, y: -serviceLineY },
        { x: 0, y: serviceLineY },
        detailLineWidth
      );

      // ベースライン中央のセンターマーク
      drawLine(
        { x: 0, y: -halfLength },
        { x: 0, y: -halfLength + centerMarkLength },
        detailLineWidth
      );
      drawLine(
        { x: 0, y: halfLength },
        { x: 0, y: halfLength - centerMarkLength },
        detailLineWidth
      );

      // ネット（軌道に対して垂直）
      const netLineWidth = Math.max(2, 2.8 * scale);
      drawLine(
        { x: -halfDoublesWidth, y: 0 },
        { x: halfDoublesWidth, y: 0 },
        netLineWidth,
        1
      );

      // ネット帯の表現
      const netBandOffset = Math.max(2.5, 3.5 * scale);
      drawLine(
        { x: -halfDoublesWidth, y: -netBandOffset },
        { x: halfDoublesWidth, y: -netBandOffset },
        detailLineWidth,
        0.45
      );
      drawLine(
        { x: -halfDoublesWidth, y: netBandOffset },
        { x: halfDoublesWidth, y: netBandOffset },
        detailLineWidth,
        0.45
      );

      // ネットポスト
      const postRadius = Math.max(2.4, 3.2 * scale);
      const leftPost = transformPoint({ x: -halfDoublesWidth, y: 0 });
      const rightPost = transformPoint({ x: halfDoublesWidth, y: 0 });
      ctx.fillStyle = netPostFill;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(leftPost.x, leftPost.y, postRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightPost.x, rightPost.y, postRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    };

    // 硬式テニスボール風の描画（蛍光イエローグリーン＋白い縫い目）
    const drawTennisBall = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      ballSize: number
    ) => {
      // 影
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.beginPath();
      ctx.ellipse(cx + 3, cy + 3, ballSize * 0.88, ballSize * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      // 本体：硬式テニスボールの蛍光イエローグリーン（オプティックイエローに近い色）
      const gradient = ctx.createRadialGradient(
        cx - ballSize * 0.35,
        cy - ballSize * 0.35,
        0,
        cx,
        cy,
        ballSize
      );
      gradient.addColorStop(0, "#e8ff8a");
      gradient.addColorStop(0.5, "#d4f537");
      gradient.addColorStop(1, "#b8d430");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, ballSize, 0, Math.PI * 2);
      ctx.fill();

      // 白い縫い目（ボール内にクリップして楕円弧で自然なシームを1本の曲線に）
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ballSize - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
      ctx.lineWidth = Math.max(2.5, ballSize * 0.2);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      // テニスボールの縫い目：中心で交わる1本のゆるいS字カーブ（楕円の弧をボール内だけ描画）
      ctx.ellipse(cx, cy, ballSize * 0.92, ballSize * 0.38, 0, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, ballSize * 0.92, ballSize * 0.38, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 光沢ハイライト
      const highlightGradient = ctx.createRadialGradient(
        cx - ballSize * 0.4,
        cy - ballSize * 0.4,
        0,
        cx - ballSize * 0.35,
        cy - ballSize * 0.35,
        ballSize * 0.4
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.65)");
      highlightGradient.addColorStop(0.6, "rgba(255, 255, 255, 0.15)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(cx - ballSize * 0.35, cy - ballSize * 0.35, ballSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    };

    // ボールの描画（硬式テニスボール）
    const drawBall = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      phase: string
    ) => {
      const scale = Math.min(window.innerWidth / 1920, 1);
      const ballSize = 16 * scale;

      // ボールが下に落ちる前に消す（画面の高さの1.1倍を超えたら非表示）
      const maxVisibleY = window.innerHeight * 1.1;
      if (y > maxVisibleY) {
        return;
      }

      if (phase === "idle" || phase === "preparing") {
        const playerX = window.innerWidth * 0.85;
        const playerY = window.innerHeight * 0.7;
        const playerSize = 120 * scale;
        const bodyHeight = playerSize * 0.55;
        const neckHeight = playerSize * 0.08;
        const headRadius = playerSize * 0.22;
        const headY = playerY - bodyHeight - neckHeight - headRadius * 0.3;
        const headTopY = headY - headRadius;
        const ballX = playerX;
        const ballY = headTopY - 20 * scale;
        drawTennisBall(ctx, ballX, ballY, ballSize);
        return;
      }

      drawTennisBall(ctx, x, y, ballSize);
    };

    // アニメーションループ
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = stateRef.current;
      const { phase, progress } = state;

      const scale = Math.min(window.innerWidth / 1920, 1);

      // プレイヤーの位置（画面右側）
      const playerX = window.innerWidth * 0.85;
      const playerY = window.innerHeight * 0.7;

      // フェーズに応じたラケットの角度（頭の上でボールを打つ）
      // 0度 = 左、90度 = 上、-90度 = 下
      let currentRacketAngle = 0;
      const playerSize = 120 * scale;
      const bodyHeight = playerSize * 0.55;
      const neckHeight = playerSize * 0.08;
      const headRadius = playerSize * 0.22;
      const headY = playerY - bodyHeight - neckHeight - headRadius * 0.3;
      const headTopY = headY - headRadius;
      
      if (phase === "preparing") {
        // 準備: ラケットを後ろに上げる（上方向、頭の上に）
        currentRacketAngle = 75 + progress * 15; // 75度から90度へ（真上）
      } else if (phase === "serving") {
        // サーブ: 頭の上でボールを打つ
        if (progress < 0.5) {
          // 前半：ラケットを頭の上に上げる
          currentRacketAngle = 90; // 真上
        } else {
          // 後半：ボールを打つ（上から左前へ）
          const serveProgress = (progress - 0.5) / 0.5;
          currentRacketAngle = 90 - serveProgress * 120; // 90度（真上）から-30度（左前上）へ
        }
      } else if (phase === "ballFlying") {
        // ボールが飛んでいる間: ラケットは前方（左前上を向く）
        currentRacketAngle = -30;
      }

      // ボールの位置と速度（頭の上から打つ、ラケットと当たる位置）
      const ballStartX = playerX;
      const ballStartY = headTopY - 20 * scale; // ラケットと当たる位置
      
      if (phase === "serving" && progress > 0.6) {
        // サーブの後半でボールを打ち出す（頭の上から・打つタイミングを遅く）
        const serveProgress = (progress - 0.6) / 0.4;
        let targetX = window.innerWidth * 0.5;
        let targetY = window.innerHeight * 0.1;
        
        // ターゲット位置をサービスボックス内に制限
        const constrainedTarget = constrainTargetToServiceBox(
          ballStartX,
          ballStartY,
          targetX,
          targetY
        );
        targetX = constrainedTarget.x;
        targetY = constrainedTarget.y;

        // 放物線軌道を計算（より自然な軌道）
        const t = serveProgress;
        const dx = targetX - ballStartX;
        const dy = targetY - ballStartY;
        
        // 放物線の係数（初速度と重力を考慮）
        const vx0 = dx * 0.026; // 水平方向の初速度
        const vy0 = dy * 0.023 - 5; // 垂直方向の初速度（上向きに）
        const gravity = 0.37; // 重力
        
        state.ballX = ballStartX + vx0 * t * 50;
        state.ballY = ballStartY + vy0 * t * 50 + 0.5 * gravity * (t * 50) * (t * 50);
        state.ballVx = vx0;
        state.ballVy = vy0;
      } else if (phase === "ballFlying") {
        if (state.ballX === 0 && state.ballY === 0) {
          let targetX = window.innerWidth * 0.25;
          let targetY = window.innerHeight * 0.15;
          
          // ターゲット位置をサービスボックス内に制限
          const constrainedTarget = constrainTargetToServiceBox(
            ballStartX,
            ballStartY,
            targetX,
            targetY
          );
          targetX = constrainedTarget.x;
          targetY = constrainedTarget.y;
          
          const dx = targetX - ballStartX;
          const dy = targetY - ballStartY;
          
          state.ballX = ballStartX;
          state.ballY = ballStartY;
          state.ballVx = dx * 0.02; // 水平方向の初速度
          state.ballVy = dy * 0.02 - 5; // 垂直方向の初速度（上向きに）
        }
        // 物理演算でボールを動かす（放物線軌道・軌道はそのままに速度だけ遅く）
        const ballTimeScale = 0.55; // 1より小さいと遅くなる。軌道は変わらない。
        state.ballX += state.ballVx * ballTimeScale;
        state.ballY += state.ballVy * ballTimeScale;
        state.ballVy += 0.3 * ballTimeScale;

        // 画面外に出たらボールを止める（速度を0にして落下を止める）
        const offScreenMargin = 50;
        const bottomLimit = window.innerHeight * 1.05; // 描画非表示(1.1)より手前で止める
        const isOffScreen =
          state.ballY > bottomLimit ||
          state.ballX < -offScreenMargin ||
          state.ballX > window.innerWidth + offScreenMargin;
        if (isOffScreen) {
          state.ballVx = 0;
          state.ballVy = 0;
          state.ballX = Math.max(-offScreenMargin, Math.min(window.innerWidth + offScreenMargin, state.ballX));
          state.ballY = Math.min(bottomLimit, state.ballY);
        }
      }

      // 学歴セクション内かどうかを判定
      const { educationTop, careerTop } = getSectionPositions();
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportCenter = scrollY + viewportHeight / 2;
      const isInEducationSection = educationTop > 0 && careerTop > 0 && 
        viewportCenter >= educationTop && viewportCenter < careerTop;
      
      // 描画（学歴セクション内の場合のみコート・プレイヤー・ボールを表示）
      const displayPhase = phase === "idle" ? "preparing" : phase;
      if (phase !== "complete" && isInEducationSection) {
        let targetX = window.innerWidth * 0.15;
        let targetY = window.innerHeight * 0.25;
        
        // ターゲット位置をサービスボックス内に制限
        const constrainedTarget = constrainTargetToServiceBox(
          ballStartX,
          ballStartY,
          targetX,
          targetY
        );
        targetX = constrainedTarget.x;
        targetY = constrainedTarget.y;
        
        drawCourt(ctx, ballStartX, ballStartY, targetX, targetY);
        drawPlayer(ctx, playerX, playerY, currentRacketAngle, displayPhase, progress);
        drawBall(ctx, state.ballX, state.ballY, displayPhase);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // スクロールイベント
    const handleScroll = () => {
      updateScrollProgress();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollProgress();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
