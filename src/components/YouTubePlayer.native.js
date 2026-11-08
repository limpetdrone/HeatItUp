import { Text } from "../i18n/ui";
import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import { ui } from '../theme';
export default function YouTubePlayer({
  videoId,
  autoStart,
  onPause
}) {
  const web = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state !== 'active') web.current?.injectJavaScript('player?.pauseVideo();true;');
    });
    return () => listener.remove();
  }, []);
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#130D18"><div id="player"></div><script src="https://www.youtube.com/iframe_api"></script><script>var player;function send(x){window.ReactNativeWebView.postMessage(x)}function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'100%',height:210,videoId:${JSON.stringify(videoId)},playerVars:{playsinline:1},events:{onReady:function(){${autoStart ? 'player.playVideo();' : ''}},onError:function(){send('error')},onAutoplayBlocked:function(){send('gesture')},onStateChange:function(e){if(e.data===2)send('pause')}}})}</script></body></html>`;
  return <><WebView ref={web} source={{
      html,
      baseUrl: 'https://www.youtube.com'
    }} style={{
      height: 210,
      minHeight: 210,
      maxHeight: 210
    }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={!autoStart} onError={() => setError('A lejátszó nem érhető el.')} onMessage={e => {
      if (e.nativeEvent.data === 'pause') onPause?.();else setError(e.nativeEvent.data === 'gesture' ? 'Érintsd meg a lejátszót az indításhoz.' : 'A videó itt nem játszható le.');
    }} />{!!error && <Text style={ui.error}>{error}</Text>}</>;
}
