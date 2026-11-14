// Pruebas del motor de traducción (inglés): lee el bloque <i18n-pure> directo de index.html.
// Usa un diccionario de prueba inyectado: lo que se prueba es el motor, no las traducciones.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <i18n-pure>[^\n]*\n([\s\S]*?)\/\/ <\/i18n-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <i18n-pure> en index.html');process.exit(1);}
const {trMake,trCase}=new Function(m[1]+';return {trMake,trCase};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};
const eq=(a,b,msg)=>ok(a===b,msg+' → «'+a+'» (esperado «'+b+'»)');

const tr=trMake(
  {'Guardar estudio':'Save study','abril':'April','Operador':'Operator','Guardar':'Save','Página 1 de 1':'Only page'},
  [['Página {n} de {n}','Page {n} of {n}'],['Operador {n}','Operator {n}'],['faltan {n}','{n} to go'],
   ['Guardar {x}','Save {x}'],['{n} min por pieza','{n} min per piece'],['{x} de {x}','{2} of {1}']]);

// 1. exacto y estilo de mayúsculas
eq(tr('Guardar estudio'),'Save study','exacto');
eq(tr('GUARDAR ESTUDIO'),'SAVE STUDY','todo mayúsculas');
eq(tr('guardar estudio'),'save study','minúsculas');
eq(tr('Guardar Estudio'),'Save study','mayúscula inicial');
// 2. espacios alrededor se conservan
eq(tr('  Guardar estudio '),'  Save study ','espacios');
// 3. plantillas con números
eq(tr('Página 2 de 5'),'Page 2 of 5','plantilla página');
eq(tr('Operador 3'),'Operator 3','plantilla operador');
eq(tr('faltan 1,226'),'1,226 to go','número con coma');
eq(tr('-0.5 min por pieza'),'-0.5 min per piece','número negativo decimal');
eq(tr('12.3% min por pieza'),'12.3% min per piece','número con %');
eq(tr('OPERADOR 4'),'OPERATOR 4','plantilla en mayúsculas');
// 4. hueco de texto: se traduce si se conoce, si no queda igual
eq(tr('Guardar abril'),'Save April','hueco conocido');
eq(tr('Guardar FOO'),'Save FOO','hueco desconocido');
eq(tr('GUARDAR ABRIL'),'SAVE APRIL','hueco en mayúsculas');
// 5. orden de los huecos en la salida ({2} {1})
eq(tr('abril de Operador'),'Operator of April','huecos reordenados');
// 6. exacto gana a plantilla
eq(tr('Página 1 de 1'),'Only page','exacto antes que plantilla');
// 7. desconocido, vacío, números solos
eq(tr('LÍNEA 7 DE JUAN'),'LÍNEA 7 DE JUAN','desconocido sin cambio');
eq(tr(''),'','vacío');
eq(tr('12.5'),'12.5','número solo');
eq(tr('   '),'   ','solo espacios');
// 8. trCase
eq(trCase('HOLA','hello there'),'HELLO THERE','trCase mayúsculas');
eq(trCase('Hola','hello'),'Hello','trCase inicial');
eq(trCase('hola','Hello'),'hello','trCase minúscula inicial');
eq(trCase('12 PZS','12 pcs'),'12 PCS','trCase con números');
// 8b. separadores en las orillas se conservan
eq(tr(' · Guardar estudio · '),' · Save study · ','separadores ·');
eq(tr('Guardar estudio:'),'Save study:','dos puntos al final');
eq(tr('— Operador 3'),'— Operator 3','raya al inicio');
// 9. rendimiento: 20,000 búsquedas en < 1 s
const t0=Date.now();for(let i=0;i<20000;i++)tr(i%2?'Operador '+i:'TEXTO DESCONOCIDO '+i);
ok(Date.now()-t0<1000,'rendimiento: '+(Date.now()-t0)+' ms');

console.log(fails?`${fails} de ${n} FALLAN`:`OK: ${n} pruebas del motor de traducción`);process.exit(fails?1:0);
