import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import anime from 'animejs';
import styled from 'styled-components';
import { IconLoader } from '@components/icons';

const StyledLoader = styled.div`
  ${({ theme }) => theme.mixins.flexCenter};
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: var(--navy);
  z-index: 99;

  .logo-wrapper {
    width: max-content;
    max-width: 100px;
    transition: var(--transition);
    opacity: ${props => (props.isMounted ? 1 : 0)};
    svg {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      margin: 0 auto;
      fill: none;
      user-select: none;
    }
  }

  .logo-wrapper svg {
    fill: var(--green);
  }
  .logo-wrapper svg path {
    fill: var(--green);
  }
  #icon-loader path {
    fill: var(--green);
    stroke: var(--green);
  }
`;

const Loader = ({ finishLoading }) => {
  const [isMounted, setIsMounted] = useState(false);

  const animate = () => {
    const loader = anime.timeline({
      easing: 'easeInOutSine',
      complete: () => finishLoading(),
    });

    loader
      .add({ targets: '.rect1', translateY: 54, duration: 500 })
      .add({ targets: '.rect2', translateX: -54, duration: 500 }, 0)
      .add({ targets: '.rect3', translateY: -54, duration: 500 }, 0)
      .add({ targets: '.rect4', translateX: 54, duration: 500, endDelay: 200 }, 0);

    loader.add({
      targets: '#icon-loader',
      duration: 500,
      rotate: 135,
      endDelay: 200,
    });

    loader
      .add({ targets: '.rect2', translateX: 0, duration: 500 })
      .add({ targets: '.rect4', translateX: 0, duration: 500, endDelay: 200 }, '-=500');

    loader
      .add({ targets: '.rect1', translateY: 0, duration: 500 })
      .add({ targets: '.rect4', translateX: 54, duration: 500 }, '-=500');

    loader
      .add({ targets: '.rect3', translateY: 0, duration: 500 }, '-=500')
      .add({ targets: '.rect2', translateX: -54, duration: 500, endDelay: 200 }, '-=500');

    loader
      .add({ targets: '.rect1', translateY: 54, duration: 500 })
      .add({ targets: '.rect3', translateY: -54, duration: 500, endDelay: 200 }, '-=500');

    loader.add({
      targets: '#sixthSVG',
      duration: 500,
      rotate: 270,
      endDelay: 200,
    });

    loader
      .add({ targets: '.rect1', translateY: 0, duration: 500 })
      .add({ targets: '.rect2', translateX: 0, duration: 500 }, '-=500')
      .add({ targets: '.rect3', translateY: 0, duration: 500 }, '-=500')
      .add({ targets: '.rect4', translateX: 0, duration: 500, endDelay: 200 }, '-=500');
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    animate();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <StyledLoader className="loader" isMounted={isMounted}>
      <Helmet bodyAttributes={{ class: `hidden` }} />

      <div className="logo-wrapper">
        <IconLoader />
      </div>
    </StyledLoader>
  );
};

Loader.propTypes = {
  finishLoading: PropTypes.func.isRequired,
};

export default Loader;
