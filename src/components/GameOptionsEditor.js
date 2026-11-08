import React from 'react';
import { View } from 'react-native';
import { Text, Switch } from '../i18n/ui';
import { activityDefaults, fetishTypes } from '../domain/profiles';
import { categoryLabels, fetishLabels } from './ProfileEditor';
import { ui } from '../theme';
import { defaultGameOptions } from '../domain/options';
export { defaultGameOptions } from '../domain/options';
export default function GameOptionsEditor({ options, onChange }) {
 const o={...defaultGameOptions,...options,activities:{...activityDefaults,...options?.activities}};
 const flags=[['parallel','Csapatfeladatok'],['questionsForAll','A kérdésekre mindenki válaszol'],['partnerWheel','Partner kijelölése kerékkel'],['bodyWheel','Testrész kijelölése kerékkel'],['trackWardrobe','Ruházat követése']];
 return <View style={ui.panel}><Text style={ui.heading}>Játék beállításai</Text>
  {Object.entries(categoryLabels).map(([id,label])=><View key={id} style={ui.row}><Text style={ui.text}>{label}</Text><Switch accessibilityLabel={label} value={o.activities[id]} onValueChange={value=>onChange({...o,activities:{...o.activities,[id]:value}})} /></View>)}
  {flags.map(([id,label])=><View key={id} style={ui.row}><Text style={ui.text}>{label}</Text><Switch accessibilityLabel={label} value={o[id]} onValueChange={value=>onChange({...o,[id]:value})} /></View>)}
 </View>;
}
