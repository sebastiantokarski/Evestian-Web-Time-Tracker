import React, { useState } from 'react';
import settings from '../../js/settings';
import { Settings, Modal } from 'popup/components';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppEnabled, setIsAppEnabled] = useState(true);
  const [settingsState, setSettings] = useState(null);

  const assetsDir = '../../assets/';

  const getSettings = async () => {
    await settings.init();

    setIsAppEnabled(settingsState.IS_ENABLED);
    setSettings(settings.getAll());
  };

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

  const onChangedSettingsInHeader = (settingsChanges) => {
    const oldValue = settingsChanges.oldValue.IS_ENABLED;
    const newValue = settingsChanges.newValue.IS_ENABLED;
    const areDifferente = oldValue !== newValue;

    if (areDifferente && newValue !== isAppEnabled) {
      setIsAppEnabled((oldValue) => !oldValue);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="row">
          <div className="header__main-row">
            <img
              className={`header__logo${isMenuOpen ? ' opened-menu' : ''}`}
              src={`${assetsDir}logoWhite.svg`}
            />
            <h1 className={`header__title${isMenuOpen ? ' opened-menu' : ''}`}>
              Evestian Web Time Tracker
            </h1>
            <div className={`header__menu-wrapper${isMenuOpen ? ' opened' : ''}`}>
              <a
                href="#"
                className="header__menu-trigger menu-item"
                onClick={(ev) => toggleMenu(ev)}
                title="Menu"
              >
                <img className="header-svg" src={`${assetsDir}menuWhite.svg`} />
              </a>

              <Modal
                trigger={
                  <a href="#" className="header__menu-settings menu-item" title="Settings">
                    <img className="header-svg" src={`${assetsDir}settings.svg`} />
                  </a>
                }
                title="Settings"
              >
                <Settings />
              </Modal>

              <a
                href="#"
                className="header__menu-app-switch menu-item"
                title={isAppEnabled ? 'Turn off' : 'Turn on'}
                onClick={(ev) => switchExtension(ev)}
              >
                <img className="header-svg" src={`${assetsDir}powerWhite.svg`} />
              </a>

              <Modal
                trigger={
                  <a href="#" className="header__menu-info menu-item" title="How it works">
                    <img className="header-svg" src={`${assetsDir}infoWhite.svg`} />
                  </a>
                }
                title="How it works"
              >
                <p>
                  Rozszerzenie liczy każdą spędzoną sekunde na każdej stronie. Statystyki liczone są
                  per domena. Żadne dane nie są wysyłane na zewnątrz.
                </p>
              </Modal>
              <a
                href="#"
                className="header__menu-close menu-item"
                onClick={(ev) => toggleMenu(ev)}
                title="Close menu"
              >
                <img className="header-svg" src={`${assetsDir}closeWhite.svg`} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
