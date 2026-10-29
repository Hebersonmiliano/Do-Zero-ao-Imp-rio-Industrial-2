// Montagem de PCs: peças compradas, consumidas no início e produto entregue ao terminar.
export const COMPONENTES_PC = { cpu:{nome:'Processador',custo:80}, placaMae:{nome:'Placa-mãe',custo:70}, memoria:{nome:'Memória RAM',custo:40}, hd:{nome:'HD',custo:30}, gabinete:{nome:'Gabinete',custo:35}, gpu:{nome:'Placa de vídeo',custo:100} };
export const novoHardware = () => ({ bancada:false, pecas:Object.fromEntries(Object.keys(COMPONENTES_PC).map((k)=>[k,0])), restantes:0, prontos:0 });
export function comprarPecaPC(estado,id,pagar) {
  const p=COMPONENTES_PC[id];
  if(!p || !pagar(p.custo)) return false;
  estado.pecas[id]++; return true;
}
export function iniciarPC(estado) {
  if(!estado.bancada) return 'Compre a bancada de montagem de PCs.';
  if(estado.restantes>0) return 'Há um computador em montagem.';
  const faltam=Object.keys(COMPONENTES_PC).filter((k)=>estado.pecas[k]<1);
  if(faltam.length) return 'Faltam: '+faltam.map((k)=>COMPONENTES_PC[k].nome).join(', ');
  for(const k of Object.keys(COMPONENTES_PC)) estado.pecas[k]--;
  estado.restantes=30; return null;
}
export function atualizarPC(estado,dt) {
  if(estado.restantes<=0) return false;
  estado.restantes=Math.max(0,estado.restantes-dt);
  if(estado.restantes===0) { estado.prontos++; return true; }
  return false;
}
export function importarHardware(d) {
  const e=novoHardware(); e.bancada=d?.bancada===true;
  for(const k of Object.keys(COMPONENTES_PC)) e.pecas[k]=Math.max(0,Math.min(10000,Math.floor(Number(d?.pecas?.[k])||0)));
  e.restantes=Math.max(0,Math.min(30,Number(d?.restantes)||0));
  e.prontos=Math.max(0,Math.min(10000,Math.floor(Number(d?.prontos)||0))); return e;
}

