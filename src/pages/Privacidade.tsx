import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Mercado Rápido Express compromete-se a proteger a privacidade dos seus utilizadores. Esta Política de Privacidade explica como recolhemos, usamos, armazenamos e protegemos as suas informações pessoais.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">2. Informações que Recolhemos</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">2.1 Informações dos Clientes</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Nome completo</li>
                    <li>Endereço de email</li>
                    <li>Número de telefone</li>
                    <li>Histórico de pesquisas e interações na plataforma</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">2.2 Informações dos Vendedores</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Nome completo e dados de contacto</li>
                    <li>Nome e endereço da loja física</li>
                    <li>Número de WhatsApp comercial</li>
                    <li>Província e cidade de operação</li>
                    <li>Informações sobre produtos e preços</li>
                    <li>Dados de pagamento para subscrições</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium">2.3 Informações Automáticas</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Endereço IP</li>
                    <li>Tipo de navegador e dispositivo</li>
                    <li>Páginas visitadas e tempo de permanência</li>
                    <li>Dados de cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">3. Como Usamos as Suas Informações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos as informações recolhidas para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Criar e gerir a sua conta na plataforma</li>
                <li>Conectar clientes a vendedores através do WhatsApp</li>
                <li>Processar pagamentos de subscrições e destaques</li>
                <li>Enviar notificações importantes sobre o serviço</li>
                <li>Melhorar a experiência do utilizador na plataforma</li>
                <li>Prevenir fraudes e garantir a segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">4. Partilha de Informações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos partilhar as suas informações nas seguintes circunstâncias:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Entre utilizadores:</strong> O nome da loja, endereço e WhatsApp dos vendedores são visíveis publicamente para que clientes possam contactá-los</li>
                <li><strong>Prestadores de serviços:</strong> Parceiros que nos ajudam a operar a plataforma (processamento de pagamentos, hospedagem, etc.)</li>
                <li><strong>Requisitos legais:</strong> Quando exigido por lei ou para proteger os nossos direitos</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Nunca vendemos as suas informações pessoais a terceiros.</strong>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações, incluindo:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Encriptação de dados sensíveis</li>
                <li>Acesso restrito a informações pessoais</li>
                <li>Monitorização regular de segurança</li>
                <li>Palavras-passe encriptadas</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">6. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Manter a sua sessão ativa</li>
                <li>Lembrar as suas preferências</li>
                <li>Analisar o uso da plataforma</li>
                <li>Melhorar os nossos serviços</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pode gerir as preferências de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">7. Os Seus Direitos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tem direito a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Aceder:</strong> Solicitar uma cópia dos seus dados pessoais</li>
                <li><strong>Corrigir:</strong> Atualizar informações incorretas ou desatualizadas</li>
                <li><strong>Eliminar:</strong> Solicitar a eliminação da sua conta e dados</li>
                <li><strong>Portabilidade:</strong> Receber os seus dados num formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento dos seus dados para fins de marketing</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Para exercer estes direitos, contacte-nos através do email suporte@mercadorapido.co.mz.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">8. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos as suas informações pessoais enquanto a sua conta estiver ativa ou conforme necessário para fornecer os nossos serviços. Após o cancelamento da conta, podemos reter certos dados por um período limitado para cumprir obrigações legais.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">9. Menores de Idade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Mercado Rápido Express não se destina a menores de 18 anos. Não recolhemos intencionalmente informações de menores. Se tomarmos conhecimento de que recolhemos dados de um menor, eliminaremos essas informações imediatamente.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">10. Alterações a Esta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações significativas através da plataforma ou por email. Recomendamos que reveja esta política regularmente.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">11. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões sobre esta Política de Privacidade ou sobre os seus dados pessoais, contacte-nos:
              </p>
              <ul className="list-none text-muted-foreground space-y-2 mt-4">
                <li><strong>Email:</strong> suporte@mercadorapido.co.mz</li>
                <li><strong>WhatsApp:</strong> +258 84 000 0000</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacidade;
