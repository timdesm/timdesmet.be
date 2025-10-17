"use client";
import HoverCursorEffect from "@/components/animation/HoverCursorEffect";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";

export default function PortfolioPopup() {
  const { selectedPortfolio, setSelectedPortfolio } = usePortfolio();

  const contentRef = useRef<HTMLDivElement | null>(null); // .mfp-content
  const popupRef = useRef<HTMLDivElement | null>(null); // .popup

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const content = contentRef.current;
      const popup = popupRef.current;

      if (!target || !popup) return;

      // ✅ ignore clicks inside the popup itself
      if (popup.contains(target)) return;

      // ✅ close if click is inside .mfp-content but outside .popup
      if (content?.contains(target)) {
        setSelectedPortfolio(null);
      }

      // ✅ OR close for any other clicks outside .popup
      if (!content?.contains(target)) {
        setSelectedPortfolio(null);
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={`mfp-bg mfp-fade mfp-ready portfolio-popup-bg ${
          selectedPortfolio ? "active" : ""
        }`}
        onClick={() => setSelectedPortfolio(null)}
      />
      <div
        className={`mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-fade mfp-ready portfolio-popup-wrap ${
          selectedPortfolio ? "active" : ""
        }`}
        tabIndex={-1}
      >
        <div className="mfp-container mfp-inline-holder" data-lenis-prevent>
          <div className="mfp-content" ref={contentRef}>
            <div className="popup" ref={popupRef}>
              {/* Popup Close Button Start */}
              <button
                className="mfp-close permanent-light"
                onClick={() => setSelectedPortfolio(null)}
              />
              {/* Popup Close Button End */}
              {/* Popup Content Start */}
              <div className="popup__container">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    <div className="col-12">
                      <div className="project">
                        {/* Project Block - Title with Image Start */}
                        <div className="project__block no-padding no-margin project-image-bg">
                          {selectedPortfolio && (
                            <>
                              <Image
                                className="project-image-bg__portrait"
                                alt="Project Illustration"
                                src={selectedPortfolio?.portrait || ""}
                                width={600}
                                height={800}
                              />
                              <Image
                                className="project-image-bg__landscape"
                                alt="Project Illustration"
                                src={selectedPortfolio?.landscape || ""}
                                width={1920}
                                height={800}
                              />{" "}
                            </>
                          )}
                          <div className="project__title">
                            <h3 className="light">
                              {selectedPortfolio?.title || ""}
                            </h3>
                          </div>
                        </div>
                        {/* Project Block - Title with Image End */}
                        {/* Project Block - Description Start */}
                        <div className="project__block grid-block grid-items">
                          <div className="project__data">
                            <div className="container-fluid p-0">
                              <div className="row g-0">
                                <div className="col-12 col-xl-4">
                                  <div className="container-fluid p-0">
                                    <div className="row g-0">
                                      {/* project data single item */}
                                      <div className="col-12 col-md-6 grid-item pdata__item">
                                        <p className="data__title tagline-chapter small type-basic-160lh">
                                          Type
                                        </p>
                                        <p className="data__descr small type-basic-160lh">
                                          3D model
                                        </p>
                                      </div>
                                      {/* project data single item */}
                                      <div className="col-12 col-md-6 grid-item pdata__item">
                                        <p className="data__title tagline-chapter small type-basic-160lh">
                                          Date
                                        </p>
                                        <p className="data__descr small type-basic-160lh">
                                          27.05.2024
                                        </p>
                                      </div>
                                      {/* project data single item */}
                                      <div className="col-12 col-md-6 grid-item pdata__item">
                                        <p className="data__title tagline-chapter small type-basic-160lh">
                                          Role
                                        </p>
                                        <p className="data__descr small type-basic-160lh">
                                          Product designer
                                        </p>
                                      </div>
                                      {/* project data single item */}
                                      <div className="col-12 col-md-6 grid-item pdata__item">
                                        <p className="data__title tagline-chapter small type-basic-160lh">
                                          Client
                                        </p>
                                        <p className="data__descr small type-basic-160lh">
                                          Editorial
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12 col-xl-8 grid-item">
                                  <p className="type-basic-160lh">
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Voluptates sequi
                                    laudantium quasi beatae, modi, explicabo quo
                                    voluptas quae enim culpa ipsum, quas nisi
                                    doloribus! Id aliquam error corrupti
                                    inventore sapiente. Lorem ipsum dolor sit
                                    amet consectetur adipisicing elit.
                                    Voluptates sequi laudantium quasi beatae,
                                    modi, explicabo quo voluptas quae enim culpa
                                    ipsum, quas nisi doloribus!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Project Block - Description End */}
                        {/* Project Block - Illustration Fullwidth Start */}
                        <div className="project__block no-margin">
                          <div className="project__illustration-xl">
                            <Image
                              alt="Project Illustration"
                              src="/img/works/work-single/1920x800_w01-02.webp"
                              width={1920}
                              height={800}
                            />
                          </div>
                        </div>
                        {/* Project Block - Illustration Fullwidth End */}
                        {/* Project Block - The Challenge Start */}
                        <div className="project__block pre-grid-items">
                          <div className="project__descr">
                            <div className="container-fluid p-0">
                              <div className="row g-0">
                                <div className="col-12 col-xl-4">
                                  <p className="project__subtitle tagline-chapter">
                                    The challenge
                                  </p>
                                </div>
                                <div className="col-12 col-xl-8">
                                  <p className="type-basic-160lh">
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Voluptates sequi
                                    laudantium quasi beatae, modi, explicabo quo
                                    voluptas quae enim culpa ipsum, quas nisi
                                    doloribus! Id aliquam error corrupti
                                    inventore sapiente.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Project Block - The Challenge End */}
                        {/* Project Block - Illustrations Grid Start */}
                        <div className="project__block grid-block no-margin">
                          <div className="project__illustrations">
                            <div className="container-fluid p-0">
                              <div className="row g-0">
                                <div className="col-12 col-md-6 col-xl-3 grid-item">
                                  <div className="project__illustration">
                                    <Image
                                      alt="Work Illustration"
                                      src="/img/works/work-single/600x800_w01-01.webp"
                                      width={600}
                                      height={800}
                                    />
                                  </div>
                                </div>
                                <div className="col-12 col-md-6 col-xl-3 grid-item">
                                  <div className="project__illustration">
                                    <Image
                                      alt="Work Illustration"
                                      src="/img/works/work-single/600x800_w01-02.webp"
                                      width={600}
                                      height={800}
                                    />
                                  </div>
                                </div>
                                <div className="col-12 col-md-6 col-xl-3 grid-item">
                                  <div className="project__illustration">
                                    <Image
                                      alt="Work Illustration"
                                      src="/img/works/work-single/600x800_w01-03.webp"
                                      width={600}
                                      height={800}
                                    />
                                  </div>
                                </div>
                                <div className="col-12 col-md-6 col-xl-3 grid-item">
                                  <div className="project__illustration">
                                    <Image
                                      alt="Work Illustration"
                                      src="/img/works/work-single/600x800_w01-04.webp"
                                      width={600}
                                      height={800}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Project Block - Illustrations Grid End */}
                        {/* Project Block - My Solution Start */}
                        <div className="project__block">
                          <div className="project__descr">
                            <div className="container-fluid p-0">
                              <div className="row g-0">
                                <div className="col-12 col-xl-4">
                                  <p className="project__subtitle tagline-chapter">
                                    My solution
                                  </p>
                                </div>
                                <div className="col-12 col-xl-8">
                                  <p className="type-basic-160lh">
                                    Lorem ipsum dolor sit amet consectetur
                                    adipisicing elit. Voluptates sequi
                                    laudantium quasi beatae, modi, explicabo quo
                                    voluptas quae enim culpa ipsum, quas nisi
                                    doloribus! Id aliquam error corrupti
                                    inventore sapiente. Voluptates sequi
                                    laudantium quasi beatae, modi, explicabo quo
                                    voluptas quae enim culpa ipsum.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Project Block - My Solution End */}
                        {/* Project Block - Illustration Fullwidth Start */}
                        <div className="project__block no-margin">
                          <div className="project__illustration-xl">
                            <Image
                              alt="Project Illustration"
                              src="/img/works/work-single/1920x800_w01-03.webp"
                              width={1920}
                              height={800}
                            />
                          </div>
                        </div>
                        {/* Project Block - Illustration Fullwidth End */}
                        {/* Project Block - Client's Feedback Start */}
                        <div className="project__block normal-size no-margin-bottom">
                          <div className="project__descr">
                            <div className="container-fluid p-0">
                              <div className="row g-0">
                                <div className="col-12 col-xl-4">
                                  <p className="project__subtitle image-top-subtitle tagline-chapter">
                                    Client&apos;s feedback
                                  </p>
                                </div>
                                <div className="col-12 col-xl-8">
                                  <div className="project__feedback">
                                    <div className="feedback__fauthor d-flex">
                                      <div className="fauthor__avatar">
                                        <Image
                                          alt="Review Author"
                                          src="/img/avatars/400x400_t01.webp"
                                          width={400}
                                          height={400}
                                        />
                                      </div>
                                      <div className="fauthor__info d-flex flex-column justify-content-center">
                                        <h4 className="fauthor__name">
                                          Alex Tomato
                                        </h4>
                                        <p className="fauthor__position small">
                                          Brand Manager in
                                          <a
                                            className="link-small-underline"
                                            href="https://1.envato.market/EKA9WD"
                                            target="_blank"
                                          >
                                            Mix Design
                                          </a>
                                        </p>
                                        <div className="fauthor__rating d-flex">
                                          <i className="ph-fill ph-star" />
                                          <i className="ph-fill ph-star" />
                                          <i className="ph-fill ph-star" />
                                          <i className="ph-fill ph-star" />
                                          <i className="ph-fill ph-star" />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="feedback__descr">
                                      <p className="type-basic-160lh">
                                        Lorem ipsum dolor sit amet, consectetuer
                                        adipiscing elit, sed diam nonummy nibh
                                        euismod tincidunt ut laoreet dolore
                                        magna aliquam erat volutpat. Ut wisi
                                        enim ad minim veniam, quis nostrud.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* project divider line */}
                          <div className="project__divider" />
                        </div>
                        {/* Project Block - Client's Feedback End */}
                        {/* Project Block - Project Link Start */}
                        <div className="project__block small-size">
                          <div className="container-fluid p-0">
                            <div className="row g-0">
                              <div className="col-12 d-flex justify-content-center">
                                <HoverCursorEffect
                                  as="a"
                                  className="btn btn-circle-text hover-circle"
                                  href="#"
                                  target="_blank"
                                  emZIndex="0"
                                >
                                  <span
                                    className="btn-caption"
                                    style={{ zIndex: 1 }}
                                  >
                                    Project page
                                  </span>
                                </HoverCursorEffect>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Project Block - Project Link End */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Popup Content End */}
            </div>
          </div>
        </div>
      </div>{" "}
    </>
  );
}
