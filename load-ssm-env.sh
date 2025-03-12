#!/bin/bash

PARAMETER_PATH="/app"

echo "Carregando variáveis de ambiente do SSM..."

for PARAM in $(aws ssm get-parameters-by-path --path $PARAMETER_PATH --with-decryption --region $AWS_REGION --query "Parameters[].Name" --output text)
do
    
    VAR_NAME=$(basename $PARAM)
    
  
    VAR_NAME=$(echo $VAR_NAME | tr '/' '_')
    
    VALUE=$(aws ssm get-parameter --name $PARAM --with-decryption --region $AWS_REGION --query "Parameter.Value" --output text)
    
  
    export $VAR_NAME="$VALUE"
    echo "Carregando: $VAR_NAME"
done

exec "$@"
