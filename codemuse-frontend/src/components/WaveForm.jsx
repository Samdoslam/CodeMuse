  import { useEffect, useRef, useState } from "react";

  export default function Waveform({ isRecording }) {
    const [bars, setBars] = useState(Array(40).fill(0));
    const rafRef = useRef();
    const audioRef = useRef();

    useEffect(() => {
      if (!isRecording) {
        setBars(Array(40).fill(0));
        cancelAnimationFrame(rafRef.current);
        if (audioRef.current) {
          audioRef.current.getTracks().forEach(track => track.stop());
        }
        return;
      }

      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioRef.current = stream;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          // Take lower half for smoother look
          const sliced = Array.from(dataArray.slice(0, bars.length));
          setBars(sliced.map(v => v / 255)); // normalize 0-1
          rafRef.current = requestAnimationFrame(update);
        };
        update();
      });

      return () => cancelAnimationFrame(rafRef.current);
    }, [isRecording]);

    return (
      <div className="flex items-center justify-center">
        <svg width="100%" height="120" viewBox={`0 0 ${bars.length * 6} 120`}>
          {bars.map((value, i) => {
            const height = value * 50 + 4;
            const x = i * 6;
            return (
              <g key={i}>
                {/* top half */}
                <rect
                  x={x}
                  y={50 - height}
                  width="4"
                  height={height}
                  rx="2"
                  fill="url(#waveGradient)"
                />
                {/* bottom half (mirror) */}
                <rect
                  x={x}
                  y={50}
                  width="4"
                  height={height}
                  rx="2"
                  fill="url(#waveGradient)"
                />
              </g>
            );
          })}
          <defs>
            <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }
