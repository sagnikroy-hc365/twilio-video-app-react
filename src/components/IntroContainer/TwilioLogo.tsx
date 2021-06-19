import React, { SVGProps } from 'react';

export default function TwilioLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <img
      style={{ position: 'absolute', top: '0', left: '0', margin: '1em' }}
      alt="dynacare-logo"
      src="https://hc365data.s3.amazonaws.com/logos/dynacare-full-logo-sm.png"
    ></img>
  );
}
