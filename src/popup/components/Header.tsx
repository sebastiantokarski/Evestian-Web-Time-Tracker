import React, { useState } from 'react';
import { Settings } from 'popup/components';
import settings from 'js/settings';
import { Modal } from 'react-bootstrap';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalInfoOpen, setModalInfoOpen] = useState(false);
  const [isModalSettingsOpen, setModalSettingsOpen] = useState(false);
  const [isAppEnabled, setIsAppEnabled] = useState(true);

  const assetsDir = '../../assets/';

  const switchExtension = async (ev) => {
    ev.preventDefault();

    const isEnabled = !isAppEnabled;

    setIsAppEnabled((oldValue) => !oldValue);

    settings.set('IS_ENABLED', isEnabled);
  };

  const toggleMenu = (ev) => {
    ev.preventDefault();

    setIsMenuOpen((oldValue) => !oldValue);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="row">
          <div className="header__main-row">
            <img
              className={`header__logo${isMenuOpen ? ' opened-menu' : ''}`}
              alt="logo"
              src={`${assetsDir}logoWhite.svg`}
            />
            <h1 className={`header__title${isMenuOpen ? ' opened-menu' : ''}`}>
              Evestian Web Time Tracker
            </h1>
            <div className={`header__menu-wrapper${isMenuOpen ? ' opened' : ''}`}>
              <button
                type="button"
                className="header__menu-trigger menu-item"
                onClick={(ev) => toggleMenu(ev)}
                title="Menu"
              >
                <img className="header-svg" alt="menu" src={`${assetsDir}menuWhite.svg`} />
              </button>

              <button
                type="button"
                className="header__menu-settings menu-item"
                title="Settings"
                onClick={() => setModalSettingsOpen(true)}
              >
                <img className="header-svg" alt="settings" src={`${assetsDir}settings.svg`} />
              </button>
              <Modal
                show={isModalSettingsOpen}
                onHide={() => setModalSettingsOpen(false)}
                title="Settings"
              >
                <Settings />
              </Modal>

              <button
                type="button"
                className="header__menu-app-switch menu-item"
                title={isAppEnabled ? 'Turn off' : 'Turn on'}
                onClick={(ev) => switchExtension(ev)}
              >
                <img
                  className="header-svg"
                  alt="switch application"
                  src={`${assetsDir}powerWhite.svg`}
                />
              </button>
              <button
                type="button"
                className="header__menu-info menu-item"
                title="How it works"
                onClick={() => setModalInfoOpen(true)}
              >
                <img className="header-svg" alt="info" src={`${assetsDir}infoWhite.svg`} />
              </button>
              <Modal
                show={isModalInfoOpen}
                onHide={() => setModalInfoOpen(false)}
                title="How it works"
              >
                <Modal.Body>
                  Rozszerzenie liczy każdą spędzoną sekunde na każdej stronie. Statystyki liczone są
                  per domena. Żadne dane nie są wysyłane na zewnątrz.
                </Modal.Body>
              </Modal>
              <button
                type="button"
                className="header__menu-close menu-item"
                onClick={(ev) => toggleMenu(ev)}
                title="Close menu"
              >
                <img className="header-svg" alt="Close menu" src={`${assetsDir}closeWhite.svg`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
