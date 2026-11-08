import { test,expect } from '@jest/globals';
import { normalizeProfile,pairProfiles,removeProfile,rekeyProfiles,profileErrors,canInteract,activityDefaults } from './profiles';
import { validateSettings } from './validation';
const people=()=>['A','B','C','D'].map(id=>normalizeProfile({id,name:id,gender:id==='B'?'female':'male'}));
test('mutual pairing, reassignment and removal clean every reference',()=>{
 let p=pairProfiles(people(),'A','B');p=pairProfiles(p,'C','D');p=pairProfiles(p,'A','C');expect(p.map(x=>x.partnerId)).toEqual(['C',null,'A',null]);expect(profileErrors(p)).toEqual([]);
 p[1].preferences.blockedIds=['A'];p[1].preferences.activities.oral.giveBlockedIds=['A'];p=removeProfile(p,'A');expect(p.find(x=>x.id==='C').partnerId).toBeNull();expect(p[0].preferences.blockedIds).toEqual([]);expect(profileErrors(p)).toEqual([]);
});
test('rekeying preserves all boundaries and pair links independently',()=>{
 const p=pairProfiles(people(),'A','B');p[0].preferences.activities.oral.givePolicy='selected';p[0].preferences.activities.oral.giveIds=['B'];let n=0;const changed=rekeyProfiles(p,()=>`new${++n}`);
 expect(changed[0].partnerId).toBe('new2');expect(changed[0].preferences.activities.oral.giveIds).toEqual(['new2']);expect(p[0].partnerId).toBe('B');expect(profileErrors(changed)).toEqual([]);
});
test('permissions intersect globally, directionally and for both partners',()=>{
 let [a,b,c]=pairProfiles(people(),'A','B');
 expect(canInteract(a,b,'oral',{})).toBe(true);expect(canInteract(a,b,'anal',{})).toBe(false);
 a.preferences.activities.oral.givePolicy='partner';expect(canInteract(a,c,'oral',{activities:{maleSameGender:true}})).toBe(false);
 b.preferences.activities.oral.receive=false;expect(canInteract(a,b,'oral',{})).toBe(false);b.preferences.activities.oral.receive=true;
 a.preferences.activities.oral.giveBlockedIds=['B'];expect(canInteract(a,b,'oral',{})).toBe(false);
 a.preferences.activities.oral.giveBlockedIds=[];b.preferences.blockedIds=['A'];expect(canInteract(a,b,'general',{})).toBe(false);
});
test('same-gender switches apply to every partner task category',()=>{
 const [a,,c]=people();expect(canInteract(a,c,'general',{})).toBe(false);expect(canInteract(a,c,'general',{activities:{maleSameGender:true}})).toBe(true);expect(canInteract(a,c,'oral',{})).toBe(false);expect(canInteract(a,c,'oral',{activities:{maleSameGender:true}})).toBe(true);
 expect(activityDefaults.oral).toBe(true);expect(activityDefaults.penetration).toBe(true);expect(activityDefaults.anal).toBe(false);expect(activityDefaults.fetish).toBe(false);
});
test('invalid setup options and unreciprocated couples are rejected',()=>{
 const p=people();p[0].partnerId='B';expect(profileErrors(p).length).toBeGreaterThan(0);
 expect(validateSettings({players:['A','B'],rounds:3,maxIntensity:5,options:{parallel:'yes'}}).ok).toBe(false);
});
test('females cannot be givers in anal tasks', () => {
  const female = { ...people()[0], gender: 'female' };
  const male = { ...people()[1], gender: 'male' };
  expect(canInteract(female, male, 'anal', { activities: { anal: true } })).toBe(false);
  expect(canInteract(male, female, 'anal', { activities: { anal: true } })).toBe(true);
});
