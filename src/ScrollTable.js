import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Spinner from "./Spinner";

function getDataChunks(data, chunkLength) {
  return Array(Math.ceil(data.length / chunkLength))
    .fill()
    .map((_, index) => index * chunkLength)
    .map((begin) => {
      const end = begin + chunkLength;
      return data.slice(begin, end);
    });
}

function makeObserver(rootNode, callback) {
  let options = {
    root: rootNode,
    rootMargin: "35px 0px",
    threshold: 0,
  };

  return new IntersectionObserver(callback, options);
}

function PageTrigger({ trigger = "next", hideIf, targetRef, style }) {
  return (
    <div
      ref={targetRef}
      id="prev-page-trigger"
      className={`page-trigger ${hideIf ? "hidden" : "visible"}`}
    >
      <Spinner />
    </div>
  );
}

function Row({ data }) {
  return (
    <div id={`id-${data.id}`} className="row">
      {Object.keys(data).map((key) => (
        <span key={key} className="cell">
          {data[key]}
        </span>
      ))}
    </div>
  );
}

function ScrollTable(props) {
  const { data, pageLength } = props;

  const [scroll, setScroll] = useState({ index: 0, direction: 1 });
  const currentPage = scroll.index;

  const dataChunks = getDataChunks(data, pageLength);

  const prevData = dataChunks[currentPage];
  const currentData = dataChunks[currentPage + 1] || [];
  const nextData = dataChunks[currentPage + 2] || [];

  const handlePrev = useCallback(
    function () {
      const nextPage = Math.max(currentPage - 1, 0);
      setScroll((s) => ({ ...s, index: nextPage }));
    },
    [currentPage]
  );

  const handleNext = useCallback(
    function handleNext() {
      const nextPage = Math.min(currentPage + 1, dataChunks.length - 1);
      setScroll((s) => ({ ...s, index: nextPage }));
    },
    [currentPage, dataChunks]
  );

  const incrementPage = useCallback(
    function (n) {
      return function (entries) {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const a = 0;
          const b = dataChunks.length - 1;
          const next = currentPage + n;

          const nextPage = Math.min(Math.max(next, a), b);

          setTimeout(() => {
            setScroll({ index: nextPage, direction: n });
          }, 0);
        });
      };
    },
    [currentPage, dataChunks.length]
  );

  const prevTriggerObserver = useRef(null);
  const nextTriggerObserver = useRef(null);
  const prevTriggerRef = useRef(null);
  const nextTriggerRef = useRef(null);

  const scrollWindowRef = useRef(null);
  const scrollContentRef = useRef(null);

  const currentPageRef = useRef(null);
  const prevOverscanRef = useRef(null);
  const nextOverscanRef = useRef(null);

  useEffect(
    function onPageChange() {
      if (!prevOverscanRef.current) return;
      if (!currentPageRef.current) return;
      if (scroll.index === 0) return;

      currentPageRef.current.scrollIntoView(scroll.direction < 0);
    },
    [scroll]
  );

  useEffect(
    function createIntersectionObservers() {
      if (!scrollWindowRef.current) return;

      if (prevTriggerObserver.current) prevTriggerObserver.current.disconnect();
      if (nextTriggerObserver.current) nextTriggerObserver.current.disconnect();

      prevTriggerObserver.current = makeObserver(
        scrollWindowRef.current,
        incrementPage(-1)
      );

      nextTriggerObserver.current = makeObserver(
        scrollWindowRef.current,
        incrementPage(1)
      );
    },
    [scrollWindowRef, prevTriggerObserver, nextTriggerObserver, incrementPage]
  );

  useEffect(
    function observePrevTrigger() {
      if (!prevTriggerObserver.current) return;
      if (!prevTriggerRef.current) return;

      prevTriggerObserver.current.observe(prevTriggerRef.current);
    },
    [prevTriggerObserver, prevTriggerRef, currentPage]
  );

  useEffect(
    function observeNextTrigger() {
      if (!nextTriggerObserver.current) return;
      if (!nextTriggerRef.current) return;

      nextTriggerObserver.current.observe(nextTriggerRef.current);
    },
    [nextTriggerObserver, nextTriggerRef, currentPage]
  );

  const firstPage = currentPage === 0;
  const lastPage = currentPage === dataChunks.length - 1;

  return (
    <main>
      <header className="header">
        <button onClick={handlePrev}>prev</button>
        {currentPage}
        <button onClick={handleNext}>next</button>
      </header>
      <div className="scroll-window" ref={scrollWindowRef}>
        <div className="list" ref={scrollContentRef}>
          <PageTrigger
            targetRef={prevTriggerRef}
            hideIf={firstPage}
            trigger="prev"
          />

          <div ref={prevOverscanRef}>
            {prevData.map((row) => (
              <Row key={row.id} data={row} />
            ))}
          </div>

          <div ref={currentPageRef}>
            {currentData.map((row) => (
              <Row key={row.id} data={row} />
            ))}
          </div>

          <div ref={nextOverscanRef}>
            {nextData.map((row) => (
              <Row key={row.id} data={row} />
            ))}
          </div>

          <PageTrigger
            targetRef={nextTriggerRef}
            hideIf={lastPage}
            trigger="next"
          />
        </div>
      </div>
    </main>
  );
}

ScrollTable.defaultProps = {
  overscan: 1,
};

ScrollTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  pageLength: PropTypes.number,
  overscan: PropTypes.number,
};

export default ScrollTable;
