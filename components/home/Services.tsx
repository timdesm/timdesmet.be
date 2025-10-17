import RevealText from "@/components/animation/RevealText";
import StackCards from "@/components/animation/StackCards";
import { home } from "@/data/services.json";

export default function Services() {
  return (
    <section id="services" className="inner inner-stack-bottom services">
      <div className="inner__wrapper">
        <div className="container-fluid p-0">
          <div className="row g-0">
            <div className="col-12 col-xl-2">
              <div className="inner__name">
                <div className="content__block name-block">
                  <span className="section-name icon-right animate-in-up">
                    <span className="section-name-caption">Services</span>
                    <i className="ph ph-arrow-down-right" />
                  </span>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-8">
              <div className="inner__content">
                <div className="content__block pre-stack-text-block">
                  <div className="block__descr">
                    <RevealText as="h2" className=" animate-in-up">
                      Creating
                      <br />
                      impactful projects
                    </RevealText>
                    <p className="h2__text type-basic-160lh animate-in-up">
                      Every project starts with understanding people - their needs, goals, and emotions. I turn ideas into digital experiences that not only work but connect. Design, code, and strategy aligned around what truly matters: impact.
                      
                    </p>
                  </div>
                </div>
                <div className="content__block">
                  <StackCards className="stack-wrapper">
                    {home.map((it) => (
                      <div key={it.id} className="services-stack__inner">
                        <div className="services-stack__title">
                          <h3
                            dangerouslySetInnerHTML={{
                              __html: it.title.replace(/\n/g, "<br />"),
                            }}
                          />
                        </div>
                        <div className="services-stack__descr">
                          <i className={it.icon} />
                          <p className="services-stack__text type-basic-160lh">{it.text}</p>
                        </div>
                        {/* <div className="services-stack__image">
                          <Image className="service-img service-img-s" alt={it.title} src={it.imgS} width={1200} height={1000} />
                          <Image className="service-img service-img-m" alt={it.title} src={it.imgM} width={800} height={1000} />
                        </div> */}
                      </div>
                    ))}
                  </StackCards>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
