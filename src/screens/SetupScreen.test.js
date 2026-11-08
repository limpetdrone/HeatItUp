import React from 'react';
import renderer,{act} from 'react-test-renderer';
import { test,expect,jest } from '@jest/globals';
import { TextInput } from 'react-native';
import SetupScreen from './SetupScreen';
import ActionButton from '../components/ActionButton';
import ProfileEditor from '../components/ProfileEditor';
jest.mock('@react-native-async-storage/async-storage',()=>require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('react-native-safe-area-context',()=>({SafeAreaView:'SafeAreaView'}));
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
test('card-based setup preserves profiles when navigating and adjusting players',async()=>{
 const warning=jest.spyOn(console,'error').mockImplementation(message=>{if(!String(message).includes('react-test-renderer is deprecated'))throw Error(String(message));});let tree;const start=jest.fn();
 const press=async title=>{const button=tree.root.findAllByType(ActionButton).find(b=>b.props.title===title);expect(button).toBeTruthy();await act(async()=>button.props.onPress());};
 try{
  await act(async()=>{tree=renderer.create(<SetupScreen draft={{players:['A','B'],maxIntensity:1,rounds:3}} onStart={start} onBack={()=>{}} />);});
  await press('+ Játékos hozzáadása');
  await press('Tovább a játékosokhoz →');
  await act(async()=>tree.root.findByType(TextInput).props.onChangeText('Alicia'));
  await press('Nő');
  await press('Következő játékos →');
  await press('Férfi');
  await press('Alicia');
  await press('Következő játékos →');
  await press('Játékos törlése');
  await press('Játék indítása →');
  const settings=start.mock.calls[0][0];expect(settings.players).toEqual(['Alicia','B']);expect(settings.profiles.map(p=>p.gender)).toEqual(['female','male']);expect(settings.profiles[0].partnerId).toBe(settings.profiles[1].id);expect(settings.profiles[1].partnerId).toBe(settings.profiles[0].id);
 }finally{if(tree)await act(async()=>tree.unmount());warning.mockRestore();}
});
