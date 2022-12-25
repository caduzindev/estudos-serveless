# 1: criar arquivo de politica da lambda, para mostrar o que ela pode acessar
# 2: criar role de segurança aws

aws iam create-role \
  --role-name lambda-ex \
  --assume-role-policy-document file://politicas.json \
  | tee logs/role.log

# 3: criar arquivo com conteudo e zipa-lo
zip function.zip index.js

aws lambda create-function \
  --function-name hello-cli \
  --zip-file fileb://function.zip \
  --handler index.handler \
  --runtime nodejs12.x \
  --role arn:aws:iam::621450410267:role/lambda-ex \
  | tee logs/lambda-create.log

# 4: invokar a lambda
aws lambda invoke \
  --function-name hello-cli \
  --log-type Tail \
  logs/lambda-invoke.log

# 5: atualizar, zipar
zip function.zip index.js

# 6: atualizar a lambda
aws lambda update-function-code \
  --zip-file fileb://function.zip \
  --function-name hello-cli \
  --publish \
  | tee logs/lambda-update.log

# 7: invokar a lambda
aws lambda invoke \
  --function-name hello-cli \
  --log-type Tail \
  logs/lambda-invoke.log

# 8: deletar lambda e role
aws lambda delete-function \
  --function-name hello-cli

aws iam delete-role \
  --role-name lambda-ex