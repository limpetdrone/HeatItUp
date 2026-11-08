import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Switch } from '../i18n/ui';
import { useTranslation } from '../i18n/context';
import { normalizeProfile, activityCategories, clothingTypes } from '../domain/profiles';
import { bodyParts } from '../domain/assignments';
import ActionButton from './ActionButton';
import { ui, colors } from '../theme';
export const categoryLabels = { oral:'Orális szex', penetration:'Behatolás', anal:'Anális szex', femaleSameGender:'Nő–nő feladatok', maleSameGender:'Férfi–férfi feladatok' };
export const clothingLabels = {shirt:'Felső',trousers:'Nadrág',skirt:'Szoknya',dress:'Ruha',bra:'Melltartó',underwear:'Alsónemű',socks:'Zokni',shoes:'Cipő',other:'Egyéb ruhadarab'};
export const fetishLabels = {blindfold:'Szemkötő',roleplay:'Szerepjáték',feet:'Láb'};
export default function ProfileEditor({ profile, profiles, onChange, onPair, makeId, wardrobeOnly = false, globalActivities = {} }) {
  const t = useTranslation(); const p = normalizeProfile(profile); const [details,setDetails] = useState(false);
  const patch = change => onChange({...p,...change});
  const preferences = change => patch({preferences:{...p.preferences,...change}});
  function rule(category, change) { preferences({activities:{...p.preferences.activities,[category]:{...p.preferences.activities[category],...change}}}); }
  const toggle = (list,id) => list.includes(id) ? list.filter(x=>x!==id) : [...list,id];
  return <View style={{gap:12}}>
    {!wardrobeOnly && <>
      <TextInput
        autoFocus={!wardrobeOnly}
        selectTextOnFocus={true}
        accessibilityLabel="Név"
        placeholder={t('Játékos neve')}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        value={p.name}
        onChangeText={name=>patch({name})}
        style={{color:colors.text,borderColor:colors.muted,borderWidth:1,borderRadius:12,padding:12,fontSize:16}}
      />
      <Text style={ui.heading}>Nem / identitás</Text>
      <View style={ui.row}>
        {[['male','Férfi'],['female','Nő']].map(([value,label])=><ActionButton key={value} title={label} selected={p.gender===value} secondary onPress={()=>patch({gender:value})} />)}
      </View>
      <Text style={ui.heading}>Pár megjelölése</Text><ActionButton title="Nincs pár" secondary selected={!p.partnerId} onPress={()=>onPair(null)} />
      {profiles.filter(other=>other.id!==p.id).map(other=><ActionButton key={other.id} verbatim title={other.name || `${profiles.indexOf(other) + 1}. ${t('játékos')}`} selected={p.partnerId===other.id} secondary onPress={()=>onPair(other.id)} />)}
      <Text style={ui.muted}>A párok megjelölése nem ír felül személyes határokat.</Text>
      <ActionButton title={details?'Személyes beállítások bezárása':'Személyes beállítások'} secondary onPress={()=>setDetails(!details)} />
      {details && <View style={{gap:16}}>
        {['femaleSameGender','maleSameGender']
          .filter(id => p.gender === 'male' ? id === 'maleSameGender' : (p.gender === 'female' ? id === 'femaleSameGender' : true))
          .map(id=><View key={id} style={ui.row}><Text style={ui.text}>{categoryLabels[id]}</Text><Switch accessibilityLabel={categoryLabels[id]} value={p.preferences.genderActivities[id]??globalActivities[id]??(id==='femaleSameGender')} onValueChange={value=>preferences({genderActivities:{...p.preferences.genderActivities,[id]:value}})} /></View>)}
        <ActionButton title="Közös beállítások öröklése" secondary onPress={()=>preferences({genderActivities:{femaleSameGender:null,maleSameGender:null}})} />
        <Text style={ui.heading}>Akikkel nem szeretnék interakciót</Text>
        {profiles.filter(other=>other.id!==p.id).map(other=><View key={other.id} style={ui.row}><Text verbatim style={ui.text}>{other.name}</Text><Switch accessibilityLabel={other.name} value={p.preferences.blockedIds.includes(other.id)} onValueChange={()=>preferences({blockedIds:toggle(p.preferences.blockedIds,other.id)})} /></View>)}
        <Text style={ui.heading}>Kizárt testrészek a sorsolásból</Text>
        <Text style={ui.muted}>Jelöld be azokat a testrészeket, amiket szeretnél kihagyni a sorsolásból:</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          {bodyParts.map(bp => {
            const isBlocked = (p.preferences.blockedBodyParts || []).includes(bp.id);
            return (
              <ActionButton
                key={bp.id}
                title={(isBlocked ? '✕ ' : '') + t(bp.label)}
                selected={isBlocked}
                secondary
                onPress={() => preferences({ blockedBodyParts: toggle(p.preferences.blockedBodyParts || [], bp.id) })}
              />
            );
          })}
        </View>
        {activityCategories.filter(category => category !== 'fetish').map(category=><View key={category} style={ui.panel}><Text style={ui.heading}>{categoryLabels[category]}</Text>
          {category === 'penetration' ? (() => {
            const isEnabled = Boolean(p.preferences.activities.penetration.give || p.preferences.activities.penetration.receive);
            const currentPolicy = p.preferences.activities.penetration.givePolicy || 'all';
            return (
              <View style={{gap:8}}>
                <Switch
                  accessibilityLabel={t(categoryLabels.penetration)}
                  value={isEnabled}
                  onValueChange={value => rule('penetration', { give: value, receive: value })}
                />
                {isEnabled && (
                  <>
                    <View style={ui.row}>
                      {[['all','Mindenkivel'],['partner','Csak a párommal'],['selected','Kijelölt személyekkel']].map(([value,label])=>(
                        <ActionButton
                          key={value}
                          title={label}
                          selected={currentPolicy === value}
                          secondary
                          onPress={()=>rule('penetration', { givePolicy: value, receivePolicy: value })}
                        />
                      ))}
                    </View>
                    {currentPolicy === 'selected' && profiles.filter(other=>other.id!==p.id).map(other=>(
                      <View key={other.id} style={ui.row}>
                        <Text verbatim style={ui.text}>{other.name || `${profiles.indexOf(other) + 1}. ${t('játékos')}`}</Text>
                        <Switch
                          accessibilityLabel={other.name || `${profiles.indexOf(other) + 1}. ${t('játékos')}`}
                          value={p.preferences.activities.penetration.giveIds.includes(other.id)}
                          onValueChange={() => {
                            const list = p.preferences.activities.penetration.giveIds;
                            const next = list.includes(other.id) ? list.filter(x=>x!==other.id) : [...list, other.id];
                            rule('penetration', { giveIds: next, receiveIds: next });
                          }}
                        />
                      </View>
                    ))}
                  </>
                )}
              </View>
            );
          })() : (
            ['give','receive']
              .filter(role => !(p.gender === 'female' && category === 'anal' && role === 'give'))
              .map(role => {
                const r = p.preferences.activities[category];
                return (
                  <View key={role} style={{gap:8}}>
                    <Text style={ui.text}>{role==='give'?'Adó szerepet vállalok':'Fogadó szerepet vállalok'}</Text>
                    <Switch
                      accessibilityLabel={t(categoryLabels[category])+' · '+t(role==='give'?'Adó szerepet vállalok':'Fogadó szerepet vállalok')}
                      value={r[role]}
                      onValueChange={value=>rule(category,{[role]:value})}
                    />
                    <View style={ui.row}>
                      {[['all','Mindenkivel'],['partner','Csak a párommal'],['selected','Kijelölt személyekkel']].map(([value,label])=>(
                        <ActionButton
                          key={value}
                          title={label}
                          selected={r[role+'Policy']===value}
                          secondary
                          onPress={()=>rule(category,{[role+'Policy']:value})}
                        />
                      ))}
                    </View>
                    {r[role+'Policy']==='selected' && profiles.filter(other=>other.id!==p.id).map(other=>(
                      <View key={other.id} style={ui.row}>
                        <Text verbatim style={ui.text}>{other.name || `${profiles.indexOf(other) + 1}. ${t('játékos')}`}</Text>
                        <Switch
                          accessibilityLabel={other.name || `${profiles.indexOf(other) + 1}. ${t('játékos')}`}
                          value={r[role+'Ids'].includes(other.id)}
                          onValueChange={()=>rule(category,{[role+'Ids']:toggle(r[role+'Ids'],other.id)})}
                        />
                      </View>
                    ))}
                  </View>
                );
              })
          )}
        </View>)}
      </View>}
    </>}
    {(details || wardrobeOnly) && (
      <View style={{ gap: 8 }}>
        <Text style={ui.heading}>Ruházat (opcionális)</Text>
        {clothingTypes.map(type => {
          const wornItems = p.wardrobe.filter(item => item.type === type && item.worn);
          const count = wornItems.length;
          return (
            <View key={type} style={ui.row}>
              <Text style={ui.text}>{clothingLabels[type]}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActionButton
                  title="−"
                  accessibilityLabel={t(clothingLabels[type]) + ' −'}
                  secondary
                  disabled={count === 0}
                  onPress={() => {
                    if (count > 0) {
                      const removeId = wornItems[wornItems.length - 1].id;
                      patch({ wardrobe: p.wardrobe.filter(x => x.id !== removeId) });
                    }
                  }}
                />
                <Text style={[ui.text, { minWidth: 24, textAlign: 'center', fontWeight: 'bold' }]}>
                  {count}
                </Text>
                <ActionButton
                  title="+"
                  accessibilityLabel={t(clothingLabels[type]) + ' +'}
                  secondary
                  onPress={() => patch({ wardrobe: [...p.wardrobe, { id: makeId(), type, worn: true }] })}
                />
              </View>
            </View>
          );
        })}
      </View>
    )}
  </View>;
}
