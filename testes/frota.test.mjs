import assert from 'node:assert/strict';
import { comprarVeiculo, despachar, exportarFrota, importarFrota, novaFrota } from '../js/entregas.js';
const f=novaFrota();
assert.ok(comprarVeiculo(f,'carreta',()=>false).erro);
assert.equal(f.veiculos.length,1);
comprarVeiculo(f,'caminhao',()=>true);
comprarVeiculo(f,'carreta',()=>true);
const quadro={ativos:[{id:1,cliente:'rede',chave:'P-0-0',quantidade:50,restante:200,pagamento:500},{id:2,cliente:'rede',chave:'P-0-0',quantidade:100,restante:200,pagamento:1000}]};
const estoque={quantidade:()=>200,retirar:()=>({defeituosas:0})};
assert.equal(despachar(quadro,estoque,f,()=>.5).viagem.veiculo,2);
assert.equal(despachar(quadro,estoque,f,()=>.5).viagem.veiculo,3);
const volta=importarFrota(exportarFrota(f));
assert.equal(volta.veiculos.length,3);
assert.equal(volta.viagens.length,2);
assert.equal(volta.veiculos[0].estado,'doca');
assert.equal(volta.veiculos[1].estado,'entrega');
console.log('PASS: frota cobra compras, escolhe capacidade e preserva viagens simultâneas no save');

