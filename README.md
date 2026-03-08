# video-processing-service
Serviço responsável pelo gerenciamento, validação e processamento assíncrono de vídeos da plataforma.

## Deploy da Lambda

Este serviço roda como uma AWS Lambda function que é acionada por mensagens na fila SQS.

### Pré-requisitos

- Node.js 20.x
- NPM
- AWS CLI configurado
- Lambda function criada pela infraestrutura (video-infra)

### Deploy do Código

O script `deploy-lambda.sh` faz o build e deploy automático do código para a Lambda:

```bash
# Configurar variáveis de ambiente
export AWS_REGION=us-east-1
export LAMBDA_FUNCTION_NAME=video-processing-prod

# Executar deploy
chmod +x scripts/deploy-lambda.sh
./scripts/deploy-lambda.sh
```

**O que o script faz:**
1. ✅ Valida variáveis de ambiente
2. 🧹 Limpa builds antigos
3. 📦 Instala dependências (incluindo dev para build)
4. 🏗️  Faz build do TypeScript
5. 📦 Reinstala apenas dependências de produção
6. 📦 Cria pacote ZIP com código e dependências
7. ☁️  Faz upload para a Lambda
8. ⏳ Aguarda atualização completar
9. 📊 Mostra informações da função
10. 🧹 Limpa artefatos de build

### Variáveis de Ambiente Necessárias

- `AWS_REGION`: Região AWS (ex: us-east-1)
- `LAMBDA_FUNCTION_NAME`: Nome da função Lambda (ex: video-processing-prod)

### GitHub Actions

O deploy é automatizado via GitHub Actions no workflow `.github/workflows/deploy-lambda.yml`.

**Configuração Inicial:**

1. Adicione os secrets no GitHub:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (se usar AWS Academy)

2. Adicione a variável no GitHub:
   - `LAMBDA_FUNCTION_NAME` (ex: `video-processing-prod`)
   
   Para obter o valor: `cd video-infra/terraform && terraform output lambda_function_name`

**Como funciona:**

- 🔄 **Push para `main`**: Deploy automático quando há mudanças em `src/`, `scripts/`, etc
- 🎯 **Manual**: Pode ser executado manualmente via Actions tab informando o nome da Lambda

O workflow:
1. Faz checkout do código
2. Configura Node.js 20
3. Configura credenciais AWS
4. Executa o script `deploy-lambda.sh`
5. Mostra resumo do deploy

### Atualização do Código

Configuradas pela infraestrutura (video-infra):
Para atualizar o código da Lambda após mudanças:

```bash
./scripts/deploy-lambda.sh
```

O script detecta automaticamente a função Lambda e faz o upload do novo código.

### Infraestrutura

A estrutura da Lambda (função, roles, triggers, etc) é gerenciada pelo repositório `video-infra`.
Este repositório é responsável apenas pelo código da aplicação.

### Configurações da Lambda

- **Runtime**: Node.js 20.x
- **Timeout**: 15 minutos (900 segundos)
- **Memory**: 1GB (1024 MB)
- **Ephemeral Storage**: 2GB
- **Trigger**: SQS Queue (video-processing-jobs-queue)
- **Batch Size**: 1 mensagem por vez

### Variáveis de Ambiente
a infraestrutura:

- `NODE_ENV`: Ambiente de execução (prd)
- `AWS_REGION`: Região AWS (us-east-1)
- `AWS_BUCKET_NAME`: Bucket S3 para vídeos
- `AWS_SQS_URL`: URL da fila SQS de vídeos processados

### Logs

Os logs da Lambda são salvos no CloudWatch Logs:
- Log Group: `/aws/lambda/video-processing-{environment}`
- Retenção: 7 dias

```bash
# Ver logs (AWS CLI)
aws logs tail /aws/lambda/video-processing-prod --follow
curl -X POST {function_url} -H "Content-Type: application/json" -d @event.json
```

