import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

export default function TypewriterMarkdown({ text, speed = 15, animate = true, onComplete }: { text: string; speed?: number; animate?: boolean; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, animate, onComplete]);

  return <Markdown>{displayedText}</Markdown>;
}
