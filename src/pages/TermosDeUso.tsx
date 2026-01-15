import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Termos de Uso
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar a plataforma Mercado Rápido Express, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Mercado Rápido Express é um catálogo digital que conecta compradores a lojas físicas em Moçambique. A plataforma permite que vendedores exibam seus produtos e que clientes encontrem o que procuram em lojas reais da sua região.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Importante:</strong> O Mercado Rápido Express não processa pagamentos nem realiza transações financeiras. Todas as compras são realizadas diretamente nas lojas físicas.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">3. Tipos de Utilizadores</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">3.1 Clientes</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Podem navegar pela plataforma, pesquisar produtos e entrar em contacto com vendedores através do WhatsApp. Não é necessário registo para visualizar produtos.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">3.2 Vendedores</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Devem criar uma conta, fornecer informações verdadeiras sobre a sua loja física e manter os dados dos produtos atualizados. Os vendedores são responsáveis pela veracidade das informações publicadas.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">4. Obrigações dos Vendedores</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Fornecer informações precisas e verdadeiras sobre a loja e produtos</li>
                <li>Manter os preços e disponibilidade dos produtos atualizados</li>
                <li>Possuir uma loja física real e verificável no endereço indicado</li>
                <li>Responder às mensagens dos clientes de forma profissional</li>
                <li>Não publicar produtos ilegais, contrafeitos ou proibidos por lei</li>
                <li>Cumprir com as leis e regulamentos de Moçambique</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">5. Planos e Pagamentos</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Mercado Rápido Express oferece diferentes planos de subscrição para vendedores. Os pagamentos são processados via M-Pesa ou outros métodos disponíveis. Os planos são renovados automaticamente, salvo cancelamento prévio.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O período de teste gratuito, quando oferecido, permite experimentar a plataforma antes de subscrever um plano pago.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">6. Produtos em Destaque</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os vendedores podem pagar para destacar os seus produtos, dando-lhes maior visibilidade na plataforma. O destaque é válido por um período determinado e não garante vendas.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">7. Conteúdo Proibido</h2>
              <p className="text-muted-foreground leading-relaxed">
                É estritamente proibido publicar:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Produtos ilegais ou contrafeitos</li>
                <li>Armas, drogas ou substâncias controladas</li>
                <li>Conteúdo adulto ou pornográfico</li>
                <li>Produtos que violem direitos de propriedade intelectual</li>
                <li>Informações falsas ou enganosas</li>
                <li>Qualquer conteúdo que viole as leis de Moçambique</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O Mercado Rápido Express atua apenas como um catálogo digital e não é responsável por:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>A qualidade, segurança ou legalidade dos produtos anunciados</li>
                <li>A veracidade das informações fornecidas pelos vendedores</li>
                <li>Transações realizadas entre compradores e vendedores</li>
                <li>Disputas ou conflitos entre utilizadores</li>
                <li>Danos resultantes do uso ou incapacidade de usar a plataforma</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">9. Suspensão e Cancelamento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de suspender ou cancelar contas que violem estes termos, sem aviso prévio e sem direito a reembolso.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">10. Alterações aos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos alterar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após a publicação na plataforma. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">11. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da República de Moçambique. Qualquer disputa será resolvida nos tribunais competentes de Moçambique.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">12. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões sobre estes Termos de Uso, entre em contacto connosco através do email suporte@mercadorapidoexpress.com ou pelo WhatsApp (+258 87 993 1016).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosDeUso;
