# 🚀 Scripts de Deploy

Este diretório contém scripts para automatizar o build e deploy do video-processing-service na AWS Lambda.

## 📋 Scripts Disponíveis

### 1. `deploy-lambda.sh`
Script para fazer build do código e deploy na AWS Lambda.

**Variáveis de Ambiente Necessárias:**
```bash
AWS_REGION=us-east-1
LAMBDA_FUNCTION_NAME=video-processing-prod
```

**Uso:**
```bash
cd video-processing-service
chmod +x scripts/deploy-lambda.sh
./scripts/deploy-lambda.sh
```

**O que faz:**
1. ✅ Valida variáveis de ambiente
2. 🧹 Limpa builds antigos
3. 📦 Instala dependências de produção (`npm ci --omit=dev`)
4. 🏗️  Faz build do TypeScript
5. 📦 Cria estrutura do pacote Lambda
6. 🗜️  Comprime em ZIP
7. ☁️  Faz upload para a Lambda via AWS CLI
8. ⏳ Aguarda a atualização completar
9. 📊 Mostra informações da função atualizada
10. 🧹 Remove artefatos de build

---

## 🎯 Uso no GitHub Actions

O script será chamado automaticamente pelo workflow `.github/workflows/deploy-lambda.yml`:

```yaml
- name: 🚀 Deploy Lambda Code
  env:
    AWS_REGION: us-east-1
    LAMBDA_FUNCTION_NAME: ${{ steps.vars.outputs.lambda_name }}
  run: |
    chmod +x scripts/deploy-lambda.sh
    ./scripts/deploy-lambda.sh
```

---

## 💻 Uso Local

Para testar o script localmente:

### 1. Configure as credenciais AWS
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_SESSION_TOKEN=your_token  # se necessário
```

### 2. Obtenha o nome da Lambda do Terraform
```bash
cd ../video-infra/terraform
export LAMBDA_FUNCTION_NAME=$(terraform output -raw lambda_function_name)
export AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1")
cd ../../video-processing-service
```

### 3. Execute o script
```bash
chmod +x scripts/deploy-lambda.sh
./scripts/deploy-lambda.sh
```

---

## 📦 Estrutura do Pacote

O script cria um pacote ZIP com a seguinte estrutura:
```
video-processing-service.zip
├── index.js                    # Entry point compilado
├── application/                # Casos de uso compilados
├── domain/                     # Domain logic compilado
├── infrastructure/             # Services e config compilados
├── node_modules/              # Dependências de produção
└── package.json               # Package manifest
```

---

## 🔍 Verificação Pós-Deploy

### Ver informações da Lambda
```bash
aws lambda get-function \
  --function-name $LAMBDA_FUNCTION_NAME \
  --region $AWS_REGION
```

### Ver logs em tempo real
```bash
aws logs tail /aws/lambda/$LAMBDA_FUNCTION_NAME --follow
```

### Testar invocação manual
```bash
aws lambda invoke \
  --function-name $LAMBDA_FUNCTION_NAME \
  --region $AWS_REGION \
  --payload '{"Records":[]}' \
  response.json
```

---

## 🐛 Troubleshooting

### Erro: "npm ci failed"
- Verifique se o `package.json` e `package-lock.json` estão sincronizados
- Execute `npm install` localmente primeiro

### Erro: "Build failed"
- Verifique erros de TypeScript com `npm run lint`
- Certifique-se que todas as dependências estão instaladas

### Erro: "Failed to update Lambda function code"
- Verifique se a função Lambda existe: `aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME`
- Verifique as permissões IAM do usuário/role
- Confirme que a região está correta

### Lambda muito grande (> 50MB)
- Revise as dependências em `package.json`
- Remova `devDependencies` desnecessárias
- Use Lambda Layers para dependências grandes (ex: FFmpeg)

---

## ⚡ Performance Tips

### Reduzir tamanho do pacote:
- Use apenas dependências de produção (`--omit=dev`)
- Minimize dependências desnecessárias
- Considere usar esbuild para bundle menor

### Reduzir tempo de deploy:
- Pipeline local: ~2-3 minutos
- GitHub Actions: ~3-5 minutos (inclui checkout, setup, etc)

---

## 📚 Documentação Relacionada

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [AWS CLI Lambda Commands](https://docs.aws.amazon.com/cli/latest/reference/lambda/)
- [Node.js on AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
