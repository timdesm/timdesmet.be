import RevealText from "@/components/animation/RevealText";

export default function About() {
  return (
    <section id="about" className="inner inner-grid-bottom about">
      <div className="inner__wrapper">
        <div className="container-fluid p-0">
          <div className="row g-0">
            <div className="col-12 col-xl-2">
              <div className="inner__name">
                <div className="content__block name-block">
                  <span className="section-name icon-right animate-in-up">
                    <span className="section-name-caption">About me</span>
                    <i className="ph ph-arrow-down-right" />
                  </span>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-8">
              <div className="inner__content">
                <div className="content__block section-grid-title">
                  <div className="block__descr">
                    <RevealText as="h2" className=" animate-in-up">
                      Beyond Code
                      <br />
                      I Create...
                    </RevealText>
                  </div>
                </div>
                <div className="content__block grid-block">
                  <div className="container-fluid p-0">
                    <div className="row g-0">
                      <div className="col-12 grid-item">
                        <div className="divider divider-image about-image-1 top-center animate-in-up" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content__block grid-block">
                  <div className="container-fluid p-0">
                    <div className="row g-0 justify-content-between">
                      <div className="col-12 col-md-8 col-lg-7 col-xxl-9 grid-item about-descr pre-grid">
                        <p className="about-descr__text type-basic-160lh animate-in-up">
                          I’m Tim, a curious mind shaped by technology, design, and adventure.  
                          I build because I love seeing ideas come to life, blending logic with emotion.  
                          I believe great work happens where creativity meets precision.  
                          When I’m not behind a screen, I’m exploring roads, cultures, and flavors that remind me there’s more to build than code.
                        </p>
                      </div>
                      <div className="col-12 col-md-4 col-xxl-3 grid-item about-info pre-grid">
                        <div className="about-info__item animate-in-up">
                          <h6>Tim De Smet</h6>
                        </div>
                        <div className="about-info__item animate-in-up">
                          <h6>
                            <a
                              className="link-inline text-link"
                              href="tel:+3233693333"
                            >
                              +32 3 369 33 33
                            </a>
                          </h6>
                        </div>
                        <div className="about-info__item animate-in-up">
                          <h6>
                            <a
                              className="link-inline text-link"
                              href="#"
                            >
                              hello@wizzou.com
                            </a>
                          </h6>
                        </div>
                        <div className="about-info__item animate-in-up">
                          <h6>
                            <a
                              className="link-inline text-link"
                              href="https://maps.app.goo.gl/SqhLerAUfwwzhiV28"
                              target="_blank"
                            >
                              Antwerp, Belgium
                            </a>
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content Block - About Me Data End */}
              </div>
            </div>
            {/* Inner Section Content End */}
            {/* Inner Section Aside Start */}
            <div className="col-12 col-xl-2" />
            {/* Inner Section Aside End */}
          </div>
        </div>
      </div>
    </section>
  );
}
