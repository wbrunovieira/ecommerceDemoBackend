#!/bin/sh


if [ "$NODE_ENV" = "production" ]; then
  ENV_FILE="/app/.env.production"
elif [ "$NODE_ENV" = "development" ]; then
  if [ -f "/app/.env.development.local" ]; then
    ENV_FILE="/app/.env.development.local"
  else
    ENV_FILE="/app/.env.development"
  fi
elif [ "$NODE_ENV" = "test" ]; then
  ENV_FILE="/app/.env.test"
else
  echo "Ambiente não reconhecido. Usando o arquivo padrão."

fi

echo "Carregando variáveis de ambiente do arquivo: $ENV_FILE"


export $(grep -v '^#' "$ENV_FILE" | xargs)


exec "$@"
