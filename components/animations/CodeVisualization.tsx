"use client";

import { useEffect, useRef, useState } from "react";

// アクセシビリティ: アニメーションを減らす設定を確認
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

interface CodeLine {
  fullText: string; // 完全なテキスト
  displayedLength: number; // 現在表示されている文字数
  x: number;
  y: number;
  opacity: number;
  typingSpeed: number; // タイピング速度（フレームごとの文字数）
  currentFrame: number; // 現在のフレーム数
}

export function CodeVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const codeLinesRef = useRef<CodeLine[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // アニメーションを減らす設定の場合は非表示
    if (prefersReducedMotion()) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;


    // コードの色を緑色に設定
    const getCodeColor = () => {
      return "hsl(120, 100%, 50%)"; // 緑色
    };

    // テーマの検出
    const detectTheme = () => {
      if (typeof window !== "undefined") {
        const isDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "dark" : "light";
      }
      return "dark";
    };

    const currentTheme = detectTheme();
    setTheme(currentTheme);

    // 定数の定義
    const lineHeight = 20; // 行の高さ
    const padding = 40; // 上下のパディング

    // コードスニペットのサンプル（長さで分類）
    const shortSnippets = [
      "score = 0",
      "return score",
      "const data = {}",
      "id: string",
      "name: string",
      "return true",
      "if (x) {",
      "}",
      "const x = 0",
      "x += 1",
    ];
    
    const mediumSnippets = [
      "def recommend_medicine(symptoms):",
      "  if is_emergency(symptoms):",
      "    return '受診を勧めます'",
      "  candidates = score_medicines(symptoms)",
      "  return filter_by_safety(candidates)",
      "class MedicineScorer:",
      "  def calculate_score(self, medicine, user):",
      "    score += self.efficacy_score(medicine, user)",
      "    score -= self.risk_penalty(medicine, user)",
      "SELECT medicine_id, efficacy_score",
      "FROM medicines",
      "WHERE category = $1",
      "ORDER BY efficacy_score DESC",
      "const particles = useRef<Particle[]>([]);",
      "particles.current.forEach((particle) => {",
      "  particle.x += particle.vx;",
      "  particle.y += particle.vy;",
      "});",
      "const model = new TensorFlowModel();",
      "model.train(trainingData);",
      "const prediction = model.predict(input);",
      "interface Medicine {",
      "  id: string;",
      "  name: string;",
      "  efficacy: number;",
      "}",
      "const medicines: Medicine[] = [];",
      "medicines.filter(m => m.efficacy > 0.8);",
    ];
    
    const longSnippets = [
      "async function fetchRecommendation(input) {",
      "  const response = await fetch('/api/recommend', {",
      "    method: 'POST',",
      "    body: JSON.stringify({ symptoms: input })",
      "  });",
      "  return response.json();",
      "}",
      "function calculateRisk(medicine, user) {",
      "  const baseRisk = medicine.baseRisk;",
      "  const userRisk = user.allergies.length * 0.1;",
      "  return baseRisk + userRisk;",
      "}",
      "export const API_ENDPOINT = '/api/recommend';",
      "const response = await fetch(API_ENDPOINT);",
      "const data = await response.json();",
      "return data.recommendations;",
      "const result = await Promise.all([",
      "  fetchUserData(userId),",
      "  fetchMedicineData(medicineId),",
      "  calculateCompatibility(userId, medicineId)",
      "]);",
      "const processedData = result.map(item => ({",
      "  ...item,",
      "  timestamp: new Date().toISOString()",
      "}));",
    ];

    // コード行の初期化（タイピングアニメーション用、下から上に配置、左端のみ）
    const initCodeLines = () => {
      if (canvas.width === 0 || canvas.height === 0) return;
      const lines: CodeLine[] = [];
      
      // 画面の7割の高さまで表示
      const availableHeight = canvas.height * 0.7;
      const lineCount = Math.floor(availableHeight / lineHeight);
      
      for (let i = 0; i < lineCount; i++) {
        // 下から上に向かって配置
        const row = i; // 行番号（0から始まる）
        const startY = canvas.height - padding; // 下から開始
        const y = startY - (row * lineHeight); // 上に向かって配置
        
        // 下に行くほど長いコードを選ぶ（乱雑なグラデーション）
        // 下（row=0）= 長いコード、上（row=大きい）= 短いコード
        const totalRows = lineCount;
        const basePositionRatio = 1 - (row / totalRows); // 1（下）から0（上）の基本比率（反転）
        
        // 乱雑なグラデーションを作るために小さなランダムなオフセットを加える
        // 行ごとに異なるランダムシードを使用（rowベース）
        const randomSeed = (row * 17 + i * 23) % 1000; // 行とインデックスに基づく疑似乱数
        const randomOffset = (Math.sin(randomSeed) * 0.15 + Math.cos(randomSeed * 1.7) * 0.1); // -0.25から0.25の範囲（小さめ）
        const noisyPositionRatio = Math.max(0, Math.min(1, basePositionRatio + randomOffset));
        
        // コードの長さを計算して右端に達するように調整（基本的な傾向を保ちつつ乱雑に）
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.font = "14px 'Courier New', 'Monaco', 'Menlo', monospace";
        
        const startX = 50;
        const endX = canvas.width - padding;
        const maxTargetWidth = endX - startX;
        
        // 目標幅の比率：基本的にはbasePositionRatioに基づき、小さな変動を加える
        // 確実に下に行くほど長くなるように、basePositionRatioを主軸とする
        const widthVariation = Math.sin(randomSeed * 0.5) * 0.1 + Math.cos(randomSeed * 0.7) * 0.05; // -0.15から0.15（小さめ）
        // basePositionRatioを主軸として、最小20%から最大100%まで
        const targetWidthRatio = Math.max(0.2, Math.min(1.0, basePositionRatio * 0.8 + 0.2 + widthVariation));
        const targetWidth = maxTargetWidth * targetWidthRatio;
        
        // 基準となるコードを選ぶ（位置に応じて、ただし乱雑さも加える）
        let baseText: string;
        if (basePositionRatio < 0.3) {
          // 上の30%は短いコード
          baseText = shortSnippets[Math.floor(Math.random() * shortSnippets.length)];
        } else if (basePositionRatio < 0.7) {
          // 中間40%は中程度のコード
          baseText = mediumSnippets[Math.floor(Math.random() * mediumSnippets.length)];
        } else {
          // 下の30%は長いコード
          baseText = longSnippets[Math.floor(Math.random() * longSnippets.length)];
        }
        
        // 基準テキストの幅を測定
        let currentText = baseText;
        let currentWidth = ctx.measureText(currentText).width;
        
        // 右端に達するまでテキストを繰り返し追加（位置に応じた長さを保ちつつ乱雑に）
        const separator = "  ";
        let iterationCount = 0;
        const maxIterations = 100; // 無限ループを防ぐ
        
        while (currentWidth < targetWidth && iterationCount < maxIterations) {
          iterationCount++;
          
          // 追加するテキストを選ぶ（位置に応じて、基本的な傾向を保つ）
          let additionalText: string;
          // 基本的には位置に応じて選ぶが、時々ランダムに変える（乱雑さ）
          const useRandom = Math.random() < 0.2; // 20%の確率でランダムに選ぶ
          
          if (useRandom) {
            // ランダムに選ぶ（乱雑さ）
            const randomChoice = Math.random();
            if (randomChoice < 0.33) {
              additionalText = shortSnippets[Math.floor(Math.random() * shortSnippets.length)];
            } else if (randomChoice < 0.67) {
              additionalText = mediumSnippets[Math.floor(Math.random() * mediumSnippets.length)];
            } else {
              additionalText = longSnippets[Math.floor(Math.random() * longSnippets.length)];
            }
          } else {
            // 位置に応じて選ぶ（基本的な傾向）
            if (basePositionRatio < 0.3) {
              additionalText = shortSnippets[Math.floor(Math.random() * shortSnippets.length)];
            } else if (basePositionRatio < 0.7) {
              additionalText = mediumSnippets[Math.floor(Math.random() * mediumSnippets.length)];
            } else {
              additionalText = longSnippets[Math.floor(Math.random() * longSnippets.length)];
            }
          }
          
          const newText = currentText + separator + additionalText;
          const newWidth = ctx.measureText(newText).width;
          
          // 右端を超えないように調整
          if (newWidth > targetWidth) {
            // 右端を超える場合は、文字を1つずつ削って調整
            let adjustedText = newText;
            while (ctx.measureText(adjustedText).width > targetWidth && adjustedText.length > currentText.length) {
              adjustedText = adjustedText.slice(0, -1);
            }
            currentText = adjustedText;
            break;
          }
          
          currentText = newText;
          currentWidth = newWidth;
        }
        
        // 最初から半分程度は表示された状態にする
        const initialDisplayLength = Math.floor(currentText.length * 0.5);
        
        lines.push({
          fullText: currentText,
          displayedLength: initialDisplayLength,
          x: startX, // 左端に固定
          y: y,
          opacity: Math.random() * 0.25 + 0.2, // 0.2-0.45の透明度
          typingSpeed: Math.random() * 0.15 + 0.1, // タイピング速度（0.1-0.25文字/フレーム）
          currentFrame: Math.floor(Math.random() * 200), // 開始タイミングをずらす
        });
      }
      codeLinesRef.current = lines;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // リサイズ時に再初期化
      if (canvas.width > 0 && canvas.height > 0) {
        initCodeLines();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 初期化関数は後で呼ばれる

    // コード行の描画（タイピングアニメーション、緑色）
    const drawCodeLine = (
      ctx: CanvasRenderingContext2D,
      line: CodeLine
    ) => {
      if (line.displayedLength === 0) return; // まだ何も表示されていない場合はスキップ
      
      ctx.save();
      ctx.globalAlpha = line.opacity;
      ctx.fillStyle = getCodeColor();
      ctx.font = "14px 'Courier New', 'Monaco', 'Menlo', monospace";
      
      // 現在表示すべき文字列を取得
      const displayedText = line.fullText.substring(0, Math.floor(line.displayedLength));
      
      // カーソルを表示（最後の文字の後に）
      const textWidth = ctx.measureText(displayedText).width;
      const cursorX = line.x + textWidth;
      
      // テキストを描画
      ctx.fillText(displayedText, line.x, line.y);
      
      // タイピングカーソルを描画（点滅効果）
      if (line.displayedLength < line.fullText.length) {
        const cursorOpacity = Math.sin(line.currentFrame * 0.2) * 0.5 + 0.5;
        ctx.globalAlpha = line.opacity * cursorOpacity;
        ctx.fillRect(cursorX, line.y - 12, 8, 14);
      }
      
      ctx.restore();
    };

    // アニメーションループ（タイピングアニメーション）
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // コード行の更新と描画
      if (codeLinesRef.current.length > 0) {
        codeLinesRef.current.forEach((line) => {
          line.currentFrame++;
          
          // タイピングアニメーション
          if (line.displayedLength < line.fullText.length) {
            // 文字を1つずつ増やす
            line.displayedLength += line.typingSpeed;
            if (line.displayedLength > line.fullText.length) {
              line.displayedLength = line.fullText.length;
            }
          } else {
            // 完全に表示された後、一定時間経過したらリセット
            const resetDelay = 300; // リセットまでのフレーム数
            if (line.currentFrame > resetDelay) {
              // 新しいコードを選んでリセット（基本的な傾向を保ちつつ乱雑に、右端に達するように）
              const availableHeight = canvas.height * 0.7;
              const totalRows = Math.floor(availableHeight / lineHeight);
              const row = Math.floor((canvas.height - padding - line.y) / lineHeight);
              const basePositionRatio = 1 - (row / totalRows); // 1（下）から0（上）の基本比率（反転）
              
              // 乱雑なグラデーションを作るために小さなランダムなオフセットを加える
              const randomSeed = (row * 17 + Date.now() % 1000) % 1000;
              const randomOffset = (Math.sin(randomSeed) * 0.15 + Math.cos(randomSeed * 1.7) * 0.1);
              const noisyPositionRatio = Math.max(0, Math.min(1, basePositionRatio + randomOffset));
              
              // コードの長さを計算して右端に達するように調整（基本的な傾向を保ちつつ乱雑に）
              const startX = 50;
              const endX = canvas.width - padding;
              const maxTargetWidth = endX - startX;
              
              // 目標幅の比率：基本的にはbasePositionRatioに基づき、小さな変動を加える
              const widthVariation = Math.sin(randomSeed * 0.5) * 0.1 + Math.cos(randomSeed * 0.7) * 0.05;
              const targetWidthRatio = Math.max(0.2, Math.min(1.0, basePositionRatio * 0.8 + 0.2 + widthVariation));
              const targetWidth = maxTargetWidth * targetWidthRatio;
              
              // 基準となるコードを選ぶ（位置に応じて、ただし乱雑さも加える）
              let baseText: string;
              if (basePositionRatio < 0.3) {
                baseText = shortSnippets[Math.floor(Math.random() * shortSnippets.length)];
              } else if (basePositionRatio < 0.7) {
                baseText = mediumSnippets[Math.floor(Math.random() * mediumSnippets.length)];
              } else {
                baseText = longSnippets[Math.floor(Math.random() * longSnippets.length)];
              }
              
              ctx.font = "14px 'Courier New', 'Monaco', 'Menlo', monospace";
              
              // 基準テキストの幅を測定
              let currentText = baseText;
              let currentWidth = ctx.measureText(currentText).width;
              
              // 右端に達するまでテキストを繰り返し追加（位置に応じた長さを保ちつつ乱雑に）
              const separator = "  ";
              let iterationCount = 0;
              const maxIterations = 100;
              
              while (currentWidth < targetWidth && iterationCount < maxIterations) {
                iterationCount++;
                
                // 追加するテキストを選ぶ（位置に応じて、基本的な傾向を保つ）
                let additionalText: string;
                const useRandom = Math.random() < 0.2; // 20%の確率でランダムに選ぶ
                
                if (useRandom) {
                  const randomChoice = Math.random();
                  if (randomChoice < 0.33) {
                    additionalText = shortSnippets[Math.floor(Math.random() * shortSnippets.length)];
                  } else if (randomChoice < 0.67) {
                    additionalText = mediumSnippets[Math.floor(Math.random() * mediumSnippets.length)];
                  } else {
                    additionalText = longSnippets[Math.floor(Math.random() * longSnippets.length)];
                  }
                } else {
                  if (basePositionRatio < 0.3) {
                    additionalText = shortSnippets[Math.floor(Math.random() * shortSnippets.length)];
                  } else if (basePositionRatio < 0.7) {
                    additionalText = mediumSnippets[Math.floor(Math.random() * mediumSnippets.length)];
                  } else {
                    additionalText = longSnippets[Math.floor(Math.random() * longSnippets.length)];
                  }
                }
                
                const newText = currentText + separator + additionalText;
                const newWidth = ctx.measureText(newText).width;
                
                // 右端を超えないように調整
                if (newWidth > targetWidth) {
                  let adjustedText = newText;
                  while (ctx.measureText(adjustedText).width > targetWidth && adjustedText.length > currentText.length) {
                    adjustedText = adjustedText.slice(0, -1);
                  }
                  currentText = adjustedText;
                  break;
                }
                
                currentText = newText;
                currentWidth = newWidth;
              }
              
              line.fullText = currentText;
              line.displayedLength = 0;
              line.currentFrame = 0;
            }
          }
          
          drawCodeLine(ctx, line);
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // 初期化後にアニメーション開始
    const startAnimation = () => {
      if (canvas.width > 0 && canvas.height > 0) {
        initCodeLines();
        animate();
      } else {
        setTimeout(startAnimation, 50);
      }
    };

    startAnimation();

    // テーマ変更の監視
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      mediaQuery.removeEventListener("change", handleThemeChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
