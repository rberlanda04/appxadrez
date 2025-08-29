# Formato de Importação/Exportação CSV

## Estrutura da Planilha

O arquivo CSV deve conter as seguintes colunas na ordem exata:

| Coluna | Descrição | Obrigatório | Exemplo |
|--------|-----------|-------------|----------|
| Nome | Nome completo do jogador | ✅ | João Silva |
| Email | Endereço de email válido | ✅ | joao.silva@email.com |
| Telefone | Número de telefone | ❌ | (11) 99999-1111 |
| Categoria | Nível do jogador | ❌ | Iniciante, Intermediário, Avançado |
| Pontos | Pontuação atual | ❌ | 15 |
| Vitorias | Número de vitórias | ❌ | 5 |
| Empates | Número de empates | ❌ | 0 |
| Derrotas | Número de derrotas | ❌ | 2 |

## Regras de Formatação

### 📋 Cabeçalho
- A primeira linha deve conter exatamente os nomes das colunas mostrados acima
- Não use acentos nos nomes das colunas
- Mantenha a ordem das colunas

### 👤 Dados dos Jogadores
- **Nome**: Texto livre, máximo 100 caracteres
- **Email**: Deve ser um email válido e único
- **Telefone**: Formato livre, recomendado (XX) XXXXX-XXXX
- **Categoria**: Apenas "Iniciante", "Intermediário" ou "Avançado"
- **Pontos**: Número inteiro positivo
- **Vitórias/Empates/Derrotas**: Números inteiros não negativos

### ⚠️ Observações Importantes

1. **Codificação**: Salve o arquivo em UTF-8 para preservar acentos
2. **Separador**: Use vírgula (,) como separador
3. **Aspas**: Use aspas duplas (") apenas se o texto contiver vírgulas
4. **Campos vazios**: Deixe em branco campos opcionais
5. **Duplicatas**: Emails duplicados serão rejeitados

## Exemplo de Uso

### Importação
1. Prepare sua planilha seguindo o formato acima
2. Salve como arquivo .csv
3. No sistema, vá em "Jogadores" → "Importar CSV"
4. Selecione seu arquivo e confirme a importação

### Exportação
1. No sistema, vá em "Relatórios"
2. Clique em "Exportar Relatório"
3. O arquivo será baixado automaticamente

## Arquivo de Exemplo

Use o arquivo `exemplo_jogadores.csv` como referência para criar sua própria planilha de importação.

---

**💡 Dica**: Sempre faça um backup dos seus dados antes de importar uma nova planilha!