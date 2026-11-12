const BLUES=['#0E3A66','#7AA3D8','#1D5FA8','#B9D0EC','#16508F','#93B6E0','#3E7BC4','#5B8FD0'];
const ORANGES=['#9A3412','#F6B48A','#C2410C','#F08A4B'];
const LIGHT=new Set(['#7AA3D8','#B9D0EC','#93B6E0','#5B8FD0','#F6B48A','#F08A4B']);
function palette(acts){let b=0,o=0;const m={};acts.forEach(a=>{m[a.id]=a.nec?BLUES[b++%BLUES.length]:ORANGES[o++%ORANGES.length];});return m;}
const pc=(x,d=0)=>(x*100).toFixed(d)+'%';

// Plantilla con las actividades del formato de Angel
const TEMPLATE=['Inspección visual','Marcar','Inspección con lima','Inspección con lámpara','*Limpieza','*Plática','*Espera','Sale de la operación','Sopleteo','Dejar pieza','Tomar pieza','Tomar agua','Quitar hojas de korokoro','Otros'];
const defaultActs=()=>TEMPLATE.map((n,i)=>({id:i+1,name:n.replace('*',''),nec:n[0]!=='*'}));
const S={studies:[],draft:null,step:1};
let uid=1000;const nid=()=>++uid;
