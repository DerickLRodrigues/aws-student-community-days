# Deploy com GitHub Actions, S3 e CloudFront

## Publicar alterações

Faça commit e push para `main`. O workflow `.github/workflows/deploy.yml` valida o
site, publica os arquivos públicos, invalida `/*`, espera a invalidação e testa a
URL do CloudFront. Pull requests apenas validam; não recebem credenciais AWS.
Também é possível iniciar em **Actions → Deploy site to S3 and CloudFront → Run workflow**, na branch `main`.

**Nenhum secret de usuário AWS é necessário.** A role usa GitHub OIDC, com audiência
`sts.amazonaws.com` e subject limitado a este repositório e à branch `main`.
O template aceita os formatos de subject legível e imutável do GitHub. Os IDs,
nomes e ARNs em `deploy-config.json` são configuração pública, não credenciais.
Não configure um GitHub Environment sem ajustar o subject da role, pois ele muda.

O Actions pode apenas gravar objetos no bucket do site e criar/consultar
invalidações desta distribuição. Não altera infraestrutura, IAM, DNS ou Amplify.
As Actions estão fixadas por SHA; atualize os SHAs deliberadamente.

## Arquitetura e custo

- S3 privado, criptografado com SSE-S3, acesso público bloqueado, versionamento
  e expiração de versões antigas após 30 dias.
- CloudFront **pay-as-you-go**, sem contratar plano fixo pago, com OAC assinado.
  A franquia disponível depende do consumo agregado da conta.
- CloudFront Function resolve diretórios como `/belo-horizonte/` e redireciona
  `www` para o domínio principal, preservando parâmetros de URL.
- Certificado ACM próprio em `us-east-1`, independente do certificado do Amplify.
- CSP e cabeçalhos de segurança preservados. Browser revalida os arquivos;
  CDN usa cache de até um dia pelo `s-maxage` publicado e invalidação por deploy.
- Logs CloudFront privados e criptografados, com retenção de 14 dias. O bucket
  de logs usa ACLs para compatibilidade com entrega de logs legada; o bucket
  do site usa BucketOwnerEnforced e não permite ACLs.
- Shield Standard é automático. Não foi contratada assinatura Shield Advanced
  nem adicionado WAF pago, para manter o objetivo de baixo custo deste site estático.
- S3, operações, logs, Functions e Route 53 podem gerar cobranças de uso.
  A zona Route 53 existente é reutilizada; não se cria outra zona.
- Não havia trail persistente na conta durante a consulta. O histórico de
  eventos de gerenciamento da AWS não substitui uma trilha de auditoria de longo prazo.

Não há build nem dependências de runtime: Python 3 + AWS CLI publicam o site.
`package-site.py` inclui HTML/CSS/JS, imagens, fontes, PDFs, vídeos, robots e sitemap;
exclui arquivos ocultos, documentação, scripts, infraestrutura e testes.
Se adicionar uma extensão pública nova, ajuste a lista permitida.
O deploy publica assets antes dos HTMLs, mas não é atômico entre todos os arquivos.
Objetos antigos não são apagados automaticamente para evitar quebrar abas abertas.
Para retirar conteúdo publicado, remova explicitamente o objeto do S3 e invalide
seu caminho; remover só do Git não o retira da hospedagem.

## Infraestrutura

Stack: `student-community-days-site`, região `us-east-1`.
Template: `03-static-site.yaml`. Os buckets e o provedor OIDC são retidos se a stack
for removida. Não exclua a stack como forma de despublicar o site.

Criação inicial (o agente prepara e executa esta etapa usando o profile `deploy`):

```powershell
aws cloudformation deploy --profile deploy --region us-east-1 --stack-name student-community-days-site --template-file infra/03-static-site.yaml --parameter-overrides HostedZoneId=Z03531562NQO4C5DT80SM EnableAliases=false --capabilities CAPABILITY_IAM
```

Após criar, registre os outputs em `deploy-config.json`. O domínio do certificado
é validado por CNAME sem alterar o A atual do site. Não remova esses CNAMEs:
eles são necessários para renovação automática do certificado.

Para atualizar infraestrutura depois da migração, mantenha `EnableAliases=true`.
Passar `false` depois do corte remove os domínios da distribuição e interrompe HTTPS.
Não reutilize este template em outra stack na mesma conta sem referenciar o provedor
OIDC já existente, pois o provider GitHub é único por conta.

## Testar e publicar localmente

```powershell
python scripts/package-site.py
node tests/routing.cjs
python scripts/deploy-site.py --profile deploy
python scripts/smoke-test.py https://DOMINIO-CLOUDFRONT
```

Se `aws` não estiver no PATH, os scripts aceitam
`--aws-cli "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2\aws.exe"`.

## Migrar o domínio do Amplify

**Não apague o Amplify antes do corte.** O domínio apex já pertence à distribuição
gerenciada pelo Amplify em outra conta de serviço. Trocar apenas o DNS não move
essa associação. É preciso liberá-la e associá-la à nova distribuição.
O processo de liberação pode causar uma interrupção temporária; escolha um horário
de pouco acesso. O site permanece acessível pela URL padrão do CloudFront.

Veja o plano (não altera recursos):

```powershell
python scripts/cutover-domain.py --profile deploy
```

Execute o corte depois de testar a URL nova e conferir o primeiro deploy do Actions:

```powershell
python scripts/cutover-domain.py --profile deploy --apply
```

O script verifica conta, site e certificado; salva os registros e a associação
atual em `.deploy-local/before-domain-cutover.json`; remove somente a associação
do domínio no Amplify; habilita apex/www na stack; aguarda CloudFront; aplica
aliases A/AAAA de apex/www e testa HTTPS. Não exclui o app Amplify, não troca NS,
não mexe no Registro.br e não remove CNAMEs de validação, MX ou TXT.

Se receber `CNAMEAlreadyExists`, a distribuição do Amplify ainda não liberou o
domínio. Espere a stack chegar a `UPDATE_ROLLBACK_COMPLETE` e execute novamente.
Se a liberação permanecer travada, consulte o status no Amplify e o suporte AWS;
não apague recursos tentando forçar a migração. Erros em outras etapas também
interrompem o script, sem apagar o backup original.

DNS antes da migração: apex A ALIAS para `d308johaif4nij.cloudfront.net`, zona de
destino CloudFront `Z2FDTNDATAQYW2`. Não havia registro `www`.
Restaurar apenas esse A não reverte a associação: para voltar ao Amplify é preciso
primeiro liberar os aliases da nova distribuição, reassociar o domínio ao app
`d1cxzd95q2sbmu`/branch `main` e aguardar o status `AVAILABLE`; só então aplicar os
registros que o Amplify indicar. O backup preserva as configurações originais.

Após o corte, valide `/`, `/belo-horizonte/`, um caminho inexistente e o redirect
`https://www.awsstudentcommunitydays.com.br/`. Só então exclua o app Amplify.
Os templates `01`/`02` e arquivos `amplify.yml`, `customHttp.yml` e
`redirects-amplify.json` permanecem como referência da hospedagem antiga;
não reaplique o template `02` após a migração.
