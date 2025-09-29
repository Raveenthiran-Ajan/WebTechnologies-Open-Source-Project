import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ margin: '1rem' }}>
    <div className="language-switcher">
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('si')}>සිංහල</button>
      <button onClick={() => changeLanguage('ta')}>தமிழ்</button>
    </div>
    </div>
  );
};

export default LanguageSwitcher;
