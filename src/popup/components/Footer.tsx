import React from 'react';

function Footer() {
  const flaticonUrl = 'https://www.flaticon.com';
  const flaticonAuthorUrl = `${flaticonUrl}/authors/smashicons`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="flaticon-desc">
          <p>
            Icons made by{' '}
            <a href={flaticonAuthorUrl} title="Smashicons">
              Smashicons
            </a>{' '}
            from{' '}
            <a href={flaticonUrl} title="Flaticon">
              www.flaticon.com
            </a>{' '}
            is licensed by
            <a
              href="http://creativecommons.org/licenses/by/3.0/"
              title="Creative Commons BY 3.0"
              rel="noopener noreferrer"
              target="_blank"
            >
              {' '}
              CC 3.0 BY{' '}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
