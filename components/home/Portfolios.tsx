"use client";
import HoverCursorEffect from "@/components/animation/HoverCursorEffect";
import MasonryGrid from "@/components/animation/MasonryGrid";
import RevealText from "@/components/animation/RevealText";
import Image from "next/image";
import { home } from "@/data/portfolios.json";
import { useRef, useState } from "react";
import Lightbox, { FullscreenRef } from "yet-another-react-lightbox";
import { Captions, Fullscreen, Share, Zoom } from "yet-another-react-lightbox/plugins";
export default function Portfolios() {
  const items = home;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const captionsRef = useRef(null);
  const fullscreenRef = useRef<FullscreenRef>(null);
  const zoomRef = useRef(null);

  return (
    <>
      <section id="portfolio" className="inner inner-grid-bottom portfolio">
        <div className="inner__wrapper">
          <div className="container-fluid p-0">
            <div className="row g-0">
              <div className="col-12 col-xl-2">
                <div className="inner__name">
                  <div className="content__block name-block">
                    <span className="section-name icon-right animate-in-up">
                      <span className="section-name-caption">Portfolio</span>
                      <i className="ph ph-arrow-down-right" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-xl-8">
                <div className="inner__content">
                  <div className="content__block section-grid-text-title">
                    <div className="block__descr">
                      <RevealText as="h2" className=" animate-in-up">
                        Design, tech &amp;
                        <br />
                        some magic
                      </RevealText>
                      <p className="h2__text type-basic-160lh animate-in-up">I wonder if I&apos;ve been changed in the night? Let me think. Was I the same when I got up this morning? I almost think I can remember feeling a little different.</p>
                    </div>
                  </div>
                  <div className="content__block grid-block">
                    <div className="container-fluid px-0 inner__gallery">
                      <MasonryGrid className="row gx-0 my-gallery">
                        {items.map((it, idx) => (
                          <figure key={it.id} className={`col-12 col-md-6 gallery__item grid-item animate-in-up`} data-delay={idx % 2 === 0 ? "0" : "600"} itemProp="associatedMedia" itemType="http://schema.org/ImageObject">
                            <a
                              href={it.href}
                              onClick={(e) => {
                                e.preventDefault();
                                setOpen(true);
                                setActiveIndex(idx);
                              }}
                              className="gallery__link"
                              itemProp="contentUrl"
                              data-size={it.size}
                            >
                              <Image className="" itemProp="thumbnail" alt={it.title} src={it.src} width={it.width} height={it.height} />
                            </a>
                            <figcaption className={"gallery__descr" + (it.opposite ? " opposite" : "")} itemProp="caption description">
                              <h5>
                                {it.title}
                                <small>{it.category}</small>
                              </h5>
                              <p className="small">{it.description}</p>
                            </figcaption>
                          </figure>
                        ))}
                      </MasonryGrid>
                      <div className="gallery__btn animate-in-up">
                        <a href="https://wizzou.com/?utm_source=timdesmet.be&utm_medium=referral&utm_campaign=portfolio&utm_content=visit-button" className="btn btn-line-circle-icon">
                          <span className="btn-caption">More @ Wizzou</span>
                          <HoverCursorEffect as="span" className="circle hover-circle">
                            <i className="ph ph-arrow-right" />
                          </HoverCursorEffect>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-xl-2" />
            </div>
          </div>
        </div>
      </section>

      <Lightbox
        open={open}
        plugins={[Captions, Fullscreen, Share, Zoom]}
        captions={{
          ref: captionsRef,
          descriptionTextAlign: "center",
        }}
        className="yarl__portfolio"
        fullscreen={{ ref: fullscreenRef }}
        on={{
          click: () => fullscreenRef.current?.enter(),
        }}
        render={{
          slideContainer: ({ slide, children }) => {
            const tags = items.find((el) => el.title === slide.title)?.category.split(", ");
            return (
              <div className="d-flex flex-column">
                {children}

                <div className="pswp__caption" style={{ position: "static" }}>
                  <div className="pswp__caption__center">
                    <h5>{slide.title}</h5>
                    <div className="card__tags d-flex flex-wrap">
                      {tags?.map((tag, i) => (
                        <span key={i} className="rounded-tag opposite">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="small">{slide.description}</p>
                  </div>
                </div>
              </div>
            );
          },
        }}
        zoom={{ ref: zoomRef }}
        close={() => setOpen(false)}
        index={activeIndex}
        slides={items.map((item) => ({
          src: item.src,
          title: item.title,
          description: item.description,
          imageFit: "contain",

          share: {
            url: "/",
            title: item.title,
            description: item.description,
          },
        }))}
      />
    </>
  );
}
