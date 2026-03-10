interface LegalTemplateInput {
    blogName: string;
    contactEmail: string;
}

function safeText(value: string, fallback: string) {
    const trimmed = value.trim();
    return trimmed || fallback;
}

export function buildPrivacyPolicyHtml(input: LegalTemplateInput) {
    const blogName = safeText(input.blogName, "Nosso Blog");
    const contactEmail = safeText(input.contactEmail, "contato@exemplo.com");

    return `
<h1>Politica de Privacidade</h1>
<p>Ultima atualizacao: ${new Date().toLocaleDateString("pt-BR")}</p>
<p>Esta Politica de Privacidade descreve como o <strong>${blogName}</strong> coleta, utiliza, armazena e protege dados pessoais de visitantes e leitores. Valorizamos transparencia e boas praticas de privacidade em todas as interacoes.</p>

<h2>1. Quais dados coletamos</h2>
<p>Podemos coletar dados fornecidos diretamente por voce e dados gerados automaticamente durante sua navegacao.</p>
<ul>
  <li><strong>Dados informados por voce:</strong> nome, e-mail, mensagem e demais informacoes enviadas por formularios de contato.</li>
  <li><strong>Dados tecnicos:</strong> endereco IP, tipo de dispositivo, navegador, paginas acessadas, origem de trafego e tempo de permanencia.</li>
  <li><strong>Cookies e tecnologias similares:</strong> identificadores para analise de audiencia, seguranca, desempenho e personalizacao de experiencia.</li>
</ul>

<h2>2. Finalidades do tratamento</h2>
<p>Os dados sao utilizados para:</p>
<ul>
  <li>operar, manter e melhorar o conteudo e os recursos do blog;</li>
  <li>responder solicitacoes, mensagens e pedidos de suporte;</li>
  <li>analisar desempenho editorial e comportamento de navegacao;</li>
  <li>prevenir fraudes, abusos e acessos indevidos;</li>
  <li>cumprir obrigacoes legais, regulatórias e de seguranca.</li>
</ul>

<h2>3. Base legal para tratamento</h2>
<p>O tratamento de dados pode ocorrer com base em consentimento, execucao de medidas preliminares relacionadas a solicitacoes do titular, interesse legitimo para operacao do servico, cumprimento de obrigacao legal e exercicio regular de direitos.</p>

<h2>4. Compartilhamento de dados</h2>
<p>Seus dados podem ser compartilhados com prestadores de servico essenciais ao funcionamento do blog, como provedores de hospedagem, analytics, seguranca e e-mail. Sempre exigimos padroes de confidencialidade e protecao adequados, limitando o compartilhamento ao necessario.</p>

<h2>5. Transferencia internacional</h2>
<p>Alguns fornecedores podem armazenar dados fora do Brasil. Nesses casos, adotamos medidas contratuais e tecnicas para assegurar nivel de protecao compativel com a legislacao aplicavel.</p>

<h2>6. Retencao e descarte</h2>
<p>Os dados sao mantidos pelo periodo necessario para cumprir as finalidades descritas, atender exigencias legais e resguardar direitos. Encerrado o prazo aplicavel, realizamos exclusao ou anonimização de forma segura.</p>

<h2>7. Seus direitos</h2>
<p>Voce pode, a qualquer momento e nos termos da lei aplicavel, solicitar:</p>
<ul>
  <li>confirmacao da existencia de tratamento;</li>
  <li>acesso, correcao e atualizacao de dados;</li>
  <li>anonimizacao, bloqueio ou eliminacao quando cabivel;</li>
  <li>informacao sobre compartilhamentos e revogacao de consentimento;</li>
  <li>portabilidade, quando aplicavel e tecnicamente viavel.</li>
</ul>

<h2>8. Cookies</h2>
<p>Utilizamos cookies estritamente necessarios e, quando aplicavel, cookies de desempenho e mensuracao. Voce pode ajustar preferencias no navegador, ciente de que algumas funcionalidades podem ser impactadas.</p>

<h2>9. Seguranca da informacao</h2>
<p>Adotamos controles tecnicos e administrativos razoaveis para proteger dados contra acesso nao autorizado, perda, alteracao ou divulgacao indevida. Ainda assim, nenhum ambiente e 100% imune a riscos.</p>

<h2>10. Conteudo de terceiros</h2>
<p>O blog pode conter links para sites externos. Nao somos responsaveis pelas praticas de privacidade desses terceiros. Recomendamos a leitura dos termos e politicas de cada plataforma visitada.</p>

<h2>11. Alteracoes desta politica</h2>
<p>Podemos atualizar esta politica periodicamente para refletir mudancas legais, tecnicas e operacionais. A versao vigente sempre estara disponivel nesta pagina.</p>

<h2>12. Contato</h2>
<p>Para exercer direitos ou esclarecer duvidas sobre privacidade e dados pessoais, entre em contato pelo e-mail: <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`;
}

export function buildTermsOfUseHtml(input: LegalTemplateInput) {
    const blogName = safeText(input.blogName, "Nosso Blog");
    const contactEmail = safeText(input.contactEmail, "contato@exemplo.com");

    return `
<h1>Termos de Uso</h1>
<p>Ultima atualizacao: ${new Date().toLocaleDateString("pt-BR")}</p>
<p>Os presentes Termos de Uso regulam o acesso e uso do <strong>${blogName}</strong>. Ao navegar no site, voce declara que leu, compreendeu e concorda com estas condicoes.</p>

<h2>1. Aceitacao dos termos</h2>
<p>O uso do blog implica concordancia integral com estes termos e com a Politica de Privacidade. Caso nao concorde, interrompa a navegacao.</p>

<h2>2. Finalidade do conteudo</h2>
<p>O conteudo possui natureza informativa e educacional. Nao constitui consultoria juridica, financeira, medica, contábil ou de qualquer outra natureza profissional especializada.</p>

<h2>3. Uso permitido</h2>
<p>Voce concorda em utilizar o site de forma licita, etica e compativel com estes termos, sem violar direitos de terceiros ou comprometer a integridade da plataforma.</p>
<ul>
  <li>nao praticar tentativa de acesso indevido, engenharia reversa ou ataque ao sistema;</li>
  <li>nao enviar codigo malicioso, spam ou conteudo ofensivo;</li>
  <li>nao utilizar o blog para atividades fraudulentas ou ilegais.</li>
</ul>

<h2>4. Propriedade intelectual</h2>
<p>Textos, marcas, identidade visual, recursos graficos e demais materiais do blog sao protegidos por direitos autorais e de propriedade intelectual. Reproducao, distribuicao ou uso comercial sem autorizacao previa e expressa e proibido.</p>

<h2>5. Conteudo de terceiros e links externos</h2>
<p>Podemos citar ferramentas, servicos e conteudos de terceiros. Nao garantimos disponibilidade, precisao ou politicas dessas plataformas externas, sendo responsabilidade do usuario avaliar os respectivos termos.</p>

<h2>6. Isencao de garantias</h2>
<p>Empregamos esforcos razoaveis para manter informacoes atualizadas, mas nao garantimos ausencia de erros, omissoes ou indisponibilidades temporarias. O uso do conteudo ocorre por conta e risco do usuario.</p>

<h2>7. Limitacao de responsabilidade</h2>
<p>Na extensao permitida por lei, o ${blogName} nao se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso ou impossibilidade de uso do site.</p>

<h2>8. Modificacoes no servico e nos termos</h2>
<p>Podemos modificar funcionalidades, suspender partes do servico ou atualizar estes Termos de Uso a qualquer momento. A versao vigente permanecera publicada nesta pagina com data de revisao.</p>

<h2>9. Privacidade e dados pessoais</h2>
<p>As regras de coleta e tratamento de dados estao descritas em nossa Politica de Privacidade, que integra estes termos para todos os efeitos.</p>

<h2>10. Legislacao e foro</h2>
<p>Estes termos serao interpretados conforme a legislacao brasileira. Fica eleito o foro da comarca do domicilio do titular do blog, ressalvadas hipoteses legais de competencia especifica.</p>

<h2>11. Contato</h2>
<p>Para duvidas, solicitacoes ou comunicacoes legais, entre em contato pelo e-mail: <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`;
}

export function buildAboutUsHtml(input: LegalTemplateInput) {
    const blogName = safeText(input.blogName, "Nosso Blog");
    const contactEmail = safeText(input.contactEmail, "contato@exemplo.com");

    return `
<h1>Quem Somos</h1>
<p>Ultima atualizacao: ${new Date().toLocaleDateString("pt-BR")}</p>
<p>O <strong>${blogName}</strong> e um blog independente focado em compartilhar conteudo de qualidade, com linguagem clara e abordagem pratica para leitores de diferentes niveis de experiencia.</p>

<h2>1. Nossa proposta</h2>
<p>Nosso objetivo e transformar temas complexos em conteudos acessiveis, uteis e acionaveis. Produzimos materiais pensando em aprendizado continuo, aplicacao no dia a dia e confiabilidade das informacoes.</p>

<h2>2. O que voce encontra aqui</h2>
<ul>
  <li>artigos explicativos e guias passo a passo;</li>
  <li>analises de tendencias e boas praticas;</li>
  <li>conteudos introdutorios e avancados;</li>
  <li>materiais atualizados com foco em relevancia e qualidade editorial.</li>
</ul>

<h2>3. Como produzimos conteudo</h2>
<p>Seguimos um processo editorial baseado em pesquisa, curadoria e revisao. Quando aplicavel, citamos referencias e atualizamos publicacoes para manter consistencia com mudancas de mercado, tecnologia e legislacao.</p>

<h2>4. Nossos valores</h2>
<ul>
  <li><strong>clareza:</strong> comunicacao objetiva e sem jargoes desnecessarios;</li>
  <li><strong>transparencia:</strong> respeito ao leitor e a origem das informacoes;</li>
  <li><strong>responsabilidade:</strong> cuidado com recomendacoes e impacto do conteudo;</li>
  <li><strong>evolucao continua:</strong> melhoria constante da experiencia editorial.</li>
</ul>

<h2>5. Para quem escrevemos</h2>
<p>Nossos conteudos sao pensados para profissionais, estudantes, empreendedores e curiosos que desejam aprender de forma pratica e confiavel, independentemente do nivel tecnico inicial.</p>

<h2>6. Relacao com marcas e parceiros</h2>
<p>Podemos eventualmente publicar conteudos patrocinados ou com parcerias. Nesses casos, sinalizamos de forma clara para preservar transparencia com a audiencia.</p>

<h2>7. Compromisso com a audiencia</h2>
<p>Valorizamos feedbacks, correcoes e sugestoes. Se identificar qualquer ponto que possa ser melhorado, entre em contato. Nosso compromisso e manter um espaco util, respeitoso e em constante evolucao.</p>

<h2>8. Contato</h2>
<p>Para falar com nossa equipe editorial, enviar sugestoes de pauta ou tirar duvidas, escreva para: <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`;
}

export function buildContactHtml(input: LegalTemplateInput) {
    const blogName = safeText(input.blogName, "Nosso Blog");
    const contactEmail = safeText(input.contactEmail, "contato@exemplo.com");

    return `
<h1>Contato</h1>
<p>Ultima atualizacao: ${new Date().toLocaleDateString("pt-BR")}</p>
<p>Obrigado por visitar o <strong>${blogName}</strong>. Este canal existe para facilitar nossa comunicacao com leitores, parceiros e empresas.</p>

<h2>1. Como falar conosco</h2>
<p>O principal canal de atendimento e o e-mail: <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
<p>Respondemos mensagens em dias uteis, conforme ordem de recebimento e complexidade do assunto.</p>

<h2>2. Assuntos atendidos</h2>
<ul>
  <li>duvidas sobre artigos e conteudos publicados;</li>
  <li>sugestoes de pauta e temas para novos materiais;</li>
  <li>solicitacoes de parceria editorial e comercial;</li>
  <li>pedidos relacionados a privacidade e dados pessoais.</li>
</ul>

<h2>3. Prazo de resposta</h2>
<p>Buscamos responder em ate 2 dias uteis. Em periodos de alta demanda, esse prazo pode variar.</p>

<h2>4. Informacoes importantes</h2>
<ul>
  <li>nao solicitamos dados sensiveis por e-mail sem necessidade;</li>
  <li>evite compartilhar senhas ou informacoes confidenciais;</li>
  <li>mensagens ofensivas, spam ou tentativas de fraude podem ser desconsideradas.</li>
</ul>

<h2>5. Imprensa e parcerias</h2>
<p>Para convites, entrevistas, publicidade e projetos em conjunto, utilize o mesmo e-mail de contato com o assunto da mensagem claramente identificado.</p>

<h2>6. Privacidade no contato</h2>
<p>Dados enviados por esse canal sao tratados com responsabilidade e de acordo com nossa Politica de Privacidade. Se necessario, voce pode solicitar atualizacao ou exclusao de dados, dentro das regras legais aplicaveis.</p>

<h2>7. Canal oficial</h2>
<p>Canal oficial de contato: <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
`;
}
