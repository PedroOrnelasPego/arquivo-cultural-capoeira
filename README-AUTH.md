# Sistema de Autenticação - Acervo Cultural
Documentação de como retomar o desenvolvimento da arquitetura de Autenticação por E-mail.

Todo o motor está **PRONTO**, desde o Banco de Dados Cosmos, Hashes de segurança, até o Envio de E-mails com Link HTML usando o Node.

Como pedimos tempo técnico para evitar bloqueios de envios de e-mail e nos focar primeiro em um login simplificado usando os botões Google e Microsoft visuais, **a lógica de Autenticação por Email e Senha foi intencionalmente DESLIGADA temporariamente na Interface React.**

## 1. O que já está programado no Backend?
- Rota POST `/api/auth/register`: Recebe Nome, E-mail, Senha e Role. Hasha a senha, salva no CosmosDB e envia um Email com link de "Ativação".
- Rota GET `/api/auth/verify/:token`: Recebe o link de ativação, valida a conta e redireciona.
- Rota POST `/api/auth/login`: Checa senha bcrypt, checa se E-mail foi verificado, e devolve JWT.
- Rota POST `/api/auth/forgot-password`: Manda html por email com Link p/ alterar senha válido por 1Hr.
- Rota POST `/api/auth/reset-password`: Completa o esquecimento gravando a nova senha na interface.
- Serviço `services/email.service.ts`: O motor principal (Nodemailer) que dispara os e-mails bonitos em HTML.

## 2. Como Religar no Frontend (`Login.tsx`)
1. Abra o arquivo `Login.tsx`
2. Encontre a tag `{false && (` logo abaixo da marcação comentada que eu deixei na linha 185 aprox.
3. Apague ou mude o `false &&` para `true &&` (ou apague completamente a condicional em volta do `<form>` e da `<div className="mt-8">` dos rodapés).
4. O formulário inteiro aparecerá, validado e com UX/UI Completa com a barrinha de Progresso da Senha!

## 3. Próximo Passo para Finalizar
No `email.service.ts` nós estamos usando a biblioteca **Ethereal** (Para desenvolvedores sem servidor fixo). É excelente para testarmos se o layout ficou bonito, mas não manda emails de verdade.

Para colocar de verdade na Plataforma da Azure para 300 Curadores no Mundo:
1. Pegue aquela "Connection String" (Cadeia de Conexão) do seu Painel da Azure lá do Communication Services roxinho.
2. Nós instalaremos no Node o pacote oficial da Microsoft `@azure/communication-email`
3. Trocamos tudo por apenas 1 linha: `const client = new EmailClient(connectionString)` e os e-mails chegarão maravilhosamente bem sob os braços limpos e gratuitos do servidor Microsoft Cloud. :)

Divirta-se!
