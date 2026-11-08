import React from 'react';
import { View } from 'react-native';
import { Text } from '../i18n/ui';
import { useTranslation } from '../i18n/context';
import ActionButton from './ActionButton';
import { ui, levels } from '../theme';
export default function LevelSelector({level,onChange,suggestion,onDismiss}){
 const t=useTranslation();
 return <View style={{gap:8}}><Text style={ui.heading}>Aktuális szint</Text><View style={ui.row}>{[1,2,3,4,5].map(n=><ActionButton key={n} title={`${n} · ${t(levels[n])}`} secondary selected={level===n} onPress={()=>onChange(n)} />)}</View>
 {suggestion&&<View style={ui.panel}><Text style={ui.text}>Négy kör eltelt. Szeretnétek szintet emelni?</Text><ActionButton title="Következő szint" onPress={()=>onChange(suggestion)} /><ActionButton title="Maradunk ezen a szinten" secondary onPress={onDismiss} /></View>}
 </View>;
}
