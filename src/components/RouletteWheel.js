import React, { useState, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Text } from '../i18n/ui';
import ActionButton from './ActionButton';
import { ui, colors } from '../theme';
export default function RouletteWheel({title,labels,onSpin}) {
 const [angle]=useState(()=>new Animated.Value(0));const [busy,setBusy]=useState(false);
 useEffect(()=>()=>angle.stopAnimation(),[angle]);
 function spin(){if(busy)return;setBusy(true);const index=Math.floor(Math.random()*Math.max(1,labels.length));angle.setValue(0);const destination=1440+(90-index*360/Math.max(1,labels.length)+360)%360;Animated.timing(angle,{toValue:destination,duration:1200,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start(({finished})=>{setBusy(false);if(finished)onSpin(index);});}
 return <View style={ui.panel}><Text style={ui.heading}>{title}</Text><View style={{alignItems:'center'}}><Animated.View style={{width:230,height:230,borderRadius:115,borderWidth:3,borderColor:colors.accent,backgroundColor:colors.background,transform:[{rotate:angle.interpolate({inputRange:[0,1800],outputRange:['0deg','1800deg']})}]}}>
  {labels.map((label,i)=>{const a=2*Math.PI*i/labels.length;return <View key={i} style={{position:'absolute',left:75+Math.cos(a)*70,top:96+Math.sin(a)*78,width:80}}><Text numberOfLines={2} style={[ui.muted,{textAlign:'center',fontSize:12}]}>{label}</Text></View>;})}
 </Animated.View><Text style={ui.text}>▼</Text></View><ActionButton title="Pörgetés" disabled={busy} onPress={spin} /></View>;
}
