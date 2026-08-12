# MVP operacional

## Ambientes

- **Mock/local:** `VITE_APP_MODE=mock`; preserva a experiência de produto e não consulta dados reais.
- **Homologação:** projeto Supabase `otngjqmezjvdlugqdsej`, mesma aplicação e dados de teste. Recebe migrations e integrações antes da produção.
- **Produção:** projeto Supabase `twdfsrclnirncxabvhhz`, `VITE_APP_MODE=live` e variáveis configuradas pelo Easypanel. Só recebe uma versão já validada em homologação.

Nunca usar a service role do Supabase ou a chave do Resend no navegador.

As migrations `003`, `004` e `005` são um conjunto: captação, escopo das carteiras e operações auditadas do corretor/gestora. Elas devem ser aplicadas na ordem numérica e validadas em homologação antes da produção.

No modo `live`, a carteira do corretor vem do Supabase. Abrir um lead chama `registrar_leitura_lead`; iniciar ou alterar etapa chama `atualizar_lead_operacional`. Essas ações ficam no histórico e não dependem de alterações livres do navegador.

## Captação

Cada integração de webhook pertence a um empreendimento. A função de servidor resolve o empreendimento pela chave da integração, valida o segredo, deduplica o recebimento e aplica a regra de distribuição internamente.

1. Zapier/n8n envia o lead para a integração.
2. A função normaliza o payload e grava `recebimentos_webhook`.
3. A deduplicação impede o mesmo lead de entrar duas vezes.
4. A função escolhe o próximo bloco ativo e o corretor elegível, em transação.
5. Cria o lead e os eventos de recebimento/distribuição; falhas continuam auditáveis e reprocessáveis.

## Contrato inicial do webhook

```text
POST https://<project-ref>.supabase.co/functions/v1/lead-ingest/<chave-publica>
x-prospera-secret: <segredo-da-integracao>
Content-Type: application/json
```

Payload mínimo:

```json
{ "nome": "Nome do lead", "telefone": "5511999999999", "email": "lead@exemplo.com", "lead_id": "id-opcional-da-origem" }
```

O endpoint não aceita `empreendimento_id` do remetente. A chave pública resolve internamente o empreendimento da integração. Quando houver uma fila ativa, ele responde `201` com o `lead_id` já distribuído; quando não houver corretor elegível, responde `202` e deixa o caso para revisão operacional.

## Próximo passo externo

Projetos definidos: homologação `otngjqmezjvdlugqdsej` e produção `twdfsrclnirncxabvhhz`. Falta definir os domínios no Auth e configurar URL + anon key em cada ambiente. Depois aplicamos as migrations primeiro em homologação e criamos as Edge Functions de webhook, convite e e-mail.
