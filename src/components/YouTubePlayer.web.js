import { Text } from "../i18n/ui";
import React, { useEffect, useRef, useState } from 'react';
import 'react-native';
import { ui } from '../theme';
let api;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!api) api = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => {
      api = null;
      reject(new Error('Nem érhető el a YouTube.'));
    };
    document.head.appendChild(script);
  });
  return api;
}
export default function YouTubePlayer({
  videoId,
  autoStart,
  onPause
}) {
  const host = useRef(null);
  const [error, setError] = useState('');
  const pause = useRef(onPause);
  useEffect(() => {
    pause.current = onPause;
  }, [onPause]);
  useEffect(() => {
    let disposed = false;
    let player;
    const stopHidden = () => {
      if (document.hidden) player?.pauseVideo?.();
    };
    document.addEventListener('visibilitychange', stopHidden);
    loadApi().then(YT => {
      if (disposed) return;
      const node = document.createElement('div');
      host.current.replaceChildren(node);
      player = new YT.Player(node, {
        width: '100%',
        height: 210,
        videoId,
        playerVars: {
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            if (!disposed && autoStart && !document.hidden) player.playVideo();
          },
          onError: () => {
            if (!disposed) setError('A videó itt nem játszható le. Válassz másik dalt.');
          },
          onAutoplayBlocked: () => {
            if (!disposed) setError('Az indításhoz érintsd meg a lejátszót.');
          },
          onStateChange: event => {
            if (!disposed && event.data === 2) pause.current?.();
          }
        }
      });
    }).catch(e => {
      if (!disposed) setError(e.message);
    });
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', stopHidden);
      player?.destroy?.();
    };
  }, [videoId, autoStart]);
  return <><div ref={host} style={{
      width: '100%',
      minHeight: 210
    }} />{!!error && <Text style={ui.error}>{error}</Text>}</>;
}
