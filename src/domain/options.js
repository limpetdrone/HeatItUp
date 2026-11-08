import { activityDefaults, fetishTypes } from './profiles';
export const defaultGameOptions = {activities:activityDefaults,fetishes:[],parallel:false,questionsForAll:false,partnerWheel:false,bodyWheel:true,trackWardrobe:false};
export function optionErrors(options){
 if(!options||typeof options!=='object'||Array.isArray(options))return ['Érvénytelen játékbeállítás.'];
 const flags=['parallel','questionsForAll','partnerWheel','bodyWheel','trackWardrobe'];
 if(flags.some(key=>options[key]!==undefined&&typeof options[key]!=='boolean'))return ['Érvénytelen játékbeállítás.'];
 if(options.activities&&(typeof options.activities!=='object'||Object.entries(options.activities).some(([key,value])=>!(key in activityDefaults)||typeof value!=='boolean')))return ['Érvénytelen játékbeállítás.'];
 if(options.fetishes&&(!Array.isArray(options.fetishes)||options.fetishes.some(id=>!fetishTypes.includes(id))))return ['Érvénytelen játékbeállítás.'];
 return [];
}
